"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, BookOpen, Check, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { getLogs, upsertLog, deleteLog, calcProductivity } from "@/lib/storage";
import type { StudyLog, Mood } from "@/lib/types";

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: "great",   emoji: "😄", label: "Great"   },
  { value: "good",    emoji: "🙂", label: "Good"    },
  { value: "neutral", emoji: "😐", label: "Okay"    },
  { value: "bad",     emoji: "😕", label: "Bad"     },
  { value: "terrible",emoji: "😔", label: "Rough"   },
];

const today = () => new Date().toISOString().slice(0, 10);

const DEFAULT = (): Omit<StudyLog, "id" | "productivityScore"> => ({
  date: today(), studyHours: 4, sleepHours: 7, mood: "good",
  focusLevel: 6, exerciseMinutes: 30, screenTime: 3,
  subjects: [], notes: "",
});

function SliderRow({ label, value, min, max, step = 0.5, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="text-xs font-semibold text-text-primary tabular-nums">{value}{unit}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  );
}

export default function StudyLogPage() {
  const [logs,      setLogs]      = useState<StudyLog[]>([]);
  const [form,      setForm]      = useState(DEFAULT());
  const [subInput,  setSubInput]  = useState("");
  const [saved,     setSaved]     = useState(false);
  const [lastQuality, setLastQuality] = useState<{ score: number; label: string; color: string } | null>(null);
  const [mounted,   setMounted]   = useState(false);
  const [expanded,  setExpanded]  = useState<string | null>(null);

  useEffect(() => { setLogs(getLogs()); setMounted(true); }, []);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const addSubject = () => {
    const s = subInput.trim();
    if (s && !form.subjects.includes(s)) { set("subjects", [...form.subjects, s]); setSubInput(""); }
  };

  function handleSave() {
    const prod = calcProductivity({ studyHours: form.studyHours, sleepHours: form.sleepHours, screenTime: form.screenTime, focusLevel: form.focusLevel });
    const log: StudyLog = { ...form, id: form.date, productivityScore: prod };
    upsertLog(log);
    setLogs(getLogs());
    setSaved(true);
    const ql =
      prod >= 9 ? { score: prod, label: "Outstanding session", color: "#10B981" } :
      prod >= 7 ? { score: prod, label: "High quality session", color: "#7C6CFF" } :
      prod >= 5 ? { score: prod, label: "Good session",         color: "#4DA3FF" } :
                  { score: prod, label: "Could be better",      color: "#F59E0B" };
    setLastQuality(ql);
    setTimeout(() => { setSaved(false); }, 2500);
  }

  function handleDelete(id: string) {
    deleteLog(id);
    setLogs(getLogs());
  }

  function loadForEdit(log: StudyLog) {
    setForm({ date: log.date, studyHours: log.studyHours, sleepHours: log.sleepHours,
      mood: log.mood, focusLevel: log.focusLevel, exerciseMinutes: log.exerciseMinutes,
      screenTime: log.screenTime, subjects: log.subjects, notes: log.notes });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!mounted) return null;

  const todayLog = logs.find(l => l.date === today());

  return (
    <div className="page-container">
      <div className="mb-6">
        <p className="section-title">Study Log</p>
        <h1 className="text-2xl font-bold text-text-primary">Daily Study Journal</h1>
        <p className="text-sm text-text-secondary mt-1">Log your study session to track patterns and generate AI insights.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ── Form ── */}
        <div className="glass p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Date</label>
            <input type="date" value={form.date}
              onChange={e => set("date", e.target.value)}
              className="input-base" />
          </div>

          {/* Mood selector */}
          <div>
            <p className="text-xs text-text-secondary mb-2">How are you feeling?</p>
            <div className="flex gap-2">
              {MOODS.map(m => (
                <button key={m.value} onClick={() => set("mood", m.value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-all duration-150 ${
                    form.mood === m.value
                      ? "border-accent-purple/50 bg-accent-purple/10"
                      : "border-white/[0.06] hover:border-white/[0.12]"
                  }`}>
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[10px] text-text-muted">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <SliderRow label="Study Hours"     value={form.studyHours}      min={0}  max={12}  unit="h" onChange={v => set("studyHours", v)} />
            <SliderRow label="Sleep Hours"     value={form.sleepHours}      min={3}  max={12}  unit="h" onChange={v => set("sleepHours", v)} />
            <SliderRow label="Screen Time"     value={form.screenTime}      min={0}  max={12}  unit="h" onChange={v => set("screenTime", v)} />
            <SliderRow label="Exercise"        value={form.exerciseMinutes} min={0}  max={180} step={5} unit="min" onChange={v => set("exerciseMinutes", v)} />
            <SliderRow label="Focus Level"     value={form.focusLevel}      min={1}  max={10}  step={1} onChange={v => set("focusLevel", v)} />
          </div>

          {/* Subjects */}
          <div>
            <p className="text-xs text-text-secondary mb-2">Subjects Studied</p>
            <div className="flex gap-2 mb-2">
              <input value={subInput} onChange={e => setSubInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSubject()}
                placeholder="e.g. Mathematics"
                className="input-base flex-1" />
              <button onClick={addSubject} className="btn-ghost border border-white/[0.08] px-3">
                <Plus size={14} />
              </button>
            </div>
            {form.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.subjects.map(s => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple flex items-center gap-1.5">
                    {s}
                    <button onClick={() => set("subjects", form.subjects.filter(x => x !== s))} className="opacity-60 hover:opacity-100">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="What did you focus on today? Any challenges?"
              rows={3} className="input-base h-auto resize-none" />
          </div>

          <button onClick={handleSave} className="btn-primary w-full">
            {saved ? <><Check size={15} /> Saved!</> : <><BookOpen size={15} /> Save Session</>}
          </button>

          {/* Session quality card */}
          <AnimatePresence>
            {lastQuality && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                className="glass p-4 flex items-center gap-3"
                style={{ borderColor: `${lastQuality.color}30` }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${lastQuality.color}18` }}>
                  <Zap size={15} style={{ color: lastQuality.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary">{lastQuality.label}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Productivity score: {lastQuality.score}/10</p>
                </div>
                <span className="text-xl font-bold tabular-nums" style={{ color: lastQuality.color }}>
                  {lastQuality.score}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── History ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="section-title">Recent Logs ({logs.length})</p>
            {todayLog && <span className="text-xs text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">Today logged ✓</span>}
          </div>

          {logs.length === 0 ? (
            <div className="glass p-8 flex flex-col items-center text-center">
              <BookOpen size={28} className="text-text-muted opacity-30 mb-3" />
              <p className="text-sm text-text-muted">No logs yet. Start by saving your first session.</p>
            </div>
          ) : (
            <AnimatePresence>
              {logs.slice(0, 14).map((log, i) => (
                <motion.div key={log.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02]"
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                    <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center text-sm shrink-0">
                      {MOODS.find(m => m.value === log.mood)?.emoji ?? "📚"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary">{log.date}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-text-muted">{log.studyHours}h · {log.sleepHours}h sleep</p>
                        <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue"
                            style={{ width: `${log.productivityScore * 10}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-text-muted tabular-nums">{log.productivityScore}/10</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {expanded === log.id ? <ChevronUp size={13} className="text-text-muted" /> : <ChevronDown size={13} className="text-text-muted" />}
                    </div>
                  </div>
                  <AnimatePresence>
                    {expanded === log.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                        transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-4 pb-3 pt-0 border-t border-white/[0.05] space-y-2">
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {[["Focus", `${log.focusLevel}/10`], ["Screen", `${log.screenTime}h`],
                              ["Exercise", `${log.exerciseMinutes}min`], ["Mood", MOODS.find(m => m.value === log.mood)?.label ?? "—"]
                            ].map(([k, v]) => (
                              <div key={k} className="bg-white/[0.03] rounded-lg px-3 py-1.5 flex justify-between">
                                <span className="text-[10px] text-text-muted">{k}</span>
                                <span className="text-[10px] font-semibold text-text-primary">{v}</span>
                              </div>
                            ))}
                          </div>
                          {log.subjects.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {log.subjects.map(s => (
                                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/20">{s}</span>
                              ))}
                            </div>
                          )}
                          {log.notes && <p className="text-xs text-text-muted italic">&ldquo;{log.notes}&rdquo;</p>}
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => loadForEdit(log)} className="btn-ghost text-xs py-1 px-2 border border-white/[0.06]">Edit</button>
                            <button onClick={() => handleDelete(log.id)} className="btn-ghost text-xs py-1 px-2 text-error hover:bg-error/10">
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
