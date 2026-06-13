"""
Hybrid Product Price Comparison Engine
Streamlit UI — production-ready
"""

import time
import json
import logging
import concurrent.futures
import streamlit as st
from modules.serpapi_client import fetch_products
from modules.ranker import rank_all

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Page Config ─────────────────────────────────────────────────────────────

st.set_page_config(
    page_title="PriceHunt — Grocery Price Comparison",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─── Custom CSS ──────────────────────────────────────────────────────────────

st.markdown("""
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
    background-color: #0f1117;
    color: #e8eaf0;
  }

  /* ── Hero ── */
  .hero-title {
    font-size: 3rem;
    font-weight: 800;
    background: linear-gradient(135deg, #6ee7f7 0%, #a78bfa 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.25rem;
    letter-spacing: -1px;
  }
  .hero-sub {
    color: #8892a4;
    font-size: 1.05rem;
    margin-bottom: 2rem;
  }

  /* ── Query badge ── */
  .query-badge {
    display: inline-block;
    background: #1e2130;
    border: 1px solid #2e3347;
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 0.78rem;
    color: #a78bfa;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 1rem;
  }

  /* ── Best Deal Card ── */
  .best-deal-card {
    background: linear-gradient(135deg, #1a1f35 0%, #151929 100%);
    border: 2px solid #a78bfa55;
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    box-shadow: 0 8px 32px rgba(167, 139, 250, 0.12);
    margin-bottom: 1rem;
  }
  .best-deal-label {
    position: absolute;
    top: -12px;
    left: 20px;
    background: linear-gradient(90deg, #a78bfa, #f472b6);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 3px 12px;
    border-radius: 20px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .product-title-big {
    font-size: 1.05rem;
    font-weight: 700;
    color: #e8eaf0;
    line-height: 1.4;
    margin: 0.5rem 0 0.25rem 0;
  }
  .price-big {
    font-size: 2rem;
    font-weight: 800;
    color: #6ee7f7;
    line-height: 1;
  }
  .price-unit {
    font-size: 0.75rem;
    color: #8892a4;
    margin-top: 2px;
  }
  .merchant-chip {
    display: inline-block;
    background: #252b3d;
    border-radius: 8px;
    padding: 3px 10px;
    font-size: 0.78rem;
    color: #c4ccdb;
    margin-top: 0.5rem;
  }
  .score-bar-label {
    font-size: 0.72rem;
    color: #8892a4;
    margin-top: 0.75rem;
    margin-bottom: 2px;
  }
  .savings-chip {
    display: inline-block;
    background: #1a3a28;
    border: 1px solid #22c55e55;
    border-radius: 6px;
    padding: 3px 10px;
    font-size: 0.78rem;
    color: #4ade80;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  /* ── Alt Cards ── */
  .alt-card {
    background: #161b2e;
    border: 1px solid #232840;
    border-radius: 12px;
    padding: 1rem 1.1rem;
    margin-bottom: 0.6rem;
    transition: border-color 0.2s;
  }
  .alt-card:hover { border-color: #a78bfa66; }
  .alt-title {
    font-size: 0.88rem;
    font-weight: 600;
    color: #cdd5e0;
    line-height: 1.35;
  }
  .alt-price {
    font-size: 1.15rem;
    font-weight: 700;
    color: #e8eaf0;
  }
  .alt-merchant {
    font-size: 0.75rem;
    color: #8892a4;
  }
  .badge-chip {
    display: inline-block;
    background: #1e2535;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 0.72rem;
    color: #a78bfa;
    font-weight: 500;
  }

  /* ── Buy Button ── */
  .buy-btn {
    display: inline-block;
    background: linear-gradient(90deg, #7c3aed, #a855f7);
    color: white !important;
    text-decoration: none !important;
    border-radius: 8px;
    padding: 8px 20px;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    transition: opacity 0.2s;
  }
  .buy-btn:hover { opacity: 0.85; }
  .buy-btn-outline {
    display: inline-block;
    background: transparent;
    border: 1px solid #7c3aed;
    color: #a78bfa !important;
    text-decoration: none !important;
    border-radius: 8px;
    padding: 6px 16px;
    font-size: 0.78rem;
    font-weight: 600;
    transition: background 0.2s;
  }
  .buy-btn-outline:hover { background: #7c3aed22; }

  /* ── Section Header ── */
  .section-header {
    font-size: 0.72rem;
    font-weight: 700;
    color: #8892a4;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 0.75rem;
    margin-top: 1.25rem;
  }

  /* ── Stats row ── */
  .stat-box {
    background: #161b2e;
    border: 1px solid #232840;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    text-align: center;
  }
  .stat-val {
    font-size: 1.4rem;
    font-weight: 800;
    color: #6ee7f7;
  }
  .stat-label {
    font-size: 0.72rem;
    color: #8892a4;
  }

  /* ── No result ── */
  .no-result {
    background: #161b2e;
    border: 1px dashed #2e3347;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    color: #8892a4;
  }

  /* ── Divider ── */
  .item-divider {
    border: none;
    border-top: 1px solid #1e2535;
    margin: 2rem 0;
  }

  /* Streamlit overrides */
  .stProgress > div > div { background: linear-gradient(90deg, #a78bfa, #6ee7f7) !important; }
  div[data-testid="stHorizontalBlock"] { gap: 0.75rem; }
  .stTextInput input {
    background: #161b2e !important;
    border: 1px solid #2e3347 !important;
    border-radius: 10px !important;
    color: #e8eaf0 !important;
    font-size: 1rem !important;
    padding: 0.6rem 1rem !important;
  }
  button[kind="primary"] {
    background: linear-gradient(90deg, #7c3aed, #a855f7) !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 700 !important;
  }
</style>
""", unsafe_allow_html=True)


# ─── Helpers ─────────────────────────────────────────────────────────────────

def parse_input(raw: str) -> list[str]:
    """Parse comma/newline-separated item list from user input."""
    items = []
    for part in raw.replace("\n", ",").split(","):
        clean = part.strip().lower()
        if clean:
            items.append(clean)
    return list(dict.fromkeys(items))  # deduplicate, preserve order


def format_price(price: float | None) -> str:
    if price is None:
        return "N/A"
    return f"₹{price:,.0f}"


def format_ppu(ppu: float | None) -> str:
    if ppu is None or ppu == 0:
        return ""
    return f"₹{ppu:.1f}/100g"


def score_color(score: float) -> str:
    if score >= 80: return "#4ade80"
    if score >= 60: return "#facc15"
    return "#f87171"


def fetch_all_parallel(items: list[str]) -> dict[str, list[dict]]:
    """Fetch products for all items in parallel threads."""
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
    badge      = product.get("badge", "")
    merchant   = product.get("merchant", "Unknown")
    icon       = product.get("merchant_icon", "🏪")
    url        = product.get("url", "#")
    title      = product.get("title", "")
    price      = product.get("price", 0)

    st.markdown(f"""
    <div class="best-deal-card">
      <div class="best-deal-label">★ BEST DEAL</div>
      <div class="product-title-big">{title}</div>
      <div class="price-big">{format_price(price)}</div>
      {"<div class='price-unit'>" + ppu_str + "</div>" if ppu_str else ""}
      <div class="merchant-chip">{icon} {merchant}</div>
      {"<div class='savings-chip'>💰 Save ~₹" + f"{savings:.0f}" + " vs avg</div>" if savings > 0 else ""}
      <div class="score-bar-label">Final Score</div>
    </div>
    """, unsafe_allow_html=True)

    # Score breakdown
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(f'<div class="stat-box"><div class="stat-val" style="color:{score_color(final_sc)}">{final_sc:.0f}</div><div class="stat-label">Final Score</div></div>', unsafe_allow_html=True)
    with col2:
        st.markdown(f'<div class="stat-box"><div class="stat-val" style="color:{score_color(price_sc)}">{price_sc:.0f}</div><div class="stat-label">Price Score</div></div>', unsafe_allow_html=True)
    with col3:
        st.markdown(f'<div class="stat-box"><div class="stat-val" style="color:{score_color(match_sc)}">{match_sc:.0f}</div><div class="stat-label">Match Score</div></div>', unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    if url and url != "#":
        st.markdown(f'<a href="{url}" target="_blank" class="buy-btn">🛒 Buy Now on {merchant}</a>', unsafe_allow_html=True)
    else:
        st.markdown('<span style="color:#8892a4;font-size:0.8rem;">No purchase link available</span>', unsafe_allow_html=True)


def render_alternative(product: dict, rank: int):
    title    = product.get("title", "")
    price    = product.get("price", 0)
    merchant = product.get("merchant", "Unknown")
    icon     = product.get("merchant_icon", "🏪")
    url      = product.get("url", "#")
    badge    = product.get("badge", "")
    f_score  = product.get("final_score", 0)
    ppu_str  = format_ppu(product.get("price_per_unit"))

    buy_html = f'<a href="{url}" target="_blank" class="buy-btn-outline">View →</a>' if url and url != "#" else ""

    st.markdown(f"""
    <div class="alt-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
        <div style="flex:1;">
          <div class="alt-title">#{rank} {title}</div>
          <div style="margin-top:4px;">
            <span class="alt-merchant">{icon} {merchant}</span>
            &nbsp;
            <span class="badge-chip">{badge}</span>
            {f"<span class='alt-merchant'> · {ppu_str}</span>" if ppu_str else ""}
          </div>
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <div class="alt-price">{format_price(price)}</div>
          <div style="font-size:0.7rem; color:{score_color(f_score)}; margin-top:2px;">Score {f_score:.0f}</div>
          <div style="margin-top:6px;">{buy_html}</div>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)


def render_no_result(query: str):
    st.markdown(f"""
    <div class="no-result">
      <div style="font-size:2rem;">🔍</div>
      <div style="font-weight:600; margin-top:0.5rem;">No results for "{query}"</div>
      <div style="font-size:0.82rem; margin-top:0.25rem;">Try a different spelling or check your SerpAPI key.</div>
    </div>
    """, unsafe_allow_html=True)


def render_result_section(result: dict):
    query = result.get("query", "")
    best  = result.get("best_deal")
    alts  = result.get("alternatives", [])
    total = result.get("total_found", 0)

    st.markdown(f'<div class="query-badge">🛒 {query.title()}</div>', unsafe_allow_html=True)
    st.caption(f"{total} products scanned")

    if not best:
        render_no_result(query)
        return

    render_best_deal(best, query)

    if alts:
        st.markdown('<div class="section-header">Alternatives</div>', unsafe_allow_html=True)
        for i, alt in enumerate(alts, 1):
            render_alternative(alt, i)


# ─── Sidebar ─────────────────────────────────────────────────────────────────

def render_sidebar():
    with st.sidebar:
        st.markdown("### ⚙️ Settings")
        mode = st.radio(
            "Data Source",
            ["Auto (SerpAPI → Fallback)", "Fallback Only (Demo)"],
            index=0,
        )
        st.markdown("---")
        st.markdown("### 📊 Scoring Weights")
        st.markdown("""
        | Factor | Weight |
        |--------|--------|
        | Price Score | **70%** |
        | Match Score | **30%** |
        """)
        st.markdown("---")
        st.markdown("### 🔑 SerpAPI Key")
        serpapi_key = st.text_input("API Key", type="password", placeholder="Paste your key here")
        if serpapi_key:
            import os
            os.environ["SERPAPI_KEY"] = serpapi_key
            st.success("Key set for this session ✓")
        st.markdown("---")
        st.caption("v1.0.0 · Built with Streamlit + RapidFuzz + SerpAPI")
        return mode


# ─── JSON Export ─────────────────────────────────────────────────────────────

def render_json_export(results: list[dict]):
    with st.expander("📋 Raw JSON Response", expanded=False):
        # Trim for display
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

    # Hero
    st.markdown('<div class="hero-title">🛒 PriceHunt</div>', unsafe_allow_html=True)
    st.markdown('<div class="hero-sub">Real-time grocery price comparison · Best deals · Instant buy links</div>', unsafe_allow_html=True)

    # Input area
    col_input, col_btn = st.columns([5, 1])
    with col_input:
        raw_input = st.text_input(
            label="Items",
            label_visibility="collapsed",
            placeholder="milk, bread, eggs, rice, butter ...",
            value="milk, bread, eggs",
        )
    with col_btn:
        search_clicked = st.button("Search", type="primary", use_container_width=True)

    # Example pills
    st.markdown(
        '<div style="margin-top:-0.5rem; margin-bottom:1rem;">'
        '<span style="font-size:0.75rem; color:#8892a4;">Try: </span>'
        '<span style="font-size:0.75rem; color:#a78bfa;">milk, bread, eggs &nbsp;·&nbsp; rice, oil, sugar &nbsp;·&nbsp; butter, cheese</span>'
        '</div>',
        unsafe_allow_html=True,
    )

    # ── Run Search ──
    if search_clicked and raw_input.strip():
        items = parse_input(raw_input)

        if not items:
            st.warning("Please enter at least one item.")
            return

        if len(items) > 8:
            st.warning("Max 8 items per search. Extra items ignored.")
            items = items[:8]

        # Force fallback if demo mode
        if "Fallback" in mode:
            import os
            os.environ["SERPAPI_KEY"] = ""

        # Progress UI
        progress_bar = st.progress(0, text="Fetching prices...")
        t_start = time.time()

        with st.spinner(""):
            # Step 1: Fetch
            progress_bar.progress(20, text=f"Querying sources for {len(items)} items...")
            raw_data = fetch_all_parallel(items)

            # Step 2: Rank
            progress_bar.progress(70, text="Ranking with scoring engine...")
            ranked_results = rank_all(items, raw_data)

            progress_bar.progress(100, text="Done!")
            time.sleep(0.3)
            progress_bar.empty()

        elapsed = time.time() - t_start

        # ── Summary stats ──
        total_products = sum(r.get("total_found", 0) for r in ranked_results)
        items_with_results = sum(1 for r in ranked_results if r.get("best_deal"))

        st.markdown("<br>", unsafe_allow_html=True)
        sc1, sc2, sc3, sc4 = st.columns(4)
        sc1.markdown(f'<div class="stat-box"><div class="stat-val">{len(items)}</div><div class="stat-label">Items Searched</div></div>', unsafe_allow_html=True)
        sc2.markdown(f'<div class="stat-box"><div class="stat-val">{total_products}</div><div class="stat-label">Products Found</div></div>', unsafe_allow_html=True)
        sc3.markdown(f'<div class="stat-box"><div class="stat-val">{items_with_results}</div><div class="stat-label">Best Deals Found</div></div>', unsafe_allow_html=True)
        sc4.markdown(f'<div class="stat-box"><div class="stat-val">{elapsed:.1f}s</div><div class="stat-label">Response Time</div></div>', unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # ── Results ──
        for i, result in enumerate(ranked_results):
            render_result_section(result)
            if i < len(ranked_results) - 1:
                st.markdown('<hr class="item-divider">', unsafe_allow_html=True)

        # ── JSON export ──
        st.markdown("<br>", unsafe_allow_html=True)
        render_json_export(ranked_results)

    elif not search_clicked:
        # Landing placeholder
        st.markdown("""
        <div style="
          background: #161b2e;
          border: 1px dashed #2e3347;
          border-radius: 16px;
          padding: 3rem 2rem;
          text-align: center;
          margin-top: 1rem;
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #c4ccdb;">
            Enter items above and click Search
          </div>
          <div style="font-size: 0.85rem; color: #8892a4; margin-top: 0.5rem;">
            Fetches live prices · Ranks by best value · Shows alternatives with buy links
          </div>
        </div>
        """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
