import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PanchamritCards.css';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    number: '01',
    icon: '🏛️',
    name: 'Jan Seva',
    subtitle: 'Grievance Redressal',
    desc: 'A multimodal citizen grievance system allowing users to report civic issues via text, voice, or images. Ensures inclusivity and faster issue resolution.',
    tag: '🎙️ Multimodal Input',
  },
  {
    number: '02',
    icon: '🗺️',
    name: 'Jan Sanchar',
    subtitle: 'Public Feed & Heatmap',
    desc: 'A real-time civic information feed combined with a geographical heatmap of issues and developments. Enhances transparency and citizen awareness.',
    tag: '📡 Live Updates',
  },
  {
    number: '03',
    icon: '🔍',
    name: 'Jan Satyapan',
    subtitle: 'Verification System',
    desc: 'AI-powered verification of civic work using before/after images and fake news detection. Ensures accountability and prevents misinformation.',
    tag: '🤖 AI Verified',
  },
  {
    number: '04',
    icon: '🧭',
    name: 'Lok-Sahayak',
    subtitle: 'Government Portal Guide',
    desc: 'An intelligent decision-based assistant that guides users to the correct government portal or service based on their specific needs.',
    tag: '🧠 Smart Assistant',
  },
  {
    number: '05',
    icon: '📊',
    name: 'Labh Vardhak AI',
    subtitle: 'Welfare Allocator',
    desc: 'A data-driven engine that optimizes welfare distribution using AI to maximize socio-economic impact per rupee spent.',
    tag: '💡 Data-Driven',
  },
];

export default function PanchamritCards() {
  const sectionRef = useRef(null);
  const headerRef  = useRef(null);
  const cardsRef   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Header reveal */
      gsap.from(headerRef.current, {
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 82%',
        },
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
      });

      /* Staggered card reveal */
      gsap.to(cardsRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
      });

      /* Subtle hover parallax tilt on each card */
      cardsRef.current.forEach((card) => {
        if (!card) return;
        const onMove = (e) => {
          const rect = card.getBoundingClientRect();
          const cx = (e.clientX - rect.left) / rect.width  - 0.5;
          const cy = (e.clientY - rect.top)  / rect.height - 0.5;
          gsap.to(card, {
            rotateY: cx * 8,
            rotateX: -cy * 8,
            transformPerspective: 800,
            ease: 'power1.out',
            duration: 0.35,
          });
        };
        const onLeave = () => {
          gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1,0.75)' });
        };
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
        return () => {
          card.removeEventListener('mousemove', onMove);
          card.removeEventListener('mouseleave', onLeave);
        };
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="panchamrit-section" ref={sectionRef}>
      {/* Header */}
      <div className="panchamrit-header" ref={headerRef}>
        <div className="panchamrit-overline">पञ्चामृत · Panchamrit</div>
        <h2 className="panchamrit-title">
          Five Pillars of <em>Smart Governance</em>
        </h2>
        <p className="panchamrit-desc">
          LokAyukt's core features unite citizens and authorities through AI-powered
          civic infrastructure — transparent, inclusive, and accountable.
        </p>
      </div>

      {/* Cards */}
      <div className="panchamrit-grid">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="panchamrit-card"
            ref={(el) => (cardsRef.current[i] = el)}
          >
            <div className="pc-number">No. {f.number}</div>
            <span className="pc-icon">{f.icon}</span>
            <h3 className="pc-name">{f.name}</h3>
            <div className="pc-subtitle">{f.subtitle}</div>
            <div className="pc-divider" />
            <p className="pc-desc">{f.desc}</p>
            <div className="pc-tag">{f.tag}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
