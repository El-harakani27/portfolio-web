'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Magnet from '@/components/Magnet';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FONT = 'var(--font-syne), var(--display), sans-serif';
const MONO = "'Elms Sans', sans-serif";

/* Deterministic bar values — no Math.random to avoid SSR/hydration mismatch */
const BARS = Array.from({ length: 44 }, (_, i) => ({
  height: +(Math.abs(Math.sin(i * 2.3 + 1)) * 55 + 14).toFixed(1),
  delay:  +(Math.abs(Math.sin(i * 3.7))      * 1.5).toFixed(2),
  duration: +(Math.abs(Math.sin(i * 5.1))   * 0.45 + 0.4).toFixed(2),
}));

const barColor = (i: number) =>
  i % 3 === 0 ? 'rgba(168,85,247,0.7)' :
  i % 3 === 1 ? 'rgba(249,115,22,0.55)' :
                'rgba(255,255,255,0.22)';

export default function AITeaserSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const ST = { toggleActions: 'play none none none' as const };

    /* ── Meta elements fade-up ─────────────────────────────── */
    gsap.fromTo('.ai-meta',
      { y: 20, autoAlpha: 0 },
      {
        y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', ...ST },
      }
    );

    /* ── Title line 1: clip-reveal + letterSpacing scrub ────── */
    gsap.fromTo('.ai-title-1',
      { y: '100%', letterSpacing: '0.06em' },
      {
        y: '0%', letterSpacing: '-0.04em',
        ease: 'none',
        scrollTrigger: {
          trigger: '.ai-title-1',
          start: 'top 100%',
          end: 'top 48%',
          scrub: 1.5,
        },
      }
    );

    /* ── Title line 2: slightly offset scrub ───────────────── */
    gsap.fromTo('.ai-title-2',
      { y: '100%', letterSpacing: '0.06em' },
      {
        y: '0%', letterSpacing: '-0.04em',
        ease: 'none',
        scrollTrigger: {
          trigger: '.ai-title-2',
          start: 'top 108%',
          end: 'top 52%',
          scrub: 1.5,
        },
      }
    );

    /* ── Waveform stagger entrance ──────────────────────────── */
    ScrollTrigger.create({
      trigger: '.waveform',
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to('.wave-bar', {
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
          stagger: { each: 0.02, from: 'center' },
        });
      },
    });

    /* ── CTA entrance ───────────────────────────────────────── */
    gsap.fromTo('.ai-cta',
      { y: 32, autoAlpha: 0 },
      {
        y: 0, autoAlpha: 1, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: '.ai-cta', start: 'top 88%', ...ST },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="ai-demo"
      style={{ background: '#000000', padding: '120px 40px 140px', overflow: 'hidden', position: 'relative' }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(124,58,237,0.07) 0%, transparent 70%)',
      }} />

      <style>{`
        @keyframes wave-pulse {
          0%   { transform: scaleY(0.22); }
          100% { transform: scaleY(1);    }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* Label */}
        <p
          className="ai-meta"
          style={{
            fontFamily: MONO, fontSize: '0.6rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
            marginBottom: '40px', visibility: 'hidden',
          }}
        >
          05 — AI Interview
        </p>

        {/* Title line 1 */}
        <div style={{ overflow: 'hidden', lineHeight: 0.88, paddingBottom: '0.1em' }}>
          <h2
            className="ai-title-1"
            style={{
              fontFamily: FONT, fontWeight: 800,
              fontSize: 'clamp(3rem, 9vw, 10rem)',
              letterSpacing: '-0.04em', lineHeight: 0.88,
              color: '#ffffff', textTransform: 'uppercase', margin: 0,
            }}
          >
            Ask Me
          </h2>
        </div>

        {/* Title line 2 — gradient */}
        <div style={{ overflow: 'hidden', lineHeight: 0.88, paddingBottom: '0.1em', marginBottom: '64px' }}>
          <h2
            className="ai-title-2"
            style={{
              fontFamily: FONT, fontWeight: 800,
              fontSize: 'clamp(3rem, 9vw, 10rem)',
              letterSpacing: '-0.04em', lineHeight: 0.88,
              textTransform: 'uppercase', margin: 0,
              background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Anything.
          </h2>
        </div>

        {/* Waveform spectrum */}
        <div
          className="waveform"
          style={{
            display: 'flex', alignItems: 'flex-end', gap: '3px',
            height: '80px', marginBottom: '64px',
          }}
        >
          {BARS.map((bar, i) => (
            <div
              key={i}
              className="wave-bar"
              style={{
                flex: 1,
                height: `${bar.height}px`,
                background: barColor(i),
                borderRadius: '2px',
                transformOrigin: 'bottom',
                opacity: 0,
                animation: `wave-pulse ${bar.duration}s ease-in-out ${bar.delay}s infinite alternate`,
              }}
            />
          ))}
        </div>

        {/* Rule */}
        <div
          className="ai-meta"
          style={{
            width: '48px', height: '1px',
            background: 'rgba(255,255,255,0.3)',
            margin: '0 0 32px', visibility: 'hidden',
          }}
        />

        {/* Body */}
        <p
          className="ai-meta"
          style={{
            fontFamily: MONO, fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em',
            textTransform: 'uppercase', lineHeight: 1.8,
            maxWidth: '500px', marginBottom: '56px', visibility: 'hidden',
          }}
        >
          Speak to an AI version of me. Ask about my projects, stack, or background.
          <br />Powered by Whisper STT · LangGraph · Real-time TTS.
        </p>

        {/* CTA */}
        <div className="ai-cta" style={{ visibility: 'hidden' }}>
          <Magnet magnetStrength={3} padding={60}>
            <Link
              href="/interview"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '14px',
                padding: '20px 52px',
                fontFamily: FONT, fontWeight: 800,
                fontSize: '1.1rem', letterSpacing: '0.01em',
                textTransform: 'uppercase',
                color: '#000000', background: '#ffffff',
                border: '2px solid #ffffff',
                borderRadius: '4px',
                textDecoration: 'none',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#000000';
              }}
            >
              Try the Interview
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Magnet>

        </div>
      </div>
    </section>
  );
}
