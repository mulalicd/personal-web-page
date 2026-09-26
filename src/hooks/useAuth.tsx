import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  /** True until BOTH the session and the admin role are known. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Look up the admin role from `user_roles` (RLS lets a user read only their own rows).
 * UI convenience only — every admin action is re-authorised server-side (E-4).
 */
async function fetchIsAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) {
      console.error("[auth] admin role lookup failed:", error.message);
      return false;
    }
    return !!data;
  } catch (error) {
    console.error("[auth] admin role lookup failed:", error);
    return false;
  }
}

/** Session + admin-role provider for the admin area. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(Boolean(supabase));

  // Resolve session AND role before clearing `loading`. Clearing it earlier made
  // the admin page redirect with a false "Access denied" right after sign-in.
  const applySession = useCallback(async (next: Session | null) => {
    setSession(next);
    setUser(next?.user ?? null);
    setIsAdmin(next?.user ? await fetchIsAdmin(next.user.id) : false);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      // Defer out of the auth callback: calling Supabase inside it can deadlock.
      setTimeout(() => void applySession(next), 0);
    });
    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    return () => subscription.unsubscribe();
  }, [applySession]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error("Sign-in is temporarily unavailable.") };
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoading(false);
    return { error };
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Access the auth context (must be inside AuthProvider). */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
