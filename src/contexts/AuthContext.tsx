import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  loading: boolean;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; avatar?: string }) => Promise<void>;
}

const ADMIN_EMAILS = ["admin@magicmirror.com", "alm.agic@yahoo.com"];

const AuthContext = createContext<AuthContextType | null>(null);

async function buildUser(su: SupabaseUser): Promise<User> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", su.id)
    .single();

  return {
    id: su.id,
    name: profile?.name || su.user_metadata?.name || "",
    email: su.email!,
    phone: profile?.phone ?? su.user_metadata?.phone,
    avatar: profile?.avatar_url,
    isAdmin: ADMIN_EMAILS.includes(su.email!) || (profile?.is_admin ?? false),
    createdAt: su.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = await buildUser(session.user);
        setUser(u);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const u = await buildUser(session.user);
          setUser(u);
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone: phone ?? null,
          is_admin: ADMIN_EMAILS.includes(email),
        },
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        throw new Error("البريد الإلكتروني مسجل مسبقاً");
      }
      throw new Error(error.message);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    // تأكد من تعيين is_admin في قاعدة البيانات لحسابات الأدمن
    if (data.user && ADMIN_EMAILS.includes(data.user.email!)) {
      await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", data.user.id);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: { name?: string; avatar?: string }) => {
    if (!user) return;
    const dbUpdates: Record<string, string | undefined> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
    await supabase.from("profiles").update(dbUpdates).eq("id", user.id);
    setUser(prev => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.isAdmin ?? false,
        isLoggedIn: !!user,
        loading,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
