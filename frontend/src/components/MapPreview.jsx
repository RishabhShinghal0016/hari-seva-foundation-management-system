// Free embedded map preview via OpenStreetMap — no API key, no billing account.
// Shows a tight, street-level view centered on the pin so a donor (or the
// pickup team) can visually confirm the exact spot within Bareilly.
export default function MapPreview({ latitude, longitude, height = 200 }) {
  if (!latitude || !longitude) return null;

  const delta = 0.002; // roughly street-level zoom
  const bbox = [longitude - delta, latitude - delta, longitude + delta, latitude + delta].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--color-line)]" style={{ height }}>
      <iframe
        title="Pinned location"
        src={src}
        className="w-full h-full"
        style={{ border: 0 }}
        loading="lazy"
      />
    </div>
  );
}
