import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

/* ─── Types ─── */
export interface Affiliate {
  id: string;
  name: string;
  phone: string | null;
  affiliate_code: string;
  commission: number;
  status: "active" | "inactive";
  created_at: string;
  username?: string; // حساب تسجيل الدخول للمسوق
}

interface AffiliateContextType {
  affiliate: Affiliate | null;
  commission: number;
  loading: boolean;
  /** Returns originalPrice + commission (if affiliate active), else original */
  adjustPrice: (originalPrice: number) => number;
}

/* ─── Context ─── */
const AffiliateContext = createContext<AffiliateContextType>({
  affiliate: null,
  commission: 0,
  loading: false,
  adjustPrice: (p) => p,
});

const SESSION_KEY = "mm_affiliate_code";

/* ─── Provider ─── */
export function AffiliateProvider({ children }: { children: ReactNode }) {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Read ?ref= from URL and persist to session
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) sessionStorage.setItem(SESSION_KEY, refCode);

    // 2. Resolve code (URL param takes priority, then session)
    const code = refCode ?? sessionStorage.getItem(SESSION_KEY);
    if (!code) { setLoading(false); return; }

    // 3. Fetch affiliate from Supabase
    supabase
      .from("affiliates")
      .select("*")
      .eq("affiliate_code", code)
      .eq("status", "active")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAffiliate(data as Affiliate);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const commission = affiliate?.commission ?? 0;
  const adjustPrice = (originalPrice: number) => originalPrice + commission;

  return (
    <AffiliateContext.Provider value={{ affiliate, commission, loading, adjustPrice }}>
      {children}
    </AffiliateContext.Provider>
  );
}

/* ─── Hook ─── */
export function useAffiliate() {
  return useContext(AffiliateContext);
}
