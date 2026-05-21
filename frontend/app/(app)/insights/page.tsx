"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw, BookOpen } from "lucide-react";
import { getLogs, getProfile, generateInsights, calcStreak, avgOf } from "@/lib/storage";
import type { StudyLog, UserProfile, AIInsight } from "@/lib/types";
const TYPE_META: Record<AIInsight["type"], { label: string; color: string; bg: string }> = {
  achievement: { label: "Achievement",   color: "#10B981", bg: "bg-success/[0.06] border-success/20"       },
  warning:     { label: "Watch Out",     color: "#F59E0B", bg: "bg-warning/[0.06] border-warning/20"       },
  tip:         { label: "Tip",           color: "#4DA3FF", bg: "bg-accent-blue/[0.06] border-accent-blue/20"},
  forecast:    { label: "Forecast",      color: "#7C6CFF", bg: "bg-accent-purple/[0.06] border-accent-purple/20"},
};

function TrendIcon({ trend }: { trend?: AIInsight["trend"] }) {
  if (trend === "up")   return <TrendingUp   size={13} className="text-success"  />;
  if (trend === "down") return <TrendingDown size={13} className="text-warning"  />;
  return                       <Minus        size={13} className="text-text-muted" />;
}

export default function InsightsPage() {
  const [logs,     setLogs]     = useState<StudyLog[]>([]);
  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [mounted,  setMounted]  = useState(false);

  function reload() {
    const l = getLogs();
    const p = getProfile();
    setLogs(l);
    setProfile(p);
    setInsights(generateInsights(l, p));
  }

  useEffect(() => { reload(); setMounted(true); }, []);
  if (!mounted) return null;

  const recent7    = logs.slice(0, 7);
  const avgStudy   = avgOf(recent7.map(l => l.studyHours));
  const avgSleep   = avgOf(recent7.map(l => l.sleepHours));
  const avgProd    = avgOf(recent7.map(l => l.productivityScore));
  const streak     = calcStreak(logs);

  const SUMMARY = [
    { label: "7-day Avg Study", value: avgStudy > 0 ? `${avgStudy.toFixed(1)}h` : "—",       color: "#7C6CFF" },
    { label: "7-day Avg Sleep", value: avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : "—",       color: "#4DA3FF" },
    { label: "Avg Productivity",value: avgProd  > 0 ? `${avgProd.toFixed(1)}/10` : "—",      color: "#10B981" },
    { label: "Current Streak",  value: streak > 0   ? `${streak} days` : "No streak",        color: "#F59E0B" },
  ];

  return (
    <div className="page-container">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="section-title">AI Insights</p>
          <h1 className="text-2xl font-bold text-text-primary">Personalised Insights</h1>
          <p className="text-sm text-text-secondary mt-1">AI-generated observations based on your study logs.</p>
        </div>
        <button onClick={reload} className="btn-ghost border border-white/[0.08] shrink-0">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        {SUMMARY.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-sm p-4">
            <p className="text-xs text-text-muted mb-1">{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Insight cards */}
      {logs.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-4">
            <BrainCircuit size={24} className="text-accent-purple" />
          </div>
          <p className="text-sm font-semibold text-text-primary mb-2">No insights yet</p>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            Log at least one study session and your AI insights will appear here — sleep patterns, focus trends, burnout risk, and more.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {insights.map((ins, i) => {
            const meta = TYPE_META[ins.type];
            return (
              <motion.div key={ins.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`glass p-5 border ${meta.bg}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles size={13} style={{ color: meta.color }} className="shrink-0" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: meta.color }}>{meta.label}</span>
                  </div>
                  <TrendIcon trend={ins.trend} />
                </div>

                <h3 className="text-sm font-bold text-text-primary mb-2 leading-snug">{ins.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{ins.body}</p>

                {ins.action && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <BookOpen size={11} style={{ color: meta.color }} />
                      <p className="text-xs font-medium" style={{ color: meta.color }}>{ins.action}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
