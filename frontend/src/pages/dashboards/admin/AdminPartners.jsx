import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { Card, Badge, Button, Loader } from "../../../components/ui";
import ThaliDivider from "../../../components/ThaliDivider";

const statusTone = { pending: "warning", approved: "success", rejected: "danger" };

export default function AdminPartners() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/partners/requests").then(setRequests).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    await api.put(`/partners/requests/${id}`, { status });
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Partner Collaboration Requests</h2>
      <ThaliDivider />

      {requests.length === 0 ? (
        <p className="text-[var(--color-ink-soft)]">No partner requests yet.</p>
      ) : (
        <div className="space-y-3">
          {requests.slice().reverse().map((r) => (
            <Card key={r.id} className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.partnerName}</span>
                  <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                </div>
                <p className="text-xs text-[var(--color-ink-soft)] mt-1">
                  Dates: {r.preferredDates} &middot; Capacity: {r.capacity}
                </p>
                {r.notes && <p className="text-xs text-[var(--color-ink-soft)]">{r.notes}</p>}
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <Button variant="subtle" onClick={() => respond(r.id, "approved")}>Approve</Button>
                  <Button variant="ghost" onClick={() => respond(r.id, "rejected")}>Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
