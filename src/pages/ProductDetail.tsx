import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useStore } from "@/contexts/StoreContext";
import { useCart } from "@/contexts/CartContext";
import { useAffiliate } from "@/contexts/AffiliateContext";
import ReviewsSection from "@/components/ReviewsSection";
import {
  Check,
  ShoppingCart,
  ChevronLeft,
  Shield,
  Truck,
  RotateCcw,
  Award,
  Star,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { products } = useStore();
  const { adjustPrice } = useAffiliate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "install" | "reviews">("description");

  const product = products.find((p) => p.id === id);

  // Build a deduplicated gallery: main image first, then any extra images
  const gallery = product
    ? [
        ...(product.image ? [product.image] : []),
        ...product.images.filter((img) => img && img !== product.image),
      ].filter(Boolean)
    : [];

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.lightColors[0]?.name ?? "");
      setSelectedImage(0);
    }
  }, [product]);

  useGSAP(() => {
    if (!sectionRef.current || !product) return;
    gsap.from(sectionRef.current.querySelectorAll(".detail-anim"), {
      x: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
    });
  }, { scope: sectionRef, dependencies: [id] });

  if (!product) {
    return (
      <div className="relative z-10 pt-32 pb-16 min-h-screen bg-background text-center">
        <h1 className="font-cairo font-bold text-2xl text-foreground mb-4">
          المنتج غير موجود
        </h1>
        <Link to="/products" className="btn-primary">
          العودة للمنتجات
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const finalSize =
      selectedSize === "مقاس خاص"
        ? customSizeInput.trim()
          ? `مقاس خاص: ${customSizeInput.trim()}`
          : "مقاس خاص"
        : selectedSize;
    addToCart(product, finalSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);

  const tabs = [
    { key: "description" as const, label: "الوصف" },
    { key: "specs" as const, label: "المواصفات" },
    { key: "install" as const, label: "التركيب" },
    { key: "reviews" as const, label: "التقييمات" },
  ];

  return (
    <div ref={sectionRef} className="relative z-10 pt-24 pb-16 min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Breadcrumb */}
        <div className="detail-anim flex items-center gap-2 text-sm font-tajawal text-foreground/40 mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">الرئيسية</Link>
          <ChevronLeft className="w-3 h-3" />
          <Link to="/products" className="hover:text-foreground transition-colors">المنتجات</Link>
          <ChevronLeft className="w-3 h-3" />
          <span className="text-foreground/60">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div className="detail-anim space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-card border border-foreground/[0.08]">
              <img
                src={gallery[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? "border-foreground" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="detail-anim space-y-6">
            <div>
              <span className="text-foreground/30 text-sm font-tajawal">{product.code}</span>
              <h1 className="font-cairo font-bold text-3xl md:text-4xl text-foreground mt-1 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-cairo font-bold text-2xl text-foreground">
                  {adjustPrice(product.price).toLocaleString()} ج.م
                </span>
              </div>
              <p className="font-tajawal text-foreground/60 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features badges */}
            <div className="flex flex-wrap gap-2">
              {product.antiFog && (
                <span className="px-3 py-1 rounded-pill bg-foreground/[0.05] text-foreground/60 text-xs font-tajawal border border-foreground/[0.08]">
                  مقاومة للبخار
                </span>
              )}
              {product.touchControl && (
                <span className="px-3 py-1 rounded-pill bg-foreground/[0.05] text-foreground/60 text-xs font-tajawal border border-foreground/[0.08]">
                  تحكم باللمس
                </span>
              )}
              <span className="px-3 py-1 rounded-pill bg-foreground/[0.05] text-foreground/60 text-xs font-tajawal border border-foreground/[0.08]">
                LED موفر
              </span>
            </div>

            {/* Size Selector */}
            <div>
              <label className="block font-cairo font-semibold text-foreground mb-2">
                المقاس
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      if (size !== "مقاس خاص") setCustomSizeInput("");
                    }}
                    className={`px-4 py-2 rounded-pill text-sm font-tajawal font-medium transition-all ${
                      selectedSize === size
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/[0.05] text-foreground/60 hover:bg-foreground/10 border border-foreground/[0.08]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Custom size input — shown only when "مقاس خاص" is selected */}
              {selectedSize === "مقاس خاص" && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={e => setCustomSizeInput(e.target.value)}
                    placeholder="مثال: 75x110 سم"
                    className="w-full h-11 bg-foreground/[0.05] border border-foreground/20 rounded-xl px-4 text-foreground font-tajawal text-sm placeholder-foreground/30 outline-none focus:border-foreground/50 transition-colors"
                    autoFocus
                  />
                  <p className="mt-1.5 text-xs font-tajawal text-foreground/40">
                    اكتب المقاس المطلوب (العرض × الارتفاع)
                  </p>
                </div>
              )}
            </div>

            {/* Light Color Selector */}
            <div>
              <label className="block font-cairo font-semibold text-foreground mb-2">
                لون الإضاءة
              </label>
              <div className="flex gap-3">
                {product.lightColors.map((lc) => (
                  <button
                    key={lc.name}
                    onClick={() => setSelectedColor(lc.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-tajawal transition-all ${
                      selectedColor === lc.name
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/[0.05] text-foreground/60 hover:bg-foreground/10 border border-foreground/[0.08]"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-foreground/20"
                      style={{ backgroundColor: lc.color }}
                    />
                    {lc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-2">
              {product.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-foreground/60">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="font-tajawal text-sm">{f}</span>
                </div>
              ))}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full h-14 rounded-pill font-cairo font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                added
                  ? "bg-green-500 text-foreground"
                  : "bg-primary text-primary-foreground hover:shadow-glow-hero hover:scale-[1.01]"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  تم الإضافة للسلة
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  أضف إلى السلة
                </>
              )}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-foreground/[0.08]">
              <div className="flex items-center gap-2 text-foreground/40">
                <Truck className="w-4 h-4" />
                <span className="font-tajawal text-xs">شحن مجاني</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/40">
                <Shield className="w-4 h-4" />
                <span className="font-tajawal text-xs">ضمان 3 سنوات</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/40">
                <RotateCcw className="w-4 h-4" />
                <span className="font-tajawal text-xs">استبدال خلال 14 يوم</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/40">
                <Award className="w-4 h-4" />
                <span className="font-tajawal text-xs">جودة عالية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex gap-2 mb-6 border-b border-foreground/[0.08]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 font-cairo font-semibold text-sm transition-colors relative ${
                  activeTab === tab.key ? "text-foreground" : "text-foreground/40 hover:text-foreground/60"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-card border border-foreground/[0.08] rounded-2xl p-6">
            {activeTab === "description" && (
              <div className="space-y-4">
                <p className="font-tajawal text-foreground/60 leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-4">
                  <h4 className="font-cairo font-semibold text-foreground mb-2">مميزات الإضاءة LED</h4>
                  <p className="font-tajawal text-foreground/50 text-sm leading-relaxed">
                    {product.ledSpecs}
                  </p>
                </div>
                <div className="mt-4 flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${product.antiFog ? "bg-green-400" : "bg-red-400"}`} />
                    <span className="font-tajawal text-foreground/60 text-sm">
                      {product.antiFog ? "مانع بخار" : "بدون مانع بخار"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${product.touchControl ? "bg-green-400" : "bg-red-400"}`} />
                    <span className="font-tajawal text-foreground/60 text-sm">
                      {product.touchControl ? "زر لمس" : "بدون زر لمس"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="space-y-3">
                {product.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-foreground/[0.05] last:border-0"
                  >
                    <span className="font-tajawal text-foreground/50 text-sm">{spec.label}</span>
                    <span className="font-tajawal text-foreground font-medium text-sm">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "install" && (
              <div className="space-y-4">
                <p className="font-tajawal text-foreground/60 leading-relaxed">
                  يتم تركيب المرآة على الحائط باستخدام الأدوات المرفقة مع المنتج. يتضمن الطلب:
                </p>
                <ul className="space-y-2">
                  {[
                    "قواعد تثبيت معدنية",
                    "مسامير وكوابل التعليق",
                    "دليل التركيب بالعربية",
                    "فيديو توضيحي للتركيب",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-foreground/60">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="font-tajawal text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-tajawal text-foreground/40 text-sm mt-4">
                  يمكنك أيضاً طلب خدمة التركيب الاحترافية من فريقنا المتخصص.
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <ReviewsSection productId={product.id} />
            )}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="font-cairo font-bold text-2xl text-foreground mb-6">
            منتجات مشابهة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="card-surface group overflow-hidden block"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <span className="text-foreground/30 text-xs font-tajawal">{p.code}</span>
                  <h3 className="font-cairo font-semibold text-foreground mt-1 mb-2">{p.name}</h3>
                  <span className="font-cairo font-bold text-foreground">
                    {p.price.toLocaleString()} ج.م
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
