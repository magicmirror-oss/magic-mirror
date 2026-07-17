import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

interface ReviewsContextType {
  reviews: Review[];
  getProductReviews: (productId: string) => Review[];
  addReview: (
    productId: string,
    userId: string,
    userName: string,
    rating: number,
    comment: string,
    userAvatar?: string
  ) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  hasReviewed: (productId: string, userId: string) => boolean;
}

const ReviewsContext = createContext<ReviewsContextType | null>(null);

function dbToReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    userAvatar: row.user_avatar as string | undefined,
    rating: row.rating as number,
    comment: row.comment as string,
    createdAt: row.created_at as string,
  };
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Failed to load reviews", error);
        return;
      }
      if (data) setReviews(data.map(r => dbToReview(r as Record<string, unknown>)));
    })();
  }, []);

  const getProductReviews = useCallback(
    (productId: string) => reviews.filter(r => r.productId === productId),
    [reviews]
  );

  const addReview = useCallback(
    async (
      productId: string,
      userId: string,
      userName: string,
      rating: number,
      comment: string,
      userAvatar?: string
    ) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          product_id: productId,
          user_id: userId,
          user_name: userName,
          user_avatar: userAvatar ?? null,
          rating,
          comment: comment.trim(),
        })
        .select()
        .single();
      if (error) throw error;
      setReviews(prev => [dbToReview(data as Record<string, unknown>), ...prev]);
    },
    []
  );

  const deleteReview = useCallback(async (reviewId: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) throw error;
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  }, []);

  const hasReviewed = useCallback(
    (productId: string, userId: string) =>
      reviews.some(r => r.productId === productId && r.userId === userId),
    [reviews]
  );

  return (
    <ReviewsContext.Provider
      value={{ reviews, getProductReviews, addReview, deleteReview, hasReviewed }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used inside ReviewsProvider");
  return ctx;
}
