import { useState } from "react";
import { Link } from "react-router";
import { Star, Trash2, User, MessageSquarePlus } from "lucide-react";
import { useReviews } from "@/contexts/ReviewsContext";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  productId: string;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const dim = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
        >
          <Star
            className={`${dim} transition-colors ${
              star <= (hovered || value)
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

function avgRating(ratings: number[]) {
  if (!ratings.length) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

export default function ReviewsSection({ productId }: Props) {
  const { getProductReviews, addReview, deleteReview, hasReviewed } = useReviews();
  const { user, isAdmin, isLoggedIn } = useAuth();

  const reviews = getProductReviews(productId);
  const avg = avgRating(reviews.map((r) => r.rating));
  const alreadyReviewed = isLoggedIn && user ? hasReviewed(productId, user.id) : false;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    setSubmitting(true);
    addReview(productId, user.id, user.name, rating, comment, user.avatar);
    setComment("");
    setRating(5);
    setSubmitting(false);
  };

  return (
    <div className="space-y-8">
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 p-5 bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl">
          <div className="text-center">
            <p className="font-cairo font-bold text-4xl text-foreground">
              {avg.toFixed(1)}
            </p>
            <StarRating value={Math.round(avg)} readonly size="sm" />
            <p className="font-tajawal text-foreground/40 text-xs mt-1">
              {reviews.length} تقييم
            </p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="font-tajawal text-foreground/40 text-xs w-3">{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-tajawal text-foreground/30 text-xs w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Review Form */}
      {isLoggedIn && !alreadyReviewed && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <MessageSquarePlus className="w-4 h-4 text-foreground/40" />
            <h4 className="font-cairo font-semibold text-foreground text-sm">
              أضف تقييمك
            </h4>
          </div>
          <div>
            <p className="font-tajawal text-foreground/50 text-xs mb-2">تقييمك</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={3}
              placeholder="شاركنا رأيك في المنتج..."
              className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground font-tajawal text-sm placeholder-foreground/20 outline-none focus:border-foreground/30 transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="h-10 px-6 bg-primary text-primary-foreground font-cairo text-sm font-semibold rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-40"
          >
            نشر التقييم
          </button>
        </form>
      )}

      {isLoggedIn && alreadyReviewed && !isAdmin && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
          <p className="font-tajawal text-green-400 text-sm">✓ لقد قمت بتقييم هذا المنتج مسبقاً</p>
        </div>
      )}

      {!isLoggedIn && (
        <div className="p-5 bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl text-center">
          <p className="font-tajawal text-foreground/50 text-sm mb-3">
            سجّل دخولك لتضيف تقييمك
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 h-10 px-6 bg-primary text-primary-foreground font-cairo text-sm font-semibold rounded-xl hover:bg-foreground/90 transition-colors"
          >
            تسجيل الدخول
          </Link>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-center font-tajawal text-foreground/30 text-sm py-8">
          لا توجد تقييمات بعد — كن أول من يقيّم!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-5 bg-foreground/[0.03] border border-foreground/[0.06] rounded-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-foreground/10 overflow-hidden flex items-center justify-center shrink-0">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-foreground/40" />
                    )}
                  </div>
                  <div>
                    <p className="font-cairo font-semibold text-foreground text-sm">
                      {review.userName}
                    </p>
                    <p className="font-tajawal text-foreground/30 text-xs">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} readonly size="sm" />
                  {isAdmin && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
                      title="حذف التقييم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="font-tajawal text-foreground/70 text-sm leading-relaxed mt-3">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
