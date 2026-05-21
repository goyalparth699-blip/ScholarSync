"use client";
// REWRITTEN

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  BarChart2,
  BrainCircuit,
  Target,
  Info,
  ChevronLeft,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { href: "/prediction", label: "Predict Score",  icon: Sparkles },
  { href: "/study-log",  label: "Study Log",      icon: BookOpen },
  { href: "/analytics",  label: "Analytics",      icon: BarChart2 },
  { href: "/insights",   label: "AI Insights",    icon: BrainCircuit },
  { href: "/profile",    label: "Profile & Goals",icon: Target },
  { href: "/about",      label: "About",          icon: Info },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname  = usePathname();
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 232 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-bg-surface border-r border-white/[0.06] shrink-0 overflow-hidden z-20"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center shrink-0 shadow-accent">
          <GraduationCap size={14} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-semibold text-text-primary whitespace-nowrap"
            >
              ScholarSync
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 overflow-hidden",
                active
                  ? "bg-accent-purple/[0.12] text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 rounded-lg bg-accent-purple/[0.12]"
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                />
              )}
              <Icon
                size={15}
                className={cn(
                  "relative shrink-0 transition-colors",
                  active ? "text-accent-purple" : "group-hover:text-text-primary",
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    key={`nav-${href}`}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="relative whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && !collapsed && (
                <motion.div
                  layoutId="sidebar-dot"
                  className="relative ml-auto w-1.5 h-1.5 rounded-full bg-accent-purple"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="px-2 py-3 border-t border-white/[0.06] shrink-0 space-y-0.5">
        {!collapsed && user && (
          <div className="px-3 py-1.5 mb-1">
            <p className="text-xs text-text-muted truncate leading-none">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors duration-150"
        >
          <LogOut size={15} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute top-[52px] -right-2.5 w-5 h-5 rounded-full bg-bg-elevated border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shadow-card"
        aria-label="Toggle sidebar"
      >
        <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronLeft size={11} />
        </motion.span>
      </button>
    </motion.aside>
  );
}
