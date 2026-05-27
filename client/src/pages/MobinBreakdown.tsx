/*
Business breakdown page for Mobin. After the hero, prospects see
the full breakdown content, case studies, program details, FAQ, and CTAs.
Same KST gold branding throughout.
*/
import { useEffect, useRef, useState } from "react";
import {
  trackCaseStudyView,
  trackCtaClick,
  trackFaqOpen,
  trackOutboundClick,
  type CtaLocation,
} from "@/lib/analytics";

const VIDEO_LINKS = {
  sajib: "https://www.youtube.com/watch?v=Wpvz6uusSZY",
  fatima: "https://www.youtube.com/watch?v=Dg3qBjnz9uo",
  mobin: "https://www.youtube.com/watch?v=CxMD9RkxYKc",
  kazi: "https://www.youtube.com/watch?v=C-BT3nrbzgQ",
  hergis: "https://www.youtube.com/watch?v=sSniAyWE-ro",
  mario: "https://www.youtube.com/watch?v=EsxysTKse7I",
  kiaan: "https://www.youtube.com/watch?v=HvJbgtaskCA",
  patrick: "https://www.youtube.com/watch?v=g0-8LlyDsZA",
};

const VIDALYTICS_ACCOUNT = "HjA51wM6";
const HERO_EMBED_ID = "tyvHhc2cEHeARjHS";

const TYPEFORM_BASE_URL = "https://form.typeform.com/to/P3NkAZnu";
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function buildCtaUrl() {
  if (typeof window === "undefined") return TYPEFORM_BASE_URL;
  const incoming = new URLSearchParams(window.location.search);
  const out = new URLSearchParams();
  for (const key of UTM_KEYS) {
    const value = incoming.get(key);
    if (value) out.set(key, value);
  }
  const qs = out.toString();
  return qs ? `${TYPEFORM_BASE_URL}?${qs}` : TYPEFORM_BASE_URL;
}

const pillars = [
  {
    title: "1-on-1 Coaching",
    body: "We'll work with you personally to choose your niche, craft your offer, and build your student acquisition system.",
  },
  {
    title: "Proven Tutoring Systems",
    body: "You get access to our library of pre-built tutoring workflows, scripts, and SOPs, so you can deliver high-quality results from day one.",
  },
  {
    title: "Student Acquisition Machine",
    body: "We'll teach you the exact outreach methods our clients are using to sign $2k\u2013$5k/month tutoring contracts without spending money on ads.",
  },
  {
    title: "Direct Support & Community",
    body: "You get direct access to me and my team, plus a community of other tutoring business owners to keep you accountable.",
  },
];

const faqs = [
  {
    q: "What is the investment?",
    a: "We share the full pricing on the 1-on-1 strategy call once we've understood your situation and confirmed it's the right fit. The program is positioned for tutors who want to build a real business, not a low-ticket course.",
  },
  {
    q: "How much time do I need to commit?",
    a: "Most of our clients start while still working full-time and dedicate 1-2 hours per day to building the business in their first 90 days. The systems are designed to compound. You put more in early, then it scales.",
  },
  {
    q: "What if I have no tech skills or business experience?",
    a: "You don't need either. Every workflow is plug-and-play, and we've onboarded tutors with zero business background. You bring the teaching expertise; we bring the systems, scripts, and 1-on-1 coaching.",
  },
  {
    q: "Is there a guarantee?",
    a: "Yes. We have a 60-day satisfaction guarantee. If you follow the process and aren't satisfied within the first 60 days, you receive a full refund.",
  },
  {
    q: "How is this different from other programs?",
    a: "Most programs sell you a course and disappear. We work with you 1-on-1, choosing your niche, refining your offer, and walking through every step of student acquisition. You're not buying information, you're buying access to a system and a team.",
  },
];

const caseStudies = [
  { key: "sajib", name: "Sajib Al Rashid", transformation: "\u00A354,238 in 90 Days" },
  { key: "fatima", name: "Fatima Galal", transformation: "\u00A38,425K in 30 Days" },
  { key: "mobin", name: "Mobin Naybin", transformation: "$40,000 in 60 Days" },
  { key: "kazi", name: "Kazi Mahathir", transformation: "\u00A315,000/Mo" },
  { key: "hergis", name: "Hergis Nkote", transformation: "$0 to $9,8K" },
  { key: "mario", name: "Mario Sison", transformation: "$6,500 in 5 Days" },
  { key: "kiaan", name: "Kiaan Patel", transformation: "\u00A39,000/mo" },
  { key: "patrick", name: "Patrick Choi", transformation: "$12k/m to $70k/m" },
] as const;

