import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useStore, type Product } from "@/contexts/StoreContext";
import {
  Plus, Pencil, Trash2, X, Check, Package, Tag, LayoutDashboard, ChevronDown, ChevronUp, Eye, ShoppingBag, Upload, Loader2, Star, MessageSquare, User, RefreshCw, Users,
} from "lucide-react";
import AffiliateTab from "@/components/admin/AffiliateTab";

interface SiteStats {
  visits: number;
  completedPurchases: number;
}
import { useReviews } from "@/contexts/ReviewsContext";

/** Inline image upload control: pick a file, upload it, or fall back to pasting a URL. */
function ImageUploadField({
  label, value, onChange,
}: { label: string; value: string; onChange: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setIsUploading(true);
    setUploadError(null);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "فشل رفع الصورة");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <label className="block font-tajawal text-foreground/60 text-xs mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg bg-foreground/5 border border-foreground/10 overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.visibility = "hidden"; }} />
          ) : (
            <Upload className="w-5 h-5 text-foreground/20" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://... أو ارفع صورة"
            className="w-full h-10 bg-foreground/5 border border-foreground/10 rounded-lg px-3 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="h-9 px-4 bg-foreground/5 border border-foreground/10 text-foreground/70 font-cairo text-xs rounded-lg hover:bg-foreground/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {isUploading ? "جارِ الرفع..." : "رفع صورة من جهازك"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }}
          />
          {uploadError && <p className="text-red-400 text-xs font-tajawal">{uploadError}</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── helpers ─── */
const emptyProduct = (): Omit<Product, "id"> => ({
  code: "", name: "", nameEn: "", price: 0, oldPrice: undefined,
  image: "", images: [], sizes: [], lightColors: [],
  description: "", features: [], specs: [],
  category: "", ledSpecs: "", antiFog: false, touchControl: false,
});

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block font-tajawal text-foreground/60 text-xs mb-1">{label}</label>
      <input
        {...props}
        className="w-full h-10 bg-foreground/5 border border-foreground/10 rounded-lg px-3 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
      />
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="block font-tajawal text-foreground/60 text-xs mb-1">{label}</label>
      <textarea
        {...props}
        rows={3}
        className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors resize-none"
      />
    </div>
  );
}

