from __future__ import annotations   # MUST be line 1
import requests

from dotenv import load_dotenv
import os

import re
import json
import logging
from dataclasses import dataclass, asdict
from datetime import date, timedelta
from pathlib import Path
from typing import Optional

# Load .env from this file's own folder, not the caller's working directory.
# This matters because Node's child_process.spawn() runs this script with
# whatever cwd the Node server started in — usually the project root, NOT
# the python/ folder — so a bare load_dotenv() can silently fail to find
# OCR_API_KEY even though the .env file exists right next to this script.
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env", override=True)

API_KEY = os.getenv("OCR_API_KEY")

import cv2
import numpy as np
from PIL import Image
from rapidfuzz import process, fuzz

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger("eatlystic")

# Fail loudly at import time instead of silently returning empty results later.
if not API_KEY:
    logger.warning(
        "OCR_API_KEY is not set! Check that your .env file exists in the "
        "working directory the process is started from, and that it contains "
        "OCR_API_KEY=your_key_here"
    )


# ══════════════════════════════════════════════
# DATA MODEL
# ══════════════════════════════════════════════

CATEGORIES = [
    "vegetables", "fruits", "beverages", "dairy",
    "bakery", "snacks", "condiments", "others",
]

# Pantry.jsx (and your Mongoose schema's consumers) expect capitalized,
# singular category names like "Bakery" / "Other" — not the lowercase
# internal keys this module categorizes items into ("bakery" / "others").
# Pantry.jsx filters items with a case-sensitive exact match against its
# own CATEGORIES list, so anything saved with a mismatched case/spelling
# silently never appears in any section, even though it's in the database.
FRONTEND_CATEGORIES = [
    "Fruits", "Vegetables", "Dairy", "Bakery",
    "Snacks", "Condiments", "Beverages", "Other",
]

_CATEGORY_TO_FRONTEND = {
    "vegetables": "Vegetables",
    "fruits": "Fruits",
    "beverages": "Beverages",
    "dairy": "Dairy",
    "bakery": "Bakery",
    "snacks": "Snacks",
    "condiments": "Condiments",
    "others": "Other",
    "other": "Other",
}

def normalize_category_for_frontend(cat: str) -> str:
    return _CATEGORY_TO_FRONTEND.get(str(cat).strip().lower(), "Other")

@dataclass
class PantryItem:
    name: str
    quantity: int = 1
    unit: Optional[str] = None
    category: str = "others"
    expiry_date: Optional[date] = None

    def quantity_with_unit(self) -> str:
        if self.unit:
            return f"{self.quantity} {self.unit}"
        return str(self.quantity)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["quantity_with_unit"] = self.quantity_with_unit()
        d["expiry_date"] = str(self.expiry_date) if self.expiry_date else None
        return d


