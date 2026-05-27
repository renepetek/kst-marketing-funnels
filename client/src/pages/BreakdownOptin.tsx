/*
Cold-traffic opt-in landing for business breakdowns.
Visitor fills the modal, data goes to the LeadConnector webhook,
then they're redirected to /<client>-breakdown where the actual breakdown lives.
*/
import { type ReactNode, useEffect, useRef, useState } from "react";
import PhoneInput, {
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useLocation } from "wouter";
import { trackOptinModalOpen, trackOptinSubmit } from "@/lib/analytics";

const WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/Ggt8JPH9NS98V7bXWPV0/webhook-trigger/4a628a32-92df-46c2-98e8-33387963894b";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}

const learnItems = [
  {
    title: "The Online Tutoring Model",
    body: "Why online tutoring is the highest-leverage one-person business right now, and how to position yours so you stand out in any subject or niche.",
  },
  {
    title: "The 3 High-Ticket Offers",
    body: "The exact offer structures our students use to fill their schedules with families willing to pay premium prices month after month.",
  },
  {
    title: "The Student Acquisition System",
    body: "The outreach playbook our students use to sign new families every single week, without referrals and without spending money on ads.",
  },
  {
    title: "The Retention Playbook",
    body: "How to deliver results that keep parents paying month after month, and turn every student into a steady source of new referrals.",
  },
  {
    title: "The Path to Full-Time",
    body: "The step-by-step plan to scale beyond solo and replace your current income, so you can run this on your own terms from anywhere.",
  },
];

const proofImages = [
  "/proof/hergis.png",
  "/proof/william.png",
  "/proof/mobin.png",
  "/proof/ibrahim.png",
  "/proof/thomas.png",
  "/proof/kyra.png",
  "/proof/kazi.png",
  "/proof/andrewm.png",
  "/proof/mario.png",
  "/proof/usman.png",
  "/proof/kiaan.png",
  "/proof/sajib.png",
  "/proof/fatima.png",
  "/proof/marta.png",
  "/proof/james.png",
];

const whoForItems = [
  {
    lead: "You're already tutoring",
    rest: "and want to turn it into a real business instead of trading hours for dollars forever.",
  },
  {
    lead: "You want a high-leverage business",
    rest: "where the systems do the heavy lifting, not just one more job dressed up to look like one.",
  },
  {
    lead: "You value your time",
    rest: "and want a business that compounds with effort instead of plateauing the second you stop.",
  },
  {
    lead: "You're willing to learn",
    rest: "the marketing and sales side of the business, not only the teaching side.",
  },
];

const CTA_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-lg bg-yellow-500 px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-black shadow-[0_0_30px_rgba(234,179,8,0.35)] transition hover:-translate-y-0.5 hover:bg-yellow-400 hover:shadow-[0_12px_40px_rgba(234,179,8,0.5)] disabled:cursor-wait disabled:opacity-70 sm:px-12 sm:py-5 sm:text-base";

interface OptInModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { fullName: string; email: string; phone: string }) => void;
  submitting: boolean;
}

function OptInModal({ open, onClose, onSubmit, submitting }: OptInModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    requestAnimationFrame(() => firstInputRef.current?.focus());
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const form = e.currentTarget;
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    if (!fullName || !email || !phone) return;
    if (!isValidPhoneNumber(phone)) {
      setPhoneError("Please enter a valid phone number for the selected country.");
      return;
    }
    setPhoneError("");
    onSubmit({ fullName, email, phone });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="optin-modal-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-zinc-400 transition hover:text-zinc-700"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <p className="text-center font-display text-xs font-bold uppercase tracking-[0.2em] text-black">
          KST <span className="text-yellow-500">Marketing</span>
        </p>

        <h2
          id="optin-modal-title"
          className="mt-4 text-center font-display text-2xl font-bold leading-[1.15] tracking-tight text-black sm:text-3xl"
        >
          Access the Breakdown
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Get instant access in the next 2 minutes.
        </p>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <input
            ref={firstInputRef}
            name="fullName"
            type="text"
            required
            placeholder="Your Full Name"
            autoComplete="name"
            disabled={submitting}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-black placeholder:text-zinc-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-60"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Your Email"
            autoComplete="email"
            disabled={submitting}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-base text-black placeholder:text-zinc-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-60"
          />
          <div>
            <PhoneInput
              international
              defaultCountry="US"
              value={phone}
              onChange={(value) => {
                setPhone(value ?? "");
                if (phoneError) setPhoneError("");
              }}
              disabled={submitting}
              placeholder="Your Phone Number"
              className="kst-phone-input"
            />
            {phoneError && (
              <p className="mt-1.5 text-xs text-red-600">{phoneError}</p>
            )}
          </div>
          <button type="submit" disabled={submitting} className={`w-full ${CTA_BUTTON_CLASS}`}>
            {submitting ? "Submitting..." : "Access the Breakdown"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-500">
          By submitting, you agree to receive emails and SMS updates from KST Marketing. You can unsubscribe at any time. Standard message rates may apply.
        </p>
      </div>
    </div>
  );
}

