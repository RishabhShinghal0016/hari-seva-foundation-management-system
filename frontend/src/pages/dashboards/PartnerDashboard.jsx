import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { Card, Badge, Button, Input, Textarea, Loader, Alert } from "../../components/ui";
import ThaliDivider from "../../components/ThaliDivider";

const statusTone = { pending: "warning", approved: "success", rejected: "danger" };

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ preferredDates: "", capacity: "", notes: "" });
  const [status, setStatus] = useState(null);

  const load = () => api.get("/partners/requests").then(setRequests).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      await api.post("/partners/requests", form);
      setStatus({ tone: "success", text: "Request sent — the admin team will review and schedule your event." });
      setForm({ preferredDates: "", capacity: "", notes: "" });
      load();
    } catch (err) {
      setStatus({ tone: "error", text: err.message });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">Partner Dashboard</span>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mt-2">{user.name}</h1>
      <p className="text-[var(--color-ink-soft)] mt-1">Facilities: {user.facilities || "Not specified"}</p>

      <ThaliDivider label="Request a Food Drive" />

      <Card className="p-8 mt-6 max-w-xl">
        {status && <div className="mb-5"><Alert tone={status.tone}>{status.text}</Alert></div>}
        <form className="space-y-5" onSubmit={submit}>
          <Input
            label="Preferred dates"
            required
            placeholder="e.g. Any weekend in August"
            value={form.preferredDates}
            onChange={(e) => setForm({ ...form, preferredDates: e.target.value })}
          />
          <Input
            label="Capacity you can host"
            required
            placeholder="e.g. 150-200 people"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
          <Textarea
            label="Additional notes"
            rows={3}
            placeholder="Parking, kitchen access, timing preferences..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <Button type="submit">Submit request</Button>
        </form>
      </Card>

      <ThaliDivider label="My Requests" />

      {loading ? (
        <Loader />
      ) : requests.length === 0 ? (
        <p className="text-[var(--color-ink-soft)] mt-6">No requests submitted yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {requests.slice().reverse().map((r) => (
            <Card key={r.id} className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.preferredDates}</span>
                  <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                </div>
                <p className="text-xs text-[var(--color-ink-soft)] mt-1">Capacity: {r.capacity}</p>
                {r.notes && <p className="text-xs text-[var(--color-ink-soft)]">{r.notes}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
