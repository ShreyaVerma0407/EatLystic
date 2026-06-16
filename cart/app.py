"""
Hybrid Product Price Comparison Engine
Streamlit UI — Production-Ready & Enhanced
"""

import time
import json
import logging
import concurrent.futures

import streamlit as st
from pathlib import Path
from modules.serpapi_client import fetch_products
from modules.ranker import rank_all

from typing import List, Dict, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ─── Page Config ─────────────────────────────────────────────────────────────

st.set_page_config(
    page_title="PriceHunt — Smart Price Comparison",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="collapsed",
)


# ─── Custom CSS ──────────────────────────────────────────────────────────────

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ───────── GLOBAL RESET & TYPOGRAPHY ───────── */
html, body, [class*="css"], .stApp {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    background-color: #f8fafc !important;
    color: #0f172a !important;
}

[data-testid="stAppViewContainer"] {
    background-color: #f8fafc !important;
}

[data-testid="stMainBlockContainer"] {
    padding-top: 2.5rem !important;
    padding-bottom: 5rem !important;
}

/* ───────── HERO SECTION ───────── */
.hero-container {
    padding: 1.5rem 0 2.5rem 0;
}

.hero-title {
    font-size: 3.25rem;
    font-weight: 800;
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.04em;
    margin-bottom: 0.5rem;
}

.hero-sub {
    color: #64748b;
    font-size: 1.15rem;
    font-weight: 400;
}

/* ───────── MODERN CARD CONTAINERS ───────── */
.best-deal-card {
    background: #ffffff !important;
    border-radius: 20px !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
    padding: 24px !important;
    margin-bottom: 1.5rem !important;
}

.alt-card {
    background: #ffffff !important;
    border-radius: 16px !important;
    border: 1px solid #e2e8f0 !important;
    padding: 18px 20px !important;
    margin-bottom: 0.75rem !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.alt-card:hover {
    border-color: #6366f1 !important;
    transform: translateY(-2px);
    box-shadow: 0 12px 20px -8px rgba(99, 102, 241, 0.15) !important;
}

/* ───────── BADGES & LABELS ───────── */
.best-deal-label {
    background: linear-gradient(135deg, #e0e7ff, #e0f2fe);
    color: #4f46e5;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 1rem;
}

.product-title-big {
    font-size: 1.35rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.3;
    margin-bottom: 0.5rem;
}

.price-big {
    font-size: 2.25rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1;
}

.price-unit {
    font-size: 0.87rem;
    color: #64748b;
    margin-top: 0.25rem;
    font-weight: 500;
}

/* ───────── CHIPS ───────── */
.merchant-chip {
    display: inline-flex;
    align-items: center;
    background: #f1f5f9;
    color: #334155;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 0.75rem;
}

.savings-chip {
    display: inline-flex;
    align-items: center;
    background: #f0fdf4;
    color: #16a34a;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 0.75rem;
    margin-left: 0.5rem;
    border: 1px solid #dcfce7;
}

/* ───────── ALTERNATIVE CARDS TEXT ───────── */
.alt-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
}

.alt-price {
    font-size: 1.35rem;
    font-weight: 700;
    color: #0f172a;
}

.alt-merchant {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
}

.badge-chip {
    background: #f8fafc;
    color: #64748b;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: 500;
}

/* ───────── INTERACTIVE BUTTONS ───────── */
.buy-btn {
    background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
    color: white !important;
    padding: 12px 24px;
    border-radius: 12px;
    text-decoration: none !important;
    font-weight: 600;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
    transition: all 0.2s;
    width: 100%;
    text-align: center;
    border: none;
}

.buy-btn:hover {
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
    transform: translateY(-1px);
}

.buy-btn-outline {
    border: 1px solid #cbd5e1;
    color: #475569 !important;
    padding: 8px 16px;
    border-radius: 10px;
    text-decoration: none !important;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.15s;
    display: inline-block;
}

.buy-btn-outline:hover {
    border-color: #6366f1;
    color: #6366f1 !important;
    background: #f5f3ff;
}

/* ───────── METRIC STAT BOXES ───────── */
.stat-box {
    background: #ffffff;
    border-radius: 14px;
    padding: 16px;
    text-align: center;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.stat-val {
    font-size: 1.65rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
}

.stat-label {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 4px;
}

.query-badge {
    display: inline-block;
    background: #e0e7ff;
    color: #4f46e5;
    border-radius: 9999px;
    padding: 6px 16px;
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.section-header {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
    font-weight: 700;
    margin: 1.5rem 0 0.75rem 0;
}

.item-divider {
    border: 0;
    height: 1px;
    background: linear-gradient(to right, #e2e8f0, transparent);
    margin: 3rem 0;
}

/* ───────── FORM OVERRIDES ───────── */
[data-testid="stTextInput"] input {
    background: #ffffff !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 12px !important;
    padding: 12px 16px !important;
    font-size: 1rem !important;
    color: #0f172a !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
    transition: all 0.2s;
}

[data-testid="stTextInput"] input:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
}

.stButton > button {
    background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
    color: white !important;
    border-radius: 12px !important;
    padding: 12px 24px !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
    border: none !important;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15) !important;
    transition: all 0.2s !important;
    height: 48px;
}

.stButton > button:hover {
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.25) !important;
    transform: translateY(-1px);
    opacity: 1 !important;
}

/* ───────── EMPTY STATE CONTAINERS ───────── */
.empty-state-card {
    background: #ffffff;
    border: 1px dashed #cbd5e1;
    border-radius: 20px;
    padding: 4rem 2rem;
    text-align: center;
    margin-top: 1.5rem;
}

.empty-state-icon {
    font-size: 3.5rem;
    margin-bottom: 1.25rem;
}

.empty-state-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
}

