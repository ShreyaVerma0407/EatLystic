import streamlit as st
from eatlystic_bill_parser import streamlit_bill_uploader

st.set_page_config(page_title="Eatlystic", page_icon="🛒")
st.title("🛒 Eatlystic — Grocery Bill Scanner")
streamlit_bill_uploader()