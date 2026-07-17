import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import LogoAnimated from "@/components/LogoAnimated";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("كلمتا المرور غير متطابقتان"); return; }
    if (form.password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block font-tajawal text-foreground/60 text-sm mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-xl px-4 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
        placeholder={placeholder}
        required={key !== "phone"}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-16 pb-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <LogoAnimated size="md" />
        </div>

        <div className="bg-foreground/[0.04] border border-foreground/[0.08] rounded-2xl p-8">
          <h1 className="font-cairo font-bold text-2xl text-foreground text-center mb-2">
            إنشاء حساب جديد
          </h1>
          <p className="font-tajawal text-foreground/40 text-center text-sm mb-8">
            انضم إلى Magic Mirror واستمتع بتجربة تسوق مميزة
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-tajawal text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {field("name", "الاسم الكامل", "text", "محمد أحمد")}
            {field("email", "البريد الإلكتروني", "email", "example@email.com")}
            {field("phone", "رقم الهاتف (اختياري)", "tel", "01xxxxxxxxx")}

            <div>
              <label className="block font-tajawal text-foreground/60 text-sm mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-xl px-4 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-tajawal text-foreground/60 text-sm mb-1.5">تأكيد كلمة المرور</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-xl px-4 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground font-cairo font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-foreground/90 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
              ) : (
                <><UserPlus className="w-4 h-4" />إنشاء الحساب</>
              )}
            </button>
          </form>

          <p className="font-tajawal text-foreground/40 text-center text-sm mt-6">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-foreground hover:underline">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
