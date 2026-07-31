import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { Card, Badge, Button, Input, Select, Loader } from "../../../components/ui";
import ThaliDivider from "../../../components/ThaliDivider";

const emptyForm = { item: "", category: "Food", unit: "", quantity: "", lowStockThreshold: "10" };

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get("/inventory").then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/inventory", { ...form, quantity: Number(form.quantity), lowStockThreshold: Number(form.lowStockThreshold) });
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  const useStock = async (id) => {
    const qty = prompt("How much stock was used?", "1");
    if (qty === null) return;
    await api.post(`/inventory/${id}/use`, { quantity: Number(qty) });
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-semibold">Inventory</h2>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "+ Add item"}</Button>
      </div>

      {showForm && (
        <Card className="p-6 mt-5">
          <form className="space-y-4" onSubmit={submit}>
            <Input label="Item name" required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Food</option>
              <option>School Supplies</option>
              <option>Winter Supplies</option>
              <option>Other</option>
            </Select>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Quantity" type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              <Input label="Unit" placeholder="KG, Pieces..." value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              <Input label="Low stock threshold" type="number" min="0" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
            </div>
            <Button type="submit">Add item</Button>
          </form>
        </Card>
      )}

      <ThaliDivider />

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((i) => (
          <Card key={i.id} className="p-5 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{i.item}</span>
                {i.lowStock && <Badge tone="danger">Low stock</Badge>}
              </div>
              <p className="text-xs text-[var(--color-ink-soft)] mt-1">{i.category}</p>
              <p className="font-mono-num text-lg mt-1">{i.quantity} {i.unit}</p>
            </div>
            <Button variant="subtle" onClick={() => useStock(i.id)}>Use stock</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
