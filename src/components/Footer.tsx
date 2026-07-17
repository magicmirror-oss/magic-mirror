import { Link } from "react-router";
import { Phone, Mail, MapPin } from "lucide-react";
import LogoAnimated from "@/components/LogoAnimated";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-foreground/[0.08] bg-background pb-20 md:pb-0">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="mb-4">
              <LogoAnimated size="md" />
            </div>
            <p className="text-foreground/50 font-tajawal text-sm leading-relaxed mb-5">
              نقدم لك أجود مرايات LED بإضاءة احترافية، تصميم عصري وتقنية متقدمة لمنزلك.
            </p>
            {/* Social */}
            <a
              href="https://www.facebook.com/share/1KWimTQzc8/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors group"
            >
              <span className="w-9 h-9 rounded-full bg-foreground/5 border border-foreground/10 group-hover:bg-[#1877F2]/20 group-hover:border-[#1877F2]/40 flex items-center justify-center transition-all">
                <FacebookIcon className="w-4 h-4" />
              </span>
              <span className="font-tajawal text-sm">تابعنا على فيسبوك</span>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-cairo font-semibold text-foreground mb-4">روابط سريعة</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-foreground/50 hover:text-foreground font-tajawal text-sm transition-colors">الرئيسية</Link>
              <Link to="/products" className="block text-foreground/50 hover:text-foreground font-tajawal text-sm transition-colors">المنتجات</Link>
              <Link to="/cart" className="block text-foreground/50 hover:text-foreground font-tajawal text-sm transition-colors">سلة المشتريات</Link>
              <Link to="/login" className="block text-foreground/50 hover:text-foreground font-tajawal text-sm transition-colors">تسجيل الدخول</Link>
              <Link to="/register" className="block text-foreground/50 hover:text-foreground font-tajawal text-sm transition-colors">إنشاء حساب</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-cairo font-semibold text-foreground mb-4">تواصل معنا</h4>
            <div className="space-y-3">
              <a href="https://wa.me/201069577622" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground/50 hover:text-foreground font-tajawal text-sm transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                01069577622
              </a>
              <div className="flex items-center gap-2 text-foreground/50 font-tajawal text-sm">
                <Mail className="w-4 h-4 shrink-0" />
                Magic.Mirror750@gmail.com
              </div>
              <div className="flex items-center gap-2 text-foreground/50 font-tajawal text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                مصر / محافظة دمياط / دمياط الجديدة
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-foreground/[0.08] text-center">
          <p className="text-foreground/30 font-tajawal text-xs">
            &copy; {new Date().getFullYear()} Magic Mirror. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
