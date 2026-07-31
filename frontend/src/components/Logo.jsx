export default function Logo({ size = "md", showName = true }) {
  const dims = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-xl" };
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/assets/logo.jpeg"
        alt="Hari Seva Foundation logo"
        className={`${dims[size]} rounded-full object-cover ring-2 ring-[var(--color-marigold)] shadow-sm`}
      />
      {showName && (
        <span className={`font-display font-semibold ${textSize[size]} leading-tight text-[var(--color-ink)]`}>
          Hari Seva
          <span className="block text-[0.65em] font-body font-medium tracking-[0.2em] uppercase text-[var(--color-maroon)] -mt-0.5">
            Foundation
          </span>
        </span>
      )}
    </div>
  );
}
