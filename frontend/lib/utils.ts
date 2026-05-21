import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PredictionFormData, Recommendation } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score >= 85) return "#10B981";
  if (score >= 70) return "#7C6CFF";
  if (score >= 55) return "#4DA3FF";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

export function getScoreCategory(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 85)
    return { label: "Excellent",      color: "#10B981", description: "Outstanding academic performance" };
  if (score >= 70)
    return { label: "Good",           color: "#7C6CFF", description: "Above average performance" };
  if (score >= 55)
    return { label: "Average",        color: "#4DA3FF", description: "Meeting expectations" };
  if (score >= 40)
    return { label: "Below Average",  color: "#F59E0B", description: "Some improvement needed" };
  return   { label: "Needs Improvement", color: "#EF4444", description: "Significant effort required" };
}

export function getRecommendations(inputs: PredictionFormData, score = 0): Recommendation[] {
  const recs: Recommendation[] = [];

  if (inputs.study_hours < 3)
    recs.push({ icon: "BookOpen", title: "Increase Study Time", detail: `${inputs.study_hours}h/day is low. Aim for 4–6 focused hours daily.` });

  if (inputs.attendance < 75)
    recs.push({ icon: "School", title: "Improve Attendance", detail: `${inputs.attendance}% attendance is below the 75% threshold for stable grades.` });

  if (inputs.sleep_hours < 6)
    recs.push({ icon: "Moon", title: "Prioritise Sleep", detail: `Only ${inputs.sleep_hours}h of sleep impairs memory retention. Target 7–8 hours.` });
  else if (inputs.sleep_hours > 9)
    recs.push({ icon: "AlarmClock", title: "Regulate Sleep Schedule", detail: `${inputs.sleep_hours}h is excessive. Optimal range is 7–8 hours per night.` });

  if (inputs.screen_time > 5)
    recs.push({ icon: "Smartphone", title: "Reduce Screen Time", detail: `${inputs.screen_time}h/day on screens reduces focus capacity significantly.` });

  if (inputs.motivation_level === "Low")
    recs.push({ icon: "Target", title: "Build Intrinsic Motivation", detail: "Set small daily goals and track your progress to build momentum." });

  if (inputs.physical_activity < 1.5)
    recs.push({ icon: "Activity", title: "Add Physical Activity", detail: "30 min of daily exercise measurably improves cognitive performance." });

  if (inputs.tutoring_sessions === 0 && inputs.previous_scores < 60)
    recs.push({ icon: "Users", title: "Consider Tutoring", detail: "Even one tutoring session per week can close knowledge gaps quickly." });

  if (recs.length === 0)
    recs.push({ icon: "Star", title: "Keep It Up!", detail: "Your habits are well-balanced. Maintain consistency for sustained excellence." });

  return recs.slice(0, 4);
}

export function localEstimate(f: PredictionFormData): number {
  const prev   = Math.max(0, Math.min(1, (f.previous_scores - 30) / 70));
  const study  = Math.max(0, Math.min(1, f.study_hours / 12));
  const att    = Math.max(0, Math.min(1, (f.attendance - 50) / 50));
  const sleep  = f.sleep_hours >= 7 ? 1 : f.sleep_hours >= 5 ? f.sleep_hours / 8 : 0.4;
  const screen = Math.max(0, 1 - f.screen_time / 12);
  const tutor  = Math.min(1, f.tutoring_sessions / 5);
  const motiv  = f.motivation_level  === "High" ? 1 : f.motivation_level  === "Medium" ? 0.6 : 0.25;
  const fam    = f.family_support    === "High" ? 1 : f.family_support    === "Medium" ? 0.65 : 0.3;
  const teach  = f.teacher_quality   === "High" ? 1 : f.teacher_quality   === "Medium" ? 0.65 : 0.3;
  const phys   = Math.min(1, f.physical_activity / 10);
  const parEd  = f.parental_education === "Postgraduate" ? 1 : f.parental_education === "College" ? 0.7 : 0.45;
  const inet   = f.internet_access === "Yes" ? 1 : 0.7;
  const extra  = f.extracurricular_activities === "Yes" ? 1 : 0.8;
  const raw =
    prev  * 0.28 + study * 0.22 + att   * 0.18 +
    sleep * 0.09 + screen* 0.07 + tutor * 0.04 +
    motiv * 0.04 + fam   * 0.025+ teach * 0.025+
    phys  * 0.015+ parEd * 0.01 + inet  * 0.005+ extra * 0.005;
  return Math.min(100, Math.max(15, Math.round(raw * 100)));
}

const NEUTRAL: PredictionFormData = {
  study_hours: 4, attendance: 75, sleep_hours: 6, previous_scores: 60,
  physical_activity: 3, screen_time: 4, tutoring_sessions: 0,
  internet_access: "Yes", motivation_level: "Medium", family_support: "Medium",
  extracurricular_activities: "No", teacher_quality: "Medium", parental_education: "College",
};

export function getInfluencingFactors(f: PredictionFormData): Array<{
  label: string; impact: number; direction: "pos" | "neg";
}> {
  const base = localEstimate(NEUTRAL);
  return [
    { label: "Previous Score", score: localEstimate({ ...NEUTRAL, previous_scores:          f.previous_scores          }) },
    { label: "Study Hours",    score: localEstimate({ ...NEUTRAL, study_hours:               f.study_hours               }) },
    { label: "Attendance",     score: localEstimate({ ...NEUTRAL, attendance:                f.attendance                }) },
    { label: "Sleep",          score: localEstimate({ ...NEUTRAL, sleep_hours:               f.sleep_hours               }) },
    { label: "Screen Time",    score: localEstimate({ ...NEUTRAL, screen_time:               f.screen_time               }) },
    { label: "Tutoring",       score: localEstimate({ ...NEUTRAL, tutoring_sessions:         f.tutoring_sessions         }) },
    { label: "Motivation",     score: localEstimate({ ...NEUTRAL, motivation_level:          f.motivation_level          }) },
  ]
    .map(({ label, score }) => ({
      label,
      impact:    score - base,
      direction: (score >= base ? "pos" : "neg") as "pos" | "neg",
    }))
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 5);
}
