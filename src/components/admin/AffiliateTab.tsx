import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { type Affiliate } from "@/contexts/AffiliateContext";
import { hashPassword } from "@/lib/crypto";
import {
  Plus, Pencil, Trash2, X, Check, Copy, CheckCheck,
  Users, ToggleLeft, ToggleRight, Loader2, Link as LinkIcon, Eye, EyeOff,
} from "lucide-react";

/* ─── Types ─── */
interface AffiliateStats {
  affiliate_id: string;
  order_count: number;
  total_sales: number;
  total_commission: number;
}

/* ─── Helpers ─── */
function generateCode(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  const rand = Math.random().toString(36).slice(2, 6);
  return `${slug || "aff"}_${rand}`;
}

function buildAffiliateLink(code: string): string {
  const base = window.location.origin;
  return `${base}/?ref=${code}`;
}

/* ─── Copy Button ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      title="نسخ الرابط"
      className="w-7 h-7 rounded-lg bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors shrink-0"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

/* ─── Form Input ─── */
function FInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block font-tajawal text-foreground/60 text-xs mb-1">{label}</label>
      <input
        {...props}
        className="w-full h-10 bg-foreground/5 border border-foreground/10 rounded-lg px-3 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors disabled:opacity-40"
      />
    </div>
  );
}

/* ─── Add / Edit Modal ─── */
type AffiliateSaveData = Omit<Affiliate, "id" | "created_at"> & { password_hash?: string };

interface ModalProps {
  initial?: Affiliate;
  onSave: (data: AffiliateSaveData) => Promise<void>;
  onClose: () => void;
}