# ══════════════════════════════════════════════
# CATEGORY KEYWORD MAP
# ══════════════════════════════════════════════

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "vegetables": [
        "potato", "potatoes", "tomato", "tomatoes", "onion", "onions",
        "garlic", "ginger", "carrot", "carrots", "spinach", "broccoli",
        "cauliflower", "cabbage", "capsicum", "peas", "beans", "cucumber",
        "zucchini", "eggplant", "brinjal", "celery", "lettuce", "kale",
        "corn", "mushroom", "mushrooms", "pumpkin", "radish", "turnip",
        "leek", "asparagus", "artichoke", "beetroot", "sweet potato",
        "yam", "okra", "ladyfinger", "coriander", "parsley", "mint",
        "chilli", "chili", "gourd", "bitter gourd", "drumstick",
        "methi", "fenugreek", "palak", "vegetable", "veggies",
    ],
    "fruits": [
        "apple", "apples", "banana", "bananas", "mango", "mangoes",
        "orange", "oranges", "grape", "grapes", "strawberry", "strawberries",
        "blueberry", "blueberries", "watermelon", "melon", "pineapple",
        "papaya", "guava", "kiwi", "pear", "peach", "plum", "cherry",
        "cherries", "lemon", "lime", "coconut", "pomegranate", "fig",
        "apricot", "lychee", "jackfruit", "dragonfruit", "avocado",
        "passion fruit", "mulberry",
    ],
    "beverages": [
        "water", "juice", "cola", "soda", "soft drink", "tea", "coffee",
        "milk tea", "green tea", "iced tea", "lemonade", "squash",
        "energy drink", "sports drink", "smoothie", "shake", "cocoa",
        "hot chocolate", "kombucha", "beer", "wine", "whiskey", "vodka",
        "rum", "gin", "tonic", "sprite", "pepsi", "coca-cola", "coke",
        "fanta", "7up", "redbull", "monster", "tropicana", "minute maid",
        "real juice", "rooh afza", "twist up", "mountain dew", "dr pepper",
        "powerade", "gatorade", "lipton", "folgers", "nescafe",
        "maxwell house", "instant coffee", "ground coffee",
    ],
    "dairy": [
        "milk", "butter", "cheese", "yogurt", "yoghurt", "curd", "cream",
        "paneer", "ghee", "whey", "lassi", "ice cream", "gelato",
        "condensed milk", "evaporated milk", "sour cream", "buttermilk",
        "cottage cheese", "ricotta", "mozzarella", "cheddar", "tofu",
        "skimmed milk", "full cream milk", "toned milk", "parm", "parmesan",
        "american cheese", "cream cheese", "half and half", "eggs", "egg",
    ],
    "bakery": [
        "bread", "bun", "buns", "roll", "rolls", "cake", "muffin",
        "muffins", "croissant", "bagel", "toast", "rusk", "biscuit",
        "cookie", "cookies", "donut", "doughnut", "pie", "tart",
        "pastry", "waffle", "pancake", "brownie", "loaf", "pav",
        "sourdough", "focaccia", "ciabatta", "pita", "naan", "chapati",
        "tortilla", "wrap", "flatbread",
    ],
    "snacks": [
        "chips", "crisps", "popcorn", "nachos", "pretzel", "pretzels",
        "nuts", "peanuts", "cashew", "almonds", "walnut", "pistachio",
        "trail mix", "granola bar", "energy bar", "protein bar",
        "chocolate", "candy", "toffee", "gummy", "lollipop",
        "crackers", "wafers", "namkeen", "bhujia", "mixture",
        "mukhwas", "chivda", "mathri", "sev", "doritos", "lays",
        "cheetos", "pringles", "ritz",
    ],
    "condiments": [
        "ketchup", "sauce", "mayonnaise", "mayo", "mustard", "vinegar",
        "soy sauce", "hot sauce", "chilli sauce", "sriracha", "relish",
        "jam", "jelly", "honey", "maple syrup", "peanut butter", "pnt buttr",
        "nutella", "hummus", "salsa", "guacamole", "tzatziki",
        "pickle", "pickles", "chutney", "masala", "spice", "spices",
        "salt", "sugar", "pepper powder", "turmeric", "cumin",
        "coriander powder", "garam masala", "curry powder", "oil",
        "olive oil", "sunflower oil", "coconut oil", "mustard oil",
        "dressing", "ranch", "caesar", "balsamic", "syrup",
    ],
    "_meat": [
        "chicken", "beef", "pork", "lamb", "turkey", "fish", "salmon",
        "tuna", "shrimp", "prawn", "crab", "lobster", "mutton", "duck",
        "sausage", "bacon", "ham", "mince", "steak", "chkn", "chnk chkn",
        "chunk chicken", "canned chicken", "sardine",
    ],
    "_grains": [
        "rice", "wheat", "flour", "oats", "pasta", "noodles", "macaroni",
        "spaghetti", "quinoa", "barley", "lentils", "dal", "rajma",
        "chickpea", "corn flour", "semolina", "rava", "poha",
        "cereal", "oatmeal", "granola", "muesli",
    ],
    "_canned": [
        "canned", "tinned", "soup", "broth", "stock",
        "tomato paste", "tomato puree",
    ],
}

CATEGORY_REMAP = {
    "_meat":   "others",
    "_grains": "others",
    "_canned": "others",
}

ALL_GROCERY_KEYWORDS: list[str] = [
    kw for kws in CATEGORY_KEYWORDS.values() for kw in kws
]


# ══════════════════════════════════════════════
# FILTER PATTERNS
# ══════════════════════════════════════════════

_BARCODE_RE = re.compile(r"\b\d{7,}\b")

_TRAILING_PRICE_RE = re.compile(r"[\s\.\-]+[\d]+[\.,]?[\d]*\s*[FfNn]?\s*$")

