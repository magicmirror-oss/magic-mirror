import { useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { products } from "@/data/products";
import LogoAnimated from "@/components/LogoAnimated";
import HomeReviews from "@/components/HomeReviews";
import {
  Wrench,
  Gem,
  Shield,
  Truck,
  Phone,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Hero ─── */
function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!textRef.current) return;
    const tl = gsap.timeline({ delay: 0.3 });
    tl.from(textRef.current.querySelectorAll(".hero-anim"), {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
    });
  }, { scope: sectionRef });

  // Character slide animation for "Magic Mirror"
  const brandText = "Magic Mirror";

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background/70" />

      {/* Content */}
      <div ref={textRef} className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Animated Logo */}
        <div className="hero-anim flex justify-center mb-8">
          <LogoAnimated size="lg" />
        </div>

        {/* Tagline */}
        <p className="hero-anim font-tajawal text-lg sm:text-xl text-foreground/70 mb-2">
          مرايات LED بلمسة سحر
        </p>
        <p className="hero-anim font-tajawal text-base text-foreground/50 mb-8 max-w-md mx-auto">
          إضاءة احترافية، تصميم عصري، جودة لا تُضاهى
        </p>

        {/* CTA Buttons */}
        <div className="hero-anim flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/products" className="btn-primary w-full sm:w-auto">
            تصفح المنتجات
          </Link>
          <Link to="/cart" className="btn-outline w-full sm:w-auto">
            سلة المشتريات
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-xs font-tajawal text-foreground/50">اسحب للأسفل</span>
        <div className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>

      <style>{`
        @keyframes char-slide {
          0%, 100% { transform: translateY(0); opacity: 1; }
          25% { transform: translateY(-8px); opacity: 0.7; }
          50% { transform: translateY(0); opacity: 1; }
          75% { transform: translateY(4px); opacity: 0.9; }
        }
        .animate-char-slide {
          animation: char-slide 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

/* ─── Product Showcase ─── */
function ProductShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.from(sectionRef.current.querySelector(".section-header"), {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
    });

    gsap.from(sectionRef.current.querySelectorAll(".product-card"), {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
      },
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative z-10 py-24 md:py-32 bg-background">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="section-header text-center mb-12">
          <div className="section-label justify-center mb-4">منتجاتنا</div>
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-foreground mb-3">
            تشكيلة مرايات LED
          </h2>
          <p className="font-tajawal text-foreground/50 max-w-lg mx-auto">
            اختر المرآة المثالية لمنزلك من مجموعتنا المتنوعة
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="product-card card-surface group overflow-hidden block"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors duration-300 flex items-end">
                  <div className="p-4 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-foreground font-tajawal text-sm bg-foreground/20 backdrop-blur-sm px-3 py-1 rounded-pill">
                      عرض التفاصيل
                    </span>
                  </div>
                </div>
                {product.oldPrice && (
                  <div className="absolute top-3 left-3 bg-red-500/90 text-foreground text-xs font-cairo font-bold px-2 py-1 rounded-lg">
                    خصم
                  </div>
                )}
              </div>
              <div className="p-4">
                <span className="text-foreground/30 text-xs font-tajawal">{product.code}</span>
                <h3 className="font-cairo font-semibold text-foreground mt-1 mb-2 group-hover:text-foreground/90 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-cairo font-bold text-foreground">
                    {product.price.toLocaleString()} ج.م
                  </span>
                  {product.oldPrice && (
                    <span className="text-foreground/30 line-through text-sm">
                      {product.oldPrice.toLocaleString()} ج.م
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/products" className="btn-outline">
            عرض جميع المنتجات
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Brand Story ─── */
function BrandStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const words = ["وضوح", "تألق", "أناقة", "تفاصيل", "إضاءة", "سحر"];

  useGSAP(() => {
    if (!sectionRef.current) return;

    const items = sectionRef.current.querySelectorAll(".story-word");
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=200%",
        scrub: true,
        pin: true,
      },
    });

    items.forEach((item, i) => {
      tl.fromTo(
        item,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.3, ease: "none" },
        i * 0.15
      );
      tl.to(
        item,
        { opacity: 0, y: -60, duration: 0.2, ease: "none" },
        i * 0.15 + 0.25
      );
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative z-10 min-h-[100dvh] flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Blurred background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url(/images/product-6.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(60px) brightness(0.3)",
        }}
      />

      <div className="relative z-10 text-center px-6">
        <h2 className="font-cairo font-bold text-3xl md:text-5xl text-foreground mb-3 text-center">لماذا تختار Magic Mirror</h2>
        <p className="font-tajawal text-foreground/55 text-base md:text-lg text-center mb-8">لأن كل مرآة مصممة بعناية فائقة لتقدم لك أفضل تجربة</p>

        <div className="space-y-6">
          {words.map((word, i) => (
            <div
              key={i}
              className="story-word font-cairo font-bold text-5xl sm:text-6xl md:text-8xl text-foreground opacity-0"
            >
              {word}
            </div>
          ))}
        </div>

        <p className="mt-12 font-tajawal text-foreground/50 max-w-2xl mx-auto leading-relaxed">
          نصنع لك مرايا تجمع بين الأناقة والإضاءة الاحترافية، لتمنح مساحتك لمسة سحرية لا تُنسى.
        </p>
      </div>
    </section>
  );
}

/* ─── CTA Marquee ─── */
function CTAMarquee() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    gsap.from(sectionRef.current.querySelector(".cta-content"), {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
      },
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-24 md:py-32 bg-background overflow-hidden"
    >
      {/* Radial spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)",
        }}
      />

      <div className="cta-content relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* 3D Ring text effect using CSS */}
        <div className="perspective-1200 mb-12 flex items-center justify-center">
          <div className="relative w-[300px] h-[300px] preserve-3d animate-spin-slow">
            {"Magic Mirror • ".repeat(4)
              .split("")
              .slice(0, 40)
              .map((char, i) => (
                <span
                  key={i}
                  className="absolute font-cairo font-bold text-foreground/20 text-lg"
                  style={{
                    transform: `rotateY(${i * 9}deg) translateZ(140px)`,
                    transformOrigin: "center center",
                    left: "50%",
                    top: "50%",
                    marginLeft: "-6px",
                    marginTop: "-10px",
                  }}
                >
                  {char}
                </span>
              ))}
          </div>
        </div>

        <h2 className="font-cairo font-bold text-3xl md:text-5xl text-foreground mb-4">
          اطلب مرآتك الآن
        </h2>
        <p className="font-tajawal text-foreground/50 mb-8 max-w-md mx-auto">
          حوّل حمامك إلى تحفة فنية مع مرايات LED من Magic Mirror
        </p>
        <Link to="/products" className="btn-primary">
          تصفح المنتجات
        </Link>

        <style>{`
          @keyframes spin-slow {
            from { transform: rotateY(0deg) rotateX(70deg); }
            to { transform: rotateY(360deg) rotateX(70deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
        `}</style>
      </div>
    </section>
  );
}

/* ─── Why Magic Mirror (Values) ─── */
function WhyUs() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const values = [
    {
      icon: Gem,
      title: "جودة لا تُضاهى",
      desc: "مرايات LED بمواصفات عالمية، مصنعة من أجود الخامات",
    },
    {
      icon: Wrench,
      title: "تركيب احترافي",
      desc: "فريق متخصص للتركيب في جميع المحافظات",
    },
    {
      icon: Shield,
      title: "ضمان 3 سنوات",
      desc: "ضمان شامل على الإضاءة LED والمكونات الإلكترونية",
    },
    {
      icon: Truck,
      title: "توصيل مجاني",
      desc: "شحن وتركيب مجاني لجميع الطلبات",
    },
  ];

  useGSAP(() => {
    if (!sectionRef.current) return;

    gsap.from(sectionRef.current.querySelectorAll(".value-card"), {
      rotateX: 60,
      rotateY: 30,
      z: -1000,
      opacity: 0,
      duration: 1,
      stagger: { amount: 0.4, from: "start" },
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        end: "center center",
        scrub: 1,
      },
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-24 md:py-32 bg-secondary"
    >
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-12">
          <div className="section-label justify-center mb-4">لماذا نحن</div>
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-foreground mb-3">
            Magic Mirror تختلف
          </h2>
          <p className="font-tajawal text-foreground/50 max-w-lg mx-auto">
            نقدم لك تجربة فريدة مع كل مرآة
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 perspective-1200">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="value-card bg-card border border-foreground/[0.08] rounded-2xl p-8 hover:border-foreground/20 hover:shadow-glow transition-all duration-300 preserve-3d"
              >
                <Icon className="w-12 h-12 text-foreground/70 mb-4" strokeWidth={1.5} />
                <h3 className="font-cairo font-semibold text-foreground text-xl mb-2">
                  {v.title}
                </h3>
                <p className="font-tajawal text-foreground/50 text-sm leading-relaxed">
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Contact ─── */
function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    gsap.from(sectionRef.current.querySelector(".contact-content"), {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative z-10 py-24 md:py-32 bg-background"
    >
      <div className="contact-content max-w-[600px] mx-auto px-6 text-center">
        <div className="section-label justify-center mb-4">تواصل معنا</div>
        <h2 className="font-cairo font-bold text-3xl md:text-4xl text-foreground mb-4">
          Magic Mirror
        </h2>
        <p className="font-tajawal text-foreground/50 mb-8">
          للاستفسارات والطلبات، تواصل معنا مباشرة
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="https://wa.me/201069577622"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            تواصل عبر واتساب
          </a>
          <a href="tel:01069577622" className="btn-outline w-full sm:w-auto">
            <Phone className="w-5 h-5" />
            01069577622
          </a>
        </div>

        <div className="flex items-center justify-center gap-4">
          <a
            href="https://www.facebook.com/share/1KWimTQzc8/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-[#1877F2]/20 border border-transparent hover:border-[#1877F2]/40 flex items-center justify-center transition-all"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5 text-foreground/60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Home Page ─── */
export default function Home() {
  return (
    <div className="relative">
      <Hero />

      <BrandStory />
      <CTAMarquee />

      <HomeReviews />

      <Contact />
    </div>
  );
}
