import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Card, Input, Select, Textarea, Button, Alert } from "../components/ui";
import ThaliDivider from "../components/ThaliDivider";
import GoogleSignInButton from "../components/GoogleSignInButton";

const roleToDashboard = {
  donor: "/dashboard/donor",
  volunteer: "/dashboard/volunteer",
  partner: "/dashboard/partner",
};

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  role: "donor",
  address: "",
  skills: "",
  availability: "",
  facilities: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(roleToDashboard[user.role], { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-20">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">Join the seva</span>
      <h1 className="font-display text-3xl font-semibold mt-2">Create your account</h1>
      <ThaliDivider />

      <Card className="p-8 mt-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <Alert tone="error">{error}</Alert>}

          <Select label="I want to join as a" value={form.role} onChange={update("role")}>
            <option value="donor">Donor</option>
            <option value="volunteer">Volunteer</option>
            <option value="partner">Food Drive Partner</option>
          </Select>

          <div>
            <GoogleSignInButton
              role={form.role}
              onSuccess={(user) => navigate(roleToDashboard[user.role], { replace: true })}
              onError={(msg) => setError(msg)}
              dividerLabel="or sign up with email"
            />
          </div>

          <Input label="Full name" required value={form.name} onChange={update("name")} />
          <div className="grid sm:grid-cols-2 gap-5">
            <Input label="Email" type="email" required value={form.email} onChange={update("email")} />
            <Input label="Mobile number" required value={form.mobile} onChange={update("mobile")} />
          </div>
          <Input label="Password" type="password" required minLength={6} value={form.password} onChange={update("password")} />

          {form.role === "volunteer" && (
            <>
              <Input label="Address" value={form.address} onChange={update("address")} placeholder="City, area" />
              <div className="grid sm:grid-cols-2 gap-5">
                <Input label="Skills" value={form.skills} onChange={update("skills")} placeholder="e.g. Cooking, Logistics" />
                <Input label="Availability" value={form.availability} onChange={update("availability")} placeholder="e.g. Weekends" />
              </div>
            </>
          )}

          {form.role === "partner" && (
            <>
              <Input label="Organization address" value={form.address} onChange={update("address")} />
              <Textarea label="Available facilities" value={form.facilities} onChange={update("facilities")} placeholder="e.g. Kitchen, Hall for 200, Parking" rows={3} />
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-[var(--color-ink-soft)] mt-6">
        Already registered? <Link to="/login" className="text-[var(--color-maroon)] font-semibold hover:underline">Log in</Link>
      </p>
    </div>
  );
}
