"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight, Loader2, Sparkles, BookOpen, BrainCircuit, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Tab = "login" | "signup";

export default function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const router = useRouter();

  const [tab,      setTab]      = useState<Tab>("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    if (tab === "signup" && password !== confirm) { setError("Passwords do not match."); return; }

    setBusy(true);
    try {
      if (tab === "login") await signIn(email, password);
      else                  await signUp(email, password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("invalid-credential") || msg.includes("wrong-password"))
        setError("Incorrect email or password.");
      else if (msg.includes("email-already-in-use"))
        setError("An account with this email already exists.");
      else if (msg.includes("user-not-found"))
        setError("No account found with this email.");
      else
        setError("Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const FEATURES = [
    { icon: Sparkles,     label: "AI Score Prediction"  },
    { icon: BookOpen,     label: "Daily Study Logs"      },
    { icon: TrendingUp,   label: "Performance Analytics" },
    { icon: BrainCircuit, label: "Personalised Insights" },
  ];

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent-purple/[0.07] blur-[100px] animate-float" />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-accent-blue/[0.06] blur-[100px] animate-float-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent-purple/[0.04] blur-[80px]" />
      </div>

      <div className="relative w-full max-w-[800px] grid lg:grid-cols-[1fr_400px] gap-8 items-center">
        {/* Left hero — hidden on small screens */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="hidden lg:block"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center shadow-accent">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">ScholarSync</span>
          </div>
          <h1 className="text-4xl font-extrabold text-text-primary leading-tight mb-4">
            Your academic<br />
            <span className="text-gradient">edge starts here.</span>
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed mb-8 max-w-sm">
            Predict your exam score, track daily study sessions, and get AI-powered insights that help you study smarter — all in one place.
          </p>
          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center shrink-0">
                  <f.icon size={13} className="text-accent-purple" />
                </div>
                <span className="text-sm text-text-secondary">{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — auth card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="w-full"
        >
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center shadow-accent mb-3">
              <GraduationCap size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">ScholarSync</h1>
            <p className="text-xs text-text-muted mt-0.5">AI-powered academic tracker</p>
          </div>

        <div className="glass p-6">
          <h2 className="text-lg font-bold text-text-primary mb-1">{tab === "login" ? "Welcome back" : "Create account"}</h2>
          <p className="text-xs text-text-muted mb-6">{tab === "login" ? "Sign in to continue" : "Start your academic journey"}</p>
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-bg-surface p-1 mb-6 gap-1">
            {(["login", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  tab === t
                    ? "bg-bg-elevated text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {t === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="input-base pl-9"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-base pl-9"
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                />
              </div>
            </div>

            {/* Confirm password (signup only) */}
            {tab === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className="input-base pl-9"
                    autoComplete="new-password"
                  />
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2.5"
              >
                <AlertCircle size={13} className="shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button type="submit" disabled={busy} className="btn-primary w-full mt-1">
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  {tab === "login" ? "Sign in" : "Create account"}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

          {/* Demo note */}
          <p className="text-center text-xs text-text-muted mt-5 leading-relaxed">
            No Firebase?{" "}
            <span className="text-accent-purple">Use any email + password (6+ chars)</span>
            {" "}to enter demo mode.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
