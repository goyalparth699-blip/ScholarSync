import type { StudyLog, UserProfile, PredictionRecord, AIInsight } from "./types";

const K = { LOGS: "spp_logs", PROFILE: "spp_profile", HISTORY: "spp_history" };
const safe = <T>(fn: () => T, fb: T): T => { try { return fn(); } catch { return fb; } };

// ── Study Logs ────────────────────────────────────────────────────────────────
export const getLogs = (): StudyLog[] =>
  safe(() => JSON.parse(localStorage.getItem(K.LOGS) ?? "[]"), []);

export const upsertLog = (log: StudyLog): void => {
  const logs = getLogs();
  const idx  = logs.findIndex(l => l.date === log.date);
  if (idx >= 0) logs[idx] = log; else logs.unshift(log);
  localStorage.setItem(K.LOGS, JSON.stringify(logs.slice(0, 365)));
};

export const deleteLog = (id: string): void =>
  localStorage.setItem(K.LOGS, JSON.stringify(getLogs().filter(l => l.id !== id)));

// ── Profile ───────────────────────────────────────────────────────────────────
const DEFAULT_PROFILE: UserProfile = {
  name: "", targetScore: 85, dailyStudyGoal: 6,
  attendanceGoal: 90, sleepTarget: 8,
  subjects: ["Mathematics", "Science", "English"],
};
export const getProfile = (): UserProfile =>
  safe(() => ({ ...DEFAULT_PROFILE, ...JSON.parse(localStorage.getItem(K.PROFILE) ?? "{}") }), DEFAULT_PROFILE);

export const saveProfile = (p: UserProfile): void =>
  localStorage.setItem(K.PROFILE, JSON.stringify(p));

// ── Prediction History ────────────────────────────────────────────────────────
export const getPredictionHistory = (): PredictionRecord[] =>
  safe(() => JSON.parse(localStorage.getItem(K.HISTORY) ?? "[]"), []);

export const savePrediction = (rec: PredictionRecord): void =>
  localStorage.setItem(K.HISTORY, JSON.stringify([rec, ...getPredictionHistory()].slice(0, 50)));

// ── Analytics Helpers ─────────────────────────────────────────────────────────
export const avgOf = (arr: number[]): number =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export const calcProductivity = (s: Pick<StudyLog, "studyHours" | "sleepHours" | "screenTime" | "focusLevel">): number =>
  Math.min(10, Math.max(1, Math.round(
    (s.studyHours / 12 * 0.4 + s.sleepHours / 10 * 0.3 +
     (10 - Math.min(s.screenTime, 10)) / 10 * 0.2 + s.focusLevel / 10 * 0.1) * 10
  )));

export const calcStreak = (logs: StudyLog[]): number => {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  if (!sorted.length) return 0;
  let streak = 0;
  let cursor = new Date(); cursor.setHours(0, 0, 0, 0);
  for (const log of sorted) {
    const d = new Date(log.date + "T00:00:00");
    const diff = Math.round((cursor.getTime() - d.getTime()) / 86_400_000);
    if (diff > 1) break;
    streak++;
    cursor = d;
  }
  return streak;
};

export const last14Days = (): string[] => {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
};

