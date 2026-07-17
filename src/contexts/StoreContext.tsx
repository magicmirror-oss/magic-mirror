import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { products as initialProducts, type Product } from "@/data/products";

export type { Product };

interface StoreContextType {
  products: Product[];
  categories: string[];
  loading: boolean;
  addProduct: (p: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

const initialCategories = Array.from(new Set(initialProducts.map(p => p.category)));

/* ── Converters: DB (snake_case) ↔ App (camelCase) ── */
function dbToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    code: (row.code as string) || "",
    name: row.name as string,
    nameEn: (row.name_en as string) || "",
    price: row.price as number,
    oldPrice: row.old_price as number | undefined,
    image: (row.image as string) || "",
    images: (row.images as string[]) || [],
    sizes: (row.sizes as string[]) || [],
    lightColors: (row.light_colors as { name: string; color: string }[]) || [],
    description: (row.description as string) || "",
    features: (row.features as string[]) || [],
    specs: (row.specs as { label: string; value: string }[]) || [],
    category: (row.category as string) || "",
    ledSpecs: (row.led_specs as string) || "",
    antiFog: (row.anti_fog as boolean) ?? false,
    touchControl: (row.touch_control as boolean) ?? false,
  };
}

function productToDb(p: Omit<Product, "id">): Record<string, unknown> {
  return {
    code: p.code,
    name: p.name,
    name_en: p.nameEn,
    price: p.price,
    old_price: p.oldPrice ?? null,
    image: p.image,
    images: p.images,
    sizes: p.sizes,
    light_colors: p.lightColors,
    description: p.description,
    features: p.features,
    specs: p.specs,
    category: p.category,
    led_specs: p.ledSpecs,
    anti_fog: p.antiFog,
    touch_control: p.touchControl,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const [{ data: prods, error: prodsErr }, { data: cats }] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: true }),
        supabase.from("categories").select("name").order("name", { ascending: true }),
      ]);

      if (prodsErr) throw prodsErr;

      if (prods && prods.length > 0) {
        setProducts(prods.map(r => dbToProduct(r as Record<string, unknown>)));
      } else {
        // Auto-seed initial products on first run
        const rows = initialProducts.map(p => ({ id: p.id, ...productToDb(p) }));
        const { data: seeded } = await supabase.from("products").insert(rows).select();
        setProducts(seeded ? seeded.map(r => dbToProduct(r as Record<string, unknown>)) : initialProducts);

        const catRows = initialCategories.map(name => ({ name }));
        await supabase.from("categories").insert(catRows);
        setCategories(initialCategories);
      }

      if (cats && cats.length > 0) {
        setCategories(cats.map((c: { name: string }) => c.name));
      }
    } catch (err) {
      console.error("Store load failed — using local fallback", err);
      setProducts(initialProducts);
      setCategories(initialCategories);
    } finally {
      setLoading(false);
    }
  }

  const addProduct = async (p: Omit<Product, "id">) => {
    const id = `mm-${Date.now()}`;
    const { data, error } = await supabase
      .from("products")
      .insert({ id, ...productToDb(p) })
      .select()
      .single();
    if (error) throw error;
    setProducts(prev => [dbToProduct(data as Record<string, unknown>), ...prev]);
  };

  const updateProduct = async (id: string, p: Partial<Product>) => {
    const { id: _id, nameEn, oldPrice, lightColors, ledSpecs, antiFog, touchControl, ...rest } = p as Product;
    const db: Record<string, unknown> = { ...rest };
    if (nameEn !== undefined) db.name_en = nameEn;
    if (oldPrice !== undefined) db.old_price = oldPrice;
    if (lightColors !== undefined) db.light_colors = lightColors;
    if (ledSpecs !== undefined) db.led_specs = ledSpecs;
    if (antiFog !== undefined) db.anti_fog = antiFog;
    if (touchControl !== undefined) db.touch_control = touchControl;

    const { error } = await supabase.from("products").update(db).eq("id", id);
    if (error) throw error;
    setProducts(prev => prev.map(prod => prod.id === id ? { ...prod, ...p } : prod));
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = async (name: string) => {
    if (categories.includes(name)) return;
    const { error } = await supabase.from("categories").insert({ name });
    if (error) throw error;
    setCategories(prev => [...prev, name]);
  };

  const deleteCategory = async (name: string) => {
    const { error } = await supabase.from("categories").delete().eq("name", name);
    if (error) throw error;
    setCategories(prev => prev.filter(c => c !== name));
  };

  return (
    <StoreContext.Provider
      value={{ products, categories, loading, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
