import { useEffect, useState, useRef } from "react";
import { Navigate, Link } from "react-router";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAffiliateAuth } from "@/contexts/AffiliateAuthContext";
import { supabase } from "@/lib/supabase";
import {
  Copy, CheckCheck, LogOut, ShoppingBag, Banknote, Link as LinkIcon,
  TrendingUp, Loader2, Calendar,
} from "lucide-react";

/* ─── Types ─── */
interface AffOrder {
  id: string;
  created_at: string;
  governorate: string | null;
  items_count: number;
  sale_total: number | null;
  affiliate_total_commission: number | null;
}

/* ─── Copy helper ─── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground/60 hover:text-foreground transition-colors text-xs font-tajawal">
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "تم النسخ" : "نسخ"}
    </button>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${color} to-transparent border border-foreground/[0.08] rounded-2xl p-5`}>
      <div className={`w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-foreground/70" />
      </div>
      <p className="font-tajawal text-foreground/50 text-xs mb-1">{label}</p>
      <p className="font-cairo font-bold text-2xl text-foreground">{value}</p>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function AffiliateDashboard() {
  const { affiliateUser, affiliateLoading, affiliateLogout } = useAffiliateAuth();
  const sectionRef = useRef<HTMLDivElement>(null);

  const [orders, setOrders] = useState<AffOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const affiliateLink = affiliateUser
    ? `${window.location.origin}/?ref=${affiliateUser.affiliate_code}`
    : "";

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll(".dash-anim"), {
      y: 20, opacity: 0, duration: 0.5, stagger: 0.07, ease: "power2.out",
    });
  }, { scope: sectionRef, dependencies: [ordersLoading] });

  useEffect(() => {
    if (!affiliateUser) return;
    supabase
      .from("orders")
      .select("id, created_at, governorate, items_count, sale_total, affiliate_total_commission")
      .eq("affiliate_id", affiliateUser.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setOrders(data as AffOrder[]);
        setOrdersLoading(false);
      })
      .catch(() => setOrdersLoading(false));
  }, [affiliateUser]);

  /* Guards */
  if (affiliateLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-foreground/30 animate-spin" />
      </div>
    );
  }
  if (!affiliateUser) return <Navigate to="/affiliate-login" replace />;

  /* Stats */
  const totalOrders = orders.length;
  const totalSales = orders.reduce((s, o) => s + (o.sale_total ?? 0), 0);
  const totalCommission = orders.reduce((s, o) => s + (o.affiliate_total_commission ?? 0), 0);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div ref={sectionRef} className="relative z-10 min-h-screen bg-background pt-20 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="dash-anim flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="font-tajawal text-foreground/40 text-sm mb-1">لوحة المسوق</p>
            <h1 className="font-cairo font-bold text-2xl md:text-3xl text-foreground">
              أهلاً، {affiliateUser.name} 👋
            </h1>
          </div>
          <button
            onClick={affiliateLogout}
            className="flex items-center gap-2 h-10 px-4 bg-foreground/5 border border-foreground/10 text-foreground/60 hover:text-foreground hover:bg-foreground/10 font-cairo text-sm rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>

        {/* Referral Link */}
        <div className="dash-anim bg-foreground/[0.03] border border-foreground/[0.08] rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-4 h-4 text-foreground/50" />
            <p className="font-cairo font-semibold text-foreground text-sm">رابط الإحالة الخاص بك</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 min-w-0">
              <p className="font-tajawal text-foreground/70 text-sm truncate" dir="ltr">{affiliateLink}</p>
            </div>
            <CopyBtn text={affiliateLink} />
          </div>
          <p className="font-tajawal text-foreground/30 text-xs mt-2">
            شارك هذا الرابط وسيُضاف عمولة <span className="text-foreground/60 font-semibold">{affiliateUser.commission.toLocaleString()} ج.م</span> على كل منتج في الطلبات القادمة عبره
          </p>
        </div>

        {/* Stats Grid */}
        <div className="dash-anim grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={ShoppingBag}  label="إجمالي الطلبات"  value={totalOrders.toLocaleString("ar-EG")} color="from-blue-500/10" />
          <StatCard icon={TrendingUp}   label="إجمالي المبيعات" value={`${totalSales.toLocaleString()} ج.م`} color="from-green-500/10" />
          <StatCard icon={Banknote}     label="عمولتك الكاملة"  value={`${totalCommission.toLocaleString()} ج.م`} color="from-amber-500/10" />
        </div>

        {/* Orders Table */}
        <div className="dash-anim">
          <h2 className="font-cairo font-semibold text-foreground mb-4">
            الطلبات الواردة عبر رابطك
            <span className="font-tajawal text-foreground/40 text-sm font-normal mr-2">({totalOrders})</span>
          </h2>

          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-7 h-7 text-foreground/30 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-14 bg-foreground/[0.02] border border-foreground/[0.06] rounded-2xl">
              <ShoppingBag className="w-12 h-12 text-foreground/15 mx-auto mb-3" />
              <p className="font-tajawal text-foreground/40">لم يصلك أي طلب بعد. شارك رابطك وابدأ الكسب!</p>
            </div>
          ) : (
            <div className="bg-foreground/[0.03] border border-foreground/[0.07] rounded-2xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-foreground/[0.06] text-foreground/40 text-xs font-tajawal">
                <span>التاريخ</span>
                <span>المحافظة</span>
                <span>القطع</span>
                <span className="text-left">عمولتك</span>
              </div>
              {/* Rows */}
              <div className="divide-y divide-foreground/[0.04]">
                {orders.map(order => (
                  <div key={order.id} className="grid grid-cols-4 gap-2 px-4 py-3 text-sm items-center hover:bg-foreground/[0.02] transition-colors">
                    <div className="flex items-center gap-1.5 text-foreground/60 font-tajawal">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs">{formatDate(order.created_at)}</span>
                    </div>
                    <span className="font-tajawal text-foreground/70 text-xs">{order.governorate ?? "—"}</span>
                    <span className="font-cairo text-foreground/70 text-xs">{order.items_count} قطعة</span>
                    <span className="font-cairo font-semibold text-amber-400 text-left text-sm">
                      +{(order.affiliate_total_commission ?? 0).toLocaleString()} ج.م
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer link */}
        <div className="dash-anim text-center mt-10">
          <Link to="/" className="font-tajawal text-foreground/30 hover:text-foreground/60 text-sm transition-colors">
            ← العودة للموقع
          </Link>
        </div>
      </div>
    </div>
  );
}
