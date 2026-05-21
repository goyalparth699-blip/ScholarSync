"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Check, Target, BookOpen, Moon, Users, Plus, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { getProfile, saveProfile, getLogs, calcStreak, avgOf } from "@/lib/storage";
import type { UserProfile } from "@/lib/types";

const DEFAULT: UserProfile = {
  name: "", targetScore: 85, dailyStudyGoal: 6,
  attendanceGoal: 90, sleepTarget: 8,
  subjects: ["Mathematics", "Science", "English"],
};

function GoalRow({ label, value, min, max, step = 1, unit = "", color, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; color: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="glass-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>{value}{unit}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
      <div className="flex justify-between text-[10px] text-text-muted mt-1.5">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT);
  const [saved,   setSaved]   = useState(false);
  const [subject, setSubject] = useState("");
  const [mounted, setMounted] = useState(false);
  const [logs,    setLogs]    = useState([] as ReturnType<typeof getLogs>);

  useEffect(() => {
    setProfile(getProfile());
    setLogs(getLogs());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) =>
    setProfile(p => ({ ...p, [k]: v }));

  const addSubject = () => {
    const s = subject.trim();
    if (s && !profile.subjects.includes(s)) { set("subjects", [...profile.subjects, s]); setSubject(""); }
  };

  function handleSave() {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const streak   = calcStreak(logs);
  const recent7  = logs.slice(0, 7);
  const avgStudy = avgOf(recent7.map(l => l.studyHours));
  const avgSleep = avgOf(recent7.map(l => l.sleepHours));

  const goalProgress = [
    { label: "Study Goal",  current: avgStudy,                 target: profile.dailyStudyGoal, unit: "h",  color: "#7C6CFF" },
    { label: "Sleep Target",current: avgSleep,                 target: profile.sleepTarget,    unit: "h",  color: "#4DA3FF" },
    { label: "Study Streak",current: Math.min(streak, 30),    target: 30,                     unit: "d",  color: "#10B981" },
  ];

  return (
    <div className="page-container">
      <div className="mb-6">
        <p className="section-title">Profile & Goals</p>
        <h1 className="text-2xl font-bold text-text-primary">Your Academic Profile</h1>
        <p className="text-sm text-text-secondary mt-1">Set your goals and track progress toward them.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left — form */}
        <div className="space-y-5">
          {/* Name */}
          <div className="glass p-5">
            <p className="section-title mb-4">Personal Info</p>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Your Name</label>
              <input value={profile.name} onChange={e => set("name", e.target.value)}
                placeholder="Enter your name"
                className="input-base" />
            </div>
          </div>

          {/* Goals */}
          <div className="glass p-5">
            <p className="section-title mb-4">Academic Goals</p>
            <div className="space-y-3">
              <GoalRow label="Target Score"      value={profile.targetScore}    min={50} max={100} unit="" color="#7C6CFF" onChange={v => set("targetScore", v)} />
              <GoalRow label="Daily Study Goal"  value={profile.dailyStudyGoal} min={1}  max={14}  step={0.5} unit="h" color="#4DA3FF" onChange={v => set("dailyStudyGoal", v)} />
              <GoalRow label="Attendance Goal"   value={profile.attendanceGoal} min={50} max={100} unit="%" color="#10B981" onChange={v => set("attendanceGoal", v)} />
              <GoalRow label="Sleep Target"      value={profile.sleepTarget}    min={5}  max={10}  step={0.5} unit="h" color="#F59E0B" onChange={v => set("sleepTarget", v)} />
            </div>
          </div>

          {/* Subjects */}
          <div className="glass p-5">
            <p className="section-title mb-4">Focus Subjects</p>
            <div className="flex gap-2 mb-3">
              <input value={subject} onChange={e => setSubject(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSubject()}
                placeholder="Add a subject"
                className="input-base flex-1" />
              <button onClick={addSubject} className="btn-ghost border border-white/[0.08] px-3">
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.subjects.map(s => (
                <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple">
                  {s}
                  <button onClick={() => set("subjects", profile.subjects.filter(x => x !== s))}
                    className="opacity-60 hover:opacity-100 transition-opacity">
                    <X size={10} />
                  </button>
                </span>
              ))}
              {profile.subjects.length === 0 && (
                <p className="text-xs text-text-muted">No subjects added yet.</p>
              )}
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary w-full">
            {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Profile</>}
          </button>
        </div>

        {/* Right — goal progress */}
        <div className="space-y-4">
          <p className="section-title">Goal Progress (7-day avg)</p>

          {goalProgress.map((g, i) => {
            const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
            const circumference = 2 * Math.PI * 24;
            return (
              <motion.div key={g.label} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="glass p-5 flex items-center gap-4">
                <div className="relative w-[56px] h-[56px] shrink-0">
                  <svg width="56" height="56" className="-rotate-90">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke={g.color} strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - pct / 100)}
                      strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-text-primary">{Math.round(pct)}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{g.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {g.current > 0 ? `${g.current.toFixed(1)}${g.unit}` : "—"}
                    <span className="mx-1 opacity-40">/</span>
                    {g.target}{g.unit}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: g.color }} />
              </motion.div>
            );
          })}

          {/* Current profile summary */}
          <div className="glass p-5 space-y-3 mt-2">
            <p className="section-title">Current Settings</p>
            {[
              { label: "Target Score",      value: `${profile.targetScore}`,         icon: Target  },
              { label: "Daily Study Goal",  value: `${profile.dailyStudyGoal}h`,     icon: BookOpen },
              { label: "Attendance Goal",   value: `${profile.attendanceGoal}%`,     icon: Users   },
              { label: "Sleep Target",      value: `${profile.sleepTarget}h`,        icon: Moon    },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <r.icon size={12} className="text-text-muted" />
                  <span className="text-xs text-text-muted">{r.label}</span>
                </div>
                <span className="text-xs font-semibold text-text-primary">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