interface BreakdownOptinProps {
  clientSlug: string;
  clientName: string;
  headline: ReactNode;
  pronoun: string;
  thumbnailSrc?: string;
  videoSrc?: string;
}

export default function BreakdownOptin({ clientSlug, clientName, headline, pronoun, thumbnailSrc, videoSrc }: BreakdownOptinProps) {
  const [, setLocation] = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = `${clientName} Breakdown | KST Marketing`;
  }, [clientName]);

  function openModal() {
    trackOptinModalOpen(`breakdown-${clientSlug}`);
    setModalOpen(true);
  }

  async function handleSubmit({ fullName, email, phone }: { fullName: string; email: string; phone: string }) {
    if (submitting) return;
    setSubmitting(true);

    const utms = getUtmParams();
    const parts = fullName.split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");

    const parsed = phone ? parsePhoneNumber(phone) : undefined;
    const country = parsed?.country;
    const countryCallingCode = parsed?.countryCallingCode;

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          firstName,
          lastName,
          email,
          phone,
          country,
          countryCallingCode,
          campaign: utms.utm_campaign,
          medium: utms.utm_medium,
          content: utms.utm_content,
          ...utms,
          source: `breakdown-${clientSlug}`,
        }),
        keepalive: true,
      });
    } catch (err) {
      console.error("Opt-in webhook failed:", err);
    }

    trackOptinSubmit(`breakdown-${clientSlug}`);

    const utmString = new URLSearchParams(utms).toString();
    setLocation(utmString ? `/${clientSlug}-breakdown?${utmString}` : `/${clientSlug}-breakdown`);
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-white via-yellow-50/60 to-white px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-yellow-600 sm:text-base">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Full Business Breakdown
            </p>
            <h1 className="mt-5 font-display text-2xl font-bold leading-[1.1] tracking-tight text-black sm:text-3xl md:text-4xl">
              <span className="text-yellow-500">WATCH NOW:</span> {headline}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-zinc-700 sm:text-lg">
              Watch the <span className="font-bold text-black">full breakdown</span> of how {clientName} used our exact system to grow {pronoun} tutoring business step by step.
            </p>

            {/* Blurred video thumbnail — click opens opt-in modal */}
            <button
              onClick={openModal}
              className="group relative mx-auto mt-8 block w-full max-w-2xl cursor-pointer overflow-hidden rounded-xl border-2 border-yellow-500"
              aria-label="Play video"
            >
              <div className="relative aspect-video w-full bg-zinc-900">
                {videoSrc ? (
                  <video
                    src={videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover brightness-75"
                  />
                ) : thumbnailSrc ? (
                  <img
                    src={thumbnailSrc}
                    alt=""
                    className="h-full w-full object-cover blur-lg brightness-75"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900 blur-sm" />
                )}
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.5)] transition group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(234,179,8,0.7)] sm:h-20 sm:w-20">
                    <svg className="h-7 w-7 text-black sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.5 5.5v13l10-6.5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            <button onClick={openModal} className={`mt-9 ${CTA_BUTTON_CLASS}`}>
              Watch the Breakdown Now
            </button>
          </div>
        </section>

        {/* What You'll Learn Inside */}
        <section className="bg-gradient-to-tr from-zinc-50 via-yellow-50/50 to-zinc-100 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                What You'll Learn Inside
              </span>
            </div>

            <div className="relative mx-auto mt-10 max-w-2xl">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br from-yellow-200/40 via-transparent to-yellow-200/30 blur-xl"
              />
              <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 shadow-[0_20px_50px_-15px_rgba(234,179,8,0.25)]">
                <div className="divide-y divide-zinc-200">
                  {learnItems.map((item) => (
                    <div key={item.title} className="flex items-start gap-4 p-5 sm:p-6">
                      <span className="mt-0.5 flex-shrink-0 select-none text-2xl leading-none text-yellow-500">
                        ◆
                      </span>
                      <p className="text-base text-zinc-800 sm:text-lg">
                        <span className="font-bold text-black">{item.title}:</span>{" "}
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Wins / Proof Screenshots */}
        <section className="relative overflow-hidden bg-zinc-950 px-5 py-16 sm:px-8 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-72 w-3/4 rounded-full bg-yellow-500/15 blur-3xl"
          />
          <div className="relative mx-auto max-w-5xl">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                Recent Wins
              </span>
            </div>
            <h2 className="mt-6 text-center font-display text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-3xl md:text-4xl">
              When You Follow the System, This Is What Happens
            </h2>
            <div className="mx-auto mt-6 h-1 w-32 bg-yellow-500" />

            <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
              {proofImages.map((src) => (
                <div
                  key={src}
                  className="mb-4 overflow-hidden rounded-xl bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] ring-1 ring-white/10"
                >
                  <img
                    src={src}
                    alt="Student win"
                    loading="lazy"
                    className="block w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who's This For */}
        <section className="bg-gradient-to-bl from-white via-yellow-50/60 to-white px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                Who's This For?
              </span>
            </div>
            <h2 className="mt-6 text-center font-display text-2xl font-bold leading-[1.15] tracking-tight text-black sm:text-3xl md:text-4xl">
              This Breakdown Is For You If:
            </h2>
            <div className="mx-auto mt-6 h-1 w-32 bg-yellow-500" />

            <div className="mx-auto mt-10 max-w-2xl space-y-3">
              {whoForItems.map((item) => (
                <div
                  key={item.lead}
                  className="flex items-start gap-3 rounded-lg bg-white p-4 ring-1 ring-zinc-200 sm:p-5"
                >
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p className="text-base text-zinc-800 sm:text-lg">
                    <span className="font-bold text-black">{item.lead}</span> {item.rest}
                  </p>
                </div>
              ))}
            </div>

            {/* Inset dark CTA */}
            <div className="relative mx-auto mt-16 max-w-2xl overflow-hidden rounded-3xl bg-zinc-950 px-6 py-12 text-center ring-1 ring-white/5 sm:px-12 sm:py-14">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-64 w-3/4 rounded-full bg-yellow-500/20 blur-3xl"
              />
              <div className="relative">
                <h3 className="font-display text-xl font-bold leading-[1.2] tracking-tight text-white sm:text-2xl md:text-[1.75rem]">
                  Ready to See the{" "}
                  <span className="relative inline-block text-yellow-500">
                    Breakdown
                    <span className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-yellow-500" />
                  </span>
                  ?
                </h3>
                <p className="mx-auto mt-4 max-w-md text-sm text-zinc-300 sm:text-base">
                  Click the button below and get instant access to the full breakdown.
                </p>
                <button onClick={openModal} className={`mt-7 ${CTA_BUTTON_CLASS}`}>
                  Watch the Breakdown Now
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-yellow-500 bg-zinc-100 px-5 py-8 text-center text-sm text-zinc-700 sm:px-8">
        <p className="font-bold">&copy; 2026 KST Marketing. All rights reserved.</p>
        <p className="mt-2">
          <a href="/terms" className="hover:text-yellow-600">
            Terms and Conditions
          </a>
          {" | "}
          <a
            href="https://kst-marketing.com/policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-600"
          >
            Privacy Policy
          </a>
        </p>
      </footer>

      <OptInModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}