.empty-state-sub {
    font-size: 0.95rem;
    color: #64748b;
    margin-top: 0.5rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}

/* Hide default headers/footers */
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
</style>
""", unsafe_allow_html=True)


# ─── Helpers ─────────────────────────────────────────────────────────────────

def parse_input(raw: str) -> List[str]:
    items = []
    for part in raw.replace("\n", ",").split(","):
        clean = part.strip().lower()
        if clean:
            items.append(clean)
    return list(dict.fromkeys(items))


def format_price(price: Optional[float]) -> str:
    if price is None:
        return "N/A"
    return f"₹{price:,.0f}"


def format_ppu(ppu: Optional[float]) -> str:
    if ppu is None or ppu == 0:
        return ""
    return f"₹{ppu:.1f}/100g"


def score_color(score: float) -> str:
    if score >= 80: return "#10b981" # Emerald 500
    if score >= 60: return "#f59e0b" # Amber 500
    return "#ef4444" # Red 500


def fetch_all_parallel(items: List[str]) -> Dict[str, List[Dict]]:
    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(items), 5)) as executor:
        future_map = {executor.submit(fetch_products, item): item for item in items}
        for future in concurrent.futures.as_completed(future_map):
            item = future_map[future]
            try:
                results[item] = future.result()
            except Exception as e:
                logger.error(f"Fetch error for {item}: {e}")
                results[item] = []
    return results


# ─── Card Renderers ──────────────────────────────────────────────────────────

def render_best_deal(product: dict, query: str):
    ppu_str    = format_ppu(product.get("price_per_unit"))
    savings    = product.get("savings_vs_avg", 0)
    final_sc   = product.get("final_score", 0)
    price_sc   = product.get("price_score", 0)
    match_sc   = product.get("match_score", 0)
    merchant   = product.get("merchant", "Unknown")
    icon       = product.get("merchant_icon", "🏪")
    url        = product.get("url", "#")
    title      = product.get("title", "")
    price      = product.get("price", 0)

    # Clean layout separation split into columns
    st.markdown('<div class="best-deal-card">', unsafe_allow_html=True)

    col_left, col_right = st.columns([1.4, 1.0], gap="large")

    with col_left:
        st.markdown(f"""
        <div class="best-deal-label">✨ BEST MATCH DEAL</div>
        <div class="product-title-big">{title}</div>
        <div class="price-big">{format_price(price)}</div>
        {"<div class='price-unit'>" + ppu_str + "</div>" if ppu_str else ""}
        <div style="margin-top: 0.5rem;">
            <div class="merchant-chip">{icon} {merchant}</div>
            {"<div class='savings-chip'>💰 Save ~₹" + f"{savings:.0f}" + "</div>" if savings > 0 else ""}
        </div>
        """, unsafe_allow_html=True)

    with col_right:
        # Mini metrics grid inside card right section
        sc1, sc2, sc3 = st.columns(3)
        with sc1:
            st.markdown(f'<div class="stat-box"><div class="stat-val" style="color:{score_color(final_sc)}">{final_sc:.0f}</div><div class="stat-label">Overall</div></div>', unsafe_allow_html=True)
        with sc2:
            st.markdown(f'<div class="stat-box"><div class="stat-val" style="color:{score_color(price_sc)}">{price_sc:.0f}</div><div class="stat-label">Price</div></div>', unsafe_allow_html=True)
        with sc3:
            st.markdown(f'<div class="stat-box"><div class="stat-val" style="color:{score_color(match_sc)}">{match_sc:.0f}</div><div class="stat-label">Match</div></div>', unsafe_allow_html=True)

        st.markdown("<div style='margin-top: 20px;'></div>", unsafe_allow_html=True)
        if url and url != "#":
            st.markdown(f'<a href="{url}" target="_blank" class="buy-btn">🛒 Purchase From {merchant}</a>', unsafe_allow_html=True)
        else:
            st.markdown('<span style="color:#64748b;font-size:0.85rem;display:block;text-align:center;">Link Unavailable</span>', unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)


def render_alternative(product: dict, rank: int):
    title    = product.get("title", "")
    price    = product.get("price", 0)
    merchant = product.get("merchant", "Unknown")
    icon     = product.get("merchant_icon", "🏪")
    url      = product.get("url", "#")
    badge    = product.get("badge", "")
    f_score  = product.get("final_score", 0)
    ppu_str  = format_ppu(product.get("price_per_unit"))

    buy_html = f'<a href="{url}" target="_blank" class="buy-btn-outline">View Deal →</a>' if url and url != "#" else ""

    st.markdown(f"""
    <div class="alt-card">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
        <div style="flex:1;">
          <div class="alt-title"><span style="color:#6366f1;font-weight:700;margin-right:6px;">#{rank}</span>{title}</div>
          <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
            <span class="alt-merchant">{icon} {merchant}</span>
            {f'<span class="badge-chip">' + badge + '</span>' if badge else ''}
            {f"<span class='alt-merchant'>· {ppu_str}</span>" if ppu_str else ""}
          </div>
        </div>
        <div style="text-align:right; display:flex; align-items:center; gap:20px; flex-shrink:0;">
          <div>
            <div class="alt-price">{format_price(price)}</div>
            <div style="font-size:0.75rem; font-weight:600; color:{score_color(f_score)}; margin-top:2px;">Score: {f_score:.0f}</div>
          </div>
          <div>{buy_html}</div>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)


