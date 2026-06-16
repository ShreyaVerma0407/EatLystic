"""
Fuzzy matching layer: score products against user query using rapidfuzz.
"""

from rapidfuzz import fuzz, process
from modules.normalizer import normalize_title
from typing import List, Dict, Optional


# Minimum fuzzy score to consider a product relevant
RELEVANCE_THRESHOLD = 40


def match_score(query: str, product_title: str) -> float:
    """
    Composite fuzzy score combining token_set_ratio and partial_ratio.
    Returns a float in [0, 100].
    """

    q = normalize_title(query)
    t = normalize_title(product_title)

    token_set = fuzz.token_set_ratio(q, t)
    partial = fuzz.partial_ratio(q, t)
    token_sort = fuzz.token_sort_ratio(q, t)

    # Weighted composite
    composite = (
        (token_set * 0.5) +
        (partial * 0.3) +
        (token_sort * 0.2)
    )

    return round(composite, 2)


def filter_relevant(
    query: str,
    products: List[Dict],
    threshold: float = RELEVANCE_THRESHOLD
) -> List[Dict]:
    """
    Attach match_score to each product and filter below threshold.
    """

    scored = []

    for p in products:
        score = match_score(query, p.get("title", ""))

        if score >= threshold:
            scored.append({
                **p,
                "match_score": score
            })

    return scored


def best_match(query: str, products: List[Dict]) -> Optional[Dict]:
    """
    Return the single best fuzzy match for a query.
    """

    if not products:
        return None

    titles = [p.get("title", "") for p in products]

    result = process.extractOne(
        query,
        titles,
        scorer=fuzz.token_set_ratio
    )

    if result:
        best_title, score, idx = result

        if score >= RELEVANCE_THRESHOLD:
            return {
                **products[idx],
                "match_score": score
            }

    return None