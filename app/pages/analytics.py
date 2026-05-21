"""
Analytics Page
===============
Interactive visualisations of the student dataset:
distribution, correlations, feature importance, scatter plots.
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
import streamlit as st

from app.components.cards import glass_header_html

DATA_PATH = os.path.join("backend", "data", "student_data.csv")


@st.cache_data
def load_data() -> pd.DataFrame:
    """Load (or generate) the student dataset."""
    if os.path.exists(DATA_PATH):
        return pd.read_csv(DATA_PATH)
    from backend.data.generate_data import generate_student_data
    return generate_student_data()


def _dark_fig(w: int = 9, h: int = 5):
    """Create a matplotlib figure with a transparent dark background."""
    fig, ax = plt.subplots(figsize=(w, h))
    fig.patch.set_alpha(0)
    ax.set_facecolor("none")
    return fig, ax


def _style_ax(ax, xlabel: str = "", ylabel: str = ""):
    """Apply consistent dark-theme styling to an axes object."""
    ax.tick_params(colors="#C0C0D0", labelsize=9)
    ax.set_xlabel(xlabel, color="#C0C0D0", fontsize=9)
    ax.set_ylabel(ylabel, color="#C0C0D0", fontsize=9)
    for spine in ax.spines.values():
        spine.set_edgecolor("rgba(255,255,255,0.12)")


# -------------------------------------------------------------------------
# MAIN PAGE
# -------------------------------------------------------------------------
def show():
    """Render the analytics dashboard."""

    st.markdown(
        glass_header_html(
            "Analytics Dashboard",
            "Explore patterns, correlations and insights in the student dataset",
            "📊",
        ),
        unsafe_allow_html=True,
    )

    df = load_data()

    # ---- Dataset summary metrics ----
    st.markdown("### 📋 Dataset Overview")
    m1, m2, m3, m4, m5 = st.columns(5)
    m1.metric("Students",   f"{len(df):,}")
    m2.metric("Features",   str(len(df.columns) - 1))
    m3.metric("Avg Score",  f"{df['Exam_Score'].mean():.1f}")
    m4.metric("Max Score",  f"{df['Exam_Score'].max():.1f}")
    m5.metric("Min Score",  f"{df['Exam_Score'].min():.1f}")

    st.markdown("<br>", unsafe_allow_html=True)

    # ---- Tabs ----
    t1, t2, t3, t4, t5 = st.tabs([
        "📈 Distribution",
        "🔥 Heatmap",
        "⭐ Feature Importance",
        "🔍 Scatter Plots",
        "📄 Raw Data",
    ])

    # ==============================================
    # TAB 1 — SCORE DISTRIBUTION
    # ==============================================
    with t1:
        col1, col2 = st.columns(2)

        with col1:
            st.markdown("**Exam Score Distribution**")
            fig, ax = _dark_fig(7, 4)
            ax.hist(
                df["Exam_Score"], bins=30,
                color="#6C63FF", alpha=0.85, edgecolor="white", linewidth=0.4,
            )
            _style_ax(ax, "Exam Score", "Number of Students")
            ax.axvline(df["Exam_Score"].mean(), color="#00D4FF", linewidth=2,
                       linestyle="--", label=f"Mean: {df['Exam_Score'].mean():.1f}")
            ax.legend(fontsize=8, labelcolor="white", facecolor="none", edgecolor="none")
            st.pyplot(fig)
            plt.close()

        with col2:
            st.markdown("**Performance Category Breakdown**")
            bins   = [0,  40,  55,  70,  85,  100]
            labels = ["Poor", "Below Avg", "Average", "Good", "Excellent"]
            df["_cat"] = pd.cut(df["Exam_Score"], bins=bins, labels=labels)
            counts = df["_cat"].value_counts().reindex(labels)

            fig, ax = _dark_fig(7, 4)
            bar_colors = ["#FF5252", "#FF6D00", "#FFD740", "#69F0AE", "#00E676"]
            bars = ax.bar(counts.index, counts.values, color=bar_colors, alpha=0.85)
            for b, v in zip(bars, counts.values):
                ax.text(b.get_x() + b.get_width()/2, v + 4, str(v),
                        ha="center", color="white", fontsize=8)
            _style_ax(ax, "Category", "Count")
            st.pyplot(fig)
            plt.close()
            df.drop(columns=["_cat"], inplace=True)

        # Motivation breakdown
        st.markdown("**Average Score by Motivation Level**")
        fig, ax = _dark_fig(9, 4)
        order    = ["Low", "Medium", "High"]
        pal      = {"Low": "#FF5252", "Medium": "#FFD740", "High": "#00E676"}
        for i, lvl in enumerate(order):
            scores = df[df["Motivation_Level"] == lvl]["Exam_Score"]
            ax.bar(i, scores.mean(), color=pal[lvl], alpha=0.85, width=0.5)
            ax.errorbar(i, scores.mean(), yerr=scores.std(), fmt="none",
                        color="white", capsize=5, linewidth=1.5)
            ax.text(i, scores.mean() + scores.std() + 0.5,
                    f"{scores.mean():.1f}", ha="center", color="white", fontsize=9)
        ax.set_xticks([0, 1, 2])
        ax.set_xticklabels(order)
        _style_ax(ax, "Motivation Level", "Average Score")
        st.pyplot(fig)
        plt.close()

    # ==============================================
    # TAB 2 — CORRELATION HEATMAP
    # ==============================================
    with t2:
        st.markdown("**Pearson Correlation Heatmap (Numerical Features)**")
        num_df = df.select_dtypes(include=[np.number])
        corr   = num_df.corr()

        fig, ax = plt.subplots(figsize=(11, 8))
        fig.patch.set_facecolor("#12122A")
        ax.set_facecolor("#12122A")
        mask = np.triu(np.ones_like(corr, dtype=bool))
        sns.heatmap(
            corr, mask=mask, annot=True, fmt=".2f",
            cmap="RdYlGn", center=0, vmin=-1, vmax=1,
            ax=ax, linewidths=0.5, linecolor="rgba(255,255,255,0.06)",
            annot_kws={"size": 8, "color": "white"},
        )
        ax.tick_params(colors="#C0C0D0", labelsize=8)
        plt.tight_layout()
        st.pyplot(fig)
        plt.close()

        # Strongest correlations table
        st.markdown("**Top Correlations with Exam Score**")
        corr_scores = (
            num_df.corr()["Exam_Score"]
            .drop("Exam_Score")
            .abs()
            .sort_values(ascending=False)
            .reset_index()
        )
        corr_scores.columns = ["Feature", "|Correlation|"]
        corr_scores["|Correlation|"] = corr_scores["|Correlation|"].round(4)
        st.dataframe(corr_scores, use_container_width=True, hide_index=True)

    # ==============================================
    # TAB 3 — FEATURE IMPORTANCE
    # ==============================================
    with t3:
        st.markdown("**Feature Correlation with Exam Score (Sorted)**")
        num_df = df.select_dtypes(include=[np.number])
        corrs  = (
            num_df.corr()["Exam_Score"]
            .drop("Exam_Score")
            .sort_values(ascending=True)
        )

        fig, ax = _dark_fig(9, 5)
        bar_colors = ["#FF5252" if v < 0 else "#6C63FF" for v in corrs.values]
        bars = ax.barh(corrs.index, corrs.values, color=bar_colors, alpha=0.85)
        ax.axvline(0, color="rgba(255,255,255,0.25)", linewidth=1)
        for bar, val in zip(bars, corrs.values):
            ax.text(val + (0.004 if val >= 0 else -0.004), bar.get_y() + bar.get_height()/2,
                    f"{val:.3f}", va="center",
                    ha="left" if val >= 0 else "right",
                    color="white", fontsize=8)
        _style_ax(ax, "Correlation with Exam Score", "")
        plt.tight_layout()
        st.pyplot(fig)
        plt.close()

        st.info(
            "🔵 **Blue bars** = positive correlation (higher → better score)   "
            "🔴 **Red bars** = negative correlation (higher → lower score)",
        )

    # ==============================================
    # TAB 4 — SCATTER PLOTS
    # ==============================================
    with t4:
        c1, c2 = st.columns(2)

        scatter_pairs = [
            ("Study_Hours",     "Exam_Score", "Study Hours",     "Exam Score",  "#6C63FF"),
            ("Attendance",      "Exam_Score", "Attendance (%)",  "Exam Score",  "#00D4FF"),
            ("Sleep_Hours",     "Exam_Score", "Sleep Hours",     "Exam Score",  "#00E676"),
            ("Screen_Time",     "Exam_Score", "Screen Time (h)", "Exam Score",  "#FF6D00"),
            ("Previous_Scores", "Exam_Score", "Previous Score",  "Exam Score",  "#FFD740"),
            ("Physical_Activity","Exam_Score","Physical Activity","Exam Score",  "#FF5252"),
        ]

        for i, (x, y, xl, yl, clr) in enumerate(scatter_pairs):
            col = c1 if i % 2 == 0 else c2
            with col:
                st.markdown(f"**{xl} vs {yl}**")
                fig, ax = _dark_fig(6, 4)
                ax.scatter(df[x], df[y], alpha=0.30, color=clr, s=12)
                m, b = np.polyfit(df[x], df[y], 1)
                xline = np.linspace(df[x].min(), df[x].max(), 200)
                ax.plot(xline, m*xline + b, color="white", linewidth=1.8, linestyle="--")
                _style_ax(ax, xl, yl)
                st.pyplot(fig)
                plt.close()

    # ==============================================
    # TAB 5 — RAW DATA
    # ==============================================
    with t5:
        st.markdown("**Dataset Preview (first 50 rows)**")
        st.dataframe(df.head(50), use_container_width=True, hide_index=True)

        st.markdown("**Descriptive Statistics**")
        st.dataframe(
            df.select_dtypes(include=[np.number]).describe().round(3),
            use_container_width=True,
        )

        # Missing-value check
        st.markdown("**Missing Values**")
        mv = df.isnull().sum().reset_index()
        mv.columns = ["Column", "Missing Values"]
        mv = mv[mv["Missing Values"] > 0]
        if mv.empty:
            st.success("✅ No missing values found in the dataset.")
        else:
            st.dataframe(mv, use_container_width=True, hide_index=True)
