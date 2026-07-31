import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card, Badge, Button, Loader, ProgressBar } from "../components/ui";
import ThaliDivider from "../components/ThaliDivider";
import StatCounter from "../components/StatCounter";
import Gallery from "../components/Gallery";

export default function Landing() {
  const [impact, setImpact] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/impact"), api.get("/campaigns"), api.get("/food-drives")])
      .then(([impactData, campaignData, driveData]) => {
        setImpact(impactData);
        setCampaigns(campaignData.filter((c) => c.status === "active").slice(0, 3));
        setDrives(driveData.filter((d) => d.status === "upcoming").slice(0, 2));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)] bg-[var(--color-maroon)]/8 px-3 py-1.5 rounded-full">
              Seva in Bareilly, Uttar Pradesh
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] mt-5 text-[var(--color-ink)]">
              A full plate, <span className="italic text-[var(--color-maroon)]">served with hands</span> that care.
            </h1>
            <p className="mt-6 text-lg text-[var(--color-ink-soft)] max-w-lg leading-relaxed">
              Hari Seva Foundation runs food drives, school kit distributions and
              relief campaigns across Bareilly &mdash; funded by donors, delivered by
              volunteers, hosted by community partners.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/donate"><Button variant="primary">Donate now</Button></Link>
              <Link to="/register"><Button variant="ghost">Volunteer with us</Button></Link>
            </div>
          </div>

          <div className="relative animate-rise" style={{ animationDelay: "0.1s" }}>
            <div className="aspect-square max-w-sm mx-auto rounded-full border-2 border-[var(--color-marigold)] flex items-center justify-center relative">
              <div className="absolute inset-6 rounded-full border border-[var(--color-line)]" />
              <div className="absolute inset-12 rounded-full border border-dashed border-[var(--color-marigold)]/50" />
              <div className="text-center px-8">
                <div className="font-mono-num text-5xl font-semibold text-[var(--color-maroon)]">
                  {impact ? impact.mealsServed.toLocaleString("en-IN") : "..."}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-soft)] mt-2">
                  Meals served to date
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5">
        <ThaliDivider label="Our Impact" />
      </div>

      {/* Impact counters */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        {loading || !impact ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4">
            <StatCounter icon="🍚" value={impact.mealsServed} label="Meals Served" />
            <StatCounter icon="🎒" value={impact.schoolKitsDelivered} label="School Kits" />
            <StatCounter icon="🙋" value={impact.totalVolunteers} label="Volunteers" />
            <StatCounter icon="🤝" value={impact.totalDonors} label="Donors" />
            <StatCounter icon="📍" value={impact.locationsCovered} label="Locations Covered" />
            <StatCounter icon="❤️" value={impact.peopleSupported} label="People Supported" />
            <StatCounter icon="🍛" value={impact.foodDrivesConducted} label="Food Drives Held" />
            <StatCounter icon="🎗️" value={campaigns.length} label="Active Campaigns" />
          </div>
        )}
      </section>

      <Gallery />

      <div className="max-w-3xl mx-auto px-5">
        <ThaliDivider label="Active Campaigns" />
      </div>

      {/* Active campaigns */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl font-semibold">Where your seva goes</h2>
          <Link to="/campaigns" className="text-sm font-semibold text-[var(--color-maroon)] hover:underline">View all &rarr;</Link>
        </div>
        {loading ? (
          <Loader />
        ) : campaigns.length === 0 ? (
          <p className="text-[var(--color-ink-soft)]">No active campaigns right now &mdash; check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <Card key={c.id} className="p-6 flex flex-col">
                <Badge tone="warning">{c.status}</Badge>
                <h3 className="font-display text-xl font-semibold mt-3">{c.name}</h3>
                <p className="text-sm text-[var(--color-ink-soft)] mt-2 flex-1 line-clamp-3">{c.description}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-mono-num mb-1.5">
                    <span>₹{c.raisedAmount.toLocaleString("en-IN")} raised</span>
                    <span className="text-[var(--color-ink-soft)]">of ₹{c.targetAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <ProgressBar value={c.raisedAmount} max={c.targetAmount} />
                </div>
                <Link to={`/campaigns/${c.id}`} className="mt-5">
                  <Button variant="subtle" className="w-full">View campaign</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming food drives */}
      <section className="bg-[var(--color-maroon)] text-white py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-3xl font-semibold">Upcoming food drives</h2>
            <Link to="/food-drives" className="text-sm font-semibold text-[var(--color-marigold)] hover:underline">View all &rarr;</Link>
          </div>
          {loading ? (
            <p className="text-white/70 text-sm">Loading...</p>
          ) : drives.length === 0 ? (
            <p className="text-white/70">No upcoming drives scheduled yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {drives.map((d) => (
                <div key={d.id} className="bg-white/8 border border-white/15 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold">{d.name}</h3>
                      <p className="text-sm text-white/70 mt-1">
                        {new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} &middot; {d.time}
                      </p>
                      <p className="text-sm text-white/70 mt-0.5">{d.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono-num text-2xl font-semibold text-[var(--color-marigold)]">{d.targetMeals}</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/60">target meals</div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <Link to="/register"><Button variant="marigold">Join as volunteer</Button></Link>
                    <Link to="/donate"><Button variant="ghost" className="border-white/30 text-white hover:border-white">Donate</Button></Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
