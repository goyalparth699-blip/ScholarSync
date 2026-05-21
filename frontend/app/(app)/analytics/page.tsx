"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { TrendingUp, Moon, BookOpen, Zap } from "lucide-react";
import { getLogs, getProfile, calcStreak, avgOf, last14Days } from "@/lib/storage";
import type { StudyLog, UserProfile } from "@/lib/types";

type Tab = "trend" | "sleep" | "subjects" | "weekly";

const TT = ({ active, payload, label }: { active?: boolean; payload?: {name:string;value:number;color:string}[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-white/[0.08] rounded-lg px-3 py-2 text-xs">
      {label && <p className="text-text-muted mb-1">{label}</p>}
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function AnalyticsPage() {
  const [logs,    setLogs]    = useState<StudyLog[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tab,     setTab]     = useState<Tab>("trend");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setLogs(getLogs()); setProfile(getProfile()); setMounted(true); }, []);
  if (!mounted) return null;

  const streak    = calcStreak(logs);
  const totalHrs  = logs.reduce((s, l) => s + l.studyHours, 0);
  const avgStudy  = avgOf(logs.slice(0, 30).map(l => l.studyHours));
  const avgProd   = avgOf(logs.slice(0, 30).map(l => l.productivityScore));

  const logMap  = Object.fromEntries(logs.map(l => [l.date, l]));
  const days14  = last14Days();
  const trendData = days14.map(d => ({
    day:   d.slice(5),
    study: logMap[d]?.studyHours         ?? null,
    prod:  logMap[d]?.productivityScore  ?? null,
  }));

  const sleepData = days14.map(d => ({
    day:   d.slice(5),
    sleep: logMap[d]?.sleepHours  ?? null,
    focus: logMap[d]?.focusLevel  ?? null,
  }));

  const subjectMap: Record<string, number> = {};
  logs.forEach(l => l.subjects.forEach(s => { subjectMap[s] = (subjectMap[s] ?? 0) + l.studyHours; }));
  const subjectData = Object.entries(subjectMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([name, hours]) => ({ name, hours: Math.round(hours * 10) / 10 }));

  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const weeklyData = DAYS.map(d => ({
    day: d,
    avg: (() => {
      const dayLogs = logs.filter(l => new Date(l.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }) === d);
      return dayLogs.length ? Math.round(avgOf(dayLogs.map(l => l.studyHours)) * 10) / 10 : 0;
    })(),
  }));

  const TABS: { id: Tab; label: string }[] = [
    { id: "trend",    label: "Study Trend"   },
    { id: "sleep",    label: "Sleep & Focus" },
    { id: "subjects", label: "Subjects"      },
    { id: "weekly",   label: "Weekly Pattern"},
  ];

  const STATS = [
    { label: "Study Streak",   value: streak > 0 ? `${streak}d` : "0d",                   icon: TrendingUp, color: "#7C6CFF" },
    { label: "Total Hours",    value: `${Math.round(totalHrs)}h`,                          icon: BookOpen,   color: "#4DA3FF" },
    { label: "Avg Daily",      value: avgStudy > 0 ? `${avgStudy.toFixed(1)}h` : "—",     icon: Zap,        color: "#10B981" },
    { label: "Avg Productivity",value: avgProd > 0 ? `${avgProd.toFixed(1)}/10` : "—",    icon: Moon,       color: "#F59E0B" },
  ];

  const empty = logs.length === 0;

  return (
    <div className="page-container">
      <div className="mb-6">
        <p className="section-title">Analytics</p>
        <h1 className="text-2xl font-bold text-text-primary">Performance Analytics</h1>
        <p className="text-sm text-text-secondary mt-1">Trends generated from your personal study logs.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted">{s.label}</p>
              <s.icon size={13} style={{ color: s.color }} />
            </div>
            <p className="text-xl font-bold text-text-primary">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-surface rounded-xl mb-5 w-fit overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
              tab === t.id ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-secondary"
            }`}>{t.label}</button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="glass p-5">
        {empty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <TrendingUp size={32} className="text-text-muted opacity-20 mb-3" />
            <p className="text-sm font-medium text-text-primary mb-1">No data yet</p>
            <p className="text-xs text-text-muted">Log study sessions to see your analytics charts here.</p>
          </div>
        ) : (
          <>
            {tab === "trend" && (
              <>
                <p className="text-sm font-semibold text-text-primary mb-4">Study Hours & Productivity — Last 14 Days</p>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7C6CFF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#7C6CFF" stopOpacity={0}    />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip content={<TT />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} />
                    <Area type="monotone" dataKey="study" stroke="#7C6CFF" fill="url(#g1)" strokeWidth={2} connectNulls dot={false} name="Study hrs" />
                    <Area type="monotone" dataKey="prod"  stroke="#10B981" fill="url(#g2)" strokeWidth={2} connectNulls dot={false} name="Productivity" />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}

            {tab === "sleep" && (
              <>
                <p className="text-sm font-semibold text-text-primary mb-4">Sleep Hours & Focus Level — Last 14 Days</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip content={<TT />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} />
                    <Line type="monotone" dataKey="sleep" stroke="#4DA3FF" strokeWidth={2} connectNulls dot={false} name="Sleep hrs" />
                    <Line type="monotone" dataKey="focus" stroke="#F59E0B" strokeWidth={2} connectNulls dot={false} name="Focus /10" />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}

            {tab === "subjects" && (
              <>
                <p className="text-sm font-semibold text-text-primary mb-4">Total Study Hours by Subject</p>
                {subjectData.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-16">Tag subjects in your logs to see this chart.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={subjectData} layout="vertical" barSize={14}>
                      <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<TT />} />
                      <Bar dataKey="hours" fill="#7C6CFF" radius={[0, 4, 4, 0]} opacity={0.85} name="Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </>
            )}

            {tab === "weekly" && (
              <>
                <p className="text-sm font-semibold text-text-primary mb-4">Average Study Hours by Day of Week</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip content={<TT />} />
                    <Bar dataKey="avg" fill="#4DA3FF" radius={[4, 4, 0, 0]} opacity={0.85} name="Avg hrs" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
