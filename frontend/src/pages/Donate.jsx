import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api, SERVER_ORIGIN } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Card, Button, Input, Select, Alert } from "../components/ui";
import ThaliDivider from "../components/ThaliDivider";
import { getCurrentLocation, reverseGeocode } from "../lib/geolocation";
import MapPreview from "../components/MapPreview";

const amountOptions = [50, 100, 250, 500];

// Hourly pickup slots, e.g. "1:00 PM – 2:00 PM", covering a normal daytime window.
const timeSlots = Array.from({ length: 12 }, (_, i) => {
  const startHour24 = 8 + i; // 8 AM through 7 PM start times -> last slot ends 8 PM
  const format = (h24) => {
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:00 ${period}`;
  };
  return `${format(startHour24)} – ${format(startHour24 + 1)}`;
});

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Donate() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("type") === "material" ? "material" : "money");
  const [campaigns, setCampaigns] = useState([]);
  const [drives, setDrives] = useState([]);
  const [upi, setUpi] = useState(null);
  const [status, setStatus] = useState(null);
  const [payingWithRazorpay, setPayingWithRazorpay] = useState(false);

  const initialTarget = searchParams.get("drive")
    ? `drive:${searchParams.get("drive")}`
    : searchParams.get("campaign")
    ? `campaign:${searchParams.get("campaign")}`
    : "";

  const [money, setMoney] = useState({
    amount: 100,
    custom: "",
    target: initialTarget,
    contactName: "",
    transactionId: "",
  });
  const [material, setMaterial] = useState({
    target: initialTarget,
    material: "",
    quantity: "",
    unit: "",
    contactName: "",
    address: "",
    latitude: null,
    longitude: null,
    preferredTimeSlot: "",
  });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (!user?.name) return;
    setMoney((m) => (m.contactName ? m : { ...m, contactName: user.name }));
    setMaterial((m) => (m.contactName ? m : { ...m, contactName: user.name }));
  }, [user]);

  useEffect(() => {
    api.get("/campaigns").then((all) => setCampaigns(all.filter((c) => c.status !== "completed")));
    api.get("/food-drives").then((all) => setDrives(all.filter((d) => d.status !== "completed")));
    api.get("/donations/upi-details").then(setUpi);
  }, []);

  // Unified list of donation targets: campaigns and food drives, each tagged so we
  // know which id field (campaignId / driveId) to send to the backend.
  const targetOptions = useMemo(
    () => [
      ...campaigns.map((c) => ({ key: `campaign:${c.id}`, kind: "campaign", id: c.id, label: c.name, materials: c.requiredMaterials })),
      ...drives.map((d) => ({ key: `drive:${d.id}`, kind: "drive", id: d.id, label: `${d.name} (Food Drive)`, materials: d.requiredMaterials })),
    ],
    [campaigns, drives]
  );

  const materialTargetOptions = targetOptions.filter((t) => t.materials?.length);
  const selectedMaterialTarget = materialTargetOptions.find((t) => t.key === material.target);

  const parseTarget = (key) => {
    if (!key) return { campaignId: null, driveId: null };
    const [kind, id] = key.split(":");
    return kind === "drive" ? { campaignId: null, driveId: id } : { campaignId: id, driveId: null };
  };

  const submitMoney = async (e) => {
    e.preventDefault();
    setStatus(null);
    const amount = money.custom ? Number(money.custom) : money.amount;
    try {
      await api.post("/donations/money", {
        amount,
        ...parseTarget(money.target),
        contactName: money.contactName,
        transactionId: money.transactionId,
      });
      setStatus({ tone: "success", text: "Thank you! Your donation is recorded and pending admin verification." });
      setMoney({ amount: 100, custom: "", target: "", contactName: user?.name || "", transactionId: "" });
    } catch (err) {
      setStatus({ tone: "error", text: err.message });
    }
  };

  const payWithRazorpay = async () => {
    setStatus(null);
    const amount = money.custom ? Number(money.custom) : money.amount;
    if (!amount || amount < 1) {
      setStatus({ tone: "error", text: "Enter a valid amount first." });
      return;
    }
    if (!money.contactName) {
      setStatus({ tone: "error", text: "Please enter your name first." });
      return;
    }
    setPayingWithRazorpay(true);
    try {
      const order = await api.post("/donations/razorpay/order", { amount });
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) throw new Error("Could not load the Razorpay checkout. Check your connection and try again.");

      const target = parseTarget(money.target);
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Hari Seva Foundation",
        description: "Donation",
        order_id: order.orderId,
        prefill: { name: money.contactName || user.name, email: user.email },
        theme: { color: "#7A1F35" },
        handler: async (response) => {
          try {
            await api.post("/donations/razorpay/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount,
              contactName: money.contactName,
              ...target,
            });
            setStatus({ tone: "success", text: "Payment successful — thank you! Your donation has been verified automatically." });
          } catch (err) {
            setStatus({ tone: "error", text: err.message });
          }
        },
        modal: { ondismiss: () => setPayingWithRazorpay(false) },
      });
      rzp.on("payment.failed", () => setStatus({ tone: "error", text: "Payment failed or was cancelled." }));
      rzp.open();
    } catch (err) {
      setStatus({ tone: "error", text: err.message });
    } finally {
      setPayingWithRazorpay(false);
    }
  };

  const useMyLocation = async () => {
    setLocationError("");
    setLocating(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const address = await reverseGeocode(latitude, longitude);
      setMaterial((m) => ({ ...m, address, latitude, longitude }));
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setLocating(false);
    }
  };

  const submitMaterial = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      await api.post("/donations/material", {
        ...parseTarget(material.target),
        material: material.material,
        quantity: material.quantity,
        unit: material.unit,
        contactName: material.contactName,
        address: material.address,
        latitude: material.latitude,
        longitude: material.longitude,
        preferredTimeSlot: material.preferredTimeSlot,
      });
      setStatus({ tone: "success", text: "Thank you! Our team will reach out to arrange pickup at your preferred time." });
      setMaterial({ target: "", material: "", quantity: "", unit: "", contactName: user?.name || "", address: "", latitude: null, longitude: null, preferredTimeSlot: "" });
    } catch (err) {
      setStatus({ tone: "error", text: err.message });
    }
  };

  if (!user || user.role !== "donor") {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">Donate</span>
        <h1 className="font-display text-3xl font-semibold mt-3">Log in as a donor to give</h1>
        <p className="text-[var(--color-ink-soft)] mt-3">
          We ask you to log in so your donation history, receipts and certificates are kept safely in one place.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/login"><Button>Log in</Button></Link>
          <Link to="/register"><Button variant="ghost">Create donor account</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">Donate</span>
      <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3">Give money or materials</h1>

      <div className="flex gap-2 mt-8">
        <button
          onClick={() => setMode("money")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${mode === "money" ? "bg-[var(--color-maroon)] text-white" : "bg-[var(--color-line)]/50 text-[var(--color-ink-soft)]"}`}
        >
          Monetary donation
        </button>
        <button
          onClick={() => setMode("material")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${mode === "material" ? "bg-[var(--color-maroon)] text-white" : "bg-[var(--color-line)]/50 text-[var(--color-ink-soft)]"}`}
        >
          Raw material donation
        </button>
      </div>

      <ThaliDivider />

      {status && <div className="mb-6"><Alert tone={status.tone}>{status.text}</Alert></div>}

      {mode === "money" ? (
        <Card className="p-8">
          <div className="grid sm:grid-cols-[1fr_auto] gap-8">
            <form className="space-y-5" onSubmit={submitMoney}>
              <div>
                <span className="block text-sm font-medium text-[var(--color-ink-soft)] mb-2">1. Select amount</span>
                <div className="flex flex-wrap gap-2">
                  {amountOptions.map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => setMoney({ ...money, amount: a, custom: "" })}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        money.amount === a && !money.custom
                          ? "bg-[var(--color-marigold)] border-[var(--color-marigold)] text-[var(--color-ink)]"
                          : "border-[var(--color-line)] hover:border-[var(--color-marigold)]"
                      }`}
                    >
                      ₹{a}
                    </button>
                  ))}
                </div>
                <Input
                  className="mt-3"
                  placeholder="Or enter a custom amount (₹)"
                  type="number"
                  min="10"
                  value={money.custom}
                  onChange={(e) => setMoney({ ...money, custom: e.target.value })}
                />
              </div>

              <Select label="Campaign or food drive (optional)" value={money.target} onChange={(e) => setMoney({ ...money, target: e.target.value })}>
                <option value="">General fund</option>
                {targetOptions.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </Select>

              <Input
                label="Your name"
                required
                placeholder="Name for the receipt"
                value={money.contactName}
                onChange={(e) => setMoney({ ...money, contactName: e.target.value })}
              />

              {upi?.razorpayEnabled && (
                <div>
                  <span className="block text-sm font-medium text-[var(--color-ink-soft)] mb-2">
                    Pay instantly with card, UPI app, netbanking or wallet
                  </span>
                  <Button type="button" variant="primary" className="w-full" disabled={payingWithRazorpay} onClick={payWithRazorpay}>
                    {payingWithRazorpay ? "Opening checkout..." : "Pay with Razorpay"}
                  </Button>
                </div>
              )}

              <div className={upi?.razorpayEnabled ? "pt-2 border-t border-[var(--color-line)]" : ""}>
                <span className="block text-sm font-medium text-[var(--color-ink-soft)] mb-2 mt-4">
                  {upi?.razorpayEnabled ? "Or scan the QR and enter your transaction ID manually" : "2. Scan the QR code → complete payment"}
                </span>
                <span className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5 mt-4">Enter your UPI transaction ID</span>
                <Input required placeholder="e.g. UPI2026081099" value={money.transactionId} onChange={(e) => setMoney({ ...money, transactionId: e.target.value })} />
              </div>

              <Button type="submit" className="w-full">Submit donation details</Button>
              {!upi?.razorpayEnabled && (
                <p className="text-xs text-[var(--color-ink-soft)]">
                  Want to pay by card or netbanking instead? Ask the foundation to enable Razorpay.
                </p>
              )}
            </form>

            <div className="flex flex-col items-center justify-start gap-3 pt-8 sm:pt-0">
              <div className="bg-white p-3 rounded-2xl border border-[var(--color-line)]">
                <img src={`${SERVER_ORIGIN}${upi?.qrImage || ""}`} alt="UPI QR code for donation" className="w-40 h-40 object-contain" />
              </div>
              <p className="text-xs text-[var(--color-ink-soft)] text-center">Scan to donate</p>
              <p className="font-mono-num text-sm font-semibold text-[var(--color-maroon)] break-all text-center">{upi?.upiId}</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8">
          <form className="space-y-5" onSubmit={submitMaterial}>
            <Select
              label="Campaign or food drive"
              required
              value={material.target}
              onChange={(e) => setMaterial({ ...material, target: e.target.value, material: "", unit: "" })}
            >
              <option value="">Select where this is needed</option>
              {materialTargetOptions.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </Select>

            {selectedMaterialTarget && (
              <Select
                label="Material"
                required
                value={material.material}
                onChange={(e) => {
                  const req = selectedMaterialTarget.materials.find((m) => m.item === e.target.value);
                  setMaterial({ ...material, material: e.target.value, unit: req?.unit || "" });
                }}
              >
                <option value="">Select a material</option>
                {selectedMaterialTarget.materials.map((m) => (
                  <option key={m.item} value={m.item}>
                    {m.item} — {Math.max(0, m.required - m.received)} {m.unit} still needed
                  </option>
                ))}
              </Select>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <Input label="Quantity" type="number" min="1" required value={material.quantity} onChange={(e) => setMaterial({ ...material, quantity: e.target.value })} />
              <Input label="Unit" required value={material.unit} onChange={(e) => setMaterial({ ...material, unit: e.target.value })} placeholder="KG, Litres, Pieces..." />
            </div>

            <Input
              label="Your name"
              required
              placeholder="Who should we contact / ask for at pickup?"
              value={material.contactName}
              onChange={(e) => setMaterial({ ...material, contactName: e.target.value })}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="block text-sm font-medium text-[var(--color-ink-soft)]">Pickup address</span>
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  className="text-xs font-semibold text-[var(--color-maroon)] hover:underline disabled:opacity-50 disabled:cursor-wait flex items-center gap-1"
                >
                  📍 {locating ? "Locating..." : "Use my current location"}
                </button>
              </div>
              <Input
                required
                placeholder="Where should we collect this from?"
                value={material.address}
                onChange={(e) => setMaterial({ ...material, address: e.target.value, latitude: null, longitude: null })}
              />
              {material.latitude && (
                <div className="mt-2.5 space-y-2">
                  <p className="text-xs text-[var(--color-leaf)]">✓ Location pinned — this helps our pickup team find your exact house in Bareilly.</p>
                  <MapPreview latitude={material.latitude} longitude={material.longitude} />
                </div>
              )}
              {locationError && <p className="text-xs text-[var(--color-maroon)] mt-1.5">{locationError}</p>}
            </div>

            <Select
              label="Time slot you're available"
              required
              value={material.preferredTimeSlot}
              onChange={(e) => setMaterial({ ...material, preferredTimeSlot: e.target.value })}
            >
              <option value="">Select a time slot</option>
              {timeSlots.map((slot) => <option key={slot}>{slot}</option>)}
            </Select>

            <Button type="submit" className="w-full">Pledge this donation</Button>
            <p className="text-xs text-[var(--color-ink-soft)]">
              Our team will confirm pickup within your selected time slot. Once handed over, an admin verifies the
              donation and updates inventory automatically.
            </p>
          </form>
        </Card>
      )}
    </div>
  );
}
