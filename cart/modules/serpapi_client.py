"""
SerpAPI Google Shopping client with fallback simulation layer.
"""

import os
import re
import time
import random
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")
COUNTRY     = os.getenv("COUNTRY", "in")
LANGUAGE    = os.getenv("LANGUAGE", "en")
MAX_RESULTS = int(os.getenv("MAX_RESULTS", 10))
ENABLE_FALLBACK = os.getenv("ENABLE_FALLBACK", "true").lower() == "true"


# ─── Price Parser ────────────────────────────────────────────────────────────

def parse_price(raw: str) -> Optional[float]:
    """Extract numeric price from any price string."""
    if not raw:
        return None
    cleaned = re.sub(r"[^\d.]", "", str(raw).replace(",", ""))
    try:
        return float(cleaned)
    except ValueError:
        return None


# ─── SerpAPI Live Fetch ──────────────────────────────────────────────────────

def fetch_serpapi(query: str) -> list[dict]:
    """Fetch Google Shopping results via SerpAPI."""
    if not SERPAPI_KEY:
        logger.warning("No SERPAPI_KEY set — using fallback data.")
        return []

    try:
        from serpapi import GoogleSearch

        params = {
            "engine":   "google_shopping",
            "q":        query,
            "api_key":  SERPAPI_KEY,
            "gl":       COUNTRY,
            "hl":       LANGUAGE,
            "num":      MAX_RESULTS,
        }

        search  = GoogleSearch(params)
        results = search.get_dict()
        items   = results.get("shopping_results", [])

        products = []
        for item in items:
            price = parse_price(item.get("price", ""))
            if price is None:
                continue

            products.append({
                "source":      "google_shopping",
                "title":       item.get("title", "").strip(),
                "price":       price,
                "currency":    "INR",
                "url":         item.get("link") or item.get("product_link", "#"),
                "thumbnail":   item.get("thumbnail", ""),
                "rating":      float(item.get("rating", 0) or 0),
                "reviews":     int(item.get("reviews", 0) or 0),
                "merchant":    item.get("source", "Unknown"),
                "raw_query":   query,
            })

        logger.info(f"SerpAPI: {len(products)} results for '{query}'")
        return products

    except Exception as e:
        logger.error(f"SerpAPI error for '{query}': {e}")
        return []


# ─── Fallback Simulation Layer ───────────────────────────────────────────────

