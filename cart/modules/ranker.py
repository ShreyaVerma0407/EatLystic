"""
Product ranking engine.

Scoring formula:
final_score = (price_score * 0.70) + (match_score * 0.30)

price_score : normalized [0-100] — lowest price = 100
match_score : fuzzy relevance [0-100]
"""

import logging
from typing import Optional, List, Dict

from modules.normalizer import build_normalized_product
from modules.fuzzy_matcher import filter_relevant


logger = logging.getLogger(__name__)


PRICE_WEIGHT = 0.70
MATCH_WEIGHT = 0.30
MAX_ALTERNATIVES = 4


def compute_price_score(price: float, min_price: float, max_price: float) -> float:
    """
    Invert price so cheapest = 100.
    """

    if max_price == min_price:
        return 100.0

    score = 100.0 - (
        (price - min_price) / (max_price - min_price)
    ) * 100.0

    return round(max(0.0, min(100.0, score)), 2)



def compute_final_score(price_score: float, match_score: float) -> float:
    return round(
        (price_score * PRICE_WEIGHT) +
        (match_score * MATCH_WEIGHT),
        2
    )



def compute_value_badge(
    price_score: float,
    match_score: float,
    final_score: float
) -> str:

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



def rank_products(query: str, raw_products: List[Dict]) -> Dict:

    if not raw_products:
        return _empty_result(query)


    normalized = [
        build_normalized_product(p)
        for p in raw_products
    ]


    relevant = filter_relevant(
        query,
        normalized,
        threshold=35
    )


    if not relevant:
        logger.warning(
            f"No relevant products found for '{query}', relaxing threshold."
        )

        relevant = [
            {
                **p,
                "match_score": 50.0
            }
            for p in normalized
        ]


    prices = [
        p.get("price_per_unit") or p.get("price", 0)
        for p in relevant
    ]

    prices = [
        x for x in prices
        if x and x > 0
    ]


    if not prices:
        return _empty_result(query)


    min_p = min(prices)
    max_p = max(prices)



    scored = []


    for p in relevant:

        ppu = (
            p.get("price_per_unit")
            or p.get("price", 0)
        )

        price_score = compute_price_score(
            ppu,
            min_p,
            max_p
        )

        match_score = p.get(
            "match_score",
            50.0
        )


        final_score = compute_final_score(
            price_score,
            match_score
        )


        scored.append(
            {
                **p,
                "price_score": price_score,
                "final_score": final_score,
                "badge": compute_value_badge(
                    price_score,
                    match_score,
                    final_score
                )
            }
        )



    scored.sort(
        key=lambda x: x["final_score"],
        reverse=True
    )



    seen_merchants = set()
    deduped = []


    for p in scored:

        merchant = p.get(
            "merchant",
            "Unknown"
        )

        if merchant not in seen_merchants:

            deduped.append(p)
            seen_merchants.add(merchant)



    best_deal = (
        deduped[0]
        if deduped
        else None
    )


    alternatives = deduped[
        1: MAX_ALTERNATIVES + 1
    ]



    return {
        "query": query,
        "best_deal": best_deal,
        "alternatives": alternatives,
        "total_found": len(relevant)
    }




def _empty_result(query: str) -> dict:

    return {
        "query": query,
        "best_deal": None,
        "alternatives": [],
        "total_found": 0
    }



def rank_all(
    items: List[str],
    all_products: Dict[str, List[Dict]]
) -> List[Dict]:

    results = []

    for item in items:

        raw = all_products.get(
            item,
            []
        )

        ranked = rank_products(
            item,
            raw
        )

        results.append(ranked)


    return results