function AffiliateModal({ initial, onSave, onClose }: ModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [commission, setCommission] = useState<number>(initial?.commission ?? 0);
  const [code, setCode] = useState(initial?.affiliate_code ?? "");
  const [status, setStatus] = useState<"active" | "inactive">(initial?.status ?? "active");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate code when name typed (add mode only)
  const handleNameChange = (v: string) => {
    setName(v);
    if (!initial) setCode(generateCode(v));
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("اسم المسوق مطلوب"); return; }
    if (!code.trim()) { setError("كود المسوق مطلوب"); return; }
    if (!username.trim()) { setError("اسم المستخدم مطلوب لتسجيل الدخول"); return; }
    if (!initial && !password) { setError("كلمة المرور مطلوبة للحساب الجديد"); return; }
    if (password && password.length < 6) { setError("كلمة المرور 6 أحرف على الأقل"); return; }
    if (commission < 0) { setError("قيمة العمولة يجب أن تكون 0 أو أكثر"); return; }
    setSaving(true);
    setError("");
    try {
      let password_hash: string | undefined;
      if (password.trim()) password_hash = await hashPassword(password);
      await onSave({
        name: name.trim(),
        phone: phone.trim() || null,
        affiliate_code: code.trim(),
        commission,
        status,
        username: username.trim(),
        ...(password_hash ? { password_hash } : {}),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ، حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-card border border-foreground/10 rounded-2xl p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-cairo font-bold text-xl text-foreground">
            {initial ? "تعديل بيانات المسوق" : "إضافة مسوق جديد"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <FInput label="اسم المسوق *" value={name} onChange={e => handleNameChange(e.target.value)} placeholder="أحمد محمد" />
          <FInput label="رقم الهاتف (اختياري)" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01xxxxxxxxx" />
          <FInput
            label="قيمة العمولة (ج.م يُضاف على كل منتج)"
            type="number"
            min={0}
            value={commission || ""}
            onChange={e => setCommission(Number(e.target.value))}
            placeholder="200"
          />

          {/* Code */}
          <div>
            <label className="block font-tajawal text-foreground/60 text-xs mb-1">كود المسوق (يُنشأ تلقائياً)</label>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="ahmed_x4f2"
                className="flex-1 h-10 bg-foreground/5 border border-foreground/10 rounded-lg px-3 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setCode(generateCode(name || "aff"))}
                className="h-10 px-3 bg-foreground/5 border border-foreground/10 text-foreground/60 text-xs font-cairo rounded-lg hover:bg-foreground/10 transition-colors whitespace-nowrap"
              >
                تجديد
              </button>
            </div>
          </div>

          {/* Preview link */}
          {code && (
            <div className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-xl p-3">
              <p className="font-tajawal text-foreground/40 text-xs mb-1 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" /> رابط المسوق
              </p>
              <div className="flex items-center gap-2">
                <p className="font-tajawal text-foreground/70 text-xs break-all flex-1" dir="ltr">
                  {buildAffiliateLink(code)}
                </p>
                <CopyButton text={buildAffiliateLink(code)} />
              </div>
            </div>
          )}

          {/* ── بيانات تسجيل الدخول ── */}
          <div className="pt-2 border-t border-foreground/[0.06]">
            <p className="font-cairo font-semibold text-foreground/70 text-xs mb-3 flex items-center gap-1.5">
              بيانات دخول المسوق للموقع
            </p>
            {/* Username */}
            <div className="mb-3">
              <label className="block font-tajawal text-foreground/60 text-xs mb-1">
                اسم المستخدم *{initial && <span className="text-foreground/30 mr-1">(لا يمكن تغييره)</span>}
              </label>
              <input
                value={username}
                onChange={e => !initial && setUsername(e.target.value.replace(/\s/g, ""))}
                disabled={!!initial}
                placeholder="ahmed_ref"
                dir="ltr"
                className="w-full h-10 bg-foreground/5 border border-foreground/10 rounded-lg px-3 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
            {/* Password */}
            <div>
              <label className="block font-tajawal text-foreground/60 text-xs mb-1">
                كلمة المرور {initial ? "(اتركها فارغة لإبقاء القديمة)" : "*"}
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={initial ? "••••••• (اختياري)" : "6 أحرف على الأقل"}
                  className="w-full h-10 bg-foreground/5 border border-foreground/10 rounded-lg px-3 pr-10 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/50 transition-colors"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Status toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="font-tajawal text-foreground/70 text-sm">حالة المسوق</span>
            <button
              onClick={() => setStatus(s => s === "active" ? "inactive" : "active")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-cairo transition-colors ${
                status === "active"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-foreground/5 text-foreground/40 border border-foreground/10"
              }`}
            >
              {status === "active"
                ? <><ToggleRight className="w-4 h-4" /> مفعّل</>
                : <><ToggleLeft className="w-4 h-4" /> موقوف</>}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm font-tajawal">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-11 bg-primary text-primary-foreground font-cairo font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {initial ? "حفظ التعديلات" : "إضافة المسوق"}
          </button>
          <button
            onClick={onClose}
            className="h-11 px-5 bg-foreground/5 border border-foreground/10 text-foreground/70 font-cairo rounded-xl hover:bg-foreground/10 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main AffiliateTab ─── */
export default function AffiliateTab() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [stats, setStats] = useState<Record<string, AffiliateStats>>({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Affiliate | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  /* ── Fetch data ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [affRes, ordRes] = await Promise.all([
        supabase.from("affiliates").select("*").order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("affiliate_id, sale_total, affiliate_total_commission")
          .not("affiliate_id", "is", null),
      ]);

      if (affRes.data) setAffiliates(affRes.data as Affiliate[]);

      // Aggregate stats per affiliate
      if (ordRes.data) {
        const map: Record<string, AffiliateStats> = {};
        for (const o of ordRes.data as any[]) {
          if (!o.affiliate_id) continue;
          const id = o.affiliate_id;
          if (!map[id]) map[id] = { affiliate_id: id, order_count: 0, total_sales: 0, total_commission: 0 };
          map[id].order_count += 1;
          map[id].total_sales += o.sale_total ?? 0;
          map[id].total_commission += o.affiliate_total_commission ?? 0;
        }
        setStats(map);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  /* ── CRUD ── */
  const handleSave = async (data: AffiliateSaveData, id?: string) => {
    if (id) {
      // في وضع التعديل: لا نُرسل password_hash إلا إذا أدخل الأدمن كلمة سر جديدة
      const { password_hash, ...rest } = data;
      const payload: Record<string, unknown> = { ...rest };
      if (password_hash) payload.password_hash = password_hash;
      const { error } = await supabase.from("affiliates").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      if (!data.password_hash) throw new Error("كلمة المرور مطلوبة");
      const { error } = await supabase.from("affiliates").insert(data);
      if (error) throw new Error(error.message);
    }
    await fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المسوق؟")) return;
    setDeleting(id);
    await supabase.from("affiliates").delete().eq("id", id);
    await fetchAll();
    setDeleting(null);
  };

  const handleToggle = async (aff: Affiliate) => {
    setToggling(aff.id);
    const newStatus = aff.status === "active" ? "inactive" : "active";
    await supabase.from("affiliates").update({ status: newStatus }).eq("id", aff.id);
    await fetchAll();
    setToggling(null);
  };

  /* ── Render ── */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-cairo font-semibold text-foreground">{affiliates.length} مسوق مسجل</p>
          <p className="font-tajawal text-foreground/40 text-xs mt-0.5">
            إدارة المسوقين وعمولاتهم
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setModal("add"); }}
          className="flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground font-cairo text-sm font-semibold rounded-xl hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />إضافة مسوق
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-foreground/30 animate-spin" />
        </div>
      ) : affiliates.length === 0 ? (
        <div className="text-center py-16 bg-foreground/[0.02] border border-foreground/[0.06] rounded-2xl">
          <Users className="w-12 h-12 text-foreground/15 mx-auto mb-3" />
          <p className="font-tajawal text-foreground/40">لا يوجد مسوقون بعد. أضف أول مسوق الآن.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {affiliates.map(aff => {
            const s = stats[aff.id];
            const link = buildAffiliateLink(aff.affiliate_code);
            return (
              <div
                key={aff.id}
                className={`bg-foreground/[0.04] border rounded-2xl p-4 transition-colors ${
                  aff.status === "active" ? "border-foreground/[0.08]" : "border-foreground/[0.04] opacity-60"
                }`}
              >
                {/* Row top */}
                <div className="flex items-start gap-4 flex-wrap">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="font-cairo font-bold text-primary text-sm">
                      {aff.name.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-cairo font-semibold text-foreground">{aff.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-tajawal border ${
                        aff.status === "active"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-foreground/5 text-foreground/30 border-foreground/10"
                      }`}>
                        {aff.status === "active" ? "مفعّل" : "موقوف"}
                      </span>
                    </div>
                    {aff.phone && (
                      <p className="font-tajawal text-foreground/40 text-xs mt-0.5">{aff.phone}</p>
                    )}
                    {/* Link */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="font-tajawal text-foreground/40 text-xs truncate max-w-[260px]" dir="ltr">
                        {link}
                      </p>
                      <CopyButton text={link} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(aff)}
                      disabled={toggling === aff.id}
                      title={aff.status === "active" ? "إيقاف المسوق" : "تفعيل المسوق"}
                      className="w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      {toggling === aff.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : aff.status === "active"
                          ? <ToggleRight className="w-3.5 h-3.5 text-green-400" />
                          : <ToggleLeft className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { setEditTarget(aff); setModal("edit"); }}
                      className="w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => void handleDelete(aff.id)}
                      disabled={deleting === aff.id}
                      className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors disabled:opacity-40"
                    >
                      {deleting === aff.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-foreground/[0.06]">
                  <StatCell label="العمولة / منتج" value={`${aff.commission.toLocaleString()} ج.م`} highlight />
                  <StatCell label="اسم المستخدم" value={aff.username ?? "—"} mono />
                  <StatCell label="عدد الطلبات" value={(s?.order_count ?? 0).toLocaleString()} />
                  <StatCell label="إجمالي المبيعات" value={`${(s?.total_sales ?? 0).toLocaleString()} ج.م`} />
                </div>
                {(s?.total_commission ?? 0) > 0 && (
                  <div className="mt-2 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    <p className="font-tajawal text-amber-400 text-xs">
                      إجمالي عمولة المسوق: <span className="font-cairo font-bold">{s.total_commission.toLocaleString()} ج.م</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <AffiliateModal
          initial={modal === "edit" && editTarget ? editTarget : undefined}
          onSave={(data) => handleSave(data, modal === "edit" ? editTarget?.id : undefined)}
          onClose={() => { setModal(null); setEditTarget(null); }}
        />
      )}
    </div>
  );
}

/* ─── Stat Cell ─── */
function StatCell({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="bg-foreground/[0.03] rounded-xl p-2.5">
      <p className="font-tajawal text-foreground/40 text-xs mb-1">{label}</p>
      <p className={`font-cairo font-semibold text-sm ${highlight ? "text-primary" : "text-foreground"} ${mono ? "text-xs font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