/* ─── Product Form Modal ─── */
function ProductModal({
  initial, categories, onSave, onClose,
}: {
  initial?: Product;
  categories: string[];
  onSave: (p: Omit<Product, "id">, id?: string) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState<Omit<Product, "id">>(
    initial ? (({ id, ...rest }) => rest)(initial) : emptyProduct()
  );
  const [sizesRaw, setSizesRaw] = useState(
    (initial?.sizes ?? []).filter(s => s !== "مقاس خاص").join("، ")
  );
  const [hasCustomSize, setHasCustomSize] = useState(
    initial?.sizes.includes("مقاس خاص") ?? false
  );
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [featuresRaw, setFeaturesRaw] = useState(initial?.features.join("\n") ?? "");

  const set = (k: keyof typeof data, v: any) => setData(d => ({ ...d, [k]: v }));

  const handleSave = () => {
    const product: Omit<Product, "id"> = {
      ...data,
      sizes: [
        ...sizesRaw.split(/[,،.\n]/).map(s => s.trim()).filter(Boolean),
        ...(hasCustomSize ? ["مقاس خاص"] : []),
      ],
      images: images.map(s => s.trim()).filter(Boolean),
      features: featuresRaw.split("\n").map(s => s.trim()).filter(Boolean),
    };
    onSave(product, initial?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-card border border-foreground/10 rounded-2xl p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-cairo font-bold text-xl text-foreground">
            {initial ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="اسم المنتج (عربي)" value={data.name} onChange={e => set("name", e.target.value)} placeholder="مرآة LED مستطيلة" />
          <Input label="اسم المنتج (إنجليزي)" value={data.nameEn} onChange={e => set("nameEn", e.target.value)} placeholder="LED Mirror" />
          <Input label="كود المنتج" value={data.code} onChange={e => set("code", e.target.value)} placeholder="MM-LED-007" />
          <div>
            <label className="block font-tajawal text-foreground/60 text-xs mb-1">القسم</label>
            <select
              value={data.category}
              onChange={e => set("category", e.target.value)}
              className="w-full h-10 bg-foreground/5 border border-foreground/10 rounded-lg px-3 text-foreground font-tajawal text-sm outline-none focus:border-foreground/30 transition-colors"
            >
              <option value="">اختر القسم</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="السعر (ج.م)" type="number" value={data.price || ""} onChange={e => set("price", Number(e.target.value))} placeholder="1850" />
          <Input label="السعر القديم (اختياري)" type="number" value={data.oldPrice ?? ""} onChange={e => set("oldPrice", e.target.value ? Number(e.target.value) : undefined)} placeholder="2200" />
          <div className="sm:col-span-2">
            <ImageUploadField label="الصورة الرئيسية" value={data.image} onChange={url => set("image", url)} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="block font-tajawal text-foreground/60 text-xs">صور إضافية</label>
            {images.map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1">
                  <ImageUploadField
                    label=""
                    value={img}
                    onChange={url => setImages(prev => prev.map((v, vi) => vi === i ? url : v))}
                  />
                </div>
                <button type="button" onClick={() => setImages(prev => prev.filter((_, vi) => vi !== i))}
                  className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setImages(prev => [...prev, ""])}
              className="h-9 px-4 bg-foreground/5 border border-foreground/10 text-foreground/70 font-cairo text-xs rounded-lg hover:bg-foreground/10 transition-colors flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" />إضافة صورة أخرى
            </button>
          </div>
          <div className="sm:col-span-2">
            <Textarea label="الوصف" value={data.description} onChange={e => set("description", e.target.value)} placeholder="وصف المنتج..." />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Input label="المقاسات المتاحة (مفصولة بفاصلة)" value={sizesRaw} onChange={e => setSizesRaw(e.target.value)} placeholder="60x80 سم. 70x90 سم. 80x100 سم. 100x120 سم" />
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={hasCustomSize}
                onChange={e => setHasCustomSize(e.target.checked)}
                className="w-4 h-4 accent-white"
              />
              <span className="font-tajawal text-foreground/70 text-sm">إضافة خيار «مقاس خاص» للعميل</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <Textarea label="المميزات (ميزة في كل سطر)" value={featuresRaw} onChange={e => setFeaturesRaw(e.target.value)} placeholder={"إضاءة LED موزعة\nمقاومة للبخار\nتحكم باللمس"} />
          </div>
          <Input label="مواصفات LED" value={data.ledSpecs} onChange={e => set("ledSpecs", e.target.value)} placeholder="إضاءة LED حول الإطار" />
          <div className="flex items-center gap-6 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.antiFog} onChange={e => set("antiFog", e.target.checked)} className="w-4 h-4 accent-white" />
              <span className="font-tajawal text-foreground/70 text-sm">مضاد للضباب</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.touchControl} onChange={e => set("touchControl", e.target.checked)} className="w-4 h-4 accent-white" />
              <span className="font-tajawal text-foreground/70 text-sm">تحكم باللمس</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleSave}
            className="flex-1 h-11 bg-primary text-primary-foreground font-cairo font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors">
            <Check className="w-4 h-4" />
            {initial ? "حفظ التعديلات" : "إضافة المنتج"}
          </button>
          <button onClick={onClose}
            className="h-11 px-5 bg-foreground/5 border border-foreground/10 text-foreground/70 font-cairo rounded-xl hover:bg-foreground/10 transition-colors">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Admin Page ─── */
export default function Admin() {
  const { isAdmin } = useAuth();
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory } = useStore();

  const { reviews, deleteReview } = useReviews();
  const [tab, setTab] = useState<"overview" | "products" | "categories" | "reviews" | "affiliates">("overview");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [newCat, setNewCat] = useState("");
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const [visitsRes, ordersRes] = await Promise.all([
        supabase.from("site_visits").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
      ]);
      setSiteStats({
        visits: visitsRes.count ?? 0,
        completedPurchases: ordersRes.count ?? 0,
      });
    } catch {
      // non-critical
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchStats();
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const openEdit = (p: Product) => { setEditTarget(p); setModal("edit"); };

  const handleSave = async (data: Omit<Product, "id">, id?: string) => {
    if (id) await updateProduct(id, data);
    else await addProduct(data);
  };

  const tabs = [
    { id: "overview",    label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "products",    label: "المنتجات",    icon: Package },
    { id: "categories",  label: "الأقسام",     icon: Tag },
    { id: "reviews",     label: "التقييمات",   icon: MessageSquare },
    { id: "affiliates",  label: "المسوقين",    icon: Users },
  ] as const;

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-cairo font-bold text-2xl md:text-3xl text-foreground mb-1">لوحة التحكم</h1>
          <p className="font-tajawal text-foreground/40 text-sm">إدارة متجر Magic Mirror</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-cairo text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground border border-foreground/10"
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-foreground/[0.08] rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <p className="font-tajawal text-foreground/50 text-sm mb-2">زوار الموقع</p>
                  {statsLoading ? (
                    <Loader2 className="w-7 h-7 text-amber-500 animate-spin mt-1" />
                  ) : (
                    <p className="font-cairo font-bold text-4xl text-foreground">
                      {siteStats != null ? siteStats.visits.toLocaleString("ar-EG") : "—"}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-amber-500" />
                  </div>
                  <button
                    onClick={fetchStats}
                    disabled={statsLoading}
                    className="flex items-center gap-1 text-foreground/30 hover:text-foreground/60 transition-colors disabled:opacity-40"
                    title="تحديث"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-foreground/[0.08] rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <p className="font-tajawal text-foreground/50 text-sm mb-2">طلبات مكتملة</p>
                  {statsLoading ? (
                    <Loader2 className="w-7 h-7 text-green-500 animate-spin mt-1" />
                  ) : (
                    <p className="font-cairo font-bold text-4xl text-foreground">
                      {siteStats != null ? siteStats.completedPurchases.toLocaleString("ar-EG") : "—"}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-green-500" />
                  </div>
                  <button
                    onClick={fetchStats}
                    disabled={statsLoading}
                    className="flex items-center gap-1 text-foreground/30 hover:text-foreground/60 transition-colors disabled:opacity-40"
                    title="تحديث"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
            {[
              { label: "إجمالي المنتجات", value: products.length, color: "from-white/10" },
              { label: "الأقسام", value: categories.length, color: "from-white/8" },
              { label: "المنتجات المخفضة", value: products.filter(p => p.oldPrice).length, color: "from-white/6" },
            ].map(card => (
              <div key={card.label} className={`bg-gradient-to-br ${card.color} to-transparent border border-foreground/[0.08] rounded-2xl p-6`}>
                <p className="font-tajawal text-foreground/50 text-sm mb-2">{card.label}</p>
                <p className="font-cairo font-bold text-4xl text-foreground">{card.value}</p>
              </div>
            ))}
            <div className="sm:col-span-3 bg-foreground/[0.03] border border-foreground/[0.08] rounded-2xl p-6">
              <p className="font-cairo font-semibold text-foreground mb-3">إجراءات سريعة</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { setModal("add"); setTab("products"); }}
                  className="flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground font-cairo text-sm font-semibold rounded-xl hover:bg-foreground/90 transition-colors">
                  <Plus className="w-4 h-4" />إضافة منتج
                </button>
                <button onClick={() => setTab("categories")}
                  className="flex items-center gap-2 h-10 px-5 bg-foreground/5 border border-foreground/10 text-foreground/70 font-cairo text-sm rounded-xl hover:bg-foreground/10 transition-colors">
                  <Tag className="w-4 h-4" />إدارة الأقسام
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Products Tab ── */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="font-cairo font-semibold text-foreground">{products.length} منتج</p>
              <button onClick={() => { setEditTarget(null); setModal("add"); }}
                className="flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground font-cairo text-sm font-semibold rounded-xl hover:bg-foreground/90 transition-colors">
                <Plus className="w-4 h-4" />إضافة منتج
              </button>
            </div>

            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-foreground/[0.04] border border-foreground/[0.08] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-foreground/5 shrink-0" onError={e => { (e.target as HTMLImageElement).src = "/images/product-1.svg"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-cairo font-semibold text-foreground text-sm truncate">{p.name}</p>
                      <p className="font-tajawal text-foreground/40 text-xs">{p.code} · {p.category}</p>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="font-cairo font-bold text-foreground text-sm">{p.price.toLocaleString()} ج.م</p>
                      {p.oldPrice && <p className="font-tajawal text-foreground/30 text-xs line-through">{p.oldPrice.toLocaleString()}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => void deleteProduct(p.id)} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setExpandedProduct(expandedProduct === p.id ? null : p.id)}
                        className="w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors">
                        {expandedProduct === p.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  {expandedProduct === p.id && (
                    <div className="px-4 pb-4 border-t border-foreground/[0.06] pt-3">
                      <p className="font-tajawal text-foreground/50 text-sm leading-relaxed">{p.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {p.sizes.map(s => <span key={s} className="px-2 py-0.5 bg-foreground/5 border border-foreground/10 rounded-md text-foreground/50 text-xs font-tajawal">{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews Tab ── */}
        {tab === "reviews" && (() => {
          const SITE_ID = "store";
          const siteReviews = [...reviews].filter(r => r.productId === SITE_ID).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const productReviews = [...reviews].filter(r => r.productId !== SITE_ID).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          const ReviewCard = ({ review, label }: { review: typeof reviews[0]; label?: string }) => (
            <div className="bg-foreground/[0.04] border border-foreground/[0.08] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-foreground/10 overflow-hidden flex items-center justify-center shrink-0">
                    {review.userAvatar
                      ? <img src={review.userAvatar} alt="" className="w-full h-full object-cover" />
                      : <User className="w-4 h-4 text-foreground/40" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-cairo font-semibold text-foreground text-sm truncate">{review.userName}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-foreground/20"}`} />
                        ))}
                      </div>
                      <span className="text-foreground/30 text-xs font-tajawal">
                        {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => void deleteReview(review.id)}
                  className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors shrink-0"
                  title="حذف التقييم"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="font-tajawal text-foreground/60 text-sm leading-relaxed mt-3">{review.comment}</p>
              {label && <p className="font-tajawal text-foreground/20 text-xs mt-2">{label}</p>}
            </div>
          );

          return (
            <div className="space-y-8">
              {/* Site reviews */}
              <div>
                <p className="font-cairo font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  تقييمات الموقع
                  <span className="font-tajawal text-foreground/40 text-xs font-normal">({siteReviews.length})</span>
                </p>
                {siteReviews.length === 0 ? (
                  <div className="text-center py-8 text-foreground/30 font-tajawal text-sm bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl">
                    لا توجد تقييمات للموقع بعد
                  </div>
                ) : (
                  <div className="space-y-3">
                    {siteReviews.map(r => <ReviewCard key={r.id} review={r} />)}
                  </div>
                )}
              </div>

              {/* Product reviews */}
              <div>
                <p className="font-cairo font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-foreground/50" />
                  تقييمات المنتجات
                  <span className="font-tajawal text-foreground/40 text-xs font-normal">({productReviews.length})</span>
                </p>
                {productReviews.length === 0 ? (
                  <div className="text-center py-8 text-foreground/30 font-tajawal text-sm bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl">
                    لا توجد تقييمات للمنتجات بعد
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productReviews.map(r => (
                      <ReviewCard
                        key={r.id}
                        review={r}
                        label={`المنتج: ${products.find(p => p.id === r.productId)?.name ?? r.productId}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── Categories Tab ── */}
        {tab === "categories" && (
          <div>
            <div className="flex gap-3 mb-5">
              <input
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newCat.trim()) { void addCategory(newCat.trim()); setNewCat(""); } }}
                placeholder="اسم القسم الجديد"
                className="flex-1 h-10 bg-foreground/5 border border-foreground/10 rounded-xl px-4 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
              />
              <button
                onClick={() => { if (newCat.trim()) { void addCategory(newCat.trim()); setNewCat(""); } }}
                className="h-10 px-5 bg-primary text-primary-foreground font-cairo text-sm font-semibold rounded-xl hover:bg-foreground/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />إضافة
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between bg-foreground/[0.04] border border-foreground/[0.08] rounded-xl px-4 py-3">
                  <div>
                    <p className="font-cairo font-medium text-foreground">{cat}</p>
                    <p className="font-tajawal text-foreground/40 text-xs">
                      {products.filter(p => p.category === cat).length} منتج
                    </p>
                  </div>
                  <button onClick={() => void deleteCategory(cat)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ── Affiliates Tab ── */}
        {tab === "affiliates" && <AffiliateTab />}

      </div>

      {/* Modal */}
      {modal && (
        <ProductModal
          initial={modal === "edit" && editTarget ? editTarget : undefined}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setModal(null); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
