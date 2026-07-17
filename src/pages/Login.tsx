import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, LogIn } from "lucide-react";
import LogoAnimated from "@/components/LogoAnimated";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <LogoAnimated size="md" />
        </div>

        <div className="bg-foreground/[0.04] border border-foreground/[0.08] rounded-2xl p-8">
          <h1 className="font-cairo font-bold text-2xl text-foreground text-center mb-2">
            تسجيل الدخول
          </h1>
          <p className="font-tajawal text-foreground/40 text-center text-sm mb-8">
            أهلاً بعودتك — سجّل دخولك لمتابعة طلباتك
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-tajawal text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-tajawal text-foreground/60 text-sm mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-xl px-4 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-tajawal text-foreground/60 text-sm">
                  كلمة المرور
                </label>
                <Link
                  to="/forgot-password"
                  className="font-tajawal text-xs text-foreground/40 hover:text-foreground transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-xl px-4 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground font-cairo font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-foreground/90 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          <p className="font-tajawal text-foreground/40 text-center text-sm mt-6">
            ليس لديك حساب؟{" "}
            <Link to="/register" className="text-foreground hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
