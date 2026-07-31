import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Card, Badge, Button, Loader, ProgressBar, Alert } from "../components/ui";
import ThaliDivider from "../components/ThaliDivider";

const statusTone = { upcoming: "warning", ongoing: "success", completed: "default" };

export default function FoodDrives() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinMsg, setJoinMsg] = useState({});

  useEffect(() => {
    api.get("/food-drives").then(setDrives).finally(() => setLoading(false));
  }, []);

  const joinDrive = async (id) => {
    try {
      await api.post(`/food-drives/${id}/join`);
      setJoinMsg((m) => ({ ...m, [id]: { tone: "success", text: "Request sent — waiting on admin approval." } }));
    } catch (e) {
      setJoinMsg((m) => ({ ...m, [id]: { tone: "error", text: e.message } }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">Food Drives</span>
      <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3">Upcoming &amp; recent drives</h1>

      <ThaliDivider />

      {loading ? (
        <Loader />
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {drives.map((d) => (
            <Card key={d.id} className="p-6">
              <div className="flex justify-between items-start">
                <Badge tone={statusTone[d.status]}>{d.status}</Badge>
                <div className="text-right">
                  <div className="font-mono-num text-xl font-semibold text-[var(--color-maroon)]">{d.mealsDistributed}/{d.targetMeals}</div>
                  <div className="text-[10px] uppercase tracking-widest text-[var(--color-ink-soft)]">meals</div>
                </div>
              </div>
              <h3 className="font-display text-xl font-semibold mt-3">{d.name}</h3>
              <p className="text-sm text-[var(--color-ink-soft)] mt-2">{d.description}</p>
              <div className="text-sm text-[var(--color-ink-soft)] mt-3 space-y-1">
                <p>🗓️ {new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} &middot; {d.time}</p>
                <p>📍 {d.address || d.location}</p>
                {d.mapsLink && (
                  <a href={d.mapsLink} target="_blank" rel="noreferrer" className="text-[var(--color-maroon)] hover:underline inline-block">
                    View on Google Maps &rarr;
                  </a>
                )}
              </div>
              <div className="mt-3">
                <ProgressBar value={d.mealsDistributed} max={Math.max(d.targetMeals, 1)} />
              </div>
              <p className="text-xs text-[var(--color-ink-soft)] mt-2">
                {(d.assignedVolunteers || []).length}/{d.volunteersRequired} volunteers assigned
              </p>

              {d.targetAmount > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--color-line)]">
                  <div className="flex justify-between text-xs font-mono-num mb-1.5">
                    <span className="font-semibold text-[var(--color-maroon)]">₹{(d.raisedAmount || 0).toLocaleString("en-IN")} raised</span>
                    <span className="text-[var(--color-ink-soft)]">of ₹{d.targetAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <ProgressBar value={d.raisedAmount || 0} max={d.targetAmount} />
                </div>
              )}

              {(d.requiredMaterials || []).length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--color-line)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">Materials still needed</p>
                  <div className="space-y-2">
                    {d.requiredMaterials.map((m) => (
                      <div key={m.item}>
                        <div className="flex justify-between text-xs font-mono-num">
                          <span>{m.item}</span>
                          <span className="text-[var(--color-ink-soft)]">{m.received}/{m.required} {m.unit}</span>
                        </div>
                        <div className="mt-1"><ProgressBar value={m.received} max={Math.max(m.required, 1)} colorVar="--color-leaf" /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {d.status === "upcoming" && (
                <div className="flex flex-wrap gap-3 mt-5 items-center">
                  {user?.role === "volunteer" ? (
                    <Button variant="marigold" onClick={() => joinDrive(d.id)}>Join as volunteer</Button>
                  ) : (
                    <Link to="/register"><Button variant="marigold">Join as volunteer</Button></Link>
                  )}
                  <Link to={`/donate?drive=${d.id}`}><Button variant="ghost">Donate</Button></Link>
                </div>
              )}
              {joinMsg[d.id] && (
                <div className="mt-3"><Alert tone={joinMsg[d.id].tone}>{joinMsg[d.id].text}</Alert></div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
