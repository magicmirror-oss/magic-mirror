import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import LogoAnimated from "@/components/LogoAnimated";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  /* Supabase يرسل الـ token في الـ URL hash — ننتظر تحميل الجلسة */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        /* استمع لأحداث AUTH — يُطلق PASSWORD_RECOVERY عند فتح الرابط */
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === "PASSWORD_RECOVERY" && session) {
              setSessionReady(true);
            }
          }
        );
        return () => subscription.unsubscribe();
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 6) {
      setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
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
          {done ? (
            /* ── تم التغيير ── */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <h1 className="font-cairo font-bold text-2xl text-foreground">
                تم تغيير كلمة المرور
              </h1>
              <p className="font-tajawal text-foreground/50 text-sm">
                سيتم توجيهك لصفحة الدخول تلقائياً…
              </p>
            </div>
          ) : !sessionReady ? (
            /* ── انتظار الجلسة ── */
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-foreground/30 animate-spin" />
                </div>
              </div>
              <p className="font-tajawal text-foreground/40 text-sm">
                جارٍ التحقق من الرابط…
              </p>
              <p className="font-tajawal text-foreground/25 text-xs">
                إذا لم يتحرك الشاشة، تأكد أنك فتحت الرابط من نفس المتصفح
              </p>
            </div>
          ) : (
            /* ── نموذج كلمة المرور الجديدة ── */
            <>
              <h1 className="font-cairo font-bold text-2xl text-foreground text-center mb-2">
                كلمة المرور الجديدة
              </h1>
              <p className="font-tajawal text-foreground/40 text-center text-sm mb-8">
                أدخل كلمة المرور الجديدة لحسابك
              </p>

              {error && (
                <div className="mb-5 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-400 font-tajawal text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* كلمة المرور */}
                <div>
                  <label className="block font-tajawal text-foreground/60 text-sm mb-1.5">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="6 أحرف على الأقل"
                      className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-xl px-4 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors"
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

                {/* تأكيد كلمة المرور */}
                <div>
                  <label className="block font-tajawal text-foreground/60 text-sm mb-1.5">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="أعد إدخال كلمة المرور"
                      className={`w-full h-12 bg-foreground/5 border rounded-xl px-4 text-foreground font-tajawal text-sm placeholder-white/20 outline-none focus:border-foreground/30 transition-colors ${
                        confirm && confirm !== password
                          ? "border-red-500/40"
                          : "border-foreground/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(s => !s)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="font-tajawal text-red-400 text-xs mt-1">
                      كلمتا المرور غير متطابقتين
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="w-full h-12 bg-primary text-primary-foreground font-cairo font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-foreground/90 transition-all disabled:opacity-50 mt-2"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الحفظ…</>
                    : "حفظ كلمة المرور الجديدة"
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