_HARD_SKIP_RE = re.compile(
    r"""
    (wal.?mart|target|kroger|costco|whole\s*foods|safeway|publix|
     \bstore\b|manager|cashier|operator|\bregister\b|terminal|
     florida\s+ave|bengaluru|address|gstin|save\s+money|live\s+better|
     thank\s+you|visit\s+us|\bphone\b|\bfax\b|\(\d{3}\)|www\.|\.com)
    |(\bdebit\b|\bcredit\b|\bvisa\b|\bmaster\b|\bcard\b|\bcash\b|
      \btend\b|\beft\b|\bappr\b|ref\s*%|account\s*:|network\s*id|
      \btc\s+\d|\bchange\b|\bbalance\b|\bpaid\b|\bupi\b|\bpayment\b|
      \btransaction\b|\btender\b)
    |(\btotal\b|\bsubtotal\b|\bsub\s*total\b|\btax\b|\bgst\b|\bcgst\b|
      \bsgst\b|\bigst\b|\bvat\b|\bsaving\b|\bdiscount\b|\bamount\b|
      \bmrp\b|rs\.\s|\binr\b|\busd\b|\bnet\b|\bdue\b)
    |(\d{2}\s+\d{2}\s+\d{2}\s+\d{2}:\d{2})
    |(\bop\s+\d{3,}\b|\btes\s+\d+\b|\btre\b|\bst\s+\d{4,}\b)
    |(\blayaway\b|electronics|\btoys\b|jewelry|invoice|receipt|
      \bbill\s*no\b|\bnial\b|\bnnn\b|\barant\b|\bett\b|\btee\b)
    """,
    re.IGNORECASE | re.VERBOSE,
)

_PRICE_ONLY_RE = re.compile(r"^\s*[\d\s,\.₹$€£%\-\+]+\s*$")


# ══════════════════════════════════════════════
# GROCERY WHITELIST CHECK
# ══════════════════════════════════════════════

def _is_grocery_item(text: str) -> bool:
    lower = text.lower()
    for kw in ALL_GROCERY_KEYWORDS:
        if kw in lower:
            return True
    result = process.extractOne(
        lower, ALL_GROCERY_KEYWORDS,
        scorer=fuzz.partial_ratio,
        score_cutoff=85,
    )
    return result is not None


# ══════════════════════════════════════════════
# NAME DEDUPLICATION HELPER
# ══════════════════════════════════════════════

def _deduplicate_items(items: list[PantryItem]) -> list[PantryItem]:
    merged: list[PantryItem] = []
    used: list[bool] = [False] * len(items)

    for i, item in enumerate(items):
        if used[i]:
            continue
        group = [item]
        for j in range(i + 1, len(items)):
            if used[j]:
                continue
            score = fuzz.ratio(item.name.lower(), items[j].name.lower())
            if score >= 92:
                group.append(items[j])
                used[j] = True

        best = max(group, key=lambda x: len(x.name))
        best.quantity = sum(g.quantity for g in group)
        merged.append(best)
        used[i] = True

    logger.info("Deduplication: %d → %d items.", len(items), len(merged))
    return merged


# ══════════════════════════════════════════════
# NAME CLEANUP
# ══════════════════════════════════════════════

_ABBREV_MAP = {
    "gv pnt buttr":  "Peanut Butter",
    "pnt buttr":     "Peanut Butter",
    "gv parm":       "Parmesan Cheese",
    "parm":          "Parmesan Cheese",
    "gv chnk chkn":  "Canned Chicken",
    "chnk chkn":     "Canned Chicken",
    "chkn":          "Chicken",
    "sc twist up":   "Soda (Twist Up)",
    "twist up":      "Soda (Twist Up)",
    "gv":            None,   # lone "Gv" prefix → remove
}

def _expand_abbreviations(name: str) -> str:
    lower = name.lower().strip()
    for abbr, full in _ABBREV_MAP.items():
        if full is None:
            continue
        if lower == abbr or lower.startswith(abbr + " ") or lower.endswith(" " + abbr):
            return full
    name = re.sub(r"^Gv\s+", "", name, flags=re.IGNORECASE).strip()
    return name


