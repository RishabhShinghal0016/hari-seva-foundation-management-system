import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Card, Input, Button, Alert } from "../components/ui";
import ThaliDivider from "../components/ThaliDivider";
import GoogleSignInButton from "../components/GoogleSignInButton";

const roleToDashboard = {
  admin: "/dashboard/admin",
  donor: "/dashboard/donor",
  volunteer: "/dashboard/volunteer",
  partner: "/dashboard/partner",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const redirect = location.state?.from || roleToDashboard[user.role];
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">Welcome back</span>
      <h1 className="font-display text-3xl font-semibold mt-2">Log in to your account</h1>
      <ThaliDivider />

      <Card className="p-8 mt-6">
        <GoogleSignInButton
          onSuccess={(user) => navigate(location.state?.from || roleToDashboard[user.role], { replace: true })}
          onError={(msg) => setError(msg)}
        />
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <Alert tone="error">{error}</Alert>}
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--color-line)] text-xs text-[var(--color-ink-soft)] space-y-1">
          <p className="font-semibold text-[var(--color-ink)]">Demo accounts (password: password123)</p>
          <p>Admin — rishabhshngl121@gmail.com</p>
          <p>Donor — donor@example.com</p>
          <p>Volunteer — volunteer@example.com</p>
          <p>Partner — partner@example.com</p>
        </div>
      </Card>

      <p className="text-center text-sm text-[var(--color-ink-soft)] mt-6">
        New here? <Link to="/register" className="text-[var(--color-maroon)] font-semibold hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
