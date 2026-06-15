"""
Product ranking engine.

Scoring formula:
  final_score = (price_score * 0.70) + (match_score * 0.30)

price_score  : normalized [0-100] — lowest price = 100
match_score  : fuzzy relevance [0-100]
"""

import logging
from typing import Optional
from modules.normalizer import build_normalized_product
from modules.fuzzy_matcher import filter_relevant

logger = logging.getLogger(__name__)

PRICE_WEIGHT = 0.70
MATCH_WEIGHT = 0.30
MAX_ALTERNATIVES = 4


# ─── Score Helpers ────────────────────────────────────────────────────────────

def compute_price_score(price: float, min_price: float, max_price: float) -> float:
    """
    Invert price so cheapest = 100.
    Uses price_per_unit for fair comparison across different pack sizes.
    """
    if max_price == min_price:
        return 100.0
    score = 100.0 - ((price - min_price) / (max_price - min_price)) * 100.0
    return round(max(0.0, min(100.0, score)), 2)


def compute_final_score(price_score: float, match_score: float) -> float:
    return round((price_score * PRICE_WEIGHT) + (match_score * MATCH_WEIGHT), 2)


def compute_value_badge(price_score: float, match_score: float, final_score: float) -> str:
    """Assign a human-readable quality badge."""
    if final_score >= 85:
        return "🏆 Best Deal"
    elif final_score >= 70:
        return "✅ Great Value"
    elif final_score >= 55:
        return "👍 Good Pick"
    elif price_score >= 80:
        return "💸 Cheapest"
    elif match_score >= 85:
        return "🎯 Best Match"
    else:
        return "📦 Option"


# ─── Core Ranking Function ───────────────────────────────────────────────────

def rank_products(query: str, raw_products: list[dict]) -> dict:
    """
    Full pipeline: normalize → fuzzy filter → score → rank → structure output.

    Returns:
    {
        "query":        str,
        "best_deal":    dict | None,
        "alternatives": list[dict],
        "total_found":  int,
    }
    """
    if not raw_products:
        return _empty_result(query)

    # Step 1: Normalize
    normalized = [build_normalized_product(p) for p in raw_products]

    # Step 2: Fuzzy filter — only keep relevant products
    relevant = filter_relevant(query, normalized, threshold=35)

    if not relevant:
        # Relax threshold — take all and rank anyway
        logger.warning(f"No relevant products found for '{query}', relaxing threshold.")
        relevant = [{**p, "match_score": 50.0} for p in normalized]

    # Step 3: Compute price bounds using price_per_unit for fairness
    prices = [p.get("price_per_unit") or p.get("price", 0) for p in relevant]
    prices = [x for x in prices if x and x > 0]

    if not prices:
        return _empty_result(query)

    min_p, max_p = min(prices), max(prices)

    # Step 4: Score each product
    scored = []
    for p in relevant:
        ppu        = p.get("price_per_unit") or p.get("price", 0)
        p_score    = compute_price_score(ppu, min_p, max_p)
        m_score    = p.get("match_score", 50.0)
        f_score    = compute_final_score(p_score, m_score)
        badge      = compute_value_badge(p_score, m_score, f_score)

        scored.append({
            **p,
            "price_score":  p_score,
            "final_score":  f_score,
            "badge":        badge,
        })

    # Step 5: Sort descending by final_score
    scored.sort(key=lambda x: x["final_score"], reverse=True)

    # Step 6: Deduplicate by merchant (keep best per merchant)
    seen_merchants = set()
    deduped = []
    for p in scored:
        merchant = p.get("merchant", "Unknown")
        if merchant not in seen_merchants:
            deduped.append(p)
            seen_merchants.add(merchant)

    best_deal     = deduped[0] if deduped else None
    alternatives  = deduped[1 : MAX_ALTERNATIVES + 1]

    # Step 7: Compute savings vs cheapest alternative
    if best_deal and alternatives:
        alt_prices = [a.get("price", 0) for a in alternatives if a.get("price")]
        if alt_prices:
            avg_alt = sum(alt_prices) / len(alt_prices)
            savings = avg_alt - best_deal.get("price", 0)
            best_deal["savings_vs_avg"] = round(max(savings, 0), 2)
        else:
            best_deal["savings_vs_avg"] = 0.0

    return {
        "query":        query,
        "best_deal":    best_deal,
        "alternatives": alternatives,
        "total_found":  len(relevant),
    }


def _empty_result(query: str) -> dict:
    return {
        "query":        query,
        "best_deal":    None,
        "alternatives": [],
        "total_found":  0,
    }


# ─── Multi-Item Orchestrator ─────────────────────────────────────────────────

def rank_all(items: list[str], all_products: dict[str, list[dict]]) -> list[dict]:
    """
    Rank products for each query item.
    `all_products`: { query: [raw_product, ...] }
    Returns list of ranked result dicts.
    """
    results = []
    for item in items:
        raw = all_products.get(item, [])
        ranked = rank_products(item, raw)
        results.append(ranked)
    return results
