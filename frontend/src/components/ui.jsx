export function Card({ children, className = "" }) {
  return (
    <div className={`bg-[var(--color-card)] border border-[var(--color-line)] rounded-2xl shadow-[0_2px_14px_rgba(42,27,18,0.06)] ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-[var(--color-line)] text-[var(--color-ink-soft)]",
    success: "bg-[var(--color-leaf)]/15 text-[var(--color-leaf)]",
    warning: "bg-[var(--color-marigold)]/20 text-[var(--color-marigold-deep)]",
    danger: "bg-[var(--color-maroon)]/12 text-[var(--color-maroon)]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-[var(--color-maroon)] text-white hover:bg-[var(--color-maroon-deep)]",
    marigold: "bg-[var(--color-marigold)] text-[var(--color-ink)] hover:bg-[var(--color-marigold-deep)] hover:text-white",
    ghost: "bg-transparent border border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-maroon)]",
    subtle: "bg-[var(--color-line)]/50 text-[var(--color-ink)] hover:bg-[var(--color-line)]",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">{label}</span>}
      <input
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-marigold)] transition-shadow ${
          error ? "border-[var(--color-maroon)]" : "border-[var(--color-line)]"
        } ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-[var(--color-maroon)] mt-1">{error}</span>}
    </label>
  );
}

export function Select({ label, children, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">{label}</span>}
      <select
        className={`w-full px-4 py-2.5 rounded-xl border border-[var(--color-line)] bg-white text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-marigold)] ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">{label}</span>}
      <textarea
        className={`w-full px-4 py-2.5 rounded-xl border border-[var(--color-line)] bg-white text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-marigold)] ${className}`}
        {...props}
      />
    </label>
  );
}

export function Alert({ tone = "info", children }) {
  const tones = {
    info: "bg-[var(--color-marigold)]/15 text-[var(--color-marigold-deep)] border-[var(--color-marigold)]/40",
    error: "bg-[var(--color-maroon)]/10 text-[var(--color-maroon)] border-[var(--color-maroon)]/30",
    success: "bg-[var(--color-leaf)]/10 text-[var(--color-leaf)] border-[var(--color-leaf)]/30",
  };
  return (
    <div className={`px-4 py-3 rounded-xl border text-sm ${tones[tone]}`} role="alert">
      {children}
    </div>
  );
}

export function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-ink-soft)]">
      <div className="thali-ring animate-spin" style={{ animationDuration: "1.4s" }} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ProgressBar({ value, max, colorVar = "--color-marigold" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full h-2 bg-[var(--color-line)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: `var(${colorVar})` }}
      />
    </div>
  );
}
