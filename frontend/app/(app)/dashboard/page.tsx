"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  BookOpen, Flame, Target, Moon, TrendingUp, TrendingDown, Sparkles,
  ArrowRight, Plus, BrainCircuit, X, Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getLogs, getProfile, calcStreak, avgOf, last14Days,
  getPredictionHistory, seedDemoData, clearDemoData, isDemoMode,
} from "@/lib/storage";
import { getScoreCategory } from "@/lib/utils";
import type { StudyLog, UserProfile } from "@/lib/types";

const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const fmtDate = () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

const TIPS = [
  "Study in 25-min Pomodoro sprints. Short breaks keep focus sharp.",
  "Sleep before an exam matters more than late-night cramming.",
  "Reviewing notes within 24h triples long-term retention.",
  "Teach what you learned to someone else — it reveals gaps fast.",
  "One phone-free hour of study beats three distracted hours.",
  "Consistency beats intensity. Small daily sessions compound.",
  "Hydration improves focus — keep water on your study desk.",
];
const dailyTip = TIPS[new Date().getDate() % TIPS.length];

function RingProgress({ pct, color, size = 60, stroke = 5 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(pct, 100) / 100)}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [logs,    setLogs]    = useState<StudyLog[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [demo,    setDemo]    = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    seedDemoData();
    setLogs(getLogs());
    setProfile(getProfile());
    setDemo(isDemoMode());
    setMounted(true);
  }, []);

  function handleClearDemo() {
    clearDemoData();
    setLogs([]);
    setDemo(false);
  }

  if (!mounted) return null;

  const streak    = calcStreak(logs);
  const recent7   = logs.slice(0, 7);
  const prev7     = logs.slice(7, 14);
  const avgStudy  = avgOf(recent7.map(l => l.studyHours));
  const avgSleep  = avgOf(recent7.map(l => l.sleepHours));
  const avgProd7  = avgOf(recent7.map(l => l.productivityScore));
  const avgProdP  = prev7.length ? avgOf(prev7.map(l => l.productivityScore)) : null;
  const weekDelta = avgProdP !== null ? Math.round((avgProd7 - avgProdP) * 10) / 10 : null;
  const lastPred  = getPredictionHistory()[0];

  const logMap   = Object.fromEntries(logs.map(l => [l.date, l]));
  const chartData = last14Days().map(d => ({
    day:   d.slice(5),
    study: logMap[d]?.studyHours        ?? null,
    prod:  logMap[d]?.productivityScore ?? null,
  }));

  const todayStr   = new Date().toISOString().slice(0, 10);
  const todayLog   = logMap[todayStr];
  const studyGoal  = profile?.dailyStudyGoal ?? 6;
  const studyPct   = Math.min(100, ((todayLog?.studyHours ?? 0) / studyGoal) * 100);
  const sleepPct   = Math.min(100, ((todayLog?.sleepHours ?? 0) / (profile?.sleepTarget ?? 8)) * 100);
  const userName   = profile?.name || user?.email?.split("@")[0] || "Student";

  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const STATS = [
    {
      label: "Study Streak", value: streak > 0 ? `${streak}d` : "0d",
      icon: Flame, color: "#F59E0B",
      sub: streak >= 7 ? "🔥 On fire!" : streak > 0 ? "Keep going!" : "Start today",
    },
    {
      label: "Weekly Productivity", value: avgProd7 > 0 ? `${avgProd7.toFixed(1)}/10` : "—",
      icon: weekDelta !== null && weekDelta >= 0 ? TrendingUp : TrendingDown,
      color: weekDelta !== null && weekDelta >= 0 ? "#10B981" : "#EF4444",
      sub: weekDelta !== null ? `${weekDelta >= 0 ? "+" : ""}${weekDelta} vs last week` : "7-day avg",
    },
    {
      label: "Avg Sleep",  value: avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : "—",
      icon: Moon, color: "#4DA3FF",
      sub: avgSleep >= 7.5 ? "Excellent!" : avgSleep >= 6 ? "OK" : "Need more",
    },
    {
      label: "Target Score", value: String(profile?.targetScore ?? 85),
      icon: Target, color: "#7C6CFF", sub: "Your goal",
    },
  ];

  return (
    <div className="page-container">
      {/* Demo banner */}
      <AnimatePresence>
        {demo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-5 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-accent-purple/[0.08] border border-accent-purple/20 text-xs">
            <span className="text-text-secondary">
              <span className="font-semibold text-accent-purple">Demo mode</span> — sample data loaded so the app doesn't feel empty. Start logging to replace it.
            </span>
            <button onClick={handleClearDemo}
              className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors shrink-0">
              <X size={12} /> Start Fresh
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-text-muted">{fmtDate()}</p>
          <h1 className="text-2xl font-bold text-text-primary mt-0.5">
            {greet()}, <span className="text-gradient">{userName}</span> 👋
          </h1>
          <p className="text-sm text-text-secondary mt-1">Your academic overview for today.</p>
        </div>
        <Link href="/study-log" className="btn-primary shrink-0"><Plus size={14} /> Log Today</Link>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-sm p-4 group hover:border-white/[0.12] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-text-muted">{s.label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${s.color}1a` }}>
                <s.icon size={13} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: s.color }}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main content row */}
      <div className="grid lg:grid-cols-[1fr_290px] gap-5 mb-5">
        {/* Study trend chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="section-title">Study Trend</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">Study Hours — Last 14 Days</p>
            </div>
            {weekDelta !== null && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${weekDelta >= 0 ? "text-success bg-success/10" : "text-error bg-error/10"}`}>
                {weekDelta >= 0 ? "+" : ""}{weekDelta} this week
              </span>
            )}
          </div>

          {/* 7-day streak dots */}
          <div className="flex items-center gap-1.5 mb-3 mt-2">
            {last7Dates.map((d, i) => {
              const logged = !!logMap[d];
              return (
                <div key={d} title={d} className="flex flex-col items-center gap-1">
                  <div className={`w-2 h-2 rounded-full transition-all ${logged ? "bg-accent-purple" : "bg-white/[0.1]"}`} />
                  {i === 6 && <span className="text-[8px] text-text-muted">today</span>}
                </div>
              );
            })}
            <span className="text-[10px] text-text-muted ml-1">7-day activity</span>
          </div>

          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C6CFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C6CFF" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} width={22} />
              <Tooltip contentStyle={{ background: "#161F36", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "#9CA3AF" }} itemStyle={{ color: "#F5F7FA" }} />
              <Area type="monotone" dataKey="study" stroke="#7C6CFF" strokeWidth={2} fill="url(#sg)" connectNulls dot={false} name="Study hrs" />
              <Area type="monotone" dataKey="prod"  stroke="#10B981" strokeWidth={1.5} fill="url(#pg)" connectNulls dot={false} name="Productivity" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Latest prediction */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass p-5">
            <p className="section-title mb-3">Latest Prediction</p>
            {lastPred ? (
              <>
                <div className="text-center py-1">
                  <p className="text-4xl font-bold text-gradient">{lastPred.result.score.toFixed(0)}</p>
                  <p className="text-xs text-text-muted mt-0.5">{getScoreCategory(lastPred.result.score).label}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Confidence</span>
                    <span className="text-text-primary font-medium">
                      {lastPred.result.r2 >= 0.9 ? "High" : lastPred.result.r2 >= 0.8 ? "Good" : "Moderate"}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue"
                      style={{ width: `${Math.round(lastPred.result.r2 * 100)}%` }} />
                  </div>
                </div>
                <Link href="/prediction" className="mt-3 flex items-center justify-between text-xs text-accent-purple hover:opacity-80 transition-opacity">
                  <span>New prediction</span><ArrowRight size={11} />
                </Link>
              </>
            ) : (
              <div className="text-center py-3">
                <Sparkles size={20} className="text-accent-purple mx-auto mb-2 opacity-60" />
                <p className="text-xs text-text-muted mb-3">No prediction yet</p>
                <Link href="/prediction" className="btn-primary text-xs py-1.5 px-3">Predict Now</Link>
              </div>
            )}
          </motion.div>

          {/* Today's goals rings */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass p-5">
            <p className="section-title mb-3">Today's Goals</p>
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-1.5">
                <RingProgress pct={studyPct} color="#7C6CFF" />
                <p className="text-[10px] text-text-muted">Study</p>
                <p className="text-[11px] font-semibold text-text-primary">{todayLog?.studyHours ?? 0}/{studyGoal}h</p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RingProgress pct={sleepPct} color="#4DA3FF" />
                <p className="text-[10px] text-text-muted">Sleep</p>
                <p className="text-[11px] font-semibold text-text-primary">{todayLog?.sleepHours ?? 0}/{profile?.sleepTarget ?? 8}h</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Daily tip */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass p-4 mb-5 flex items-start gap-3 border-accent-purple/10 bg-accent-purple/[0.03]">
        <div className="w-7 h-7 rounded-lg bg-accent-purple/15 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb size={13} className="text-accent-purple" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent-purple mb-0.5">Daily Tip</p>
          <p className="text-xs text-text-secondary leading-relaxed">{dailyTip}</p>
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/study-log",  icon: BookOpen,     label: "Log Session",   color: "#10B981" },
            { href: "/prediction", icon: Sparkles,     label: "Predict Score", color: "#7C6CFF" },
            { href: "/analytics",  icon: TrendingUp,   label: "View Trends",   color: "#4DA3FF" },
            { href: "/insights",   icon: BrainCircuit, label: "AI Insights",   color: "#F59E0B" },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href}
              className="glass-sm p-4 flex items-center gap-3 hover:border-white/[0.14] transition-all duration-200 group">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                style={{ background: `${color}1a` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
