import { useState } from "react";
import { Link } from "react-router";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import LogoAnimated from "@/components/LogoAnimated";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );
      if (err) throw err;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <LogoAnimated size="md" />
        </div>

        <div className="bg-foreground/[0.04] border border-foreground/[0.08] rounded-2xl p-8">
          {sent ? (
            /* ── تم الإرسال ── */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <h1 className="font-cairo font-bold text-2xl text-foreground">
                تحقق من بريدك
              </h1>
              <p className="font-tajawal text-foreground/50 text-sm leading-relaxed">
                أرسلنا رابط إعادة تعيين كلمة المرور إلى
                <br />
                <span className="text-foreground/80 font-medium">{email}</span>
              </p>
              <p className="font-tajawal text-foreground/30 text-xs">
                إذا لم يصل الإيميل، تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 mt-4 font-tajawal text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            /* ── النموذج ── */
            <>
              <h1 className="font-cairo font-bold text-2xl text-foreground text-center mb-2">
                نسيت كلمة المرور؟
              </h1>
              <p className="font-tajawal text-foreground/40 text-center text-sm mb-8">
                أدخل بريدك الإلكتروني وسنرسل لك رابط الاسترجاع
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
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-xl px-4 pr-11 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
                    />
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-12 bg-primary text-primary-foreground font-cairo font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-foreground/90 transition-all disabled:opacity-50 mt-2"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الإرسال…</>
                    : "إرسال رابط الاسترجاع"
                  }
                </button>
              </form>

              <p className="font-tajawal text-foreground/40 text-center text-sm mt-6">
                تذكّرت كلمة المرور؟{" "}
                <Link to="/login" className="text-foreground hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
