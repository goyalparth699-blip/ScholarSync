"""
Reusable HTML Card Components
==============================
All functions return raw HTML strings that can be injected
via st.markdown(..., unsafe_allow_html=True).
"""


def glass_header_html(title: str, subtitle: str = "", icon: str = "🎓") -> str:
    """Gradient glass banner used at the top of every page."""
    return f"""
    <div style="
        background: linear-gradient(135deg, rgba(108,99,255,0.18), rgba(0,212,255,0.10));
        border: 1px solid rgba(108,99,255,0.30);
        border-radius: 22px;
        padding: 32px 28px;
        margin-bottom: 28px;
        text-align: center;
        animation: fadeInUp 0.5s ease both;
    ">
        <div style="font-size: 3rem; margin-bottom: 8px; line-height:1;">{icon}</div>
        <h1 style="
            color: #E8E8FF;
            margin: 0;
            font-size: 1.9rem;
            font-weight: 700;
            letter-spacing: -0.5px;
        ">{title}</h1>
        <p style="
            color: #A0A0B8;
            margin: 10px 0 0;
            font-size: 0.95rem;
            font-weight: 400;
        ">{subtitle}</p>
    </div>
    """


def metric_card_html(
    title:    str,
    value:    str,
    subtitle: str  = "",
    color:    str  = "#6C63FF",
    icon:     str  = "📊",
) -> str:
    """Animated metric card with left accent border."""
    return f"""
    <div style="
        background:      rgba(255,255,255,0.05);
        backdrop-filter: blur(16px);
        border:          1px solid rgba(255,255,255,0.09);
        border-left:     4px solid {color};
        border-radius:   18px;
        padding:         20px 18px;
        text-align:      center;
        transition:      all 0.3s ease;
        margin-bottom:   10px;
        animation:       fadeInUp 0.5s ease both;
    ">
        <div style="font-size:2rem; line-height:1; margin-bottom:6px;">{icon}</div>
        <div style="
            font-size:   2rem;
            font-weight: 800;
            color:       {color};
            margin:      4px 0;
            line-height: 1.1;
        ">{value}</div>
        <div style="font-size:0.88rem; color:#E0E0E0; font-weight:600;">{title}</div>
        <div style="font-size:0.75rem; color:#888; margin-top:3px;">{subtitle}</div>
    </div>
    """


def recommendation_card_html(
    icon:   str,
    title:  str,
    detail: str,
    color:  str = "#6C63FF",
) -> str:
    """Compact recommendation item with icon."""
    return f"""
    <div style="
        background:    rgba(255,255,255,0.04);
        border:        1px solid rgba(255,255,255,0.07);
        border-left:   3px solid {color};
        border-radius: 14px;
        padding:       14px 16px;
        margin-bottom: 10px;
        transition:    all 0.3s ease;
        animation:     fadeInUp 0.5s ease both;
    ">
        <div style="display:flex; align-items:flex-start; gap:12px;">
            <div style="font-size:1.4rem; flex-shrink:0;">{icon}</div>
            <div>
                <div style="color:#E0E0E0; font-weight:600; font-size:0.88rem;">{title}</div>
                <div style="color:#A0A0B0; font-size:0.80rem; margin-top:3px; line-height:1.5;">{detail}</div>
            </div>
        </div>
    </div>
    """


def prediction_result_html(
    score:    float,
    category: str,
    color:    str,
    emoji:    str,
    message:  str,
) -> str:
    """Large result card showing predicted score and category."""
    return f"""
    <div style="
        background:    linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,255,0.08));
        border:        2px solid {color};
        border-radius: 24px;
        padding:       36px 28px;
        text-align:    center;
        margin:        16px 0;
        box-shadow:    0 0 36px rgba(108,99,255,0.18);
        animation:     fadeInUp 0.55s ease both;
    ">
        <div style="font-size:4rem; margin-bottom:8px; line-height:1;">{emoji}</div>
        <div style="
            font-size:   4.5rem;
            font-weight: 800;
            color:       {color};
            line-height: 1.1;
            letter-spacing: -2px;
        ">{score:.1f}</div>
        <div style="color:#C8C8D8; font-size:1rem; font-weight:500; margin-top:4px;">
            Predicted Exam Score&nbsp;/&nbsp;100
        </div>
        <div style="
            display:       inline-block;
            background:    {color}22;
            border:        1px solid {color};
            border-radius: 30px;
            padding:       7px 26px;
            margin-top:    14px;
            color:         {color};
            font-weight:   700;
            font-size:     1rem;
            letter-spacing: 0.5px;
        ">{category}</div>
        <p style="color:#A0A0B8; margin-top:14px; font-size:0.88rem; line-height:1.55;">{message}</p>
    </div>
    """


def step_card_html(step: str, detail: str, color: str = "#6C63FF") -> str:
    """Training pipeline step card."""
    return f"""
    <div style="
        background:    rgba(255,255,255,0.04);
        border:        1px solid rgba(255,255,255,0.07);
        border-left:   3px solid {color};
        border-radius: 12px;
        padding:       12px 16px;
        margin-bottom: 10px;
        transition:    all 0.3s ease;
    ">
        <div style="color:#E0E0E0; font-weight:600; font-size:0.88rem;">{step}</div>
        <div style="color:#A0A0B0; font-size:0.80rem; margin-top:3px;">{detail}</div>
    </div>
    """


def feature_card_html(title: str, description: str, color: str = "#6C63FF") -> str:
    """Feature highlight card used on dashboard and about page."""
    return f"""
    <div style="
        background:    rgba(255,255,255,0.04);
        border:        1px solid rgba(255,255,255,0.07);
        border-top:    3px solid {color};
        border-radius: 18px;
        padding:       24px 20px;
        text-align:    center;
        transition:    all 0.35s ease;
        height:        100%;
        min-height:    130px;
    ">
        <h3 style="color:{color}; font-size:0.95rem; margin:0 0 8px;">{title}</h3>
        <p style="color:#A0A0B0; font-size:0.80rem; margin:0; line-height:1.55;">{description}</p>
    </div>
    """
