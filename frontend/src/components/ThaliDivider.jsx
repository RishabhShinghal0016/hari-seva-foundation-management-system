export default function ThaliDivider({ label }) {
  return (
    <div className="thali-divider w-full my-2" role="separator">
      <span className="thali-ring" aria-hidden="true" />
      {label && (
        <span className="font-mono-num text-xs tracking-[0.25em] uppercase text-[var(--color-maroon)] whitespace-nowrap">
          {label}
        </span>
      )}
      <span className="thali-ring" aria-hidden="true" />
    </div>
  );
}
