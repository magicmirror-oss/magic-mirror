import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Product } from "@/data/products";
import { useAffiliate } from "@/contexts/AffiliateContext";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedLightColor: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, lightColor: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  /** السعر النهائي بعد إضافة عمولة المسوق (إن وُجد) */
  totalPrice: number;
  /** السعر الأصلي بدون عمولة */
  originalTotalPrice: number;
  /** قيمة العمولة للمنتج الواحد */
  commission: number;
  downPayment: number;
  remainingAmount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // CartProvider renders inside AffiliateProvider — safe to call useAffiliate here
  const { commission } = useAffiliate();

  const addToCart = useCallback((product: Product, size: string, lightColor: string) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedLightColor === lightColor
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedLightColor === lightColor
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: size, selectedLightColor: lightColor }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // السعر الأصلي بدون عمولة
  const originalTotalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // السعر النهائي: السعر الأصلي + عمولة المسوق لكل وحدة × الكمية
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product.price + commission) * item.quantity,
    0
  );

  const downPayment = Math.round(totalPrice * 0.2);
  const remainingAmount = totalPrice - downPayment;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        originalTotalPrice,
        commission,
        downPayment,
        remainingAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
