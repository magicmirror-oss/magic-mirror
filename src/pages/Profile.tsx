import { useState, useRef } from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Camera, Check, User, Loader2, AlertCircle } from "lucide-react";
import LogoAnimated from "@/components/LogoAnimated";

/** تصغير الصورة وتحويلها إلى base64 داخل المتصفح — بدون أي رفع للـ storage */
function resizeToBase64(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذّر قراءة الملف"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("صيغة الصورة غير مدعومة"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { user, isLoggedIn, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = "";

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("حجم الصورة كبير — اختر صورة أقل من 5 ميجابايت");
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      // تصغير الصورة وتحويلها إلى base64 (بدون رفع للـ storage)
      const base64 = await resizeToBase64(file, 256);
      setAvatar(base64);

      // حفظ تلقائي مباشرة في جدول profiles
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: base64 })
        .eq("id", user.id);

      if (error) {
        setUploadError(`فشل حفظ الصورة: ${error.message}`);
        setAvatar(user.avatar ?? "");
        return;
      }

      // تحديث السياق المحلي
      await updateProfile({ avatar: base64 });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
      setAvatar(user.avatar ?? "");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() || user!.name, avatar });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // يمكن إضافة معالجة خطأ هنا
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-16 pb-24">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <LogoAnimated size="md" />
        </div>

        <div className="bg-foreground/[0.04] border border-foreground/[0.08] rounded-2xl p-8">
          <h1 className="font-cairo font-bold text-2xl text-foreground text-center mb-6">
            حسابي
          </h1>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full bg-foreground/10 border-2 border-foreground/20 overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="صورة الحساب"
                    className="w-full h-full object-cover"
                    onError={() => setAvatar("")}
                  />
                ) : (
                  <User className="w-10 h-10 text-foreground/30" />
                )}
              </div>

              <button
                onClick={() => !uploading && fileRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 left-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {uploading
                  ? <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" />
                  : <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                }
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {uploading && (
              <p className="font-tajawal text-xs text-foreground/50">
                جارٍ معالجة الصورة…
              </p>
            )}

            {uploadError && (
              <div className="flex items-start gap-2 mt-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 max-w-xs text-right">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="font-tajawal text-xs text-red-400">{uploadError}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block font-tajawal text-foreground/60 text-sm mb-1.5">
                الاسم
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-12 bg-foreground/5 border border-foreground/10 rounded-xl px-4 text-foreground font-tajawal text-sm outline-none focus:border-foreground/30 transition-colors"
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block font-tajawal text-foreground/60 text-sm mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="w-full h-12 bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 text-foreground/40 font-tajawal text-sm cursor-not-allowed"
              />
            </div>

            {/* Phone (readonly) */}
            {user?.phone && (
              <div>
                <label className="block font-tajawal text-foreground/60 text-sm mb-1.5">
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  value={user.phone}
                  readOnly
                  className="w-full h-12 bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 text-foreground/40 font-tajawal text-sm cursor-not-allowed"
                />
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className={`w-full h-12 rounded-xl font-cairo font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${
                saved
                  ? "bg-green-500 text-foreground"
                  : "bg-primary text-primary-foreground hover:bg-foreground/90"
              }`}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الحفظ…</>
              ) : saved ? (
                <><Check className="w-4 h-4" />تم الحفظ</>
              ) : (
                "حفظ التغييرات"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