def render_no_result(query: str):
    st.markdown(f"""
    <div class="empty-state-card" style="border-color: #f87171;">
      <div class="empty-state-icon">🔍</div>
      <div class="empty-state-title" style="color: #ef4444;">No Matches Found for "{query}"</div>
      <div class="empty-state-sub">We couldn't retrieve variants for this item. Verify formatting, or try adjusting filters in the configuration panel.</div>
    </div>
    """, unsafe_allow_html=True)


def render_result_section(result: dict):
    query = result.get("query", "")
    best  = result.get("best_deal")
    alts  = result.get("alternatives", [])
    total = result.get("total_found", 0)

    st.markdown(f'<div class="query-badge">🔹 {query.title()}</div>', unsafe_allow_html=True)
    st.markdown(f'<span style="color:#64748b; font-size:0.85rem; margin-left:8px; font-weight:500;">{total} variants indexed and ranked</span>', unsafe_allow_html=True)
    st.markdown("<div style='margin-top: 10px;'></div>", unsafe_allow_html=True)

    if not best:
        render_no_result(query)
        return

    render_best_deal(best, query)

    if alts:
        st.markdown('<div class="section-header">Alternative Offers</div>', unsafe_allow_html=True)
        for i, alt in enumerate(alts, 1):
            render_alternative(alt, i)


