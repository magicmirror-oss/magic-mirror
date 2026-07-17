import { useState, useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Star, Trash2, User, Quote, AlertCircle, Loader2 } from "lucide-react";
import { useReviews } from "@/contexts/ReviewsContext";
import { useAuth } from "@/contexts/AuthContext";

gsap.registerPlugin(ScrollTrigger);

const STORE_ID = "store";

function StarPicker({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              s <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-foreground/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function HomeReviews() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { getProductReviews, addReview, deleteReview, hasReviewed } = useReviews();
  const { user, isAdmin, isLoggedIn } = useAuth();

  const reviews = getProductReviews(STORE_ID);
  const avgRaw =
    reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const avg = Math.round(avgRaw * 10) / 10;
  const alreadyReviewed = isLoggedIn && user ? hasReviewed(STORE_ID, user.id) : false;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addReview(STORE_ID, user.id, user.name, rating, comment, user.avatar);
      setComment("");
      setRating(5);
    } catch (err) {
      const msg = err instanceof Error ? err.message : (typeof err === "object" && err !== null && "message" in err ? String((err as {message: unknown}).message) : "حدث خطأ أثناء نشر التقييم");
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      gsap.from(sectionRef.current.querySelectorAll(".hr-anim"), {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-24 md:py-32 bg-background border-t border-foreground/[0.06]"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Header */}
        <div className="hr-anim text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-foreground/[0.12] bg-foreground/[0.04] mb-5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-tajawal text-foreground/50 text-xs tracking-widest uppercase">
              آراء العملاء
            </span>
          </div>
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-foreground mb-3">
            ماذا يقول عملاؤنا؟
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="font-cairo font-bold text-4xl text-foreground">{avg.toFixed(1)}</span>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(avg)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-transparent text-foreground/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="font-tajawal text-foreground/40 text-xs mt-0.5">
                  بناءً على {reviews.length} تقييم
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reviews grid */}
        {reviews.length > 0 && (
          <div className="hr-anim grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="relative bg-foreground/[0.03] border border-foreground/[0.08] rounded-2xl p-5 flex flex-col gap-4"
              >
                <Quote className="w-7 h-7 text-foreground/10 absolute top-4 left-4" />
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-transparent text-foreground/20"
                      }`}
                    />
                  ))}
                </div>
                {/* Comment */}
                <p className="font-tajawal text-foreground/70 text-sm leading-relaxed flex-1">
                  "{review.comment}"
                </p>
                {/* Author row */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-foreground/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-foreground/10 overflow-hidden flex items-center justify-center shrink-0">
                      {review.userAvatar ? (
                        <img
                          src={review.userAvatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-3.5 h-3.5 text-foreground/40" />
                      )}
                    </div>
                    <div>
                      <p className="font-cairo font-semibold text-foreground text-xs">
                        {review.userName}
                      </p>
                      <p className="font-tajawal text-foreground/30 text-[10px]">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors shrink-0"
                      title="حذف التقييم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {reviews.length === 0 && (
          <div className="hr-anim text-center py-10 mb-10 text-foreground/25 font-tajawal text-sm">
            كن أول من يشارك تجربته مع Magic Mirror ✨
          </div>
        )}

        {/* Add Review */}
        <div className="hr-anim max-w-xl mx-auto">
          {!isLoggedIn ? (
            <div className="text-center p-8 bg-foreground/[0.03] border border-foreground/[0.08] rounded-2xl">
              <p className="font-tajawal text-foreground/50 text-sm mb-4">
                سجّل دخولك لتشارك تجربتك مع Magic Mirror
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 h-11 px-8 bg-primary text-primary-foreground font-cairo font-semibold text-sm rounded-full hover:bg-foreground/90 transition-colors"
              >
                تسجيل الدخول
              </Link>
            </div>
          ) : alreadyReviewed ? (
            <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <p className="font-tajawal text-green-400 text-sm">
                ✓ شكراً — لقد شاركت تقييمك بالفعل
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-2xl p-6 space-y-5"
            >
              <h3 className="font-cairo font-bold text-foreground text-lg text-center">
                شارك تجربتك
              </h3>
              <div className="flex flex-col items-center gap-2">
                <p className="font-tajawal text-foreground/50 text-sm">تقييمك للخدمة</p>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                placeholder="كيف كانت تجربتك مع Magic Mirror؟"
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground font-tajawal text-sm placeholder-foreground/20 outline-none focus:border-foreground/30 transition-colors resize-none"
              />
              {submitError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="font-tajawal text-red-400 text-sm">{submitError}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="w-full h-12 bg-primary text-primary-foreground font-cairo font-semibold text-sm rounded-full hover:bg-foreground/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ النشر…</>
                  : "نشر التقييم"
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