def normalise_item_name(raw_name: str) -> str:
    name = raw_name

    name = re.sub(r"\b[a-zA-Z]\b", " ", name)
    name = re.sub(r"\b[a-zA-Z]{1,2}\d+\b", " ", name)
    name = re.sub(r"[^a-zA-Z\s]", " ", name)
    name = re.sub(r"\s{2,}", " ", name).strip()

    name = _expand_abbreviations(name)
    return name.title()


# ══════════════════════════════════════════════
# MODULE 1 — OCR EXTRACTION
# ══════════════════════════════════════════════

def preprocess_image_for_ocr(image_path: str | Path) -> np.ndarray:
    img = cv2.imread(str(image_path))
    if img is None:
        raise FileNotFoundError(f"Cannot open image: {image_path}")
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    if max(h, w) < 1500:
        scale = 1500 / max(h, w)
        gray = cv2.resize(gray, None, fx=scale, fy=scale,
                          interpolation=cv2.INTER_CUBIC)
    binary = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, blockSize=31, C=10,
    )
    return cv2.fastNlMeansDenoising(binary, h=10)


def extract_text_from_image(image_path) -> str:
    """
    Sends the preprocessed image to OCR.space and returns the parsed text.

    IMPORTANT: OCR.space's multipart form requires the file to be sent under
    the field name "file". Sending it as "filename" (or anything else) means
    no actual file is uploaded, so the API responds with an error/empty
    payload instead of failing the HTTP request — which is why this used to
    silently return an empty list downstream instead of raising.
    """
    if not API_KEY:
        raise RuntimeError(
            "OCR_API_KEY is missing. Check your .env file and that the "
            "process is started from a directory where load_dotenv() can find it."
        )

    processed = preprocess_image_for_ocr(image_path)
    _, buffer = cv2.imencode(".png", processed)

    response = requests.post(
        "https://api.ocr.space/parse/image",
        files={
            "file": ("bill.png", buffer.tobytes(), "image/png"),  # <-- FIXED (was "filename")
        },
        data={
            "apikey": API_KEY,
            "language": "eng",
            "OCREngine": 2,
        },
        timeout=30,
    )

    response.raise_for_status()
    result = response.json()

    # OCR.space returns HTTP 200 even on internal errors, so check explicitly.
    if result.get("IsErroredOnProcessing"):
        error_msg = result.get("ErrorMessage") or result.get("ErrorDetails")
        logger.error("OCR.space reported an error: %s", error_msg)
        raise RuntimeError(f"OCR.space error: {error_msg}")

    parsed_results = result.get("ParsedResults") or []
    if not parsed_results:
        logger.warning("OCR.space returned no ParsedResults. Full response: %s", result)
        return ""

    raw = parsed_results[0].get("ParsedText", "")
    logger.info("OCR extracted %d characters.", len(raw))
    logger.debug("Raw OCR text:\n%s", raw)
    return raw


# ══════════════════════════════════════════════
# MODULE 2 — TEXT CLEANING
# ══════════════════════════════════════════════

def clean_raw_text(raw_text: str) -> list[str]:
    lines: list[str] = []

    for raw_line in raw_text.splitlines():
        line = raw_line.strip()

        if not line or len(line) < 3:
            continue
        if _PRICE_ONLY_RE.match(line):
            continue

        line = _BARCODE_RE.sub("", line).strip()
        line = _TRAILING_PRICE_RE.sub("", line).strip()

        if _HARD_SKIP_RE.search(line):
            continue

        if not _is_grocery_item(line):
            continue

        if len(line) < 3:
            continue

        lines.append(line)

    logger.info("Strict cleaning kept %d grocery lines.", len(lines))
    return lines


_QTY_RE = re.compile(
    r"""
    (?:
        (\d+)\s*[xX×]\s*
        |[xX×]\s*(\d+)
        |qty[:\s]+(\d+)
        |(\d+)\s*(kg|g|gm|grams?|l|ltr|ml|pcs?|nos?|pack|packs?)\b
        |(\d+)\s+
    )
    """,
    re.IGNORECASE | re.VERBOSE,
)

_UNIT_NOISE = re.compile(
    r"\b(rs|inr|kg|g|gm|gram|grams|ltr|l|ml|pcs?|nos?|pack|packs)\b",
    re.IGNORECASE
)

