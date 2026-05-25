'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FONT = 'var(--font-syne), var(--display), sans-serif';
const MONO = "'Elms Sans', sans-serif";

const PILLARS = [
  {
    num: '01',
    title: 'LLM Engineering',
    desc: 'Fine-tuning, prompt engineering & production LLM deployment at enterprise scale.',
  },
  {
    num: '02',
    title: 'RAG & Retrieval Systems',
    desc: 'FAISS, Chroma, multilingual embeddings and hybrid search pipelines.',
  },
  {
    num: '03',
    title: 'Voice AI & Real-time',
    desc: 'Whisper STT, neural TTS, sentence-level streaming — bilingual Arabic/English.',
  },
  {
    num: '04',
    title: 'AI Agent Architecture',
    desc: 'LangGraph orchestration, multi-tool agents, session-aware state machines.',
  },
];

const TIMELINE = [
  {
    years: '2025 – Now', company: 'Nokia', role: 'AI Engineer', detail: 'Cairo, Egypt',
    bullets: [
      'Design and develop AI-powered agents for enterprise use cases.',
      'Build and optimize Retrieval-Augmented Generation (RAG) systems to enhance information retrieval and response accuracy.',
      'Conduct internal sessions and knowledge-sharing workshops on AI technologies and best practices.',
    ],
  },
  {
    years: '2025', company: 'Singularity Labs', role: 'AI / LLM Engineer', detail: 'Cairo, Egypt',
    bullets: [
      'Worked on Sales Agent AI, improving response accuracy using RAG-based search techniques.',
      'Worked with LangChain for optimized retrieval.',
      'Developed expertise in Retrieval-Augmented Generation (RAG) and AI Agents.',
      'Tested and fine-tuned LLMs using QLoRA and LoRA.',
    ],
  },
  {
    years: '2024 – 2025', company: 'TechWebInnovations OÜ', role: 'Web Designer & Infra Admin', detail: 'Germany — Remote',
    bullets: [
      'Designed and developed custom websites for clients using WordPress, WooCommerce, and Divi.',
      'Created user-friendly websites tailored to client needs, ensuring brand consistency and optimal UX.',
      'Integrated AI-driven features and tools into websites to enhance functionality.',
    ],
  },
  {
    years: '2022', company: 'EPROM', role: 'Database Developer Intern', detail: 'Alexandria, Egypt',
    bullets: [
      'Led database digitization project, migrating from paper-based to digital system.',
      'Built employee request management system and manager approval database.',
      'Used SQL, PL/SQL, and Oracle Apex.',
    ],
  },
];

const PROOF = [
  { label: 'Nokia',               sub: 'Enterprise AI Systems'       },
  { label: 'Singularity Labs',    sub: 'AI Product Startup'          },
  { label: 'TechWebInnovations',  sub: 'Web & Infrastructure'        },
  { label: 'Alexandria Univ.',    sub: 'BSc AI Major · GPA 3.828'   },
  { label: 'LangGraph / FAISS',   sub: 'Agentic Frameworks'          },
  { label: 'Arabic + English',    sub: 'Bilingual AI Systems'        },
];

const tagLight: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: '0.6rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(0,0,0,0.4)',
};

const tagDark: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: '0.6rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)',
};

const ruleDark: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255,255,255,0.08)',
  margin: '80px 0',
};

