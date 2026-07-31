import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { Card, Badge, Button, Loader } from "../../components/ui";
import ThaliDivider from "../../components/ThaliDivider";

const statusTone = { pending: "warning", approved: "success", rejected: "danger" };

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/volunteers/me/summary").then(setSummary).finally(() => setLoading(false));
  }, []);

  if (loading || !summary) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">Volunteer Dashboard</span>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mt-2">Namaste, {user.name.split(" ")[0]} 🙏</h1>

      <div className="grid sm:grid-cols-4 gap-5 mt-8">
        <Card className="p-6">
          <div className="font-mono-num text-2xl font-semibold text-[var(--color-maroon)]">{summary.totalEvents}</div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)] mt-1">Events joined</div>
        </Card>
        <Card className="p-6">
          <div className="font-mono-num text-2xl font-semibold text-[var(--color-maroon)]">{summary.totalHours}</div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)] mt-1">Hours served</div>
        </Card>
        <Card className="p-6">
          <div className="font-mono-num text-2xl font-semibold text-[var(--color-maroon)]">{summary.certificatesEarned}</div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)] mt-1">Certificates earned</div>
        </Card>
        <Card className="p-6">
          <div className="font-mono-num text-2xl font-semibold text-[var(--color-maroon)]">{summary.events.filter((e) => e.myStatus === "pending").length}</div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)] mt-1">Requests pending</div>
        </Card>
      </div>

      <div className="mt-8">
        <Link to="/food-drives"><Button>Browse food drives to join</Button></Link>
      </div>

      <ThaliDivider label="My Events" />

      {summary.events.length === 0 ? (
        <p className="text-[var(--color-ink-soft)] mt-6">You haven't joined any events yet — browse food drives to get started.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {summary.events.map((e) => (
            <Card key={e.id} className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{e.name}</span>
                  <Badge tone={statusTone[e.myStatus]}>{e.myStatus}</Badge>
                </div>
                <p className="text-xs text-[var(--color-ink-soft)] mt-1">
                  {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} &middot; {e.location}
                </p>
              </div>
              <Badge>{e.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
