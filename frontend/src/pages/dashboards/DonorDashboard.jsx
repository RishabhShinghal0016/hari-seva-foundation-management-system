import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { Card, Badge, Button, Loader } from "../../components/ui";
import ThaliDivider from "../../components/ThaliDivider";

const statusTone = { pending: "warning", verified: "success", rejected: "danger" };

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/donations").then(setDonations).finally(() => setLoading(false));
  }, []);

  const verified = donations.filter((d) => d.status === "verified");
  const totalMoney = verified.filter((d) => d.type === "money").reduce((sum, d) => sum + d.amount, 0);
  const materialCount = verified.filter((d) => d.type === "material").length;

  const downloadReceipt = (d) => {
    const text = `HARI SEVA FOUNDATION\nOfficial Donation Receipt\n\nReceipt No: ${d.receiptNumber}\nDonor: ${d.donorName}\nDate: ${new Date(d.createdAt).toLocaleDateString("en-IN")}\nType: ${d.type === "money" ? "Monetary" : "Raw Material"}\n${
      d.type === "money"
        ? `Amount: Rs. ${d.amount}\nReceipt name: ${d.contactName || d.donorName}\nPayment method: ${d.paymentMethod === "razorpay" ? "Razorpay" : "UPI (manual)"}\nTransaction/Payment ID: ${d.transactionId}`
        : `Material: ${d.quantity} ${d.unit} ${d.material}\nContact: ${d.contactName || d.donorName}\nPickup address: ${d.address || "-"}\nAvailable: ${d.preferredTimeSlot || "-"}`
    }\nStatus: ${d.status.toUpperCase()}\n\nThank you for your seva.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${d.receiptNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">Donor Dashboard</span>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mt-2">Welcome back, {user.name.split(" ")[0]}</h1>

      <div className="grid sm:grid-cols-3 gap-5 mt-8">
        <Card className="p-6">
          <div className="font-mono-num text-2xl font-semibold text-[var(--color-maroon)]">₹{totalMoney.toLocaleString("en-IN")}</div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)] mt-1">Total donated</div>
        </Card>
        <Card className="p-6">
          <div className="font-mono-num text-2xl font-semibold text-[var(--color-maroon)]">{materialCount}</div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)] mt-1">Material donations</div>
        </Card>
        <Card className="p-6">
          <div className="font-mono-num text-2xl font-semibold text-[var(--color-maroon)]">{donations.filter((d) => d.status === "pending").length}</div>
          <div className="text-xs uppercase tracking-wide text-[var(--color-ink-soft)] mt-1">Pending verification</div>
        </Card>
      </div>

      <div className="flex gap-3 mt-8">
        <Link to="/donate"><Button>Make a new donation</Button></Link>
        <Link to="/campaigns"><Button variant="ghost">Browse campaigns</Button></Link>
      </div>

      <ThaliDivider label="Donation History" />

      {loading ? (
        <Loader />
      ) : donations.length === 0 ? (
        <p className="text-[var(--color-ink-soft)] mt-6">You haven't made any donations yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {donations
            .slice()
            .reverse()
            .map((d) => (
              <Card key={d.id} className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{d.type === "money" ? `₹${d.amount.toLocaleString("en-IN")}` : `${d.quantity} ${d.unit} ${d.material}`}</span>
                    <Badge tone={statusTone[d.status]}>{d.status}</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-ink-soft)] mt-1 font-mono-num">
                    {d.receiptNumber} &middot; {new Date(d.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                {d.status === "verified" && (
                  <Button variant="subtle" onClick={() => downloadReceipt(d)}>Download receipt</Button>
                )}
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