export default function AboutSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const bioRef      = useRef<HTMLDivElement>(null);
  const darkRef     = useRef<HTMLDivElement>(null);
  const pillarsRef  = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const proofRef    = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ST = { toggleActions: 'play none none none' as const };

    /* ── About tag ───────────────────────────────────────────── */
    gsap.fromTo('.about-tag',
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', ...ST } }
    );

    /* ── Bio hero elements ───────────────────────────────────── */
    if (bioRef.current) {
      gsap.fromTo(bioRef.current.querySelectorAll('.bio-el'),
        { y: 55, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', stagger: 0.14,
          scrollTrigger: { trigger: bioRef.current, start: 'top 82%', ...ST } }
      );
    }

    /* ── Dark section entrance: rounded card expanding to full width ── */
    if (darkRef.current) {
      gsap.fromTo(darkRef.current,
        { clipPath: 'inset(4% 3% 0% 3% round 24px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: darkRef.current,
            start: 'top 95%',
            end: 'top top',
            scrub: 1,
          },
        }
      );
    }

    /* ── Section title scroll-driven clip reveals ───────────── */
    gsap.fromTo('.expertise-label',
      { y: '100%', letterSpacing: '0.06em' },
      {
        y: '0%', letterSpacing: '-0.04em',
        ease: 'none',
        scrollTrigger: {
          trigger: '.expertise-label',
          start: 'top 92%',
          end: 'top 32%',
          scrub: 1.5,
        },
      }
    );

    gsap.fromTo('.experience-label',
      { y: '100%', letterSpacing: '0.06em' },
      {
        y: '0%', letterSpacing: '-0.04em',
        ease: 'none',
        scrollTrigger: {
          trigger: '.experience-label',
          start: 'top 92%',
          end: 'top 32%',
          scrub: 1.5,
        },
      }
    );

    /* ── Pillar rows: stagger up from below ──────────────────── */
    if (pillarsRef.current) {
      gsap.fromTo(pillarsRef.current.querySelectorAll('.pillar-row'),
        { y: 70, autoAlpha: 0 },
        {
          y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.13,
          scrollTrigger: { trigger: pillarsRef.current, start: 'top 82%', ...ST },
        }
      );
    }

    /* ── Experience timeline — chapter-by-chapter storytelling ── */
    if (timelineRef.current) {
      const line = timelineRef.current.querySelector<HTMLElement>('.tl-line');
      if (line) {
        gsap.fromTo(line,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: timelineRef.current,
              start: 'top 75%',
              end: 'bottom 55%',
              scrub: 1.2,
            },
          }
        );
      }

      timelineRef.current.querySelectorAll<HTMLElement>('.tl-entry').forEach(entry => {
        const dot     = entry.querySelector<HTMLElement>('.tl-dot');
        const year    = entry.querySelector<HTMLElement>('.tl-year');
        const company = entry.querySelector<HTMLElement>('.tl-company');
        const meta    = entry.querySelectorAll<HTMLElement>('.tl-meta');

        /* Reveal — play once on scroll enter */
        const revealTl = gsap.timeline({
          scrollTrigger: { trigger: entry, start: 'top 84%', ...ST },
        });
        const bullets = entry.querySelectorAll<HTMLElement>('.tl-bullet');
        if (dot)        revealTl.fromTo(dot,     { scale: 0, autoAlpha: 0 },                              { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(2.5)' });
        if (year)       revealTl.fromTo(year,    { x: -20, autoAlpha: 0, immediateRender: true },          { x: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' }, '-=0.1');
        if (company)    revealTl.fromTo(company, { y: 44, autoAlpha: 0, immediateRender: true },           { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' }, '-=0.2');
        if (meta.length) revealTl.fromTo(meta,  { y: 12, autoAlpha: 0, immediateRender: true },           { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out', stagger: 0.07 }, '-=0.45');
        if (bullets.length) revealTl.fromTo(bullets, { y: 8, autoAlpha: 0, immediateRender: true },       { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out', stagger: 0.06 }, '-=0.3');

        /* Light scrub — text glows as entry reaches viewport center, dims as it leaves */
        const lightTl = gsap.timeline({
          scrollTrigger: {
            trigger: entry,
            start: 'top 65%',
            end: 'bottom 35%',
            scrub: 0.8,
          },
        });
        if (company) {
          lightTl
            .fromTo(company, { color: 'rgba(255,255,255,0.2)' }, { color: '#fff', ease: 'none', duration: 0.5 }, 0)
            .to(company, { color: 'rgba(255,255,255,0.2)', ease: 'none', duration: 0.5 }, 0.5);
        }
        if (year) {
          lightTl
            .fromTo(year, { color: 'rgba(255,255,255,0.25)' }, { color: 'rgba(255,255,255,0.6)', ease: 'none', duration: 0.5 }, 0)
            .to(year, { color: 'rgba(255,255,255,0.25)', ease: 'none', duration: 0.5 }, 0.5);
        }
        if (meta.length) {
          lightTl
            .fromTo(meta, { color: 'rgba(255,255,255,0.3)' }, { color: 'rgba(255,255,255,0.65)', ease: 'none', duration: 0.5 }, 0)
            .to(meta, { color: 'rgba(255,255,255)', ease: 'none', duration: 0.5 }, 0.5);
        }
        if (bullets.length) {
          lightTl
            .fromTo(bullets, { color: 'rgba(255,255,255)' }, { color: 'rgba(255,255,255,0.65)', ease: 'none', duration: 0.5 }, 0)
            .to(bullets, { color: 'rgba(255,255,255,0.3)', ease: 'none', duration: 0.5 }, 0.5);
        }
      });
    }

    /* ── Social proof ────────────────────────────────────────── */
    if (proofRef.current) {
      gsap.fromTo(proofRef.current.querySelectorAll('.proof-cell'),
        { y: 30, autoAlpha: 0 },
        {
          y: 0, autoAlpha: 1, duration: 0.65, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: proofRef.current, start: 'top 85%', ...ST },
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="about"
      style={{ overflow: 'hidden', background: '#ffffff' }}
    >

      {/* ════════════════════════════════════════════════════
          WHITE PART — About + Bio
      ════════════════════════════════════════════════════ */}
      <div className="about-white-part" style={{ background: '#ffffff', padding: '120px 40px 100px' }}>
        <p className="about-tag" style={{ ...tagLight, marginBottom: '80px', visibility: 'hidden' }}>
          02 — About
        </p>

        <div
          ref={bioRef}
          className="bio-grid"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}
        >
          {/* Left — architectural title */}
          <div>
            <h2
              className="bio-el"
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 'clamp(2.5rem, 7.5vw, 8rem)',
                lineHeight: 0.88,
                letterSpacing: '-0.04em',
                color: '#000000',
                textTransform: 'uppercase',
                visibility: 'hidden',
              }}
            >
              AI<br />Engineer<span style={{ color: 'rgba(0,0,0,0.2)' }}>.</span>
            </h2>

            <div
              className="bio-el"
              style={{
                width: '48px',
                height: '1px',
                background: '#000000',
                margin: '32px 0',
                visibility: 'hidden',
              }}
            />

            <p
              className="bio-el"
              style={{
                fontFamily: MONO,
                fontSize: '0.7rem',
                color: 'rgba(0,0,0)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                lineHeight: 1.7,
                visibility: 'hidden',
              }}
            >
              Alexandria, Egypt<br />
              BSc · AI Major · <b className='font-black text-xl'>GPA 3.828</b>
            </p>
          </div>

          {/* Right — punchy statement */}
          <div style={{ paddingTop: '12px' }}>
            <p
              className="bio-el"
              style={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 'clamp(1.25rem, 2vw, 1.65rem)',
                lineHeight: 1.4,
                color: '#000000',
                letterSpacing: '-0.02em',
                marginBottom: '28px',
                visibility: 'hidden',
              }}
            >
              Building intelligent systems that operate in the real world  not just in demos.
            </p>

            <p
              className="bio-el"
              style={{
                fontFamily: MONO,
                fontSize: '0.78rem',
                lineHeight: 1.85,
                color: 'rgba(0,0,0,0.55)',
                maxWidth: '440px',
                visibility: 'hidden',
              }}
            >
              Currently at Nokia designing AI agents and building Agents, RAG pipelines, and LLM
              systems for real production environments. Previously shipped AI products at
              Singularity Labs and built web-ui at TechWebInnovations OÜ.
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          BLACK PART — slides in as expanding rounded card
      ════════════════════════════════════════════════════ */}
      <div
        ref={darkRef}
        className="about-dark-part"
        style={{ background: '#000000', padding: '100px 40px 120px' }}
      >

        {/* 2. CORE PILLARS */}
        <section>
          <div style={{ overflow: 'hidden', lineHeight: 0.88, paddingBottom: '0.1em', marginBottom: '48px' }}>
            <h2
              className="expertise-label"
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 'clamp(2rem, 9vw, 10rem)',
                letterSpacing: '-0.04em',
                lineHeight: 0.88,
                color: '#ffffff',
                textTransform: 'uppercase',
              }}
            >
              Expertise
            </h2>
          </div>

          <div ref={pillarsRef}>
            <div
              className="pillar-header"
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr',
                gap: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span style={tagDark}>#</span>
              <span style={tagDark}>Domain</span>
            </div>

            {PILLARS.map((p, i) => (
              <div
                key={p.num}
                className="pillar-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr',
                  gap: '24px',
                  padding: '28px 40px',
                  borderBottom: i < PILLARS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  visibility: 'hidden',
                  transition: 'background 0.25s',
                  margin: '0 -40px',
                } as React.CSSProperties}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <span style={{ ...tagDark, paddingTop: '5px', alignSelf: 'start' }}>{p.num}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)',
                      color: '#ffffff',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                      marginBottom: '8px',
                    }}>
                      {p.title}
                    </p>
                    <p style={{ fontFamily: MONO, fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.65 }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={ruleDark} />

        {/* 3. EXPERIENCE TIMELINE */}
        <section>
          <div style={{ overflow: 'hidden', lineHeight: 0.88, paddingBottom: '0.1em', marginBottom: '64px' }}>
            <h2
              className="experience-label"
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 'clamp(2rem, 9vw, 10rem)',
                letterSpacing: '-0.04em',
                lineHeight: 0.88,
                color: '#ffffff',
                textTransform: 'uppercase',
              }}
            >
              Experience
            </h2>
          </div>

          <div ref={timelineRef} style={{ position: 'relative', paddingLeft: '32px' }}>

            {/* Vertical line — draws down as you scroll */}
            <div
              className="tl-line"
              style={{
                position: 'absolute',
                left: 0,
                top: '8px',
                width: '1px',
                height: 'calc(100% - 24px)',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.04) 100%)',
                transformOrigin: 'top',
                transform: 'scaleY(0)',
              }}
            />

            {TIMELINE.map((entry, i) => (
              <div
                key={i}
                className="tl-entry"
                style={{
                  position: 'relative',
                  paddingBottom: i < TIMELINE.length - 1 ? '80px' : '0',
                }}
              >
                {/* Dot marker */}
                <div
                  className={'tl-dot' + (i === 0 ? ' tl-dot-now' : '')}
                  style={{
                    position: 'absolute',
                    left: '-36px',
                    top: '10px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: i === 0 ? '#fff' : 'rgba(255,255,255,0.3)',
                    boxShadow: i === 0 ? '0 0 14px rgba(255,255,255,0.55)' : 'none',
                  }}
                />

                {/* Year / period */}
                <p
                  className="tl-year"
                  style={{
                    fontFamily: MONO,
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.12em',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {entry.years}
                  {i === 0 && (
                    <span style={{
                      padding: '2px 9px',
                      borderRadius: '999px',
                      background: 'rgba(0,128,0)',
                      color: 'rgba(0,0,0)',
                      fontSize: '0.52rem',
                      letterSpacing: '0.12em',
                      fontFamily: MONO,
                    }}>
                      NOW
                    </span>
                  )}
                </p>

                {/* Company — big editorial headline */}
                <h3
                  className="tl-company"
                  style={{
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize: 'clamp(1.9rem, 4vw, 3.2rem)',
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: '-0.04em',
                    lineHeight: 0.9,
                    marginBottom: '20px',
                  }}
                >
                  {entry.company}
                </h3>

                {/* Role */}
                <p
                  className="tl-meta"
                  style={{
                    fontFamily: FONT,
                    fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
                    color: 'rgba(255,255,255,0.28)',
                    letterSpacing: '-0.01em',
                    marginBottom: '6px',
                  }}
                >
                  {entry.role}
                </p>

                {/* Location */}
                <p
                  className="tl-meta"
                  style={{
                    fontFamily: MONO,
                    fontSize: '0.58rem',
                    color: 'rgba(255,255,255,0.28)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '20px',
                  }}
                >
                  {entry.detail}
                </p>

                {/* Bullets */}
                <ul
                  className="tl-bullets"
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {entry.bullets.map((b, bi) => (
                    <li
                      key={bi}
                      className="tl-bullet"
                      style={{
                        fontFamily: MONO,
                        fontSize: '1rem',
                        color: 'rgba(255,255,255,0.3)',
                        lineHeight: 1.65,
                        paddingLeft: '14px',
                        position: 'relative',
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        color: 'rgba(255,255,255,0.15)',
                      }}>—</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>


      </div>

      {/* ── Responsive overrides + animations ───────────── */}
      <style>{`
        @keyframes dot-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(255,255,255,0.45); }
          50%       { box-shadow: 0 0 22px rgba(167,139,250,0.75); }
        }
        .tl-dot-now { animation: dot-pulse 2.4s ease-in-out infinite; }

        @media (max-width: 768px) {
          .about-white-part { padding: 80px 24px 60px !important; }
          .about-dark-part  { padding: 60px 24px 80px !important; }
          .bio-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .proof-grid { grid-template-columns: 1fr 1fr !important; }
          .tl-entry { padding-bottom: 56px !important; }
          .pillar-row {
            margin: 0 !important;
            padding: 24px 0 !important;
          }
        }
        @media (max-width: 480px) {
          .proof-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
