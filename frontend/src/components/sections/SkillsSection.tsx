'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  SiPython, SiTensorflow, SiLangchain, SiFastapi,
  SiReact, SiNextdotjs, SiDocker, SiGithub,
  SiMongodb, SiMysql, SiKeras, SiHuggingface, SiPytorch,
} from '@icons-pack/react-simple-icons';
import LogoLoop from '@/components/LogoLoop';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FONT = 'var(--font-syne), var(--display), sans-serif';
const MONO = "'Elms Sans', sans-serif";

type IconComp = React.ComponentType<{ size?: number; color?: string }>;

function IconNode({ Ic, label }: { Ic: IconComp; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '0 16px' }}>
      <Ic size={52} color="rgba(0,0,0,0.72)" />
      <span style={{
        fontFamily: MONO,
        fontSize: '0.62rem',
        color: 'rgba(0,0,0,0.38)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        whiteSpace: 'nowrap' as const,
      }}>
        {label}
      </span>
    </div>
  );
}

const ROW1 = [
  { node: <IconNode Ic={SiPython}      label="Python"      />, href: 'https://www.python.org',          ariaLabel: 'Python' },
  { node: <IconNode Ic={SiTensorflow}  label="TensorFlow"  />, href: 'https://www.tensorflow.org',      ariaLabel: 'TensorFlow' },
  { node: <IconNode Ic={SiPytorch}     label="PyTorch"     />, href: 'https://pytorch.org',             ariaLabel: 'PyTorch' },
  { node: <IconNode Ic={SiLangchain}   label="LangChain"   />, href: 'https://www.langchain.com',       ariaLabel: 'LangChain' },
  { node: <IconNode Ic={SiHuggingface} label="HuggingFace" />, href: 'https://huggingface.co',          ariaLabel: 'HuggingFace' },
  { node: <IconNode Ic={SiFastapi}     label="FastAPI"     />, href: 'https://fastapi.tiangolo.com',    ariaLabel: 'FastAPI' },
  { node: <IconNode Ic={SiDocker}      label="Docker"      />, href: 'https://www.docker.com',          ariaLabel: 'Docker' },
  { node: <IconNode Ic={SiKeras}     label="Keras"   />, href: 'https://keras.io',          ariaLabel: 'Keras' },
  { node: <IconNode Ic={SiNextdotjs} label="Next.js" />, href: 'https://nextjs.org',        ariaLabel: 'Next.js' },
  { node: <IconNode Ic={SiReact}     label="React"   />, href: 'https://react.dev',         ariaLabel: 'React' },
  { node: <IconNode Ic={SiMongodb}   label="MongoDB" />, href: 'https://www.mongodb.com',   ariaLabel: 'MongoDB' },
  { node: <IconNode Ic={SiMysql}     label="MySQL"   />, href: 'https://www.mysql.com',     ariaLabel: 'MySQL' },
  { node: <IconNode Ic={SiGithub}    label="GitHub"  />, href: 'https://github.com',        ariaLabel: 'GitHub' },
  { node: <IconNode Ic={SiPytorch}   label="PyTorch" />, href: 'https://pytorch.org',       ariaLabel: 'PyTorch' },
];


export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const ST = { toggleActions: 'play none none none' as const };

    /* ── Tag + rule + descriptor fade-up ─────────────── */
    gsap.fromTo('.skills-meta',
      { y: 20, autoAlpha: 0 },
      {
        y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', ...ST },
      }
    );

    /* ── Title: clip-reveal + letterSpacing scrub ─────── */
    gsap.fromTo('.skills-title',
      { y: '100%', letterSpacing: '0.06em' },
      {
        y: '0%', letterSpacing: '-0.04em',
        ease: 'none',
        scrollTrigger: {
          trigger: '.skills-title',
          start: 'top 100%',
          end: 'top 90%',
          scrub: 1.5,
        },
      }
    );

    /* ── Marquee rows: staggered fade + rise on enter ─── */
    gsap.fromTo('.marquee-row',
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.2,
        scrollTrigger: { trigger: '.marquee-row', start: 'top 88%', ...ST },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="skills"
      style={{ background: '#ffffff', padding: '120px 0 140px', overflow: 'hidden' }}
    >
      <style>{`
        @media (max-width: 768px) {
          #skills { padding-top: 80px !important; padding-bottom: 100px !important; }
        }
      `}</style>
      {/* Label */}
      <p
        className="skills-meta"
        style={{
          fontFamily: MONO,
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.4)',
          textAlign: 'center',
          marginBottom: '40px',
          visibility: 'hidden',
        }}
      >
        03 — Tech Stack
      </p>

      {/* Title — centered */}
      <div style={{ overflow: 'hidden', lineHeight: 0.88, paddingBottom: '0.1em', textAlign: 'center', padding: '0 40px 0.1em' }}>
        <h2
          className="skills-title"
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 10rem)',
            letterSpacing: '-0.04em',
            lineHeight: 0.88,
            color: '#000000',
            textTransform: 'uppercase',
          }}
        >
          Tech Stack
        </h2>
      </div>

      {/* Rule — centered */}
      <div
        className="skills-meta"
        style={{ width: '48px', height: '1px', background: '#000000', margin: '32px auto', visibility: 'hidden' }}
      />

      {/* Descriptor — centered */}
      <p
        className="skills-meta"
        style={{
          fontFamily: MONO,
          fontSize: '0.7rem',
          color: 'rgba(0,0,0,0.4)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          lineHeight: 1.7,
          textAlign: 'center',
          marginBottom: '80px',
          visibility: 'hidden',
        }}
      >
        The tools I reach for when building in production.
      </p>

      {/* Marquee rows — full width, no horizontal padding */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          className="marquee-row"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '36px 0' }}
        >
          <LogoLoop
            logos={ROW1}
            speed={55}
            direction="left"
            logoHeight={90}
            gap={32}
            pauseOnHover
            fadeOut
            fadeOutColor="#ffffff"
            scaleOnHover
            ariaLabel="Tech stack — row 1"
          />
        </div>

      </div>
    </section>
  );
}
