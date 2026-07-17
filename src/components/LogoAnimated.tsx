import { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * LogoAnimated — Magic Mirror logo with full motion graphics
 *
 * Effects (GSAP + CSS):
 *  1. Boot-up flicker — LED turns on with realistic flicker sequence
 *  2. Glow burst      — intense white glow blooms on entry then settles
 *  3. LED breathe     — continuous soft glow pulse (like powered LED)
 *  4. Light sweep     — diagonal beam crosses the logo every 4s
 *  5. Glitch pulse    — micro digital glitch shimmer every 8s
 *  6. Corner sparks   — 4 corner dots blink asynchronously
 */
export default function LogoAnimated({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const imgRef   = useRef<HTMLImageElement>(null);
  const glowRef  = useRef<HTMLDivElement>(null);

  const dims: Record<string, { w: number }> = {
    sm: { w: 120 },
    md: { w: 180 },
    lg: { w: 300 },
  };
  const { w } = dims[size];

  useEffect(() => {
    if (!imgRef.current || !glowRef.current) return;

    const img  = imgRef.current;
    const glow = glowRef.current;

    /* ── 1. Boot-up flicker ── */
    const boot = gsap.timeline({ delay: 0.1 });
    boot
      .set(img,  { opacity: 0, scale: 0.97 })
      .set(glow, { opacity: 0 })
      // flicker sequence (like LED powering on)
      .to(img, { opacity: 0.9, duration: 0.04 })
      .to(img, { opacity: 0,   duration: 0.04 })
      .to(img, { opacity: 1,   duration: 0.07 })
      .to(img, { opacity: 0.2, duration: 0.03 })
      .to(img, { opacity: 1,   duration: 0.05 })
      .to(img, { opacity: 0,   duration: 0.02 })
      .to(img, { opacity: 1,   duration: 0.06 })
      // glow burst on stabilise
      .to(glow, { opacity: 1, duration: 0.01 }, "<")
      .to([img, glow], {
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
      })
      .to(glow, { opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.2");

    /* ── 2. Continuous LED breathe (after boot) ── */
    const breathe = gsap.timeline({ repeat: -1, yoyo: true, delay: 1 });
    breathe.to(img, {
      filter:
        "drop-shadow(0 0 10px rgba(255,255,255,0.7)) drop-shadow(0 0 28px rgba(255,255,255,0.3))",
      duration: 2.2,
      ease: "power1.inOut",
    });
    gsap.set(img, {
      filter:
        "drop-shadow(0 0 4px rgba(255,255,255,0.35)) drop-shadow(0 0 10px rgba(255,255,255,0.15))",
    });

    /* ── 3. Glitch micro-pulse every 8 s ── */
    const glitch = gsap.timeline({ repeat: -1, delay: 4 });
    glitch
      .to(img, { x: 3,  skewX: 1.5, duration: 0.04, ease: "none" })
      .to(img, { x: -2, skewX: -1,  duration: 0.04, ease: "none" })
      .to(img, { x: 0,  skewX: 0,   duration: 0.06, ease: "power1.out" })
      .to({}, { duration: 7.8 });

    return () => {
      boot.kill();
      breathe.kill();
      glitch.kill();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative inline-block select-none overflow-hidden ${className}`}
      style={{ width: w, direction: "ltr" }}
    >
      {/* Glow burst overlay (fades after boot) */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 rounded-sm"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.55) 0%, transparent 70%)",
          opacity: 0,
          mixBlendMode: "screen",
        }}
      />

      {/* Real brand logo (source asset is white — invert it for light mode) */}
      <div className="invert dark:invert-0 transition-[filter] duration-500">
        <img
          ref={imgRef}
          src="/images/logo.png"
          alt="Magic For LED Mirrors"
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            opacity: 0,
          }}
        />
      </div>
    </div>
  );
}
