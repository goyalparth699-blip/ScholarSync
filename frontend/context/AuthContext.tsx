"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  isConfigured,
  type User,
} from "@/lib/firebase";

interface AuthContextValue {
  user:    User | null;
  loading: boolean;
  signIn:  (email: string, password: string) => Promise<void>;
  signUp:  (email: string, password: string) => Promise<void>;
  logout:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn(email: string, password: string) {
    if (!auth) {
      // Demo mode — simulate login with a fake user object
      setUser({ email, uid: `demo_${email}` } as User);
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string) {
    if (!auth) {
      setUser({ email, uid: `demo_${email}` } as User);
      return;
    }
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    if (auth) await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
