"""
Product name normalization + unit extraction.
"""

import re
from typing import Optional


# ─── Unit Normalization Map ───────────────────────────────────────────────────

UNIT_MAP = {
    # weight
    r"(\d+(?:\.\d+)?)\s*kg":  lambda m: float(m.group(1)) * 1000,
    r"(\d+(?:\.\d+)?)\s*g\b": lambda m: float(m.group(1)),
    # volume
    r"(\d+(?:\.\d+)?)\s*l\b": lambda m: float(m.group(1)) * 1000,
    r"(\d+(?:\.\d+)?)\s*ml":  lambda m: float(m.group(1)),
    # count
    r"(\d+)\s*(?:pcs|pieces|pack|pc|nos|eggs?|units?)": lambda m: float(m.group(1)),
}

NOISE_WORDS = {
    "buy", "online", "best", "price", "offer", "sale", "deal",
    "fresh", "pure", "natural", "organic", "premium", "quality",
    "india", "indian", "new", "free", "delivery", "fast",
}

BRAND_ALIASES = {
    "amul":         "amul",
    "britannia":    "britannia",
    "mother dairy": "mother_dairy",
    "motherdairy":  "mother_dairy",
    "nandini":      "nandini",
    "nestlé":       "nestle",
    "nestle":       "nestle",
}


def normalize_title(title: str) -> str:
    """Lowercase, strip noise words, collapse whitespace."""
    t = title.lower().strip()
    t = re.sub(r"[^\w\s]", " ", t)
    tokens = [w for w in t.split() if w not in NOISE_WORDS]
    return " ".join(tokens)


def extract_quantity(title: str) -> Optional[float]:
    """
    Parse quantity from title string.
    Returns normalized numeric value (grams/ml/count) or None.
    """
    title_lower = title.lower()
    for pattern, converter in UNIT_MAP.items():
        m = re.search(pattern, title_lower)
        if m:
            try:
                return converter(m)
            except Exception:
                continue
    return None


def price_per_unit(price: float, title: str) -> float:
    """
    Compute price-per-unit (per 100g/100ml/per piece).
    Falls back to raw price if no quantity found.
    """
    qty = extract_quantity(title)
    if qty and qty > 0:
        return (price / qty) * 100
    return price


def canonical_brand(title: str) -> str:
    """Extract known brand from title string."""
    title_lower = title.lower()
    for alias, brand in BRAND_ALIASES.items():
        if alias in title_lower:
            return brand
    return "unknown"


def build_normalized_product(product: dict) -> dict:
    """Attach normalized fields to a raw product dict (non-destructive)."""
    title = product.get("title", "")
    price = product.get("price", 0.0) or 0.0

    return {
        **product,
        "normalized_title": normalize_title(title),
        "quantity_value":   extract_quantity(title),
        "price_per_unit":   price_per_unit(price, title),
        "brand":            canonical_brand(title),
    }
