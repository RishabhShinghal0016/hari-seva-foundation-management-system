import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { Card, Badge, Button, Loader } from "../../../components/ui";
import ThaliDivider from "../../../components/ThaliDivider";
import MapPreview from "../../../components/MapPreview";

const statusTone = { pending: "warning", verified: "success", rejected: "danger" };

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [expandedMap, setExpandedMap] = useState(null);

  const load = () => api.get("/donations").then(setDonations).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const verify = async (id, status) => {
    await api.put(`/donations/${id}/verify`, { status });
    load();
  };

  const filtered = filter === "all" ? donations : donations.filter((d) => d.status === filter);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="font-display text-2xl font-semibold">Donations</h2>
        <div className="flex gap-2">
          {["pending", "verified", "rejected", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                filter === f ? "bg-[var(--color-maroon)] text-white" : "bg-[var(--color-line)]/50 text-[var(--color-ink-soft)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ThaliDivider />

      {filtered.length === 0 ? (
        <p className="text-[var(--color-ink-soft)]">Nothing here.</p>
      ) : (
        <div className="space-y-3">
          {filtered.slice().reverse().map((d) => (
            <Card key={d.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {d.type === "money" ? `₹${d.amount.toLocaleString("en-IN")}` : `${d.quantity} ${d.unit} ${d.material}`}
                    </span>
                    <Badge tone={statusTone[d.status]}>{d.status}</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-ink-soft)] mt-1">
                    {d.donorName} &middot; {d.receiptNumber} &middot; {new Date(d.createdAt).toLocaleDateString("en-IN")}
                    {d.type === "money" && d.paymentMethod === "razorpay" && " · via Razorpay"}
                    {d.type === "money" && d.paymentMethod !== "razorpay" && d.transactionId && ` · TXN: ${d.transactionId}`}
                  </p>
                  {d.type === "money" && d.contactName && d.contactName !== d.donorName && (
                    <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">👤 Receipt name: {d.contactName}</p>
                  )}
                  {d.type === "material" && (
                    <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
                      👤 {d.contactName} &middot; 📍 {d.address} &middot; 🕒 {d.preferredTimeSlot}
                      {d.latitude && d.longitude && (
                        <>
                          {" "}
                          &middot;{" "}
                          <button
                            type="button"
                            onClick={() => setExpandedMap(expandedMap === d.id ? null : d.id)}
                            className="text-[var(--color-maroon)] font-semibold hover:underline"
                          >
                            {expandedMap === d.id ? "Hide map" : "Show map"}
                          </button>
                          {" "}
                          &middot;{" "}
                          <a
                            href={`https://www.google.com/maps?q=${d.latitude},${d.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--color-maroon)] font-semibold hover:underline"
                          >
                            Open in Google Maps
                          </a>
                        </>
                      )}
                    </p>
                  )}
                </div>
                {d.status === "pending" && (
                  <div className="flex gap-2">
                    <Button variant="subtle" onClick={() => verify(d.id, "verified")}>Verify</Button>
                    <Button variant="ghost" onClick={() => verify(d.id, "rejected")}>Reject</Button>
                  </div>
                )}
              </div>
              {expandedMap === d.id && d.latitude && d.longitude && (
                <div className="mt-4">
                  <MapPreview latitude={d.latitude} longitude={d.longitude} height={260} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