// ── AI Insight Generator ──────────────────────────────────────────────────────
export function generateInsights(logs: StudyLog[], profile: UserProfile): AIInsight[] {
  if (logs.length === 0) return [{
    id: "onboard", type: "tip",
    title: "Start Your First Log",
    body: "Log your daily study sessions to unlock personalised AI insights about your performance patterns.",
    action: "Log Today's Session",
  }];

  const recent = logs.slice(0, 7);
  const prev   = logs.slice(7, 14);
  const insights: AIInsight[] = [];

  const avgStudy  = avgOf(recent.map(l => l.studyHours));
  const avgSleep  = avgOf(recent.map(l => l.sleepHours));
  const avgScreen = avgOf(recent.map(l => l.screenTime));
  const avgFocus  = avgOf(recent.map(l => l.focusLevel));
  const avgProd   = avgOf(recent.map(l => l.productivityScore));
  const prevProd  = prev.length ? avgOf(prev.map(l => l.productivityScore)) : null;
  const prevStudy = prev.length ? avgOf(prev.map(l => l.studyHours)) : null;
  const streak    = calcStreak(logs);

  // Sleep
  if (avgSleep < 6.5)
    insights.push({ id: "sleep", type: "warning", title: "Sleep Deficit Detected",
      body: `You're averaging ${avgSleep.toFixed(1)}h of sleep — below the recommended 7–9h. Low sleep reduces memory consolidation by up to 40% and can drop your predicted score by 5–8 points.`,
      action: "Try sleeping 45 minutes earlier tonight.", trend: "down" });
  else if (avgSleep >= 7.5)
    insights.push({ id: "sleep-good", type: "achievement", title: "Excellent Sleep Routine",
      body: `Averaging ${avgSleep.toFixed(1)}h of sleep this week. Consistent quality sleep is one of the strongest predictors of academic success.`, trend: "up" });

  // Study consistency
  const onGoalDays = recent.filter(l => l.studyHours >= profile.dailyStudyGoal).length;
  if (onGoalDays >= 5)
    insights.push({ id: "study-streak", type: "achievement", title: "Strong Study Consistency",
      body: `You hit your ${profile.dailyStudyGoal}h study goal on ${onGoalDays}/7 days this week. Consistency is the #1 factor in long-term academic improvement.`, trend: "up" });
  else if (avgStudy < profile.dailyStudyGoal * 0.65)
    insights.push({ id: "study-low", type: "warning", title: "Study Hours Below Target",
      body: `You're averaging ${avgStudy.toFixed(1)}h/day vs your ${profile.dailyStudyGoal}h goal. Closing this gap by just 1 hour could boost your predicted score by 3–5 points.`,
      action: "Block 1 extra study hour on your calendar tomorrow.", trend: "down" });

  // Screen time
  if (avgScreen > 5)
    insights.push({ id: "screen", type: "tip", title: "High Screen Time Impact",
      body: `${avgScreen.toFixed(1)}h of daily screen time is reducing your deep focus capacity. Studies show this level correlates with a 20–30% decrease in retention during study sessions.`,
      action: "Try a 2-hour phone-free study block each afternoon.", trend: "down" });

  // Productivity trend
  if (prevProd !== null) {
    const delta = avgProd - prevProd;
    if (delta > 1)
      insights.push({ id: "prod-up", type: "achievement", title: `Productivity Up ${delta.toFixed(1)} Points`,
        body: `Your productivity score rose from ${prevProd.toFixed(1)} to ${avgProd.toFixed(1)} over the past two weeks. You're building excellent academic momentum.`, trend: "up" });
    else if (delta < -1.5)
      insights.push({ id: "prod-down", type: "forecast", title: "Productivity Declining",
        body: `Productivity dropped ${Math.abs(delta).toFixed(1)} points this week — often caused by fatigue, irregular sleep, or high screen time. Identify which factor is affecting you most.`, trend: "down" });
  }

  // Burnout risk
  if (avgStudy > 9 && avgSleep < 7)
    insights.push({ id: "burnout", type: "warning", title: "Burnout Risk Elevated",
      body: `High study load (${avgStudy.toFixed(1)}h) combined with low sleep (${avgSleep.toFixed(1)}h) is a classic pre-burnout pattern. Quality over quantity — one well-rested 6h session beats two exhausted 5h sessions.`,
      action: "Take one lighter study day with 8h+ of sleep.", trend: "down" });

  // Study improvement
  if (prevStudy !== null && avgStudy - prevStudy > 1)
    insights.push({ id: "study-up", type: "achievement",
      title: `Study Time Up ${((avgStudy / prevStudy - 1) * 100).toFixed(0)}%`,
      body: `You increased study time from ${prevStudy.toFixed(1)}h to ${avgStudy.toFixed(1)}h/day. This directly improves your academic trajectory.`, trend: "up" });

  // Focus
  if (avgFocus < 5)
    insights.push({ id: "focus", type: "tip", title: "Focus Levels Need Attention",
      body: `Your average focus score is ${avgFocus.toFixed(1)}/10. Common causes: phone notifications, background noise, and studying in long unbroken stretches.`,
      action: "Try 25-min Pomodoro sprints with 5-min breaks." });

  // Streak forecast
  if (streak >= 7)
    insights.push({ id: "streak-fore", type: "forecast", title: `${streak}-Day Streak Forecast`,
      body: `A ${streak}-day streak puts you in the top 12% of consistent learners. Maintain it for another 7 days and your predicted score is likely to increase by 3–5 points.`, trend: "up" });

  return insights.slice(0, 6);
}
