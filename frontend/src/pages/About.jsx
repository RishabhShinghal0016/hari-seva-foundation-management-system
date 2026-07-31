import ThaliDivider from "../components/ThaliDivider";
import { Card } from "../components/ui";

const values = [
  { title: "Transparency", body: "Every rupee and every sack of rice is tracked from donation to distribution, with receipts and verified records anyone can see." },
  { title: "Community first", body: "Restaurants, temples, schools and companies open their doors as food drive partners, so seva happens where people already gather." },
  { title: "Dignity in service", body: "Meals are served, not dumped. Volunteers are trained to treat every beneficiary with respect." },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">About us</span>
      <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3 leading-tight">
        Seva is simple: cook enough, and no one nearby stays hungry.
      </h1>
      <p className="mt-6 text-lg text-[var(--color-ink-soft)] leading-relaxed">
        Hari Seva Foundation started as a handful of monthly food distributions in
        Bareilly and has grown into a coordinated platform connecting donors,
        volunteers and food-drive partners &mdash; restaurants, temples, schools and
        community halls &mdash; so that meals, school kits and winter relief reach
        the families who need them, campaign after campaign.
      </p>

      <ThaliDivider label="Our Values" />

      <div className="grid sm:grid-cols-3 gap-5 mt-10">
        {values.map((v) => (
          <Card key={v.title} className="p-6">
            <h3 className="font-display text-lg font-semibold text-[var(--color-maroon)]">{v.title}</h3>
            <p className="text-sm text-[var(--color-ink-soft)] mt-2 leading-relaxed">{v.body}</p>
          </Card>
        ))}
      </div>

      <ThaliDivider label="Founder" />

      <Card className="p-8 mt-10 grid sm:grid-cols-[auto_1fr] gap-6 items-center">
        <img
          src="/assets/founder.jpeg"
          alt="Rishabh Shinghal, Founder of Hari Seva Foundation"
          className="w-28 h-28 rounded-full object-cover ring-4 ring-[var(--color-marigold)]/40 mx-auto sm:mx-0"
        />
        <div>
          <h3 className="font-display text-2xl font-semibold">Rishabh Shinghal</h3>
          <p className="text-sm text-[var(--color-maroon)] font-semibold uppercase tracking-wide mt-1">Founder</p>
          <p className="text-sm text-[var(--color-ink-soft)] mt-3 leading-relaxed">
            Rishabh founded Hari Seva Foundation to bring the same discipline he
            brings to building software &mdash; clear records, verified data, no
            guesswork &mdash; to running food drives on the ground in Bareilly.
          </p>
        </div>
      </Card>
    </div>
  );
}
