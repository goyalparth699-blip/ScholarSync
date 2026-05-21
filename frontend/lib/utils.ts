import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

import type { PredictionFormData, Recommendation } from "./types";
