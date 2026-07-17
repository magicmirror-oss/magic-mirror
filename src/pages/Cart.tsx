import { useRef } from "react";
import { Link, useNavigate } from "react-router";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCart } from "@/contexts/CartContext";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, downPayment, remainingAmount } = useCart();
  const { adjustPrice } = useAffiliate();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll(".cart-anim"), {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.out",
    });
  }, { scope: sectionRef, dependencies: [items.length] });

  if (items.length === 0) {
    return (
      <div className="relative z-10 pt-32 pb-16 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <ShoppingCart className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h1 className="font-cairo font-bold text-2xl text-foreground mb-2">
            سلة المشتريات فارغة
          </h1>
          <p className="font-tajawal text-foreground/50 mb-6">
            ابدأ تسوقك الآن واكتشف مجموعتنا
          </p>
          <Link to="/products" className="btn-primary">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="relative z-10 pt-24 pb-16 min-h-screen bg-background">
      <div className="max-w-[900px] mx-auto px-6">
        <div className="text-center mb-10">
          <div className="section-label justify-center mb-4">السلة</div>
          <h1 className="font-cairo font-bold text-3xl md:text-4xl text-foreground mb-2">
            سلة المشتريات
          </h1>
          <p className="font-tajawal text-foreground/50">
            {totalItems} منتج في السلة
          </p>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="cart-anim bg-card border border-foreground/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row gap-4"
            >
              {/* Image */}
              <Link
                to={`/product/${item.product.id}`}
                className="w-full sm:w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.product.id}`}
                  className="font-cairo font-semibold text-foreground hover:text-foreground/80 transition-colors block truncate"
                >
                  {item.product.name}
                </Link>
                <span className="text-foreground/30 text-xs font-tajawal">{item.product.code}</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs font-tajawal text-foreground/50">
                  <span>المقاس: {item.selectedSize}</span>
                  <span>اللون: {item.selectedLightColor}</span>
                </div>
                <div className="font-cairo font-bold text-foreground mt-2">
                  {(adjustPrice(item.product.price) * item.quantity).toLocaleString()} ج.م
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="w-8 h-8 rounded-full bg-foreground/[0.05] hover:bg-red-500/20 flex items-center justify-center transition-colors"
                  aria-label="حذف"
                >
                  <Trash2 className="w-4 h-4 text-foreground/40 hover:text-red-400" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-foreground/[0.05] hover:bg-foreground/10 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4 text-foreground/60" />
                  </button>
                  <span className="w-8 text-center font-cairo font-semibold text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-foreground/[0.05] hover:bg-foreground/10 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4 text-foreground/60" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-anim bg-card border border-foreground/[0.08] rounded-2xl p-6 space-y-4">
          <h3 className="font-cairo font-semibold text-foreground text-lg">ملخص الطلب</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between font-tajawal">
              <span className="text-foreground/50">المجموع الفرعي</span>
              <span className="text-foreground">{totalPrice.toLocaleString()} ج.م</span>
            </div>
            <div className="flex items-center justify-between font-tajawal">
              <span className="text-foreground/50">الشحن</span>
              <span className="text-green-400">مجاني</span>
            </div>
            <div className="flex items-center justify-between font-tajawal pt-2 border-t border-foreground/[0.08]">
              <span className="text-foreground/50">مبلغ المقدم (20%)</span>
              <span className="text-foreground font-cairo font-bold">{downPayment.toLocaleString()} ج.م</span>
            </div>
            <div className="flex items-center justify-between font-tajawal">
              <span className="text-foreground/50">المبلغ المتبقي عند الاستلام</span>
              <span className="text-foreground font-cairo font-bold">{remainingAmount.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div className="pt-4 border-t border-foreground/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-cairo font-bold text-foreground text-xl">الإجمالي</span>
              <span className="font-cairo font-black text-foreground text-2xl">
                {totalPrice.toLocaleString()} ج.م
              </span>
            </div>

            <p className="text-xs font-tajawal text-foreground/40 mb-4 text-center">
              الدفع يكون بمبلغ مقدم، والباقي عند الاستلام
            </p>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full h-14 rounded-pill bg-primary text-primary-foreground font-cairo font-semibold text-base transition-all duration-300 hover:shadow-glow-hero hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              تأكيد الطلب
              <ArrowRight className="w-5 h-5" />
            </button>

            <Link
              to="/products"
              className="block text-center mt-3 font-tajawal text-foreground/50 hover:text-foreground text-sm transition-colors"
            >
              مواصلة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