def parse_quantity(line: str) -> tuple[int, str, str | None]:
    qty = 1
    unit = None

    m = _QTY_RE.search(line)
    if m:
        for g in m.groups():
            if g:
                if g.isdigit():
                    qty = max(1, int(g))
                elif g.lower() in ["kg", "g", "gm", "ltr", "l", "ml", "pcs", "nos", "pack", "packs"]:
                    unit = g.lower()

        line = _QTY_RE.sub("", line).strip()

    line = _UNIT_NOISE.sub("", line)
    line = re.sub(r"[:\-–|]", " ", line)
    line = re.sub(r"\b[a-zA-Z]\b", " ", line)
    line = re.sub(r"\s{2,}", " ", line).strip()

    return qty, line, unit


# ══════════════════════════════════════════════
# MODULE 3 — CATEGORISATION
# ══════════════════════════════════════════════

_KEYWORD_LIST: list[tuple[str, str]] = [
    (kw, cat)
    for cat, kws in CATEGORY_KEYWORDS.items()
    for kw in kws
]
_KW_STRINGS: list[str] = [kw for kw, _ in _KEYWORD_LIST]


def categorise_item(item_name: str, fuzzy_threshold: int = 78) -> str:
    name_lower = item_name.lower()
    for kw, cat in _KEYWORD_LIST:
        if kw in name_lower:
            return CATEGORY_REMAP.get(cat, cat)
    result = process.extractOne(
        name_lower, _KW_STRINGS,
        scorer=fuzz.partial_ratio,
        score_cutoff=fuzzy_threshold,
    )
    if result:
        raw_cat = _KEYWORD_LIST[result[2]][1]
        return CATEGORY_REMAP.get(raw_cat, raw_cat)
    return "others"


# ══════════════════════════════════════════════
# MODULE 4 — BUILD & UPDATE PANTRY
# ══════════════════════════════════════════════

def build_pantry_items(
    cleaned_lines: list[str],
    expiry_map: dict[str, date] | None = None,
) -> list[PantryItem]:
    expiry_map = expiry_map or {}
    raw_items: list[PantryItem] = []

    for line in cleaned_lines:
        qty, name_raw, unit = parse_quantity(line)
        name = normalise_item_name(name_raw)
        if len(name) < 2:
            continue
        category = categorise_item(name)
        raw_items.append(PantryItem(
            name=name,
            quantity=qty,
            unit=unit,
            category=category,
            expiry_date=expiry_map.get(name.lower()),
        ))
    items = _deduplicate_items(raw_items)
    logger.info("Final pantry items after dedup: %d", len(items))
    return items


def update_pantry(
    existing_pantry: list[dict],
    new_items: list[PantryItem],
) -> list[dict]:
    index = {e["name"].lower(): i for i, e in enumerate(existing_pantry)}
    for item in new_items:
        key = item.name.lower()
        if key in index:
            existing_pantry[index[key]]["quantity"] += item.quantity
        else:
            existing_pantry.append(item.to_dict())
            index[key] = len(existing_pantry) - 1
    return existing_pantry


# ══════════════════════════════════════════════
# MAIN PIPELINE
# ══════════════════════════════════════════════

def process_bill_image(
    image_path: str | Path,
    existing_pantry: list[dict] | None = None,
    expiry_map: dict[str, date] | None = None,
) -> tuple[list[PantryItem], list[dict]]:
    if existing_pantry is None:
        existing_pantry = []
    raw       = extract_text_from_image(image_path)
    cleaned   = clean_raw_text(raw)
    new_items = build_pantry_items(cleaned, expiry_map)
    updated   = update_pantry(existing_pantry, new_items)
    return new_items, updated


def process_bill_text(
    raw_text: str,
    existing_pantry: list[dict] | None = None,
    expiry_map: dict[str, date] | None = None,
) -> tuple[list[PantryItem], list[dict]]:
    if existing_pantry is None:
        existing_pantry = []
    cleaned   = clean_raw_text(raw_text)
    new_items = build_pantry_items(cleaned, expiry_map)
    updated   = update_pantry(existing_pantry, new_items)
    return new_items, updated


# ══════════════════════════════════════════════
# STREAMLIT UI  (upload + editable table)
# ══════════════════════════════════════════════