# ─── Sidebar ─────────────────────────────────────────────────────────────────

def render_sidebar():
    with st.sidebar:
        st.markdown("### ⚙️ Control Engine")
        mode = st.radio(
            "Source Protocol",
            ["Auto Engine Optimization", "Static Engine Local Cache"],
            index=0,
        )
        st.markdown("---")
        st.markdown("### 📊 Metrics Engine Weight")
        st.markdown("""
        | Metrics Target | Bias Value |
        |:---|:---|
        | Price Index Alpha | **70%** |
        | Context Match Matrix | **30%** |
        """)
        st.markdown("---")
        st.markdown("### 🔑 Authentication")
        serpapi_key = st.text_input("SerpAPI Gateway Key", type="password", placeholder="Paste API passkey...")
        if serpapi_key:
            import os
            os.environ["SERPAPI_KEY"] = serpapi_key
            st.success("Configuration updated ✓")
        st.markdown("---")
        st.caption("Engine Core Framework v1.1.0")
        return mode


# ─── JSON Export ─────────────────────────────────────────────────────────────

def render_json_export(results: List[Dict]):
    with st.expander("📋 Structural Payload Output (JSON)", expanded=False):
        slim = []
        for r in results:
            slim.append({
                "query":       r.get("query"),
                "total_found": r.get("total_found"),
                "best_deal": {
                    k: v for k, v in (r.get("best_deal") or {}).items()
                    if k in ("title", "price", "merchant", "url", "final_score", "badge")
                } if r.get("best_deal") else None,
                "alternatives": [
                    {k: v for k, v in alt.items()
                     if k in ("title", "price", "merchant", "url", "final_score", "badge")}
                    for alt in r.get("alternatives", [])
                ],
            })
        st.code(json.dumps(slim, indent=2), language="json")


# ─── Main App ────────────────────────────────────────────────────────────────

