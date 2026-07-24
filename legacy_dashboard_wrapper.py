import os
import shutil
import streamlit as st
from streamlit.components.v1 import iframe


@st.cache_resource
def setup_static_dashboard():
    base_dir = os.path.dirname(__file__)
    dashboard_dir = os.path.join(base_dir, "legacy", "dashboard")
    static_dir = os.path.join(base_dir, "static")
    
    # Sync legacy/dashboard to static/ for Streamlit to serve
    if os.path.exists(static_dir):
        shutil.rmtree(static_dir)
    shutil.copytree(dashboard_dir, static_dir)
    return True


def main():
    st.set_page_config(
        page_title="KCAU Debate Club Elections 2026/27",
        page_icon="📊",
        layout="wide",
    )

    st.markdown("""
        <style>
               .block-container {
                    padding-top: 10rem;
                    padding-bottom: 0rem;
                    padding-left: 0rem;
                    padding-right: 0rem;
                }
        </style>
        """, unsafe_allow_html=True)
    setup_static_dashboard()
    
    # Streamlit serves the static folder at /app/static/
    dashboard_url = "app/static/index.html"
    iframe(dashboard_url, height=1800, scrolling=True)
