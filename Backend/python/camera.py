import streamlit as st
from eatlystic_bill_parser import streamlit_bill_uploader

st.set_page_config(page_title="Eatlystic", page_icon="🛒")
st.title("🛒 Eatlystic — Grocery Bill Scanner")

# ── Receive the logged-in user's identity from the React app ──────────────
# Pantry.jsx opens this app as:  <STREAMLIT_URL>/?userId=<the logged-in id>
# Streamlit sessions are per-tab, so we only need to read this once and
# store it in st.session_state — streamlit_bill_uploader() already checks
# st.session_state.get("userId") in its "Save to Pantry" button.
try:
    # Streamlit >= 1.30
    query_params = st.query_params
    qp_user_id = query_params.get("userId")
except Exception:
    # Older Streamlit versions
    query_params = st.experimental_get_query_params()
    qp_user_id = query_params.get("userId", [None])[0]

if qp_user_id and not st.session_state.get("userId"):
    st.session_state["userId"] = qp_user_id

if st.session_state.get("userId"):
    st.caption(f"Logged in as: {st.session_state['userId']}")
else:
    st.warning(
        "No user detected. Open this page from the Pantry page in the app "
        "so your items are saved to the right account."
    )

streamlit_bill_uploader()
