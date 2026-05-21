"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, BookOpen, Moon, Activity, Smartphone, Target, School, Users, AlarmClock, Star, Sparkles, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ScoreMeter } from "@/components/prediction/ScoreMeter";
import { predictPerformance } from "@/lib/api";
import { getRecommendations, getScoreCategory } from "@/lib/utils";
import { savePrediction } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import type { PredictionFormData, PredictionResult, PredictionRecord } from "@/lib/types";

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Moon, Activity, Smartphone, Target, School, Users, AlarmClock, Star,
};

const DEFAULT: PredictionFormData = {
  study_hours: 4, attendance: 75, sleep_hours: 7, previous_scores: 65,
  physical_activity: 3, screen_time: 3, tutoring_sessions: 0,
  internet_access: "Yes", motivation_level: "Medium", family_support: "Medium",
  extracurricular_activities: "No", teacher_quality: "Medium", parental_education: "College",
};

function genAIInsight(score: number, form: PredictionFormData): string {
  const strengths: string[] = [], tips: string[] = [];
  if (form.attendance >= 80)       strengths.push("strong attendance");
  if (form.study_hours >= 6)       strengths.push("solid study hours");
  if (form.sleep_hours >= 7)       strengths.push("good sleep routine");
  if (form.previous_scores >= 70)  strengths.push("solid academic foundation");
  if (form.sleep_hours < 6.5)      tips.push("sleeping 7–8h per night");
  if (form.study_hours < 4)        tips.push("adding 1–2 more daily study hours");
  if (form.screen_time > 5)        tips.push("reducing screen time below 3h");
  if (form.attendance < 75)        tips.push("improving attendance above 80%");
  const str = strengths.length ? `Your ${strengths.slice(0,2).join(" and ")} ${strengths.length > 1 ? "are" : "is"} working in your favour. ` : "";
  const tip = tips.length ? `Prioritise ${tips[0]} for the biggest score uplift. ` : "";
  if (score >= 85) return `${str}You're performing in the top tier. ${tip}Maintain this momentum and your semester results will be excellent.`;
  if (score >= 70) return `${str}You're on a solid path. ${tip}One focused improvement could push you into the Excellent category.`;
  if (score >= 55) return `You have a good foundation to build on. ${str}${tip}Small daily improvements compound significantly over a semester.`;
  return `There's meaningful room to grow. ${tip}${str}Focus on one change at a time — consistency beats intensity.`;
}