FALLBACK_CATALOG = {
    "milk": [
        {"title": "Amul Taaza Toned Milk 1L", "price": 66.0,  "merchant": "BigBasket",  "url": "https://www.bigbasket.com/pd/40076534/"},
        {"title": "Mother Dairy Full Cream Milk 1L", "price": 72.0, "merchant": "Blinkit", "url": "https://blinkit.com/prn/mother-dairy-full-cream-milk/prid/4703"},
        {"title": "Nandini Full Cream Milk 1L", "price": 60.0, "merchant": "JioMart",   "url": "https://www.jiomart.com/p/groceries/nandini-full-cream-milk-1-l/491627869"},
        {"title": "Amul Gold Full Cream Milk 1L", "price": 74.0, "merchant": "Zepto",    "url": "https://www.zeptonow.com/pn/amul-gold-full-cream-milk/pvid/4fbd"},
        {"title": "Sudha Full Cream Milk 500ml", "price": 34.0, "merchant": "Swiggy Instamart", "url": "https://www.swiggy.com/instamart"},
        {"title": "Heritage Full Cream Milk 1L", "price": 70.0, "merchant": "Amazon Fresh", "url": "https://www.amazon.in/s?k=heritage+milk"},
    ],
    "bread": [
        {"title": "Britannia 100% Whole Wheat Bread 400g", "price": 45.0, "merchant": "BigBasket", "url": "https://www.bigbasket.com/pd/1003/"},
        {"title": "Harvest Gold White Bread 400g", "price": 40.0, "merchant": "Blinkit",  "url": "https://blinkit.com/prn/harvest-gold-bread/prid/999"},
        {"title": "Modern Bread Sliced 400g", "price": 38.0, "merchant": "Zepto",     "url": "https://www.zeptonow.com/pn/modern-bread/pvid/1234"},
        {"title": "Britannia Whole Wheat Bread 450g", "price": 50.0, "merchant": "JioMart", "url": "https://www.jiomart.com/p/groceries/britannia-wheat-bread"},
        {"title": "English Oven Multigrain Bread 400g", "price": 65.0, "merchant": "Amazon Fresh", "url": "https://www.amazon.in/s?k=english+oven+bread"},
        {"title": "Wibs Fresh White Bread 400g", "price": 35.0, "merchant": "Swiggy Instamart", "url": "https://www.swiggy.com/instamart"},
    ],
    "eggs": [
        {"title": "Licious Fresh White Eggs 6pcs", "price": 62.0, "merchant": "Licious", "url": "https://www.licious.in/product/fresh-white-eggs"},
        {"title": "Country Eggs (Desi) 6pcs", "price": 72.0, "merchant": "BigBasket", "url": "https://www.bigbasket.com/pd/eggs"},
        {"title": "Suguna Daily Fresh Eggs 6pcs", "price": 58.0, "merchant": "Blinkit", "url": "https://blinkit.com/prn/suguna-eggs/prid/3344"},
        {"title": "Kegg Farms Brown Eggs 6pcs", "price": 78.0, "merchant": "Amazon Fresh", "url": "https://www.amazon.in/s?k=kegg+farms+eggs"},
        {"title": "NID Desi Eggs 6pcs", "price": 90.0, "merchant": "Zepto", "url": "https://www.zeptonow.com/pn/desi-eggs/pvid/5566"},
        {"title": "Farm Fresh White Eggs 12pcs", "price": 108.0, "merchant": "JioMart", "url": "https://www.jiomart.com/p/groceries/eggs"},
    ],
    "rice": [
        {"title": "India Gate Basmati Rice 1kg", "price": 130.0, "merchant": "BigBasket", "url": "https://www.bigbasket.com/pd/india-gate-rice"},
        {"title": "Fortune Biryani Special Basmati 1kg", "price": 120.0, "merchant": "Blinkit", "url": "https://blinkit.com"},
        {"title": "Daawat Rozana Basmati 1kg", "price": 105.0, "merchant": "Zepto", "url": "https://www.zeptonow.com"},
        {"title": "Kohinoor Super Silver Rice 1kg", "price": 115.0, "merchant": "JioMart", "url": "https://www.jiomart.com"},
        {"title": "Sona Masoori Raw Rice 1kg", "price": 68.0, "merchant": "Amazon Fresh", "url": "https://www.amazon.in/s?k=sona+masoori+rice"},
    ],
    "sugar": [
        {"title": "Uttam Sugar 1kg", "price": 46.0, "merchant": "BigBasket", "url": "https://www.bigbasket.com"},
        {"title": "Madhur Pure Sugar 1kg", "price": 48.0, "merchant": "Blinkit", "url": "https://blinkit.com"},
        {"title": "Nature Fresh Sulphurless Sugar 1kg", "price": 55.0, "merchant": "JioMart", "url": "https://www.jiomart.com"},
        {"title": "Rajshree Sugar 1kg", "price": 44.0, "merchant": "Amazon Fresh", "url": "https://www.amazon.in"},
    ],
    "butter": [
        {"title": "Amul Butter Pasteurised 500g", "price": 245.0, "merchant": "BigBasket", "url": "https://www.bigbasket.com"},
        {"title": "Mother Dairy Butter 500g", "price": 240.0, "merchant": "Blinkit", "url": "https://blinkit.com"},
        {"title": "Verka Butter 500g", "price": 235.0, "merchant": "JioMart", "url": "https://www.jiomart.com"},
        {"title": "Britannia Butter 500g", "price": 250.0, "merchant": "Zepto", "url": "https://www.zeptonow.com"},
    ],
    "oil": [
        {"title": "Fortune Sunflower Oil 1L", "price": 130.0, "merchant": "BigBasket", "url": "https://www.bigbasket.com"},
        {"title": "Saffola Gold Oil 1L", "price": 155.0, "merchant": "Amazon Fresh", "url": "https://www.amazon.in"},
        {"title": "Dhara Refined Soyabean Oil 1L", "price": 115.0, "merchant": "JioMart", "url": "https://www.jiomart.com"},
        {"title": "Gemini Sunflower Oil 1L", "price": 120.0, "merchant": "Blinkit", "url": "https://blinkit.com"},
    ],
}

MERCHANT_LOGOS = {
    "BigBasket":        "🛒",
    "Blinkit":          "🟡",
    "Zepto":            "🟣",
    "JioMart":          "🔵",
    "Amazon Fresh":     "📦",
    "Swiggy Instamart": "🟠",
    "Licious":          "🔴",
    "google_shopping":  "🛍️",
    "Unknown":          "🏪",
}


def fetch_fallback(query: str) -> list[dict]:
    """Simulate product data for demo/dev mode."""
    query_lower = query.lower().strip()
    results = []

    for keyword, products in FALLBACK_CATALOG.items():
        if keyword in query_lower or query_lower in keyword:
            for p in products:
                results.append({
                    "source":    "fallback",
                    "title":     p["title"],
                    "price":     p["price"] * random.uniform(0.95, 1.08),  # slight variance
                    "currency":  "INR",
                    "url":       p["url"],
                    "thumbnail": "",
                    "rating":    round(random.uniform(3.5, 4.8), 1),
                    "reviews":   random.randint(50, 5000),
                    "merchant":  p["merchant"],
                    "raw_query": query,
                })
            break

    return results


# ─── Main Fetch Orchestrator ─────────────────────────────────────────────────

def fetch_products(query: str) -> list[dict]:
    """
    Primary fetch: try SerpAPI first, fall back to simulation if needed.
    Returns list of raw product dicts.
    """
    products = fetch_serpapi(query)

    if not products and ENABLE_FALLBACK:
        logger.info(f"Using fallback data for '{query}'")
        products = fetch_fallback(query)

    # Attach merchant logo
    for p in products:
        merchant = p.get("merchant", "Unknown")
        p["merchant_icon"] = MERCHANT_LOGOS.get(merchant, "🏪")

    return products


def get_merchant_icon(merchant: str) -> str:
    return MERCHANT_LOGOS.get(merchant, "🏪")
