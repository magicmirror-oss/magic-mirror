import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/crypto";
import { type Affiliate } from "@/contexts/AffiliateContext";

/* ─── Types ─── */
export type AffiliateUser = Omit<Affiliate, "password_hash">;

interface AffiliateAuthContextType {
  affiliateUser: AffiliateUser | null;
  affiliateLoading: boolean;
  affiliateLogin: (username: string, password: string) => Promise<void>;
  affiliateLogout: () => void;
}

/* ─── Context ─── */
const AffiliateAuthContext = createContext<AffiliateAuthContextType>({
  affiliateUser: null,
  affiliateLoading: false,
  affiliateLogin: async () => {},
  affiliateLogout: () => {},
});

const LS_KEY = "mm_affiliate_session";

/* ─── Provider ─── */
export function AffiliateAuthProvider({ children }: { children: ReactNode }) {
  const [affiliateUser, setAffiliateUser] = useState<AffiliateUser | null>(null);
  const [affiliateLoading, setAffiliateLoading] = useState(true);

  /* Restore session from localStorage on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AffiliateUser;
        setAffiliateUser(parsed);
      }
    } catch {
      localStorage.removeItem(LS_KEY);
    } finally {
      setAffiliateLoading(false);
    }
  }, []);

  /* Login: match username + hashed password against Supabase */
  const affiliateLogin = async (username: string, password: string) => {
    const hashed = await hashPassword(password);

    const { data, error } = await supabase
      .from("affiliates")
      .select("*")
      .eq("username", username.trim())
      .eq("password_hash", hashed)
      .eq("status", "active")
      .maybeSingle();

    if (error || !data) {
      throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _ph, ...safeData } = data as Affiliate & { password_hash: string };
    const user = safeData as AffiliateUser;
    localStorage.setItem(LS_KEY, JSON.stringify(user));
    setAffiliateUser(user);
  };

  const affiliateLogout = () => {
    localStorage.removeItem(LS_KEY);
    setAffiliateUser(null);
  };

  return (
    <AffiliateAuthContext.Provider value={{ affiliateUser, affiliateLoading, affiliateLogin, affiliateLogout }}>
      {children}
    </AffiliateAuthContext.Provider>
  );
}

/* ─── Hook ─── */
export function useAffiliateAuth() {
  return useContext(AffiliateAuthContext);
}
