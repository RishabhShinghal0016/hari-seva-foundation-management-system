import { useEffect, useRef, useState } from "react";

export default function StatCounter({ value = 0, label, icon, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center px-4">
      <div className="text-2xl mb-1" aria-hidden="true">{icon}</div>
      <div className="font-mono-num text-3xl md:text-4xl font-semibold text-[var(--color-maroon)]">
        {prefix}
        {display.toLocaleString("en-IN")}
        {suffix}
      </div>
      <div className="text-xs uppercase tracking-[0.15em] text-[var(--color-ink-soft)] mt-1.5">{label}</div>
    </div>
  );
}
