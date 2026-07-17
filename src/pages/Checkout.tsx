import { useState, useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCart } from "@/contexts/CartContext";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { governorates } from "@/data/products";
import { supabase } from "@/lib/supabase";
import { CreditCard, Check, ArrowRight, Phone, User, MapPin, FileText } from "lucide-react";

export default function Checkout() {
  const { items, totalPrice, originalTotalPrice, commission, downPayment, remainingAmount, clearCart } = useCart();
  const { affiliate } = useAffiliate();
  const sectionRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    governorate: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll(".checkout-anim"), {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.out",
    });
  }, { scope: sectionRef });

  if (items.length === 0) {
    return (
      <div className="relative z-10 pt-32 pb-16 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="font-cairo font-bold text-2xl text-foreground mb-4">
            لا يوجد منتجات في السلة
          </h1>
          <Link to="/products" className="btn-primary">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "الاسم مطلوب";
    if (!form.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    else if (!/^01[0-9]{9}$/.test(form.phone.trim()))
      newErrors.phone = "رقم هاتف غير صحيح";
    if (!form.governorate) newErrors.governorate = "المحافظة مطلوبة";
    if (!form.address.trim()) newErrors.address = "العنوان مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Build WhatsApp message
    let message = "*طلب جديد من Magic Mirror*\n\n";
    message += "*المنتجات:*\n";
    items.forEach((item, i) => {
      const unitPrice = item.product.price + commission;
      message += `${i + 1}. ${item.product.name}\n`;
      message += `   الكود: ${item.product.code}\n`;
      message += `   المقاس: ${item.selectedSize}\n`;
      message += `   اللون: ${item.selectedLightColor}\n`;
      message += `   الكمية: ${item.quantity}\n`;
      message += `   السعر: ${(unitPrice * item.quantity).toLocaleString()} ج.م\n\n`;
    });
    message += `*الإجمالي:* ${totalPrice.toLocaleString()} ج.م\n`;
    message += `*المقدم (20%):* ${downPayment.toLocaleString()} ج.م\n`;
    message += `*المتبقي عند الاستلام:* ${remainingAmount.toLocaleString()} ج.م\n\n`;

    message += "*بيانات العميل:*\n";
    message += `الاسم: ${form.fullName}\n`;
    message += `الهاتف: ${form.phone}\n`;
    message += `المحافظة: ${form.governorate}\n`;
    message += `العنوان: ${form.address}\n`;
    if (form.notes) message += `ملاحظات: ${form.notes}\n`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/201069577622?text=${encoded}`, "_blank");

    // تسجيل الطلب في قاعدة البيانات (non-blocking)
    const itemsCount = items.reduce((s, i) => s + i.quantity, 0);
    const affiliateCommission = commission > 0 ? commission * itemsCount : null;
    supabase.from("orders").insert({
      customer_name: form.fullName,
      customer_phone: form.phone,
      governorate: form.governorate,
      address: form.address,
      total_amount: totalPrice,
      items_count: itemsCount,
      // بيانات المسوق
      ...(affiliate && {
        affiliate_id: affiliate.id,
        affiliate_name: affiliate.name,
        affiliate_code: affiliate.affiliate_code,
        affiliate_commission: commission,
        affiliate_total_commission: affiliateCommission,
        original_total: originalTotalPrice,
        sale_total: totalPrice,
      }),
    }).then(() => {}).catch(() => {});

    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <div className="relative z-10 pt-32 pb-16 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="font-cairo font-bold text-2xl text-foreground mb-3">
            تم إرسال طلبك بنجاح!
          </h1>
          <p className="font-tajawal text-foreground/60 text-base mb-8">
            سيتواصل معك فريق Magic Mirror قريباً عبر واتساب لتأكيد الطلب وترتيب التوصيل.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-12 px-8 bg-primary text-primary-foreground font-cairo font-semibold text-sm rounded-xl hover:bg-foreground/90 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="relative z-10 pt-28 pb-20 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <h1 className="checkout-anim font-cairo font-bold text-2xl md:text-3xl text-foreground mb-8">
          إتمام الطلب
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            {/* Full Name */}
            <div className="checkout-anim">
              <label className="flex items-center gap-2 font-tajawal text-foreground/60 text-sm mb-2">
                <User className="w-4 h-4" /> الاسم بالكامل
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className={`w-full h-12 bg-foreground/5 border rounded-xl px-4 text-foreground font-tajawal text-sm outline-none focus:border-foreground/40 transition-colors ${errors.fullName ? "border-red-500/50" : "border-foreground/10"}`}
                placeholder="محمد أحمد"
              />
              {errors.fullName && <p className="font-tajawal text-red-400 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Phone */}
            <div className="checkout-anim">
              <label className="flex items-center gap-2 font-tajawal text-foreground/60 text-sm mb-2">
                <Phone className="w-4 h-4" /> رقم الهاتف
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className={`w-full h-12 bg-foreground/5 border rounded-xl px-4 text-foreground font-tajawal text-sm outline-none focus:border-foreground/40 transition-colors ${errors.phone ? "border-red-500/50" : "border-foreground/10"}`}
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
              {errors.phone && <p className="font-tajawal text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Governorate */}
            <div className="checkout-anim">
              <label className="flex items-center gap-2 font-tajawal text-foreground/60 text-sm mb-2">
                <MapPin className="w-4 h-4" /> المحافظة
              </label>
              <select
                value={form.governorate}
                onChange={e => setForm(f => ({ ...f, governorate: e.target.value }))}
                className={`w-full h-12 bg-foreground/5 border rounded-xl px-4 text-foreground font-tajawal text-sm outline-none focus:border-foreground/40 transition-colors ${errors.governorate ? "border-red-500/50" : "border-foreground/10"}`}
              >
                <option value="">اختر المحافظة</option>
                {governorates.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.governorate && <p className="font-tajawal text-red-400 text-xs mt-1">{errors.governorate}</p>}
            </div>

            {/* Address */}
            <div className="checkout-anim">
              <label className="flex items-center gap-2 font-tajawal text-foreground/60 text-sm mb-2">
                <MapPin className="w-4 h-4" /> العنوان بالتفصيل
              </label>
              <textarea
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                rows={3}
                className={`w-full bg-foreground/5 border rounded-xl px-4 py-3 text-foreground font-tajawal text-sm outline-none focus:border-foreground/40 transition-colors resize-none ${errors.address ? "border-red-500/50" : "border-foreground/10"}`}
                placeholder="الشارع، الحي، رقم المبنى..."
              />
              {errors.address && <p className="font-tajawal text-red-400 text-xs mt-1">{errors.address}</p>}
            </div>

            {/* Notes */}
            <div className="checkout-anim">
              <label className="flex items-center gap-2 font-tajawal text-foreground/60 text-sm mb-2">
                <FileText className="w-4 h-4" /> ملاحظات (اختياري)
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground font-tajawal text-sm outline-none focus:border-foreground/40 transition-colors resize-none"
                placeholder="أي تفاصيل إضافية..."
              />
            </div>

            <button
              type="submit"
              className="checkout-anim w-full h-14 bg-primary text-primary-foreground font-cairo font-bold text-base rounded-xl flex items-center justify-center gap-3 hover:bg-foreground/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
            >
              <CreditCard className="w-5 h-5" />
              إرسال الطلب عبر واتساب
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="checkout-anim bg-foreground/[0.04] border border-foreground/[0.08] rounded-2xl p-6 sticky top-24">
              <h2 className="font-cairo font-bold text-lg text-foreground mb-5">ملخص الطلب</h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.selectedSize}-${item.selectedLightColor}`} className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-foreground/5 overflow-hidden shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-tajawal text-foreground text-sm font-medium line-clamp-1">{item.product.name}</p>
                      <p className="font-tajawal text-foreground/50 text-xs mt-0.5">
                        {item.selectedSize} · {item.selectedLightColor} · ×{item.quantity}
                      </p>
                    </div>
                    <p className="font-cairo font-semibold text-foreground text-sm shrink-0">
                      {(item.product.price * item.quantity).toLocaleString()} ج
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-foreground/10 pt-4 space-y-2">
                {affiliate && (
                  <div className="flex justify-between text-xs font-tajawal text-foreground/40 pb-1">
                    <span>سعر موقوت خاص</span>
                    <span className="text-green-400">✓ مفعّل</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-tajawal text-foreground/60 text-sm">الإجمالي</span>
                  <span className="font-cairo font-bold text-foreground">{totalPrice.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-tajawal text-foreground/60 text-sm">المقدم (20%)</span>
                  <span className="font-cairo font-semibold text-amber-400">{downPayment.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-tajawal text-foreground/60 text-sm">عند الاستلام</span>
                  <span className="font-cairo font-semibold text-foreground/80">{remainingAmount.toLocaleString()} ج.م</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