def main():
    mode = render_sidebar()

    query_items_raw = st.query_params.get("items", "")
    suggested_items = parse_input(query_items_raw) if query_items_raw else []

    if "selected_items" not in st.session_state:
        st.session_state.selected_items = []

    # Hero Banner
    st.markdown("""
    <div class="hero-container">
        <div class="hero-title">🛒 PriceHunt</div>
        <div class="hero-sub">Hybrid dynamic price scoring index engine. Engine pipeline scans multiple channels natively.</div>
    </div>
    """, unsafe_allow_html=True)

    # Smart Cart Link Chips
    if suggested_items:
        st.markdown(
            '<div style="font-size:0.75rem; font-weight:700; color:#4f46e5; '
            'text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem;">'
            '⚡ Linked Cart Entities Available — Append to tracking queue</div>',
            unsafe_allow_html=True,
        )
        chip_cols = st.columns(min(len(suggested_items), 4))
        for i, item in enumerate(suggested_items):
            col = chip_cols[i % 4]
            with col:
                already_added = item in st.session_state.selected_items
                label = f"✓ {item.title()}" if already_added else f"+ {item.title()}"
                if st.button(
                    label,
                    key=f"chip_{item}",
                    disabled=already_added,
                    use_container_width=True,
                ):
                    st.session_state.selected_items.append(item)
                    st.rerun()
        st.markdown("<br>", unsafe_allow_html=True)

    # Primary Input Form Array
    prefilled = ", ".join(st.session_state.selected_items) if st.session_state.selected_items else ""

    col_input, col_btn = st.columns([4.5, 1.2], gap="medium")
    with col_input:
        raw_input = st.text_input(
            label="Search Query Target Entry",
            label_visibility="collapsed",
            placeholder="Type items to rank (e.g., milk, organic eggs, basmati rice...)",
            value=prefilled,
        )
    with col_btn:
        search_clicked = st.button("Execute Index Analysis", type="primary", use_container_width=True)

    if not suggested_items:
        st.markdown(
            '<div style="margin-top:-0.5rem; margin-bottom:1.5rem; padding-left:4px;">'
            '<span style="font-size:0.8rem; color:#64748b; font-weight:500;">Quick-start syntax maps: </span>'
            '<span style="font-size:0.8rem; color:#4f46e5; font-weight:600; cursor:pointer;">'
            'fresh milk, sourdough bread &nbsp;·&nbsp; olive oil, brown sugar'
            '</span></div>',
            unsafe_allow_html=True,
        )

    # Execution Loop Pipeline
    if search_clicked and raw_input.strip():
        items = parse_input(raw_input)

        if not items:
            st.warning("Execution terminated. Structural array entry empty.")
            return

        if len(items) > 8:
            st.warning("Queue overflow. Restructuring pipeline context matrix window to top 8 objects.")
            items = items[:8]

        if "Static" in mode:
            import os
            os.environ["SERPAPI_KEY"] = ""

        progress_bar = st.progress(0, text="Initializing matrix threads...")
        t_start = time.time()

        with st.spinner(""):
            progress_bar.progress(25, text=f"Scanning nodes for target array objects [{len(items)} items]...")
            raw_data = fetch_all_parallel(items)

            progress_bar.progress(72, text="Mapping cost function scoring parameters...")
            ranked_results = rank_all(items, raw_data)

            progress_bar.progress(100, text="Compilation sequence complete.")
            time.sleep(0.2)
            progress_bar.empty()

        elapsed = time.time() - t_start

        total_products = sum(r.get("total_found", 0) for r in ranked_results)
        items_with_results = sum(1 for r in ranked_results if r.get("best_deal"))

        # Analytics Panel
        st.markdown("<div style='margin-top:10px;'></div>", unsafe_allow_html=True)
        sc1, sc2, sc3, sc4 = st.columns(4)
        sc1.markdown(f'<div class="stat-box"><div class="stat-val">{len(items)}</div><div class="stat-label">Tracked Targets</div></div>', unsafe_allow_html=True)
        sc2.markdown(f'<div class="stat-box"><div class="stat-val">{total_products}</div><div class="stat-label">Nodes Parsed</div></div>', unsafe_allow_html=True)
        sc3.markdown(f'<div class="stat-box"><div class="stat-val" style="color:#10b981;">{items_with_results}</div><div class="stat-label">Optimal Outputs</div></div>', unsafe_allow_html=True)
        sc4.markdown(f'<div class="stat-box"><div class="stat-val">{elapsed:.2f}s</div><div class="stat-label">Runtime Delta</div></div>', unsafe_allow_html=True)
        st.markdown("<div style='margin-top:25px;'></div>", unsafe_allow_html=True)

        # Output Sections
        for i, result in enumerate(ranked_results):
            render_result_section(result)
            if i < len(ranked_results) - 1:
                st.markdown('<div class="item-divider"></div>', unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        render_json_export(ranked_results)

    elif not search_clicked:
        if not suggested_items:
            st.markdown("""
            <div class="empty-state-card">
              <div class="empty-state-icon">📊</div>
              <div class="empty-state-title">Engine State: Idle</div>
              <div class="empty-state-sub">Provide consumer targets inside the sequence field tracking entry space above to execute distributed ranking workflows.</div>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div class="empty-state-card" style="border-color: #6366f1; background: #f5f3ff;">
              <div class="empty-state-icon">☝️</div>
              <div class="empty-state-title" style="color: #4f46e5;">Pending Selection Inputs Detected</div>
              <div class="empty-state-sub">Select linked item fragments above to build structural search tokens, then initiate the live valuation index scan.</div>
            </div>
            """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()