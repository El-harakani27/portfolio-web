'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FONT = 'var(--font-syne), var(--display), sans-serif';
const MONO = "'Elms Sans', sans-serif";

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const ST = { toggleActions: 'play none none none' as const };

    /* ── Meta elements fade-up ─────────────────────────────── */
    gsap.fromTo('.contact-meta',
      { y: 20, autoAlpha: 0 },
      {
        y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', ...ST },
      }
    );

    /* ── Title line 1: clip-reveal + letterSpacing scrub ────── */
    gsap.fromTo('.contact-t1',
      { y: '100%', letterSpacing: '0.06em' },
      {
        y: '0%', letterSpacing: '-0.04em',
        ease: 'none',
        scrollTrigger: {
          trigger: '.contact-t1',
          start: 'top 100%',
          end: 'top 48%',
          scrub: 1.5,
        },
      }
    );

    /* ── Title line 2: slightly offset ─────────────────────── */
    gsap.fromTo('.contact-t2',
      { y: '100%', letterSpacing: '0.06em' },
      {
        y: '0%', letterSpacing: '-0.04em',
        ease: 'none',
        scrollTrigger: {
          trigger: '.contact-t2',
          start: 'top 108%',
          end: 'top 52%',
          scrub: 1.5,
        },
      }
    );

    /* ── Contact items stagger fade-up ──────────────────────── */
    gsap.fromTo('.contact-item',
      { y: 24, autoAlpha: 0 },
      {
        y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.14,
        scrollTrigger: { trigger: '.contact-item', start: 'top 88%', ...ST },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="contact"
      style={{ background: '#ffffff', padding: '120px 40px 80px', overflow: 'hidden' }}
    >
      <style>{`
        @media (max-width: 768px) {
          #contact { padding: 80px 24px 60px !important; }
        }
        @media (max-width: 640px) {
          .email-link { font-size: clamp(0.7rem, 3.8vw, 1rem) !important; gap: 8px !important; }
          .email-link svg { width: 14px !important; height: 14px !important; }
        }
      `}</style>
      <style>{`
        .email-link {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          position: relative;
          text-decoration: none;
          padding-bottom: 6px;
        }
        .email-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: #000;
          transform: scaleX(0.12);
          transform-origin: left;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .email-link:hover::after {
          transform: scaleX(1);
        }
        .social-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          padding: 14px 22px;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 6px;
          background: transparent;
          transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
        }
        .social-link:hover {
          background: #000;
          border-color: #000;
          color: #fff !important;
        }
        .social-link:hover svg {
          color: #fff;
        }
      `}</style>

      {/* Label */}
      <p
        className="contact-meta"
        style={{
          fontFamily: MONO, fontSize: '0.6rem', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)',
          marginBottom: '40px', visibility: 'hidden',
        }}
      >
        06 — Contact
      </p>

      {/* Title line 1 */}
      <div style={{ overflow: 'hidden', lineHeight: 0.88, paddingBottom: '0.1em' }}>
        <h2
          className="contact-t1"
          style={{
            fontFamily: FONT, fontWeight: 800,
            fontSize: 'clamp(2rem, 9vw, 10rem)',
            letterSpacing: '-0.04em', lineHeight: 0.88,
            color: '#000000', textTransform: 'uppercase', margin: 0,
          }}
        >
          Let&apos;s
        </h2>
      </div>

      {/* Title line 2 */}
      <div style={{ overflow: 'hidden', lineHeight: 0.88, paddingBottom: '0.1em', marginBottom: '72px' }}>
        <h2
          className="contact-t2"
          style={{
            fontFamily: FONT, fontWeight: 800,
            fontSize: 'clamp(2rem, 9vw, 10rem)',
            letterSpacing: '-0.04em', lineHeight: 0.88,
            color: 'rgba(0,0,0,0.12)', textTransform: 'uppercase', margin: 0,
          }}
        >
          Talk.
        </h2>
      </div>

      {/* Rule */}
      <div
        className="contact-meta"
        style={{ width: '48px', height: '1px', background: '#000000', margin: '0 0 32px', visibility: 'hidden' }}
      />

      {/* Descriptor */}
      <p
        className="contact-meta"
        style={{
          fontFamily: MONO, fontSize: '0.7rem', color: 'rgba(0,0,0)',
          letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.8,
          maxWidth: '440px', marginBottom: '64px', visibility: 'hidden',
        }}
      >
        Open to roles, collaborations, and interesting conversations.
        <br />Reach out directly.
      </p>

      {/* Email — the main CTA */}
      <div className="contact-item" style={{ marginBottom: '56px', visibility: 'hidden' }}>
        <a
          href="mailto:mohamedelharakani@gmail.com"
          className="email-link"
          style={{
            fontFamily: FONT, fontWeight: 800,
            fontSize: 'clamp(1.1rem, 2.8vw, 2.2rem)',
            letterSpacing: '-0.02em',
            color: '#000000',
          }}
        >
          mohamedelharakani@gmail.com
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* Secondary links */}
      <div
        className="contact-item"
        style={{ display: 'flex', gap: '12px', marginBottom: '80px', flexWrap: 'wrap', visibility: 'hidden' }}
      >
        <a
          href="https://www.linkedin.com/in/mohamed-el-harakani-b344021ba/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          style={{
            fontFamily: MONO, fontSize: '0.5rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(0,0,0,0.55)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </svg>
          LinkedIn
        </a>
        <a
          href="https://github.com/El-harakani27"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          style={{
            fontFamily: MONO, fontSize: '0.7rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(0,0,0,0.55)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
        <a
          href="/Mohamed_El_Harakani.pdf"
          download
          className="social-link"
          style={{
            fontFamily: MONO, fontSize: '0.7rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(0,0,0,0.55)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v13M7 11l5 5 5-5M5 20h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download CV
        </a>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(0,0,0)', paddingTop: '28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <p style={{
          fontFamily: MONO, fontSize: '0.58rem', letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(0,0,0)',
        }}>
          © 2026 Mohamed El Harakani · Egypt
        </p>

      </div>
    </section>
  );
}
