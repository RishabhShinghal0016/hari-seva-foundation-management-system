import { useState } from "react";
import ThaliDivider from "../components/ThaliDivider";
import { Card, Input, Textarea, Button, Alert } from "../components/ui";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-16">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">Get in touch</span>
      <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3">We'd love to hear from you</h1>
      <p className="text-lg text-[var(--color-ink-soft)] mt-4 max-w-xl">
        Questions about donating, volunteering, or partnering your space for a food drive &mdash; reach out directly.
      </p>

      <ThaliDivider />

      <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 mt-10">
        <Card className="p-8 text-center md:text-left">
          <img
            src="/assets/founder.jpeg"
            alt="Rishabh Shinghal"
            className="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--color-marigold)]/40 mx-auto md:mx-0"
          />
          <h3 className="font-display text-xl font-semibold mt-4">Rishabh Shinghal</h3>
          <p className="text-sm text-[var(--color-maroon)] font-semibold uppercase tracking-wide">Founder, Hari Seva Foundation</p>

          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-2.5 justify-center md:justify-start">
              <span aria-hidden="true">📞</span>
              <a href="tel:+918630197225" className="hover:text-[var(--color-maroon)]">+91 86301 97225</a>
            </li>
            <li className="flex items-center gap-2.5 justify-center md:justify-start">
              <span aria-hidden="true">✉️</span>
              <a href="mailto:rishabhshngl121@gmail.com" className="hover:text-[var(--color-maroon)] break-all">rishabhshngl121@gmail.com</a>
            </li>
            <li className="flex items-center gap-2.5 justify-center md:justify-start">
              <span aria-hidden="true">📍</span>
              <span>Bareilly, Uttar Pradesh, India</span>
            </li>
          </ul>
        </Card>

        <Card className="p-8">
          {sent ? (
            <Alert tone="success">
              Thank you — your message has been noted. We'll get back to you at the email or number you shared.
            </Alert>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-5">
                <Input label="Your name" required placeholder="Full name" />
                <Input label="Mobile number" required placeholder="10-digit mobile number" />
              </div>
              <Input label="Email" type="email" required placeholder="you@example.com" />
              <Textarea label="Message" required rows={5} placeholder="How can we help?" />
              <Button type="submit" variant="primary" className="w-full">Send message</Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