function SliderField({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-text-secondary">{label}</label>
        <span className="text-xs font-semibold text-text-primary bg-bg-elevated border border-white/[0.06] px-2 py-0.5 rounded-md tabular-nums">
          {value}{unit}
        </span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function PredictionPage() {
  const { user } = useAuth();
  const [form,    setForm]    = useState<PredictionFormData>(DEFAULT);
  const [result,  setResult]  = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  function set<K extends keyof PredictionFormData>(key: K, value: PredictionFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePredict() {
    setLoading(true); setError("");
    try {
      const res = await predictPerformance(form);
      setResult(res);
      const rec: PredictionRecord = {
        id: Date.now().toString(), inputs: form, result: res,
        timestamp: Date.now(), uid: user?.uid ?? "demo", email: user?.email ?? "",
      };
      savePrediction(rec);
    } catch {
      setError("Could not connect. Make sure the API server is running.");
    } finally {
      setLoading(false);
    }
  }

  const recs = result ? getRecommendations(form, result.score) : [];

  function downloadReport() {
    if (!result) return;
    const cat = getScoreCategory(result.score);
    const lines = [
      "STUDY AI — PERFORMANCE PREDICTION REPORT",
      "=".repeat(42),
      "Date       : " + new Date().toLocaleString(),
      "PREDICTED SCORE : " + result.score.toFixed(0) + " / 100",
      "PERFORMANCE     : " + cat.label,
      "CONFIDENCE      : " + (result.r2 >= 0.9 ? "High" : result.r2 >= 0.8 ? "Good" : "Moderate"),
      "",
      "AI INSIGHT",
      "-".repeat(30),
      genAIInsight(result.score, form),
      "",
      "INPUT PROFILE",
      "-".repeat(30),
      ...Object.entries(form).map(([k, v]) => "  " + k.replace(/_/g, " ") + ": " + v),
      "",
      "RECOMMENDATIONS",
      "-".repeat(30),
      ...recs.map((r) => "  \u2022 " + r.title + ": " + r.detail),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "performance_report.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <p className="section-title">Predict Score</p>
        <h1 className="text-2xl font-bold text-text-primary">AI Score Prediction</h1>
        <p className="text-sm text-text-secondary mt-1">Enter your habits and get a personalised predicted academic score.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ─── LEFT: Form ─── */}
        <div className="space-y-5">
          {/* Academic */}
          <div className="surface p-5">
            <p className="section-title mb-4">Academic Habits</p>
            <div className="space-y-5">
              <SliderField label="Daily Study Hours"    value={form.study_hours}    min={0} max={12} step={0.5} unit="h"  onChange={(v) => set("study_hours", v)} />
              <SliderField label="Attendance"           value={form.attendance}     min={50} max={100}          unit="%"  onChange={(v) => set("attendance", v)} />
              <SliderField label="Previous Exam Score"  value={form.previous_scores} min={30} max={100}                  onChange={(v) => set("previous_scores", v)} />
              <SliderField label="Tutoring Sessions / week" value={form.tutoring_sessions} min={0} max={5}               onChange={(v) => set("tutoring_sessions", v)} />
            </div>
          </div>

          {/* Lifestyle */}
          <div className="surface p-5">
            <p className="section-title mb-4">Lifestyle</p>
            <div className="space-y-5">
              <SliderField label="Sleep Hours / Night"   value={form.sleep_hours}        min={3} max={10} step={0.5} unit="h" onChange={(v) => set("sleep_hours", v)} />
              <SliderField label="Daily Screen Time"     value={form.screen_time}        min={0} max={10} step={0.5} unit="h" onChange={(v) => set("screen_time", v)} />
              <SliderField label="Physical Activity (hrs/week)" value={form.physical_activity} min={0} max={14} step={0.5} unit="h" onChange={(v) => set("physical_activity", v)} />
            </div>
          </div>

          {/* Context */}
          <div className="surface p-5">
            <p className="section-title mb-4">Context & Environment</p>
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Motivation Level"   value={form.motivation_level}          options={["Low","Medium","High"]}                                onChange={(v) => set("motivation_level",          v as PredictionFormData["motivation_level"])} />
              <SelectField label="Family Support"     value={form.family_support}            options={["Low","Medium","High"]}                                onChange={(v) => set("family_support",            v as PredictionFormData["family_support"])} />
              <SelectField label="Internet Access"    value={form.internet_access}           options={["Yes","No"]}                                           onChange={(v) => set("internet_access",           v as PredictionFormData["internet_access"])} />
              <SelectField label="Extracurricular"    value={form.extracurricular_activities} options={["Yes","No"]}                                          onChange={(v) => set("extracurricular_activities", v as PredictionFormData["extracurricular_activities"])} />
              <SelectField label="Teacher Quality"    value={form.teacher_quality}           options={["Low","Medium","High"]}                                onChange={(v) => set("teacher_quality",           v as PredictionFormData["teacher_quality"])} />
              <SelectField label="Parent Education"   value={form.parental_education}        options={["High School","College","Postgraduate"]}               onChange={(v) => set("parental_education",        v as PredictionFormData["parental_education"])} />
            </div>
          </div>

          {error && (
            <p className="text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2.5">{error}</p>
          )}

          <button onClick={handlePredict} disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Analysing…</> : "Predict My Performance"}
          </button>
        </div>

        {/* ─── RIGHT: Result ─── */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                      {/* Score meter */}
                <div className="glass p-6 flex flex-col items-center">
                  <ScoreMeter score={result.score} size={170} />
                  {/* Confidence */}
                  <div className="w-full mt-5 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-text-muted">Prediction Confidence</span>
                      <span className="font-semibold text-text-primary">
                        {result.r2 >= 0.9 ? "High" : result.r2 >= 0.8 ? "Good" : "Moderate"}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(result.r2 * 100)}%` }}
                        transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>

                {/* AI Insight paragraph */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="glass p-4 border-accent-purple/20 bg-accent-purple/[0.04]">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={13} className="text-accent-purple" />
                    <p className="text-xs font-semibold text-accent-purple">AI Insight</p>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{genAIInsight(result.score, form)}</p>
                </motion.div>

                {/* Recommendations */}
                {recs.length > 0 && (
                  <div className="surface p-4">
                    <p className="section-title mb-3">Recommendations</p>
                    <div className="space-y-2">
                      {recs.map((rec, i) => {
                        const Icon = ICON_MAP[rec.icon] ?? Star;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.08 }}
                            className="flex gap-3 p-3 rounded-lg bg-bg-surface hover:bg-bg-elevated transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-accent-purple/10 flex items-center justify-center shrink-0">
                              <Icon size={13} className="text-accent-purple" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-text-primary">{rec.title}</p>
                              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{rec.detail}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Download */}
                <button onClick={downloadReport} className="btn-ghost w-full border border-white/[0.08] text-text-secondary">
                  <Download size={14} /> Download Report
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="surface flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-4">
                  <Target size={20} className="text-accent-purple" />
                </div>
                <p className="text-sm font-medium text-text-primary">Ready to predict</p>
                <p className="text-xs text-text-muted mt-1">Fill in your profile and click predict.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