function normalizeEmbedUrl(url: string) {
  if (!url) return "";
  if (url.includes("youtube.com/watch?v=")) {
    const id = url.split("v=")[1]?.split("&")[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  return url;
}

let vidalyticsReady: Promise<void> | null = null;

function ensureVidalyticsLoaded(accountId: string, firstEmbedId: string): Promise<void> {
  if (vidalyticsReady) return vidalyticsReady;

  vidalyticsReady = new Promise((resolve) => {
    const w = window as any;
    if (!w.Vidalytics) w.Vidalytics = {};
    if (!w.VidalyticsL) w.VidalyticsL = {};
    if (!w._vidalytics) w._vidalytics = {};

    const baseUrl = `https://fast.vidalytics.com/embeds/${accountId}/${firstEmbedId}/`;
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = baseUrl + "loader.min.js";
    s.onload = () => {
      const LoaderClass = w.VidalyticsL?.Loader;
      if (LoaderClass) {
        const loader = new LoaderClass();
        loader.loadScript(baseUrl + "player.min.js", () => resolve());
      }
    };
    document.head.appendChild(s);
  });

  return vidalyticsReady;
}

function VidalyticsEmbed({ embedId, accountId }: { embedId: string; accountId: string }) {
  const divId = `vidalytics_embed_${embedId}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    ensureVidalyticsLoaded(accountId, HERO_EMBED_ID).then(() => {
      const w = window as any;
      const EmbedClass = w.Vidalytics?.Embed;
      if (EmbedClass) {
        const embed = new EmbedClass();
        embed.run(divId);
      }
    });
  }, [visible, accountId, divId]);

  return (
    <div className="overflow-hidden rounded-xl border-2 border-yellow-500" ref={containerRef}>
      <div id={divId} style={{ width: "100%", position: "relative", paddingTop: "56.25%" }} />
    </div>
  );
}

const CTA_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-lg bg-yellow-500 px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-black shadow-[0_0_30px_rgba(234,179,8,0.35)] transition hover:-translate-y-0.5 hover:bg-yellow-400 hover:shadow-[0_12px_40px_rgba(234,179,8,0.5)] sm:px-12 sm:py-5 sm:text-base";

function CtaHeadline() {
  return (
    <h3 className="font-display text-xl font-bold leading-[1.2] tracking-tight text-black sm:text-2xl">
      Ready to <span className="text-yellow-500">Build</span> Your Own Online Tutoring Business?
    </h3>
  );
}

function CtaFull({ location }: { location: CtaLocation }) {
  return (
    <div className="text-center">
      <CtaHeadline />

      <p className="mx-auto mt-4 max-w-md text-sm text-zinc-600 sm:text-base">
        If you want my help doing it{" "}
        <span className="font-bold text-zinc-900">1-on-1</span>, book a call with us:
      </p>

      <a
        href={buildCtaUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackCtaClick(location, "full")}
        className={`mt-7 ${CTA_BUTTON_CLASS}`}
      >
        Yes, I Want to Build a Tutoring Business
      </a>

      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 sm:text-xs">
        Book In My Free 1:1 Roadmap Session
      </p>
    </div>
  );
}

function CtaSlim({ location }: { location: CtaLocation }) {
  return (
    <div className="text-center">
      <CtaHeadline />

      <a
        href={buildCtaUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackCtaClick(location, "slim")}
        className={`mt-6 ${CTA_BUTTON_CLASS}`}
      >
        Book In My Free 1:1 Roadmap Session
      </a>
    </div>
  );
}

function CaseStudyCard({
  study,
}: {
  study: { key: keyof typeof VIDEO_LINKS; name: string; transformation: string };
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackCaseStudyView(study.key);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [study.key]);

  return (
    <article ref={ref} className="rounded-lg bg-white p-6 ring-1 ring-zinc-200">
      <p className="text-base font-semibold text-yellow-600">{study.transformation}</p>
      <h3 className="mt-2 font-display text-2xl font-bold text-black">{study.name}</h3>
      <div className="relative mt-5 aspect-video overflow-hidden rounded-lg bg-black">
        <iframe
          src={normalizeEmbedUrl(VIDEO_LINKS[study.key])}
          title={study.name}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </article>
  );
}

export default function MobinBreakdown() {
  useEffect(() => {
    document.title = "Mobin Breakdown | KST Marketing";
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero / VSL Section */}
      <header className="border-b border-zinc-200 bg-gradient-to-br from-white via-yellow-50/60 to-white px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-600">Success</span>
            <span className="text-zinc-700">Breakdown Unlocked</span>
          </div>

          <h1 className="mx-auto mt-5 max-w-3xl font-display text-2xl font-bold leading-[1.1] tracking-tight text-black sm:text-3xl md:text-4xl">
            <span className="text-yellow-500 uppercase">Watch Now:</span>{" "}
            How Mobin Made <span className="relative inline-block"><span className="relative z-10">$40.5K in 60 Days</span><svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5.5C20 2 40 7 60 4.5C80 2 100 6.5 120 3.5C140 1 160 6 180 4C190 3 197 5.5 199 4.5" stroke="#EAB308" strokeWidth="3" strokeLinecap="round"/></svg></span> Tutoring SAT over Zoom
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-700 sm:text-lg">
            Make sure to watch until the end where I reveal the{" "}
            <em className="font-bold not-italic text-yellow-600">exact strategies and offers</em>{" "}
            that made this transformation possible.
          </p>

          <div className="mx-auto mt-6 h-1 w-32 bg-yellow-500" />

          <div className="mx-auto mt-6 max-w-3xl overflow-hidden">
            <VidalyticsEmbed embedId={HERO_EMBED_ID} accountId={VIDALYTICS_ACCOUNT} />
          </div>

          <div className="mt-12">
            <CtaFull location="hero" />
          </div>
        </div>
      </header>

      <main>
        {/* How We Can Help Section */}
        <section className="bg-gradient-to-bl from-white via-yellow-50/60 to-white px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold leading-[1.15] tracking-tight text-black sm:text-3xl md:text-4xl text-center">
              Here's How We Can Help You Inside the Educator Incubator Program
            </h2>
            <div className="mx-auto mt-6 h-1 w-32 bg-yellow-500" />

            <ul className="mt-12 space-y-5">
              {pillars.map((p) => (
                <li key={p.title} className="flex items-start gap-3 sm:gap-4">
                  <span className="flex-shrink-0 select-none font-display text-2xl font-bold leading-none text-yellow-500">
                    &raquo;
                  </span>
                  <p className="text-base text-zinc-800 sm:text-lg">
                    <span className="font-bold text-black">{p.title}:</span> {p.body}
                  </p>
                </li>
              ))}
            </ul>

            <h3 className="mt-16 font-display text-xl font-bold leading-[1.15] tracking-tight text-black sm:text-2xl md:text-3xl text-center">
              The Next Step Is To<br />See If You're A Good Fit
            </h3>
            <div className="mt-8 space-y-4 text-base text-zinc-800 sm:text-lg">
              <p>
                This program isn't for everyone. We're looking for a specific type of person who is coachable, resourceful, and ready to take massive action.
              </p>
              <p>
                To see if that's you, the next step is to fill out a short application and book a 1-on-1 consultation call with our team.
              </p>
              <p>
                This is not a high-pressure sales call. It's a strategy session where we'll dive into your personal situation, your goals, and see if we can genuinely help you. If it's a good fit, we'll invite you to join. If not, we'll be honest and point you in the right direction.
              </p>
            </div>

            <div className="mt-12">
              <CtaSlim location="help" />
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section className="bg-gradient-to-tl from-zinc-50 via-yellow-50/50 to-zinc-100 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-black sm:text-4xl md:text-5xl text-center">
              Our Case Studies
            </h2>
            <div className="mx-auto mt-6 h-1 w-48 bg-yellow-500" />

            <p className="mx-auto mt-8 max-w-2xl text-center text-lg font-semibold text-zinc-800">
              We Give You Proven, Copy & Paste Tutoring Business Workflows You Can Use. Zero Technical Skills Required.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {caseStudies.map((study) => (
                <CaseStudyCard key={study.key} study={study} />
              ))}
            </div>

            <p className="mx-auto mt-10 max-w-3xl text-center text-lg text-zinc-900">
              We have <strong>dozens more of these</strong>, with screenshots, full context, and the exact playbook each of them used.
            </p>

            <div className="mt-16">
              <CtaSlim location="case_studies" />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gradient-to-tr from-zinc-50 via-yellow-50/50 to-zinc-100 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                Frequently Asked Questions
              </span>
            </div>
            <h2 className="mt-6 font-display text-3xl font-bold leading-[1.05] tracking-tight text-black sm:text-4xl md:text-5xl text-center">
              Questions You May Have...
            </h2>
            <div className="mx-auto mt-6 h-1 w-32 bg-yellow-500" />

            <div className="mt-12 border-t border-zinc-200">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  onToggle={(e) => {
                    if (e.currentTarget.open) trackFaqOpen(faq.q);
                  }}
                  className="group border-b border-zinc-200 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base text-zinc-800 sm:text-lg">
                    <span>{faq.q}</span>
                    <span className="flex-shrink-0 text-2xl font-bold leading-none text-yellow-500 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-5 pr-10 text-base leading-relaxed text-zinc-700">{faq.a}</p>
                </details>
              ))}
            </div>

            <h3 className="mt-20 font-display text-xl font-bold leading-[1.2] tracking-tight text-black sm:text-2xl md:text-3xl text-center whitespace-nowrap">
              If You Don't Get Results, You Don't Pay
            </h3>
            <div className="mx-auto mt-6 h-1 w-32 bg-yellow-500" />
            <p className="mx-auto mt-8 max-w-2xl text-base text-zinc-800 sm:text-lg">
              We have a 60-day satisfaction guarantee for anybody who joins our Educator Incubator Program. That means if you follow our process and you're not satisfied with the program and want to leave within the first 60 days, we will give you a full refund.
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-800 sm:text-lg">
              This is to minimize the potential loss you could have working with us. We want to minimize the risk as much as possible for you.
            </p>

            <div className="mt-12">
              <CtaSlim location="faq" />
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
            onClick={() => trackOutboundClick("privacy_policy")}
            className="hover:text-yellow-600"
          >
            Privacy Policy
          </a>
        </p>
      </footer>
    </div>
  );
}
