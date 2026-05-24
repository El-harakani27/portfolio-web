'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FONT = 'var(--font-syne), var(--display), sans-serif';

const metaStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.45)',
  fontSize: '0.62rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontFamily: FONT,
  fontWeight: 500,
};

const navLinkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.5)',
  textDecoration: 'none',
  fontSize: '0.62rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontFamily: FONT,
  fontWeight: 500,
  transition: 'color 0.2s',
};

export default function HeroSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const topBarRef    = useRef<HTMLDivElement>(null);
  const hrTopRef     = useRef<HTMLDivElement>(null);
  const nameWrapRef  = useRef<HTMLDivElement>(null);
  const elRef        = useRef<HTMLDivElement>(null);
  const harakaniRef  = useRef<HTMLDivElement>(null);
  const hrBotRef     = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    /* ── Entrance ──────────────────────────────────────────────── */
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.fromTo(topBarRef.current,
      { y: -28, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9 },
      0
    );
    tl.fromTo([hrTopRef.current, hrBotRef.current],
      { scaleX: 0 },
      { scaleX: 1, duration: 1.1 },
      0.1
    );
    tl.fromTo(elRef.current,
      { y: '110%' },
      { y: '0%', duration: 1.15 },
      0.18
    );
    tl.fromTo(harakaniRef.current,
      { y: '110%' },
      { y: '0%', duration: 1.15 },
      0.36
    );
    tl.fromTo(bottomBarRef.current,
      { y: 28, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9 },
      0.58
    );

    /* ── Scroll: bars fade out ─────────────────────────────────── */
    gsap.fromTo(
      [topBarRef.current, hrTopRef.current, hrBotRef.current, bottomBarRef.current],
      { opacity: 1, immediateRender: false },
      {
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=30%',
          scrub: 1,
        },
      }
    );

    /* ── Scroll: name scales up and blurs out ──────────────────── */
    gsap.fromTo(
      nameWrapRef.current,
      { scale: 1, opacity: 1, filter: 'blur(0px)', immediateRender: false },
      {
        scale: 1.08,
        opacity: 0,
        filter: 'blur(18px)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=55%',
          scrub: 1.4,
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        height: '100svh',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 40px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div
        ref={topBarRef}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '36px',
          paddingBottom: '24px',
          visibility: 'hidden',
        }}
      >
        <span style={{ ...metaStyle, color: '#ffffff', letterSpacing: '0.12em', fontWeight: 600 }}>
          Mohamed El Harakani
        </span>
        <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a
            href="#about"
            style={navLinkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            About
          </a>
          <a
            href="#projects"
            style={navLinkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            Work
          </a>
          <Link
            href="/interview"
            style={{
              ...navLinkStyle,
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '8px 18px',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          >
            AI Interview ↗
          </Link>
        </nav>
      </div>

      {/* Top rule */}
      <div
        ref={hrTopRef}
        style={{
          height: '1px',
          background: 'rgba(255,255,255,0.12)',
          transformOrigin: 'left center',
        }}
      />

      {/* ── Massive name ─────────────────────────────────────────── */}
      <div
        ref={nameWrapRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* EL — clip-reveal wrapper */}
        <div style={{ overflow: 'hidden', lineHeight: 1 }}>
          <div
            ref={elRef}
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: '18vw',
              lineHeight: 0.86,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              whiteSpace: 'nowrap',
            }}
          >
            EL
          </div>
        </div>

        {/* HARAKANI — clip-reveal wrapper */}
        <div style={{ overflow: 'hidden', lineHeight: 1 }}>
          <div
            ref={harakaniRef}
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: '18vw',
              lineHeight: 0.86,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              whiteSpace: 'nowrap',
            }}
          >
            HARAKANI
          </div>
        </div>
      </div>

      {/* Bottom rule */}
      <div
        ref={hrBotRef}
        style={{
          height: '1px',
          background: 'rgba(255,255,255,0.12)',
          transformOrigin: 'left center',
        }}
      />

      {/* ── Bottom bar ───────────────────────────────────────────── */}
      <div
        ref={bottomBarRef}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '20px',
          paddingBottom: '36px',
          visibility: 'hidden',
        }}
      >
        <span style={metaStyle}>AI Engineer @ Nokia</span>
        <span style={metaStyle}>Est. 2026</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={metaStyle}>Scroll</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}
