import { useEffect } from "react";
import { Routes, Route } from "react-router";
import { ThemeProvider } from "next-themes";
import { supabase } from "@/lib/supabase";
import { AffiliateProvider } from "@/contexts/AffiliateContext";
import { AffiliateAuthProvider } from "@/contexts/AffiliateAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
import LightCursor from "@/components/LightCursor";
import ScrollToTop from "@/components/ScrollToTop";
import RequireAuth from "@/components/RequireAuth";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Features from "@/pages/Features";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AffiliateLogin from "@/pages/AffiliateLogin";
import AffiliateDashboard from "@/pages/AffiliateDashboard";

/** تسجيل الزيارة مرة واحدة فقط لكل جلسة */
function recordSessionVisit() {
  const KEY = "mm_session_recorded";
  if (sessionStorage.getItem(KEY)) return;
  sessionStorage.setItem(KEY, "1");

  // session_id فريد لكل جلسة
  const sessionId =
    sessionStorage.getItem("mm_session_id") ??
    (() => {
      const id = crypto.randomUUID();
      sessionStorage.setItem("mm_session_id", id);
      return id;
    })();

  supabase
    .from("site_visits")
    .insert({ session_id: sessionId })
    .then(() => {})
    .catch(() => {});
}

function App() {
  useEffect(() => {
    recordSessionVisit();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
      <AffiliateAuthProvider>
      <AuthProvider>
        <StoreProvider>
          <AffiliateProvider>
          <CartProvider>
            <ReviewsProvider>
              <LightCursor />
              <div className="relative min-h-screen bg-background" dir="rtl">
                <ScrollToTop />
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/"            element={<Home />} />
                    <Route path="/features"    element={<Features />} />
                    <Route path="/products"    element={<RequireAuth><Products /></RequireAuth>} />
                    <Route path="/product/:id" element={<RequireAuth><ProductDetail /></RequireAuth>} />
                    <Route path="/cart"        element={<Cart />} />
                    <Route path="/checkout"    element={<Checkout />} />
                    <Route path="/login"       element={<Login />} />
                    <Route path="/register"    element={<Register />} />
                    <Route path="/admin"            element={<Admin />} />
                    <Route path="/profile"         element={<Profile />} />
                    <Route path="/forgot-password"       element={<ForgotPassword />} />
                    <Route path="/reset-password"        element={<ResetPassword />} />
                    <Route path="/affiliate-login"       element={<AffiliateLogin />} />
                    <Route path="/affiliate-dashboard"   element={<AffiliateDashboard />} />
                  </Routes>
                </main>
                <Footer />
                <MobileNav />
              </div>
            </ReviewsProvider>
          </CartProvider>
          </AffiliateProvider>
        </StoreProvider>
      </AuthProvider>
      </AffiliateAuthProvider>
    </ThemeProvider>
  );
}

export default App;
