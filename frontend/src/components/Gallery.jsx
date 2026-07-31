const photos = [
  { src: "/assets/gallery/street-distribution.jpeg", caption: "Taking food directly to people who need it" },
  { src: "/assets/gallery/school-kits-group.jpeg", caption: "Handing out school kits" },
  { src: "/assets/gallery/meal-service-hall.jpeg", caption: "Serving a hot meal" },
  { src: "/assets/gallery/classroom-visit.jpeg", caption: "Visiting a school for a kit distribution drive" },
  { src: "/assets/gallery/flag-hoisting.jpeg", caption: "Independence Day with the children" },
  { src: "/assets/gallery/meal-service-yellow.jpeg", caption: "Mealtime at one of our drives" },
  { src: "/assets/gallery/community-distribution.jpeg", caption: "Community distribution on the ground" },
  { src: "/assets/gallery/preparing-refreshments.jpeg", caption: "Getting refreshments ready for a drive" },
  { src: "/assets/gallery/street-team.jpeg", caption: "Our team out in the field" },
];

export default function Gallery() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">In the field</span>
          <h2 className="font-display text-3xl font-semibold mt-2">Moments from our drives</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[140px] sm:auto-rows-[190px] md:auto-rows-[210px]">
        {photos.map((p, i) => (
          <figure
            key={p.src}
            className={`relative overflow-hidden rounded-2xl border border-[var(--color-line)] group h-full w-full ${
              i === 0 ? "col-span-2 row-span-2" : ""
            }`}
          >
            <img
              src={p.src}
              alt={p.caption}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent text-white text-xs md:text-sm px-3 py-2.5">
              {p.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
