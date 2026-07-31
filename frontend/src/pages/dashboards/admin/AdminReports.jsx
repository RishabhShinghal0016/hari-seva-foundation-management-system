import { api } from "../../../lib/api";
import { Card, Button } from "../../../components/ui";
import ThaliDivider from "../../../components/ThaliDivider";

const reports = [
  { type: "donations", label: "Donation Report", desc: "All donation records with donor, type, amount and status." },
  { type: "food-drives", label: "Food Drive Report", desc: "Every food drive with meals targeted vs distributed." },
  { type: "volunteers", label: "Volunteer Report", desc: "Volunteer roster with events and hours served." },
  { type: "inventory", label: "Inventory Report", desc: "Current stock levels across all tracked items." },
];

export default function AdminReports() {
  const download = (type) => api.downloadCsv(`/admin/reports/${type}`, `${type}-report.csv`);

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Reports</h2>
      <p className="text-sm text-[var(--color-ink-soft)] mt-1">Export CSV reports, ready to open in Excel or Google Sheets.</p>
      <ThaliDivider />

      <div className="grid sm:grid-cols-2 gap-4">
        {reports.map((r) => (
          <Card key={r.type} className="p-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">{r.label}</h3>
              <p className="text-xs text-[var(--color-ink-soft)] mt-1">{r.desc}</p>
            </div>
            <Button variant="subtle" onClick={() => download(r.type)}>Download CSV</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
