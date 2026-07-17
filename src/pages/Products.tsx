import { useState, useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useStore } from "@/contexts/StoreContext";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { Search, SlidersHorizontal } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Products() {
  const { products, categories: storeCategories } = useStore();
  const { adjustPrice } = useAffiliate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const sectionRef = useRef<HTMLDivElement>(null);

  const categories = ["الكل", ...storeCategories];

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.includes(search) || p.code.includes(search) || p.nameEn.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "الكل" || p.category === category;
    return matchSearch && matchCat;
  });

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll(".product-card"), {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
    });
  }, { scope: sectionRef, dependencies: [filtered.length] });

  return (
    <div className="relative z-10 pt-24 pb-16 min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="section-label justify-center mb-4">المتجر</div>
          <h1 className="font-cairo font-bold text-3xl md:text-4xl text-foreground mb-3">
            جميع المنتجات
          </h1>
          <p className="font-tajawal text-foreground/50 max-w-lg mx-auto">
            {filtered.length} منتج متاح
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pr-10 pl-4 rounded-pill bg-foreground/[0.05] border border-foreground/[0.08] text-foreground font-tajawal text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/30 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <SlidersHorizontal className="w-4 h-4 text-foreground/30 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-pill text-sm font-tajawal font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground/[0.05] text-foreground/60 hover:bg-foreground/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div ref={sectionRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="product-card card-surface group overflow-hidden block"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors duration-300 flex items-end">
                  <div className="p-4 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-foreground font-tajawal text-sm bg-foreground/20 backdrop-blur-sm px-3 py-1 rounded-pill">
                      عرض التفاصيل
                    </span>
                  </div>
                </div>
                {product.oldPrice && (
                  <div className="absolute top-3 left-3 bg-red-500/90 text-foreground text-xs font-cairo font-bold px-2 py-1 rounded-lg">
                    خصم
                  </div>
                )}
              </div>
              <div className="p-4">
                <span className="text-foreground/30 text-xs font-tajawal">{product.code}</span>
                <h3 className="font-cairo font-semibold text-foreground mt-1 mb-2 group-hover:text-foreground/90 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-cairo font-bold text-foreground">
                    {adjustPrice(product.price).toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-tajawal text-foreground/50 text-lg">لا توجد منتجات مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
}
