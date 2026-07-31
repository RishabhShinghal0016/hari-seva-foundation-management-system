import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, Loader } from "../components/ui";
import ThaliDivider from "../components/ThaliDivider";

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
        aria-expanded={isOpen}
      >
        <span className="font-display text-lg font-semibold">{item.question}</span>
        <span
          className={`shrink-0 w-7 h-7 rounded-full border border-[var(--color-marigold)] flex items-center justify-center text-[var(--color-maroon)] transition-transform ${isOpen ? "rotate-45" : ""}`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      {isOpen && (
        <p className="px-6 pb-5 text-sm text-[var(--color-ink-soft)] leading-relaxed">{item.answer}</p>
      )}
    </Card>
  );
}

export default function Faq() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api.get("/faq").then(setItems).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-maroon)]">FAQ</span>
      <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3">Frequently asked questions</h1>
      <p className="text-lg text-[var(--color-ink-soft)] mt-4">
        Can't find what you need here? Ask Hari, our assistant, in the chat bubble in the corner — or reach out on the{" "}
        <a href="/contact" className="text-[var(--color-maroon)] font-semibold hover:underline">Contact page</a>.
      </p>

      <ThaliDivider />

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <FaqItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
