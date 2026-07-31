import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-ink)] text-[#F3E9D6] mt-24">
      <div className="max-w-6xl mx-auto px-5 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <Logo size="sm" />
          <p className="mt-4 text-sm text-[#D8C6A8] leading-relaxed max-w-xs">
            A community-run seva platform serving meals, school kits and relief
            to families across Bareilly and beyond &mdash; one plate at a time.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.2em] text-[var(--color-marigold)] mb-4">Navigate</h4>
          <ul className="space-y-2 text-sm text-[#D8C6A8]">
            <li><Link to="/campaigns" className="hover:text-white">Campaigns</Link></li>
            <li><Link to="/food-drives" className="hover:text-white">Food Drives</Link></li>
            <li><Link to="/donate" className="hover:text-white">Donate</Link></li>
            <li><Link to="/register" className="hover:text-white">Volunteer with us</Link></li>
            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.2em] text-[var(--color-marigold)] mb-4">Reach us</h4>
          <ul className="space-y-2 text-sm text-[#D8C6A8]">
            <li>Rishabh Shinghal, Founder</li>
            <li>+91 86301 97225</li>
            <li>rishabhshngl121@gmail.com</li>
            <li>Bareilly, Uttar Pradesh</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-[#B5A183]">
        &copy; {new Date().getFullYear()} Hari Seva Foundation. Built as a working prototype for portfolio &amp; pilot use.
      </div>
    </footer>
  );
}
