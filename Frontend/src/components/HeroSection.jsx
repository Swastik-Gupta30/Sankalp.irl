import { useState, useEffect } from "react";
import "./HeroSection.css";

/* ── Animated counter hook ── */
function useCountUp(target, duration = 1800, trigger = true) {
  const [val, setVal] = useState(0);
  const isNumber = !isNaN(parseFloat(target));
  useEffect(() => {
    if (!trigger || !isNumber) return;
    const num = parseFloat(target);
    const start = performance.now();
    let raf;
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(+(eased * num).toFixed(target.toString().includes('.') ? 1 : 0));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, trigger, isNumber]);
  return isNumber ? val : target;
}

/* ── Stat block with animated counter ── */
function StatBlock({ num, label, delay = 0, trigger }) {
  const v = useCountUp(num, 1800, trigger);
  return (
    <div className="stat" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-num">{v}{num === "1.4" ? "B" : ""}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* ── Title words configuration ── */
const TITLE_WORDS = [
  { text: "स्थानीय शासन होगा",   className: "hero-word",                delay: 0.35 },
  { text: " ",          className: "hero-word",                delay: 0.42, space: true },
  { text: "संयुक्त,", className: "hero-word hero-word--accent", delay: 0.50 },
]

const TITLE_WORDS_LINE2 = [
  { text: "जब भारत चुनेगा",   className: "hero-word",                delay: 0.65 },
  { text: " ",          className: "hero-word",                delay: 0.72, space: true },
  { text: "लोकायुक्त।", className: "hero-word hero-word--accent", delay: 0.80 },
];

/* ═══════════════════════════════════════════
   HeroSection — Clean hero, no floating cards
   ═══════════════════════════════════════════ */
export default function HeroSection({ heroRef, heroVis, scrollY }) {
  const pxContent = scrollY * 0.12;
  const pxOrb     = scrollY * 0.05;
  const scrolledPast = scrollY > 100;

  return (
    <section className="hero" ref={heroRef}>
      {/* ── Background orbs (parallax) ── */}
      <div className="hero-bg-orb hero-bg-orb--warm"  style={{ transform: `translate(0, ${pxOrb}px)` }} />
      <div className="hero-bg-orb hero-bg-orb--green" style={{ transform: `translate(0, ${-pxOrb}px)` }} />
      <div className="hero-bg-orb hero-bg-orb--gold"  style={{ transform: `translateX(-50%) translateY(${pxOrb * 0.5}px)` }} />

      {/* ── Hero Content ── */}
      <div className="hero-content" style={{ transform: `translateY(${-pxContent}px)` }}>
        {/* Glass badge */}
        <div className="hero-glass-badge">
          <img src="/logo.jpeg" alt="Logo" className="w-4 h-4 object-contain" />
          LokAyukt · Smart Governance Platform
        </div>

        {/* Staggered title */}
        <h1 className="hero-title">
          <span className="hero-title-line">
            {TITLE_WORDS.map((w, i) =>
              w.space ? (
                <span key={i}>&nbsp;</span>
              ) : (
                <span key={i} className={w.className} style={{ animationDelay: `${w.delay}s` }}>
                  {w.text}
                </span>
              )
            )}
          </span>
          <span className="hero-title-line">
            {TITLE_WORDS_LINE2.map((w, i) => (
              <span key={i} className={w.className} style={{ animationDelay: `${w.delay}s` }}>
                {w.text}
              </span>
            ))}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-sub">
          A next-generation AI governance platform bridging the gap between citizens and authorities.{' '}
          Report, verify, and resolve — ensuring Every Voice counts.
        </p>

        {/* Divider */}
        <div className="hero-divider">
          <div className="hero-line" />
          <div className="hero-diamond" />
          <div className="hero-line" />
        </div>

        {/* ── Portal Glasscards ── */}
        <div className="hero-portal-cards">

          {/* Lok-Sahayak */}
          <a href="/loksahayak" className="hero-portal-card">
            <div className="hero-portal-card-glow" style={{ background: 'rgba(255,107,53,0.15)' }} />
            <div className="hero-portal-card-icon">🧭</div>
            <div className="hero-portal-card-body">
              <div className="hero-portal-card-tag" style={{ color:'#c2410c', background:'rgba(255,107,53,0.10)', border:'1px solid rgba(255,107,53,0.22)' }}>AI Assistant</div>
              <h3 className="hero-portal-card-title">Lok-Sahayak</h3>
              <p className="hero-portal-card-desc">Not sure which government portal to use? Our intelligent guide navigates you to the exact service you need — instantly.</p>
            </div>
            <div className="hero-portal-card-cta" style={{ background:'linear-gradient(135deg,#FF6B35,#e85d3a)', boxShadow:'0 4px 16px rgba(255,107,53,0.35)' }}>
              Open Guide <span>→</span>
            </div>
          </a>

          {/* Jan Sanchar */}
          <a href="/public-feed" className="hero-portal-card">
            <div className="hero-portal-card-glow" style={{ background: 'rgba(26,58,143,0.12)' }} />
            <div className="hero-portal-card-icon">🗺️</div>
            <div className="hero-portal-card-body">
              <div className="hero-portal-card-tag" style={{ color:'#1e40af', background:'rgba(26,58,143,0.08)', border:'1px solid rgba(26,58,143,0.18)' }}>Live Feed</div>
              <h3 className="hero-portal-card-title">Jan Sanchar</h3>
              <p className="hero-portal-card-desc">Real-time civic updates and a geographic heatmap of issues across India. Stay informed, stay empowered.</p>
            </div>
            <div className="hero-portal-card-cta" style={{ background:'linear-gradient(135deg,#1A3A8F,#0B1D51)', boxShadow:'0 4px 16px rgba(26,58,143,0.35)' }}>
              View Feed <span>→</span>
            </div>
          </a>

          {/* Jan Satyapan */}
          <a href="/news-verification" className="hero-portal-card">
            <div className="hero-portal-card-glow" style={{ background: 'rgba(21,128,61,0.12)' }} />
            <div className="hero-portal-card-icon">🔍</div>
            <div className="hero-portal-card-body">
              <div className="hero-portal-card-tag" style={{ color:'#15803d', background:'rgba(21,128,61,0.08)', border:'1px solid rgba(21,128,61,0.18)' }}>AI Verification</div>
              <h3 className="hero-portal-card-title">Jan Satyapan</h3>
              <p className="hero-portal-card-desc">AI-powered fact-checking of civic news and government work claims. Truth at scale — before it spreads.</p>
            </div>
            <div className="hero-portal-card-cta" style={{ background:'linear-gradient(135deg,#15803d,#166534)', boxShadow:'0 4px 16px rgba(21,128,61,0.35)' }}>
              Verify Now <span>→</span>
            </div>
          </a>

        </div>
      </div>

      {/* Scroll hint */}
      <div className={`hero-scroll-hint${scrolledPast ? " faded" : ""}`}>
        <span>Scroll</span>
        <div className="hero-scroll-chevron" />
      </div>
    </section>
  );
}
