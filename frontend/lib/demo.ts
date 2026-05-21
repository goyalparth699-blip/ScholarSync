import type { StudyLog, PredictionRecord } from "./types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// 21 days of realistic study logs — deterministic for consistency
// Format: [studyHours, sleepHours, focusLevel, screenTime, exerciseMin, moodIdx, subjects, notes]
const RAW: [number, number, number, number, number, number, string[], string][] = [
  [5.0, 7.5, 8, 2.0,  30, 1, ["Mathematics", "Physics"],            "Great focus session today."   ],
  [7.5, 8.0, 9, 1.5,  60, 0, ["Mathematics", "Computer Science"],   ""                             ],
  [6.0, 7.5, 8, 2.0,  30, 1, ["English", "Chemistry"],              ""                             ],
  [7.0, 8.0, 9, 1.0,  45, 0, ["Physics", "Mathematics"],            "Covered full chapter."        ],
  [6.5, 7.5, 8, 2.0,  30, 0, ["Computer Science"],                  ""                             ],
  [7.0, 7.0, 9, 1.5,  50, 0, ["Mathematics", "English"],            ""                             ],
  [6.0, 7.5, 8, 2.0,  40, 1, ["Chemistry", "Physics"],              ""                             ],
  [4.0, 9.0, 6, 2.0,   0, 1, ["English"],                           "Rest day — lighter session."  ],
  [3.0, 8.5, 7, 3.0,  60, 1, ["Mathematics"],                       ""                             ],
  [6.5, 7.0, 8, 2.5,  30, 1, ["Physics", "Chemistry"],              ""                             ],
  [5.0, 7.5, 8, 2.0,  45, 0, ["Computer Science", "Mathematics"],   ""                             ],
  [4.0, 6.5, 6, 4.0,  25, 2, ["English"],                           ""                             ],
  [6.0, 7.0, 7, 2.5,  30, 1, ["Mathematics", "Physics"],            ""                             ],
  [5.5, 7.5, 7, 3.0,  40, 1, ["Chemistry"],                         ""                             ],
  [2.0, 9.0, 6, 4.0,   0, 2, ["English"],                           "Lazy day — need to pick up."  ],
  [3.0, 8.5, 7, 3.0,  60, 1, ["Physics"],                           ""                             ],
  [5.0, 7.0, 6, 3.5,  30, 1, ["Mathematics", "English"],            ""                             ],
  [4.5, 7.0, 6, 4.0,  30, 1, ["Chemistry", "Physics"],              ""                             ],
  [2.0, 5.5, 4, 6.0,   0, 3, ["Mathematics"],                       "Rough day — poor sleep."      ],
  [4.0, 6.5, 5, 4.5,  25, 2, ["English"],                           ""                             ],
  [3.5, 6.0, 5, 5.0,  20, 2, ["Physics", "Chemistry"],              ""                             ],
];

const MOODS = ["great", "good", "neutral", "bad", "terrible"] as const;

export const DEMO_LOGS: StudyLog[] = RAW.map(
  ([studyHours, sleepHours, focusLevel, screenTime, exerciseMinutes, moodIdx, subjects, notes], i) => {
    const productivityScore = Math.min(
      10,
      Math.max(
        1,
        Math.round(
          (studyHours / 12 * 0.4 +
            sleepHours / 10 * 0.3 +
            (10 - Math.min(screenTime, 10)) / 10 * 0.2 +
            focusLevel / 10 * 0.1) * 10,
        ),
      ),
    );
    return {
      id:               daysAgo(i),
      date:             daysAgo(i),
      studyHours,
      sleepHours,
      mood:             MOODS[moodIdx],
      focusLevel,
      exerciseMinutes,
      screenTime,
      subjects,
      productivityScore,
      notes,
    };
  },
);

export const DEMO_PREDICTION: PredictionRecord = {
  id:        "demo_pred_1",
  inputs: {
    study_hours: 6, attendance: 82, sleep_hours: 7.5, previous_scores: 73,
    physical_activity: 4, screen_time: 2, tutoring_sessions: 1,
    internet_access: "Yes", motivation_level: "High", family_support: "Medium",
    extracurricular_activities: "Yes", teacher_quality: "High", parental_education: "College",
  },
  result:    { score: 81, model_name: "AI Model", r2: 0.91, mae: 4.2 },
  timestamp: Date.now() - 86_400_000 * 2,
  uid:       "demo",
  email:     "demo@scholarsync.app",
};
