import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { Card, Button, Input, Loader, Alert } from "../../../components/ui";
import ThaliDivider from "../../../components/ThaliDivider";

const FIELDS = [
  { key: "mealsServed", label: "Meals Served", icon: "🍚" },
  { key: "schoolKitsDelivered", label: "School Kits Delivered", icon: "🎒" },
  { key: "foodDrivesConducted", label: "Food Drives Conducted", icon: "🍛" },
  { key: "totalVolunteers", label: "Total Volunteers", icon: "🙋" },
  { key: "totalDonors", label: "Total Donors", icon: "🤝" },
  { key: "locationsCovered", label: "Locations Covered", icon: "📍" },
  { key: "peopleSupported", label: "People Supported", icon: "❤️" },
];

export default function AdminImpact() {
  const [calculated, setCalculated] = useState(null);
  const [overrides, setOverridesState] = useState({});
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const load = () =>
    api.get("/admin/impact-settings").then((data) => {
      setCalculated(data.calculated);
      setOverridesState(data.overrides);
      const initial = {};
      FIELDS.forEach((f) => {
        initial[f.key] = data.overrides[f.key] ?? "";
      });
      setValues(initial);
      setLoading(false);
    });

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const data = await api.put("/admin/impact-settings", values);
      setCalculated(data.calculated);
      setOverridesState(data.overrides);
      setStatus({ tone: "success", text: "Saved — the homepage now reflects these numbers." });
    } catch (err) {
      setStatus({ tone: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const clearField = (key) => {
    setValues((v) => ({ ...v, [key]: "" }));
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Impact Numbers</h2>
      <p className="text-sm text-[var(--color-ink-soft)] mt-1 max-w-2xl">
        These are the numbers shown on the homepage's Impact section. By default they're calculated live from real
        data (food drives, donations, registered users). Set a number below to override it directly — leave it blank
        to go back to the calculated value.
      </p>

      <ThaliDivider />

      {status && <div className="mb-5"><Alert tone={status.tone}>{status.text}</Alert></div>}

      <Card className="p-6 max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          {FIELDS.map((f) => {
            const isOverridden = overrides[f.key] !== undefined && overrides[f.key] !== null && overrides[f.key] !== "";
            return (
              <div key={f.key} className="flex items-center gap-3">
                <span className="w-8 text-center text-lg" aria-hidden="true">{f.icon}</span>
                <span className="flex-1 text-sm font-medium">{f.label}</span>
                <span className="text-xs font-mono-num text-[var(--color-ink-soft)] w-20 text-right">
                  calc: {calculated[f.key]?.toLocaleString("en-IN")}
                </span>
                <Input
                  type="number"
                  min="0"
                  placeholder="auto"
                  value={values[f.key]}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  className="w-28 py-1.5"
                />
                {isOverridden && (
                  <button
                    type="button"
                    onClick={() => clearField(f.key)}
                    className="text-xs text-[var(--color-maroon)] font-semibold whitespace-nowrap"
                    title="Clear override, go back to calculated value"
                  >
                    Reset
                  </button>
                )}
              </div>
            );
          })}

          <Button type="submit" disabled={saving} className="mt-2">
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
