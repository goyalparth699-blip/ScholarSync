"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BookOpen, Flame, Target, Moon, TrendingUp, Sparkles, ArrowRight, Plus, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getLogs, getProfile, calcStreak, avgOf, last14Days, getPredictionHistory } from "@/lib/storage";
import { getScoreCategory } from "@/lib/utils";
import type { StudyLog, UserProfile } from "@/lib/types";

const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const fmtDate = () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

export default function DashboardPage() {
  const { user } = useAuth();
  const [logs,    setLogs]    = useState<StudyLog[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setLogs(getLogs()); setProfile(getProfile()); setMounted(true); }, []);
  if (!mounted) return null;

  const streak   = calcStreak(logs);
  const recent7  = logs.slice(0, 7);
  const avgStudy = avgOf(recent7.map(l => l.studyHours));
  const avgSleep = avgOf(recent7.map(l => l.sleepHours));
  const lastPred = getPredictionHistory()[0];

  const logMap   = Object.fromEntries(logs.map(l => [l.date, l]));
  const chartData = last14Days().map(d => ({
    day:   d.slice(5),
    study: logMap[d]?.studyHours    ?? null,
    prod:  logMap[d]?.productivityScore ?? null,
  }));

  const today         = new Date().toISOString().slice(0, 10);
  const todayLog      = logMap[today];
  const studyGoal     = profile?.dailyStudyGoal ?? 6;
  const studyPct      = Math.min(100, ((todayLog?.studyHours ?? 0) / studyGoal) * 100);
  const circumference = 2 * Math.PI * 26;
  const userName      = profile?.name || user?.email?.split("@")[0] || "Student";

  const STATS = [
    { label: "Study Streak",  value: streak > 0 ? `${streak}d` : "0d",                            icon: Flame,   color: "#F59E0B", sub: streak > 0 ? "Keep it up!" : "Start today" },
    { label: "Target Score",  value: String(profile?.targetScore ?? 85),                           icon: Target,  color: "#7C6CFF", sub: "Your goal" },
    { label: "Avg Sleep",     value: avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : "—",               icon: Moon,    color: "#4DA3FF", sub: "Last 7 days" },
    { label: "Avg Study",     value: avgStudy > 0 ? `${avgStudy.toFixed(1)}h` : "—",               icon: BookOpen,color: "#10B981", sub: "Per day" },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-text-muted">{fmtDate()}</p>
          <h1 className="text-2xl font-bold text-text-primary mt-0.5">
            {greet()}, <span className="text-gradient">{userName}</span> 👋
          </h1>
          <p className="text-sm text-text-secondary mt-1">Your academic overview for today.</p>
        </div>
        <Link href="/study-log" className="btn-primary shrink-0"><Plus size={14} /> Log Today</Link>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-text-muted">{s.label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}1a` }}>
                <s.icon size={13} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{s.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-[1fr_290px] gap-5 mb-5">
        {/* Study trend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title">Study Hours</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">Last 14 Days</p>
            </div>
            <TrendingUp size={15} className="text-accent-purple" />
          </div>
          {logs.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7C6CFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C6CFF" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} width={22} />
                <Tooltip contentStyle={{ background: "#161F36", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "#9CA3AF" }} itemStyle={{ color: "#F5F7FA" }} />
                <Area type="monotone" dataKey="study" stroke="#7C6CFF" strokeWidth={2} fill="url(#sg)" connectNulls dot={false} name="Study hrs" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[170px] flex flex-col items-center justify-center">
              <BookOpen size={28} className="text-text-muted opacity-30 mb-2" />
              <p className="text-xs text-text-muted text-center">Log study sessions to see your trend</p>
            </div>
          )}
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
                    <span className="text-text-primary font-medium">{lastPred.result.r2 >= 0.9 ? "High" : lastPred.result.r2 >= 0.8 ? "Good" : "Moderate"}</span>
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

          {/* Today progress ring */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass p-5">
            <p className="section-title mb-3">Today's Goal</p>
            <div className="flex items-center gap-4">
              <div className="relative w-[60px] h-[60px] shrink-0">
                <svg width="60" height="60" className="-rotate-90">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#7C6CFF" strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - studyPct / 100)}
                    strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary">{Math.round(studyPct)}%</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{todayLog?.studyHours ?? 0}h / {studyGoal}h</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {studyPct >= 100 ? "✓ Goal achieved!" : `${(studyGoal - (todayLog?.studyHours ?? 0)).toFixed(1)}h to go`}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
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
