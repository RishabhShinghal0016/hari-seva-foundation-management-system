import { useEffect, useState } from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { api } from "../../lib/api";
import { Card, Loader } from "../../components/ui";
import ThaliDivider from "../../components/ThaliDivider";
import AdminCampaigns from "./admin/AdminCampaigns";
import AdminFoodDrives from "./admin/AdminFoodDrives";
import AdminDonations from "./admin/AdminDonations";
import AdminInventory from "./admin/AdminInventory";
import AdminPartners from "./admin/AdminPartners";
import AdminReports from "./admin/AdminReports";
import AdminImpact from "./admin/AdminImpact";

const tabs = [
  { to: "", label: "Overview", end: true },
  { to: "campaigns", label: "Campaigns" },
  { to: "food-drives", label: "Food Drives" },
  { to: "donations", label: "Donations" },
  { to: "inventory", label: "Inventory" },
  { to: "partners", label: "Partner Requests" },
  { to: "impact", label: "Impact Numbers" },
  { to: "reports", label: "Reports" },
];

const PIE_COLORS = ["#E8A230", "#7A1F35", "#4A6B3C"];

function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(setStats);
  }, []);

  if (!stats) return <Loader />;

  const cards = [
    { label: "Total Donations", value: `₹${stats.totalDonations.toLocaleString("en-IN")}` },
    { label: "Total Donors", value: stats.totalDonors },
    { label: "Total Volunteers", value: stats.totalVolunteers },
    { label: "Total Partners", value: stats.totalPartners },
    { label: "Food Drives Held", value: stats.totalFoodDrives },
    { label: "Meals Served", value: stats.mealsServed },
    { label: "Active Campaigns", value: stats.activeCampaigns },
    { label: "Low Stock Items", value: stats.lowStockItems },
  ];

  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="font-mono-num text-2xl font-semibold text-[var(--color-maroon)]">{c.value}</div>
            <div className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)] mt-1">{c.label}</div>
          </Card>
        ))}
      </div>

      {(stats.pendingDonations > 0 || stats.pendingPartnerRequests > 0) && (
        <Card className="p-5 mt-6 border-[var(--color-marigold)]">
          <p className="text-sm font-semibold">
            ⚠️ {stats.pendingDonations} donation{stats.pendingDonations !== 1 ? "s" : ""} and{" "}
            {stats.pendingPartnerRequests} partner request{stats.pendingPartnerRequests !== 1 ? "s" : ""} need your review.
          </p>
        </Card>
      )}

      <ThaliDivider label="Funds Raised by Campaign" />
      <Card className="p-6 mt-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.donationsByCampaign}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6D8BE" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="raised" fill="#E8A230" name="Raised (₹)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="target" fill="#7A1F35" name="Target (₹)" radius={[6, 6, 0, 0]} fillOpacity={0.25} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Food Drive Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.driveStatusBreakdown} dataKey="count" nameKey="status" outerRadius={80} label>
                {stats.driveStatusBreakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Monthly Donations</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthlyDonations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6D8BE" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="amount" fill="#4A6B3C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">Admin Dashboard</span>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mt-2">Hari Seva Foundation Control Center</h1>

      <div className="flex gap-1.5 mt-8 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive ? "bg-[var(--color-maroon)] text-white" : "bg-[var(--color-line)]/50 text-[var(--color-ink-soft)] hover:bg-[var(--color-line)]"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-8">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="food-drives" element={<AdminFoodDrives />} />
          <Route path="donations" element={<AdminDonations />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="impact" element={<AdminImpact />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </div>
    </div>
  );
}
