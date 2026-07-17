import {
  Lightbulb,
  ShieldCheck,
  Truck,
  Wallet,
  Gem,
  Palette,
  Smartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const features: Feature[] = [
  { icon: Lightbulb, title: "إضاءة LED موفرة للطاقة", desc: "استمتع بإضاءة قوية وواضحة مع استهلاك منخفض للكهرباء وعمر افتراضي طويل." },
  { icon: ShieldCheck, title: "ضمان الجودة", desc: "جميع منتجاتنا مصنوعة من خامات عالية الجودة مع ضمان ضد عيوب الصناعة." },
  { icon: Truck, title: "شحن لجميع المحافظات", desc: "نوفر خدمة شحن سريعة وآمنة إلى جميع محافظات مصر مع تغليف احترافي." },
  { icon: Wallet, title: "دفع مقدم والباقي عند الاستلام", desc: "ادفع مبلغًا مقدمًا لتأكيد الطلب، ثم سدد المبلغ المتبقي عند استلام المنتج." },
  { icon: Gem, title: "خامات ممتازة", desc: "مرايات عالية النقاء مع تشطيبات فاخرة تمنح منزلك مظهرًا عصريًا وأنيقًا." },
  { icon: Palette, title: "تصميمات ومقاسات متنوعة", desc: "اختر من بين مجموعة كبيرة من الأشكال والمقاسات أو اطلب تصميمًا مخصصًا يناسب احتياجاتك." },
  { icon: Smartphone, title: "مفاتيح لمس حديثة", desc: "تشغيل وإيقاف الإضاءة بسهولة باستخدام تقنية اللمس الحديثة مع مظهر فاخر." },
  { icon: Wrench, title: "سهولة التركيب", desc: "يتم توفير المرايات بطريقة تسهل تركيبها مع جميع الملحقات اللازمة." },
];
