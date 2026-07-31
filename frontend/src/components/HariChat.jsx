import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

const GREETING = "Namaste 🙏 I'm Hari. Ask me about donating, volunteering, food drives, campaigns, or our impact so far.";

const QUICK_PROMPTS = ["How do I donate?", "Upcoming food drives?", "How do I volunteer?", "Your impact so far?"];

export default function HariChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: "hari", text: GREETING }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    setMessages((m) => [...m, { from: "user", text: message }]);
    setInput("");
    setSending(true);
    try {
      const data = await api.post("/assistant/ask", { message });
      setMessages((m) => [...m, { from: "hari", text: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "hari", text: "Sorry, I couldn't reach the server just now. Please try again in a moment." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[28rem] bg-[var(--color-card)] border border-[var(--color-line)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-rise">
          <div className="bg-[var(--color-maroon)] text-white px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-marigold)] flex items-center justify-center text-[var(--color-ink)] font-display font-bold text-lg shrink-0">
              H
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold leading-tight">Hari</p>
              <p className="text-xs text-white/70 leading-tight">Hari Seva Foundation assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white/80 hover:text-white text-xl leading-none px-1"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
                    m.from === "user"
                      ? "bg-[var(--color-maroon)] text-white rounded-br-sm"
                      : "bg-[var(--color-bg)] border border-[var(--color-line)] rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-[var(--color-bg)] border border-[var(--color-line)] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-[var(--color-ink-soft)]">
                  Hari is typing...
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-marigold)]/15 text-[var(--color-marigold-deep)] font-medium hover:bg-[var(--color-marigold)]/25"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-[var(--color-line)] p-3 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Hari something..."
              className="flex-1 px-3.5 py-2 rounded-full border border-[var(--color-line)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-marigold)]"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-maroon)] text-white flex items-center justify-center disabled:opacity-40"
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 12h16M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[var(--color-maroon)] text-white shadow-xl flex items-center justify-center hover:bg-[var(--color-maroon-deep)] transition-colors"
        aria-label={open ? "Close Hari chat" : "Chat with Hari"}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
          </svg>
        ) : (
          <span className="font-display font-bold text-xl">H</span>
        )}
      </button>
    </>
  );
}
