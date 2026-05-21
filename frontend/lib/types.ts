// ── Prediction ───────────────────────────────────────────────────────────────
export interface PredictionFormData {
  study_hours:               number;
  attendance:                number;
  sleep_hours:               number;
  previous_scores:           number;
  physical_activity:         number;
  screen_time:               number;
  tutoring_sessions:         number;
  internet_access:           "Yes" | "No";
  motivation_level:          "Low" | "Medium" | "High";
  family_support:            "Low" | "Medium" | "High";
  extracurricular_activities:"Yes" | "No";
  teacher_quality:           "Low" | "Medium" | "High";
  parental_education:        "High School" | "College" | "Postgraduate";
}

export interface PredictionResult {
  score:      number;
  model_name: string;
  r2:         number;
  mae:        number;
}

export interface PredictionRecord {
  id:        string;
  inputs:    PredictionFormData;
  result:    PredictionResult;
  timestamp: number;
  uid:       string;
  email:     string;
}

export interface Recommendation {
  icon:   string;
  title:  string;
  detail: string;
}

// ── Study Logs ────────────────────────────────────────────────────────────────
export type Mood = "great" | "good" | "neutral" | "bad" | "terrible";

export interface StudyLog {
  id:               string;
  date:             string;       // "YYYY-MM-DD"
  studyHours:       number;
  sleepHours:       number;
  mood:             Mood;
  focusLevel:       number;       // 1–10
  exerciseMinutes:  number;
  screenTime:       number;       // hours
  subjects:         string[];
  productivityScore:number;       // 1–10 (auto-calculated)
  notes:            string;
}

// ── User Profile & Goals ──────────────────────────────────────────────────────
export interface UserProfile {
  name:           string;
  targetScore:    number;
  dailyStudyGoal: number;         // hours/day
  attendanceGoal: number;         // %
  sleepTarget:    number;         // hours/night
  subjects:       string[];
}

// ── AI Insights ───────────────────────────────────────────────────────────────
export type InsightType = "achievement" | "warning" | "tip" | "forecast";

export interface AIInsight {
  id:      string;
  type:    InsightType;
  title:   string;
  body:    string;
  action?: string;
  trend?:  "up" | "down" | "stable";
}