def streamlit_bill_uploader() -> None:
    import streamlit as st
    import tempfile, os
    import pandas as pd

    st.subheader("📷 Scan Grocery Bill")

    uploaded = st.file_uploader(
        "Upload a photo of your grocery bill",
        type=["jpg", "jpeg", "png", "webp"],
        key="bill_upload",
    )

    if uploaded:
        suffix = Path(uploaded.name).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(uploaded.read())
            tmp_path = tmp.name

        try:
            with st.spinner("Scanning bill…"):
                try:
                    new_items, _ = process_bill_image(tmp_path)
                except Exception as e:
                    st.error(f"OCR/parse failed: {e}")
                    return
        finally:
            os.unlink(tmp_path)

        if not new_items:
            st.warning("No grocery items detected. Try a clearer photo.")
            return

        st.success(f"✅ Detected {len(new_items)} item(s). Edit below then save.")

        st.markdown("### ✏️ Review & Edit Detected Items")
        st.caption("You can change any name, quantity, category, or expiry date directly in the table.")

        df = pd.DataFrame([i.to_dict() for i in new_items])
        df = df.drop(columns=["unit"], errors="ignore")

        # Convert internal lowercase category keys ("bakery", "others") to
        # the exact capitalized strings Pantry.jsx filters against
        # ("Bakery", "Other") — otherwise items save fine but never show
        # up in any category section on the pantry page.
        df["category"] = df["category"].apply(normalize_category_for_frontend)

        # The bill parser can't detect expiry dates from a receipt, so this
        # starts out blank for every scanned item. Your backend's schema
        # requires a non-empty "expiry" field, so a blank date here would
        # get sent as null and rejected as "Missing required fields" for
        # every single item. Default to a week from today instead — the
        # user can still edit any row to a real date before saving.
        default_expiry = date.today() + timedelta(days=7)
        df["expiry_date"] = pd.to_datetime(df["expiry_date"], errors="coerce").dt.date
        df["expiry_date"] = df["expiry_date"].fillna(default_expiry)

        edited_df = st.data_editor(
            df,
            column_config={
                "name": st.column_config.TextColumn(
                    "Item Name", width="large"
                ),
                "quantity": st.column_config.NumberColumn(
                    "Qty", min_value=1, max_value=999, step=1, width="small"
                ),
                "category": st.column_config.SelectboxColumn(
                    "Category", options=FRONTEND_CATEGORIES, width="medium"
                ),
                "expiry_date": st.column_config.DateColumn(
                    "Expiry Date",
                    min_value=date.today(),
                    max_value=date(2100, 12, 31),
                    format="YYYY-MM-DD",
                ),
            },
            num_rows="dynamic",
            use_container_width=True,
            key="item_editor",
        )

        with st.expander("➕ Add an item manually (if OCR missed something)"):
            col1, col2, col3, col4 = st.columns([3, 1, 2, 2])
            with col1:
                m_name = st.text_input("Item name", key="m_name")
            with col2:
                m_qty = st.number_input("Qty", min_value=1, value=1, key="m_qty")
            with col3:
                m_cat = st.selectbox("Category", FRONTEND_CATEGORIES, key="m_cat")
            with col4:
                m_exp = st.text_input("Expiry (optional)", key="m_exp")

            if st.button("Add item"):
                if m_name.strip():
                    new_row = pd.DataFrame([{
                        "name": m_name.strip().title(),
                        "quantity": int(m_qty),
                        "category": m_cat,
                        "expiry_date": m_exp.strip() or "",
                    }])
                    edited_df = pd.concat([edited_df, new_row], ignore_index=True)
                    st.success(f"Added '{m_name.title()}' to the list.")
                else:
                    st.warning("Please enter an item name.")

        user_id = st.session_state.get("userId")

        if not user_id:
            st.error("User not logged in")
            return

        if st.button("💾 Save to Pantry", type="primary"):
            if "pantry" not in st.session_state:
                st.session_state["pantry"] = []

            saved_items = []
            skipped_rows = []

            for _, row in edited_df.iterrows():
                name = str(row["name"]).strip()
                category = str(row["category"]).strip() if row["category"] else ""
                expiry = row["expiry_date"] if isinstance(row["expiry_date"], date) else None

                try:
                    quantity = int(row["quantity"])
                except (TypeError, ValueError):
                    quantity = 0

                # Every field must actually be filled in — no silent
                # defaults, no blanks/N/A slipping through to the backend.
                if not name or not category or not expiry or quantity < 1:
                    skipped_rows.append(name or "(unnamed row)")
                    continue

                saved_items.append(PantryItem(
                    name=name,
                    quantity=quantity,
                    category=category,
                    expiry_date=expiry,
                ))

            if skipped_rows:
                st.warning(
                    "⚠️ Skipped item(s) with missing name, quantity, category, "
                    f"or expiry date — please fill these in and save again: "
                    f"{', '.join(skipped_rows)}"
                )

            # Configurable so this matches your real Node backend, not the
            # old Flask demo port. Set PANTRY_API_URL in your .env to the
            # same value your React app uses for VITE_API_BASE_URL + "/pantry",
            # e.g. PANTRY_API_URL=http://localhost:3001/api/pantry
            API_URL = os.getenv("PANTRY_API_URL", "http://localhost:5000/api/pantry")
            success_count = 0

            for item in saved_items:
                payload = {
                    "userId": user_id,
                    "name": item.name,
                    "quantity": item.quantity,
                    "consumed": 0,
                    "category": item.category,
                    "expiry": str(item.expiry_date) if item.expiry_date else None,
                    "imageUrl": "",
                }

                try:
                    response = requests.post(API_URL, json=payload)
                    if response.status_code in [200, 201]:
                        st.session_state["pantry"].append(payload)
                        success_count += 1
                    else:
                        st.error(
                            f"Failed to save {item.name}: "
                            f"{response.json().get('message', 'Unknown error')}"
                        )
                except Exception as e:
                    st.error(f"API Error: {e}")

            st.success(f"✅ {success_count} item(s) saved to MongoDB!")

            if success_count > 0:
                # This page was opened from Pantry.jsx in the same browser
                # tab, so send that tab back there once saving is done.
                # Set PANTRY_PAGE_URL in your .env if your React app doesn't
                # run at the default Vite dev URL below.
                pantry_page_url = os.getenv(
                    "PANTRY_PAGE_URL", "http://localhost:5173/pantry"
                )
                st.info("Redirecting back to your pantry…")
                st.link_button("⬅ Back to Pantry now", pantry_page_url)

                import streamlit.components.v1 as components
                components.html(
                    f"""
                    <script>
                    setTimeout(function() {{
                        window.location.href = "{pantry_page_url}";
                    }}, 2500);
                    </script>
                    """,
                    height=0,
                )

            st.markdown("### 🧺 Current Pantry")
            st.dataframe(
                pd.DataFrame(st.session_state["pantry"]),
                use_container_width=True,
            )


