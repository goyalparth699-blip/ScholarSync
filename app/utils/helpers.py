"""
Helper Utilities
=================
Performance categorization, personalized recommendations,
and confidence level formatting.
"""


# ---------------------------------------------------------------------------
# PERFORMANCE CATEGORY
# ---------------------------------------------------------------------------
def get_performance_category(score: float) -> dict:
    """
    Map a predicted exam score to a performance category with
    display metadata (color, emoji, message).
    """
    if score >= 85:
        return {
            "category": "Excellent",
            "emoji":    "🌟",
            "color":    "#00E676",
            "message":  "Outstanding performance! You are in the top tier of students.",
        }
    elif score >= 70:
        return {
            "category": "Good",
            "emoji":    "✅",
            "color":    "#69F0AE",
            "message":  "Good performance! Keep up the consistent effort.",
        }
    elif score >= 55:
        return {
            "category": "Average",
            "emoji":    "📊",
            "color":    "#FFD740",
            "message":  "Average performance. A few targeted improvements can boost your score.",
        }
    elif score >= 40:
        return {
            "category": "Below Average",
            "emoji":    "⚠️",
            "color":    "#FF6D00",
            "message":  "Below average. Focus on weak areas and seek additional help.",
        }
    else:
        return {
            "category": "Needs Improvement",
            "emoji":    "🔴",
            "color":    "#FF5252",
            "message":  "Significant improvement required. Please seek guidance immediately.",
        }


# ---------------------------------------------------------------------------
# PERSONALISED RECOMMENDATIONS
# ---------------------------------------------------------------------------
def get_recommendations(inputs: dict, score: float) -> list[dict]:
    """
    Generate up to 5 personalised improvement recommendations
    based on the student's input values and predicted score.
    """
    recs = []

    # Study hours
    study = inputs.get("study_hours", 5)
    if study < 3:
        recs.append({
            "icon":   "📚",
            "title":  "Increase Study Hours",
            "detail": f"You study only {study}h/day. Aim for at least 4–6 focused hours.",
        })
    elif study < 5 and score < 70:
        recs.append({
            "icon":   "📚",
            "title":  "Study More Consistently",
            "detail": "Increase daily study time to 5–6 hours for a meaningful grade boost.",
        })

    # Attendance
    attendance = inputs.get("attendance", 80)
    if attendance < 75:
        recs.append({
            "icon":   "🏫",
            "title":  "Improve Attendance",
            "detail": f"Your attendance is {attendance}%. Staying above 75% directly raises grades.",
        })

    # Sleep
    sleep = inputs.get("sleep_hours", 7)
    if sleep < 6:
        recs.append({
            "icon":   "😴",
            "title":  "Get More Sleep",
            "detail": f"You sleep {sleep}h. Insufficient sleep hurts memory. Aim for 7–8 hours.",
        })
    elif sleep > 9:
        recs.append({
            "icon":   "⏰",
            "title":  "Reduce Oversleeping",
            "detail": f"Sleeping {sleep}h may cause grogginess. Optimal is 7–8 hours per night.",
        })

    # Screen time
    screen = inputs.get("screen_time", 3)
    if screen > 5:
        recs.append({
            "icon":   "📵",
            "title":  "Cut Down Screen Time",
            "detail": f"{screen}h/day on screens reduces focus. Try limiting to 2–3 hours.",
        })

    # Motivation
    if inputs.get("motivation_level") == "Low":
        recs.append({
            "icon":   "🎯",
            "title":  "Boost Your Motivation",
            "detail": "Set small daily goals, track progress, and reward yourself for achievements.",
        })

    # Physical activity
    activity = inputs.get("physical_activity", 3)
    if activity < 1.5:
        recs.append({
            "icon":   "🏃",
            "title":  "Exercise Regularly",
            "detail": "Physical activity improves brain function. Try 30 minutes of activity daily.",
        })

    # Tutoring
    if inputs.get("tutoring_sessions", 0) == 0 and score < 65:
        recs.append({
            "icon":   "👨‍🏫",
            "title":  "Consider Tutoring Sessions",
            "detail": "Extra tutoring can fill knowledge gaps and significantly raise scores.",
        })

    # If doing great, just encourage
    if not recs:
        recs.append({
            "icon":   "🌟",
            "title":  "Keep It Up!",
            "detail": "You're doing everything right. Maintain your habits for continued success.",
        })

    return recs[:5]


# ---------------------------------------------------------------------------
# MODEL CONFIDENCE
# ---------------------------------------------------------------------------
def get_confidence_level(r2: float) -> dict:
    """Return confidence metadata based on the model's R² score."""
    pct = max(0, min(100, int(r2 * 100)))
    if r2 >= 0.85:
        return {"level": "Very High", "color": "#00E676", "percent": pct}
    elif r2 >= 0.70:
        return {"level": "High",      "color": "#69F0AE", "percent": pct}
    elif r2 >= 0.55:
        return {"level": "Moderate",  "color": "#FFD740", "percent": pct}
    else:
        return {"level": "Low",       "color": "#FF5252", "percent": pct}
