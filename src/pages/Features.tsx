import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { features } from "@/data/features";
import { Sparkles } from "lucide-react";
import ContactSheet from "@/components/ContactSheet";

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [contactOpen, setContactOpen] = useState(false);

  useGSAP(() => {
    // Animate hero card
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll(".feature-card");

    cards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay: (i % 4) * 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );

      const icon = card.querySelector(".feature-icon");
      if (icon) {
        gsap.fromTo(
          icon,
          { scale: 0, rotate: -25 },
          {
            scale: 1,
            rotate: 0,
            duration: 0.6,
            delay: (i % 4) * 0.08 + 0.15,
            ease: "back.out(2.2)",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });
  }, { scope: sectionRef, dependencies: [features.length] });

  return (
    <div
      ref={sectionRef}
      className="relative z-10 pt-24 pb-16 min-h-screen bg-background overflow-hidden"
    >
      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute -top-40 right-1/4 w-[420px] h-[420px] rounded-full bg-foreground/[0.04] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 w-[420px] h-[420px] rounded-full bg-foreground/[0.03] blur-[120px]" />

      <div className="relative max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-label justify-center mb-4">مميزاتنا</div>
          <h1 className="font-cairo font-bold text-3xl md:text-4xl text-foreground mb-3">
            لماذا تختار Magic Mirror؟
          </h1>
          <p className="font-tajawal text-foreground/50 max-w-lg mx-auto">
            كل مرآة مصممة بعناية فائقة لتقدم لك أفضل تجربة
          </p>
        </div>

        {/* ── Hero Card: تصميم خاص بك ── */}
        <div ref={heroRef} className="mb-8">
          <div className="relative group overflow-hidden rounded-2xl border border-foreground/20 bg-foreground/[0.04] backdrop-blur-sm p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 hover:border-foreground/40 hover:bg-foreground/[0.07] hover:shadow-glow transition-all duration-500">
            {/* Background shimmer */}
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-l from-foreground/[0.04] via-transparent to-transparent" />

            {/* Icon */}
            <div className="shrink-0 w-20 h-20 rounded-2xl bg-foreground border border-foreground/20 flex items-center justify-center shadow-glow">
              <Sparkles className="w-9 h-9 text-background" strokeWidth={1.5} />
            </div>

            {/* Text content */}
            <div className="flex-1 text-center md:text-right">
              <div className="inline-flex items-center gap-2 bg-foreground/10 border border-foreground/20 rounded-full px-3 py-1 mb-3">
                <span className="font-tajawal text-xs text-foreground/60">حصري</span>
              </div>
              <h2 className="font-cairo font-bold text-2xl md:text-3xl text-foreground mb-3 leading-snug">
                تصميم خاص بك
              </h2>
              <p className="font-tajawal text-foreground/60 text-base leading-relaxed max-w-xl">
                هل لديك فكرة مرآة تحلم بها؟ تواصل مع مصممنا المتخصص وسنُنفّذ
                لك أي تصميم تريده — أبعاد مخصصة، إضاءة فريدة، أو لمسة شخصية
                تجعل مرآتك قطعة فن لا تُضاهى.
              </p>
            </div>

            {/* CTA */}
            <div className="shrink-0">
              <a
                href="https://wa.me/201095120815"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-cairo font-semibold text-sm bg-foreground text-background px-7 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all duration-200 whitespace-nowrap shadow-glow"
              >
                تواصل مع المصمم
              </a>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="feature-card group relative bg-foreground/[0.03] backdrop-blur-sm border border-foreground/[0.08] rounded-2xl p-6 hover:border-foreground/20 hover:bg-foreground/[0.05] hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
              >
                <div className="feature-icon w-14 h-14 rounded-xl bg-foreground/[0.06] border border-foreground/[0.1] flex items-center justify-center mb-5 group-hover:bg-foreground group-hover:border-foreground transition-colors duration-300">
                  <Icon className="w-6 h-6 text-foreground/70 group-hover:text-background transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <h3 className="font-cairo font-semibold text-foreground text-base mb-2 leading-snug">
                  {f.title}
                </h3>
                <p className="font-tajawal text-foreground/50 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <ContactSheet open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
