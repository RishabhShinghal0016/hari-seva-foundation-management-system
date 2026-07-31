import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { Card, Badge, Button, Input, Textarea, Select, Loader, Alert } from "../../../components/ui";
import ThaliDivider from "../../../components/ThaliDivider";

const emptyForm = { name: "", description: "", startDate: "", endDate: "", location: "", targetAmount: "", status: "upcoming" };
const statusTone = { active: "success", upcoming: "warning", completed: "default" };

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => api.get("/campaigns").then(setCampaigns).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/campaigns", { ...form, targetAmount: Number(form.targetAmount) });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/campaigns/${id}`, { status });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    await api.del(`/campaigns/${id}`);
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-semibold">Campaigns</h2>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "+ New campaign"}</Button>
      </div>

      {showForm && (
        <Card className="p-6 mt-5">
          {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
          <form className="space-y-4" onSubmit={submit}>
            <Input label="Campaign name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Start date" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              <Input label="End date" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <Input label="Target amount (₹)" type="number" min="0" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
            </div>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </Select>
            <Button type="submit">Create campaign</Button>
          </form>
        </Card>
      )}

      <ThaliDivider />

      <div className="space-y-3">
        {campaigns.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                </div>
                <p className="text-xs text-[var(--color-ink-soft)] mt-1">
                  ₹{c.raisedAmount.toLocaleString("en-IN")} of ₹{c.targetAmount.toLocaleString("en-IN")} &middot; {c.location}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <select
                  className="text-sm border border-[var(--color-line)] rounded-lg px-2 py-1"
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <Button variant="ghost" onClick={() => remove(c.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
