import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card, Badge, Button, Loader, ProgressBar } from "../components/ui";
import ThaliDivider from "../components/ThaliDivider";

const statusTone = { active: "success", upcoming: "warning", completed: "default" };

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/campaigns").then(setCampaigns).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">Campaigns</span>
      <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3">Where every donation is headed</h1>

      <div className="flex gap-2 mt-8">
        {["all", "active", "upcoming", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${
              filter === f ? "bg-[var(--color-maroon)] text-white" : "bg-[var(--color-line)]/50 text-[var(--color-ink-soft)] hover:bg-[var(--color-line)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <ThaliDivider />

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <p className="text-[var(--color-ink-soft)] mt-8">No campaigns in this category yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {filtered.map((c) => (
            <Card key={c.id} className="p-6 flex flex-col">
              <div className="flex justify-between items-start">
                <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                <span className="text-xs text-[var(--color-ink-soft)] font-mono-num">
                  {new Date(c.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold mt-3">{c.name}</h3>
              <p className="text-sm text-[var(--color-ink-soft)] mt-2 flex-1 line-clamp-3">{c.description}</p>
              <p className="text-xs text-[var(--color-ink-soft)] mt-2">📍 {c.location}</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs font-mono-num mb-1.5">
                  <span>₹{c.raisedAmount.toLocaleString("en-IN")}</span>
                  <span className="text-[var(--color-ink-soft)]">of ₹{c.targetAmount.toLocaleString("en-IN")}</span>
                </div>
                <ProgressBar value={c.raisedAmount} max={c.targetAmount} />
              </div>
              <Link to={`/campaigns/${c.id}`} className="mt-5">
                <Button variant="subtle" className="w-full">View details</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
