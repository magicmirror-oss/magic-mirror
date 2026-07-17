import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, User, LogOut, Shield, Menu, X, Sparkles, ShoppingBag } from "lucide-react";
import LogoAnimated from "@/components/LogoAnimated";
import ThemeToggle from "@/components/ThemeToggle";
import ContactSheet from "@/components/ContactSheet";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const isActive = (href: string) => href === location.pathname;

  const menuLinks = [
    { href: "/products", label: "المنتجات", Icon: ShoppingBag },
    { href: "/features", label: "المميزات", Icon: Sparkles },
  ];

  return (
    <>
      <nav className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-foreground/[0.08]" : "bg-transparent"
      }`}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <LogoAnimated size="sm" />
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Cart */}
            <Link to="/cart"
              className="relative w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors">
              <ShoppingCart className="w-5 h-5 text-foreground/80" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Hamburger menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors"
                aria-label="القائمة"
              >
                {menuOpen
                  ? <X className="w-5 h-5 text-foreground" />
                  : <Menu className="w-5 h-5 text-foreground" />}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute left-0 top-[calc(100%+8px)] w-56 bg-card border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden">

                  {/* Nav links */}
                  <div className="p-2 space-y-0.5">
                    {menuLinks.map(({ href, label, Icon }) => (
                      <Link
                        key={href}
                        to={href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-tajawal text-sm transition-colors ${
                          isActive(href)
                            ? "bg-foreground/10 text-foreground"
                            : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                        {label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-tajawal text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <Shield className="w-4 h-4 shrink-0" />
                        لوحة التحكم
                      </Link>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="mx-3 border-t border-foreground/[0.07]" />

                  {/* Account section */}
                  <div className="p-2 space-y-0.5">
                    {isLoggedIn ? (
                      <>
                        <div className="flex items-center gap-3 px-3 py-2">
                          <div className="w-7 h-7 rounded-full bg-foreground/10 overflow-hidden flex items-center justify-center shrink-0">
                            {user?.avatar
                              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                              : <User className="w-3.5 h-3.5 text-foreground/50" />}
                          </div>
                          <span className="font-tajawal text-foreground/50 text-xs truncate">
                            {user?.name || user?.email}
                          </span>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-tajawal text-sm text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors"
                        >
                          <User className="w-4 h-4 shrink-0" />
                          حسابي
                        </Link>
                        <button
                          onClick={() => { logout(); setMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-tajawal text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          تسجيل الخروج
                        </button>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <Link
                          to="/login"
                          onClick={() => setMenuOpen(false)}
                          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground/70 font-tajawal text-sm hover:bg-foreground/10 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          دخول
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setMenuOpen(false)}
                          className="flex-1 flex items-center justify-center h-9 rounded-xl bg-foreground text-background font-cairo text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          تسجيل
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
