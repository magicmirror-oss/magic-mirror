import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAffiliateAuth } from "@/contexts/AffiliateAuthContext";
import { LogIn, User, Lock, Eye, EyeOff } from "lucide-react";

export default function AffiliateLogin() {
  const { affiliateLogin } = useAffiliateAuth();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelectorAll(".aff-anim"), {
      y: 24, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out",
    });
  }, { scope: sectionRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await affiliateLogin(username, password);
      navigate("/affiliate-dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={sectionRef} className="relative z-10 min-h-screen bg-background flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="aff-anim text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center mb-4">
            <LogIn className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-cairo font-bold text-2xl text-foreground">بوابة المسوقين</h1>
          <p className="font-tajawal text-foreground/40 text-sm mt-1">سجّل دخولك لمتابعة إحصائياتك</p>
        </div>

        {/* Card */}
        <div className="aff-anim bg-card border border-foreground/[0.08] rounded-2xl p-8 shadow-xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="flex items-center gap-2 font-tajawal text-foreground/60 text-sm mb-2">
                <User className="w-4 h-4" /> اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your_username"
                dir="ltr"
                className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-xl px-4 text-foreground font-tajawal text-sm placeholder-foreground/20 outline-none focus:border-foreground/30 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 font-tajawal text-foreground/60 text-sm mb-2">
                <Lock className="w-4 h-4" /> كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-xl px-4 pr-12 text-foreground font-tajawal text-sm placeholder-foreground/20 outline-none focus:border-foreground/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="font-tajawal text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground font-cairo font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-foreground/90 transition-all duration-300 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "جارِ التحقق..." : "دخول"}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="aff-anim text-center mt-6">
          <Link to="/" className="font-tajawal text-foreground/30 hover:text-foreground/60 text-sm transition-colors">
            ← العودة للموقع
          </Link>
        </div>
      </div>
    </div>
  );
}
