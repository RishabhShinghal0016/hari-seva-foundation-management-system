import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../lib/auth";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/campaigns", label: "Campaigns" },
  { to: "/food-drives", label: "Food Drives" },
  { to: "/donate", label: "Donate" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

const roleToDashboard = {
  admin: "/dashboard/admin",
  donor: "/dashboard/donor",
  volunteer: "/dashboard/volunteer",
  partner: "/dashboard/partner",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-line)]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-7 font-medium text-sm">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `transition-colors hover:text-[var(--color-maroon)] ${
                  isActive ? "text-[var(--color-maroon)]" : "text-[var(--color-ink-soft)]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to={roleToDashboard[user.role]}
                className="text-sm font-semibold text-[var(--color-maroon)] hover:underline"
              >
                {user.name.split(" ")[0]}'s Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-maroon)]"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-maroon)]">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-[var(--color-maroon)] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[var(--color-maroon-deep)] transition-colors"
              >
                Join the Seva
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-[var(--color-ink)]"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--color-line)] px-5 py-4 flex flex-col gap-4 bg-[var(--color-bg)]">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium">
              {l.label}
            </NavLink>
          ))}
          <hr className="border-[var(--color-line)]" />
          {user ? (
            <>
              <Link to={roleToDashboard[user.role]} onClick={() => setOpen(false)} className="text-sm font-semibold text-[var(--color-maroon)]">
                My Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/");
                }}
                className="text-sm text-left"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm">Log in</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="text-sm font-semibold text-[var(--color-maroon)]">
                Join the Seva
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