# ══════════════════════════════════════════════
# DEMO
# ══════════════════════════════════════════════

DEMO_BILL_TEXT = """
    Wal-Mart
    Save Money. Live Better.
    (813) 932-0562
    Manager Colleen Brickey
    N Florida Ave  8885
    Tampa Fl 33604
    St 5221 Op 00001061 Tes 06 Tre

    Bread 007225003712 F 2.88 N
    Gv Pnt Buttr 007874237003 F 3.84 N
    Gv Parm 1602 007874201510 F 4.98
    Gv Chnk Chkn 007874206784 F 1.98 N
    12 Ct Nitril 073191913822 2.78
    Folgers 002550000377 F 10.48 N
    Sc Twist Up 007874222682 F 0.84
    Eggs 060538871459 F 1.88

    Debit Tend
    Eft Debit Pay From Primary
    Account :
    11 06 11 02:21:54
    Ref %
    Network Id. 0071 Appr Code
    Layaway Is Back For Electronics, Toys, And Jewelry.
"""


def run_demo() -> None:
    print("\n" + "=" * 58)
    print("  EATLYSTIC — Grocery-Only Bill Parser Demo")
    print("=" * 58)
    new_items, _ = process_bill_text(DEMO_BILL_TEXT)
    if not new_items:
        print("No grocery items found.")
        return
    print(f"\n{'ITEM':<28} {'QTY':>4}  CATEGORY")
    print("-" * 58)
    for item in new_items:
        print(f"{item.name:<28} {item.quantity:>4}  {item.category}")
    print(f"\nTotal grocery items: {len(new_items)}")
    print("=" * 58 + "\n")


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python eatlystic_bill_parser.py <image_path>")
        print("Running text-based demo instead (no image supplied):\n")
        run_demo()
        sys.exit(0)

    image_path = sys.argv[1]

    try:
        items, _ = process_bill_image(image_path)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    print(json.dumps(
        [item.to_dict() for item in items],
        default=str
    ))
