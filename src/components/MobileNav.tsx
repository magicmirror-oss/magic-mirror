import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Home, ShoppingBag, Sparkles, MessageCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import ThemeToggle from "@/components/ThemeToggle";
import ContactSheet from "@/components/ContactSheet";

export default function MobileNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const [contactOpen, setContactOpen] = useState(false);

  const isActive = (href: string) => href === location.pathname;

  return (
    <>
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 right-0 left-0 z-50 bg-background/90 backdrop-blur-xl border-t border-foreground/[0.08] md:hidden">
        <div className="flex items-center justify-around h-16">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
              isActive("/") ? "text-foreground" : "text-foreground/40"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-tajawal">الرئيسية</span>
          </Link>

          <Link
            to="/products"
            className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
              isActive("/products") ? "text-foreground" : "text-foreground/40"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-tajawal">المنتجات</span>
          </Link>

          <Link
            to="/features"
            className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
              isActive("/features") ? "text-foreground" : "text-foreground/40"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-tajawal">المميزات</span>
          </Link>

          <button
            onClick={() => setContactOpen(true)}
            className="flex flex-col items-center gap-1 py-2 px-3 transition-colors text-foreground/40 hover:text-foreground"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-tajawal">تواصل</span>
          </button>

          <ThemeToggle />
        </div>
      </nav>

      {/* Cart FAB for mobile */}
      <Link
        to="/cart"
        className="fixed bottom-20 right-4 z-50 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg md:hidden"
      >
        <ShoppingCart className="w-5 h-5 text-primary-foreground" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Link>

      <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
