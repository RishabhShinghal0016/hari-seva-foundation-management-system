import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { Card, Badge, Button, Input, Textarea, Select, Loader, Alert, ProgressBar } from "../../../components/ui";
import ThaliDivider from "../../../components/ThaliDivider";

const emptyMaterialRow = { item: "", required: "", unit: "" };
const emptyForm = {
  name: "",
  description: "",
  date: "",
  time: "",
  location: "",
  address: "",
  mapsLink: "",
  volunteersRequired: "",
  targetMeals: "",
  campaignId: "",
  targetAmount: "",
};
const statusTone = { upcoming: "warning", ongoing: "success", completed: "default" };

export default function AdminFoodDrives() {
  const [drives, setDrives] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [materialRows, setMaterialRows] = useState([{ ...emptyMaterialRow }]);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [newMaterial, setNewMaterial] = useState({ item: "", required: "", unit: "" });

  const load = () =>
    Promise.all([api.get("/food-drives"), api.get("/campaigns")]).then(([d, c]) => {
      setDrives(d);
      setCampaigns(c);
      setLoading(false);
    });
  useEffect(() => { load(); }, []);

  const updateRow = (idx, field, value) => {
    setMaterialRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };
  const addRow = () => setMaterialRows((rows) => [...rows, { ...emptyMaterialRow }]);
  const removeRow = (idx) => setMaterialRows((rows) => rows.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const requiredMaterials = materialRows
        .filter((r) => r.item && r.required)
        .map((r) => ({ item: r.item, required: Number(r.required), received: 0, unit: r.unit }));

      await api.post("/food-drives", {
        ...form,
        volunteersRequired: Number(form.volunteersRequired),
        targetMeals: Number(form.targetMeals),
        targetAmount: Number(form.targetAmount) || 0,
        campaignId: form.campaignId || null,
        requiredMaterials,
      });
      setForm(emptyForm);
      setMaterialRows([{ ...emptyMaterialRow }]);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/food-drives/${id}`, { status });
    load();
  };

  const updateMeals = async (id, mealsDistributed) => {
    await api.put(`/food-drives/${id}`, { mealsDistributed: Number(mealsDistributed) });
    load();
  };

  const updateTargetAmount = async (id, targetAmount) => {
    await api.put(`/food-drives/${id}`, { targetAmount: Number(targetAmount) });
    load();
  };

  const addMaterialNeed = async (drive) => {
    if (!newMaterial.item || !newMaterial.required) return;
    const requiredMaterials = [
      ...(drive.requiredMaterials || []),
      { item: newMaterial.item, required: Number(newMaterial.required), received: 0, unit: newMaterial.unit },
    ];
    await api.put(`/food-drives/${drive.id}`, { requiredMaterials });
    setNewMaterial({ item: "", required: "", unit: "" });
    load();
  };

  const removeMaterialNeed = async (drive, item) => {
    const requiredMaterials = (drive.requiredMaterials || []).filter((m) => m.item !== item);
    await api.put(`/food-drives/${drive.id}`, { requiredMaterials });
    load();
  };

  const respondVolunteer = async (driveId, userId, status) => {
    await api.put(`/food-drives/${driveId}/volunteers/${userId}`, { status });
    load();
  };

  const checkIn = async (driveId, userId) => {
    const hours = prompt("Hours worked at this event?", "4");
    if (hours === null) return;
    await api.post(`/food-drives/${driveId}/attendance`, { userId, hoursWorked: Number(hours) });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this food drive?")) return;
    await api.del(`/food-drives/${id}`);
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-semibold">Food Drives</h2>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "+ New food drive"}</Button>
      </div>

      {showForm && (
        <Card className="p-6 mt-5">
          {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
          <form className="space-y-4" onSubmit={submit}>
            <Input label="Drive name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea label="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Select label="Linked campaign (optional)" value={form.campaignId} onChange={(e) => setForm({ ...form, campaignId: e.target.value })}>
              <option value="">None</option>
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Input label="Time" placeholder="10:00 AM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <Input label="Complete address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <Input label="Google Maps link" value={form.mapsLink} onChange={(e) => setForm({ ...form, mapsLink: e.target.value })} />
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Volunteers required" type="number" min="0" value={form.volunteersRequired} onChange={(e) => setForm({ ...form, volunteersRequired: e.target.value })} />
              <Input label="Target meals" type="number" min="0" value={form.targetMeals} onChange={(e) => setForm({ ...form, targetMeals: e.target.value })} />
              <Input label="Fund target (₹)" type="number" min="0" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
            </div>

            <div>
              <span className="block text-sm font-medium text-[var(--color-ink-soft)] mb-2">
                Raw materials needed for this drive
              </span>
              <div className="space-y-2">
                {materialRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_100px_100px_auto] gap-2 items-end">
                    <Input placeholder="e.g. Rice" value={row.item} onChange={(e) => updateRow(idx, "item", e.target.value)} />
                    <Input placeholder="Qty" type="number" min="0" value={row.required} onChange={(e) => updateRow(idx, "required", e.target.value)} />
                    <Input placeholder="Unit" value={row.unit} onChange={(e) => updateRow(idx, "unit", e.target.value)} />
                    <Button type="button" variant="ghost" onClick={() => removeRow(idx)}>✕</Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="subtle" className="mt-2" onClick={addRow}>+ Add material</Button>
            </div>

            <Button type="submit">Create food drive</Button>
          </form>
        </Card>
      )}

      <ThaliDivider />

      <div className="space-y-3">
        {drives.map((d) => (
          <Card key={d.id} className="p-5">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{d.name}</h3>
                  <Badge tone={statusTone[d.status]}>{d.status}</Badge>
                </div>
                <p className="text-xs text-[var(--color-ink-soft)] mt-1">
                  {new Date(d.date).toLocaleDateString("en-IN")} &middot; {d.location} &middot; {(d.assignedVolunteers || []).length}/{d.volunteersRequired} volunteers
                  {d.targetAmount > 0 && <> &middot; ₹{(d.raisedAmount || 0).toLocaleString("en-IN")} of ₹{d.targetAmount.toLocaleString("en-IN")}</>}
                </p>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <select
                  className="text-sm border border-[var(--color-line)] rounded-lg px-2 py-1"
                  value={d.status}
                  onChange={(e) => updateStatus(d.id, e.target.value)}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
                <input
                  type="number"
                  defaultValue={d.mealsDistributed}
                  onBlur={(e) => e.target.value !== String(d.mealsDistributed) && updateMeals(d.id, e.target.value)}
                  className="w-24 text-sm border border-[var(--color-line)] rounded-lg px-2 py-1"
                  title="Meals distributed"
                />
                <Button variant="subtle" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
                  {expanded === d.id ? "Hide" : "Details"}
                </Button>
                <Button variant="ghost" onClick={() => remove(d.id)}>Delete</Button>
              </div>
            </div>

            {expanded === d.id && (
              <div className="mt-4 pt-4 border-t border-[var(--color-line)] grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">Volunteers</h4>
                  {(d.assignedVolunteers || []).length === 0 ? (
                    <p className="text-sm text-[var(--color-ink-soft)]">No volunteers have requested to join yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {d.assignedVolunteers.map((v) => (
                        <div key={v.userId} className="flex flex-wrap items-center justify-between gap-2 text-sm bg-[var(--color-bg)] rounded-lg px-3 py-2">
                          <span>
                            {v.name} &middot; <Badge tone={v.status === "approved" ? "success" : v.status === "rejected" ? "danger" : "warning"}>{v.status}</Badge>
                            {v.checkInTime && <span className="text-xs text-[var(--color-ink-soft)]"> &middot; checked in, {v.hoursWorked}h</span>}
                          </span>
                          <div className="flex gap-2">
                            {v.status === "pending" && (
                              <>
                                <Button variant="subtle" onClick={() => respondVolunteer(d.id, v.userId, "approved")}>Approve</Button>
                                <Button variant="ghost" onClick={() => respondVolunteer(d.id, v.userId, "rejected")}>Reject</Button>
                              </>
                            )}
                            {v.status === "approved" && !v.checkInTime && (
                              <Button variant="subtle" onClick={() => checkIn(d.id, v.userId)}>Mark attendance</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">Materials & Funds</h4>

                  <label className="flex items-center gap-2 text-sm mb-3">
                    <span className="text-[var(--color-ink-soft)]">Fund target (₹)</span>
                    <input
                      type="number"
                      defaultValue={d.targetAmount || 0}
                      onBlur={(e) => e.target.value !== String(d.targetAmount || 0) && updateTargetAmount(d.id, e.target.value)}
                      className="w-28 border border-[var(--color-line)] rounded-lg px-2 py-1"
                    />
                  </label>

                  {(d.requiredMaterials || []).length === 0 ? (
                    <p className="text-sm text-[var(--color-ink-soft)] mb-2">No material requirements set for this drive.</p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {d.requiredMaterials.map((m) => (
                        <div key={m.item} className="bg-[var(--color-bg)] rounded-lg px-3 py-2">
                          <div className="flex justify-between items-center text-sm">
                            <span>{m.item}</span>
                            <span className="font-mono-num text-xs text-[var(--color-ink-soft)]">
                              {m.received}/{m.required} {m.unit}
                              <button onClick={() => removeMaterialNeed(d, m.item)} className="ml-2 text-[var(--color-maroon)]">✕</button>
                            </span>
                          </div>
                          <div className="mt-1"><ProgressBar value={m.received} max={m.required} colorVar="--color-leaf" /></div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-[1fr_70px_70px_auto] gap-2 items-end">
                    <Input placeholder="Material" value={newMaterial.item} onChange={(e) => setNewMaterial({ ...newMaterial, item: e.target.value })} />
                    <Input placeholder="Qty" type="number" min="0" value={newMaterial.required} onChange={(e) => setNewMaterial({ ...newMaterial, required: e.target.value })} />
                    <Input placeholder="Unit" value={newMaterial.unit} onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })} />
                    <Button type="button" variant="subtle" onClick={() => addMaterialNeed(d)}>Add</Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
