'use client';

import { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectCard, { Project } from '@/components/ProjectCard';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FONT = 'var(--font-syne), var(--display), sans-serif';
const MONO = "'Elms Sans', sans-serif";

const PROJECTS: Project[] = [
  {
    title: 'Digital Twin — Network Topology Extractor',
    summary: "Parses PowerPoint network diagrams into structured YAML topology files using LLM output with Pydantic models, built for Nokia's DTaaS platform.",
    description: 'Extracts nodes, connections, and link types from network topology diagrams in PowerPoint. Exports results as YAML files ready for Digital Twin as a Service (DTaaS). Includes a chatbot interface for querying the topology and generates an LLM-powered network summary.',
    context: 'Built at Nokia as part of enterprise AI engineering work · LLM + Pydantic + YAML',
    tags: ['Python', 'LLM', 'Pydantic', 'FastAPI', 'YAML', 'Nokia'],
    github: 'https://github.com/El-harakani27',
  },
  {
    title: 'MonoTalk — Graduation Project',
    summary: 'Mobile + web app for real-time interaction with museum monuments, promoting Egyptian culture with multilingual AI.',
    description: 'Built a CNN model for monument detection from scratch (TensorFlow), then improved with ResNet via transfer learning. Engineered a multilingual sentiment analysis pipeline: language detection → translation → BERT sentiment. Integrated TTS and STT for LLM-powered conversations with cultural artifacts.',
    context: 'Feb 2023 – Jun 2024 · Alexandria University Graduation Project',
    tags: ['TensorFlow', 'Keras', 'ResNet', 'BERT', 'TTS', 'STT', 'Python'],
    github: 'https://github.com/El-harakani27',
  },
  {
    title: 'Hieroglyphic OCR & Translator',
    summary: 'Photograph an ancient Egyptian wall — get a translation. OCR + translation pipeline for hieroglyphic characters.',
    description: 'Developed an object detection and OCR system for ancient Egyptian hieroglyphic characters using Detectron2 with transfer learning. Tourists point a camera at hieroglyphs and receive a full translation.',
    context: 'Research project · TensorFlow, Detectron2, Keras, Python',
    tags: ['Computer Vision', 'TensorFlow', 'Detectron2', 'OCR', 'Python', 'Keras'],
    github: 'https://github.com/El-harakani27',
  },
  {
    title: 'BMW Logistics Automation',
    summary: 'Automated email generation and analysis system — LLMs write outreach emails and evaluate logistics offers.',
    description: 'Built a fully automated logistics pipeline where an LLM generates outreach emails to logistics companies, then analyses replies to determine the best offer based on defined business criteria.',
    context: 'Industry automation project · LangChain, Ollama, FastAPI, Python',
    tags: ['LangChain', 'Ollama', 'FastAPI', 'Python', 'LLM', 'Automation'],
    github: 'https://github.com/El-harakani27',
  },
];

export default function ProjectsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP((_, contextSafe) => {
    const ST = { toggleActions: 'play none none none' as const };

    /* ── Meta elements fade-up ───────────────────────────── */
    gsap.fromTo('.projects-meta',
      { y: 20, autoAlpha: 0 },
      {
        y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', ...ST },
      }
    );

    /* ── Title: clip-reveal + letterSpacing scrub ─────────── */
    gsap.fromTo('.projects-title',
      { y: '100%', letterSpacing: '0.06em' },
      {
        y: '0%', letterSpacing: '-0.04em',
        ease: 'none',
        scrollTrigger: {
          trigger: '.projects-title',
          start: 'top 95%',
          end: 'top 45%',
          scrub: 1.5,
        },
      }
    );

    /* ── Cards: staggered entrance ────────────────────────── */
    const cardEls = Array.from(
      sectionRef.current!.querySelectorAll<HTMLElement>('.proj-card-wrap')
    );

    gsap.set(cardEls, { autoAlpha: 0, y: 60 });

    ScrollTrigger.batch(cardEls, {
      onEnter: (elements) => {
        gsap.to(elements, {
          autoAlpha: 1, y: 0,
          duration: 0.9, ease: 'power3.out', stagger: 0.15,
        });
      },
      start: 'top 88%',
      once: true,
    });

    /* ── Cards: 3D tilt on hover ──────────────────────────── */
    const handleMove = contextSafe!((e: Event) => {
      const wrap = e.currentTarget as HTMLElement;
      const me = e as MouseEvent;
      const rect = wrap.getBoundingClientRect();
      const dx = (me.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (me.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      gsap.to(wrap, {
        rotateY: dx * 7,
        rotateX: -dy * 5,
        scale: 1.015,
        duration: 0.35,
        ease: 'power2.out',
      });
    });

    const handleLeave = contextSafe!((e: Event) => {
      const wrap = e.currentTarget as HTMLElement;
      gsap.to(wrap, {
        rotateY: 0, rotateX: 0, scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.35)',
      });
    });

    cardEls.forEach(card => {
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);
    });

    return () => {
      cardEls.forEach(card => {
        card.removeEventListener('mousemove', handleMove);
        card.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="projects"
      style={{ background: '#000000', padding: '120px 40px 140px', overflow: 'hidden' }}
    >
      <style>{`
        @media (max-width: 768px) {
          #projects { padding: 80px 24px 100px !important; }
        }
      `}</style>
      {/* Label */}
      <p
        className="projects-meta"
        style={{
          fontFamily: MONO,
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '40px',
          visibility: 'hidden',
        }}
      >
        04 — Work
      </p>

      {/* Title */}
      <div style={{ overflow: 'hidden', lineHeight: 0.88, paddingBottom: '0.1em' }}>
        <h2
          className="projects-title"
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
          Work
        </h2>
      </div>

      {/* Rule */}
      <div
        className="projects-meta"
        style={{ width: '48px', height: '1px', background: 'rgba(255,255,255,0.3)', margin: '32px 0', visibility: 'hidden' }}
      />

      {/* Descriptor */}
      <p
        className="projects-meta"
        style={{
          fontFamily: MONO,
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          lineHeight: 1.7,
          marginBottom: '80px',
          visibility: 'hidden',
        }}
      >
        Enterprise systems, research, and everything in between.
      </p>

      {/* Cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
          perspective: '1200px',
        }}
      >
        {PROJECTS.map((project, i) => (
          <div
            key={project.title}
            className="proj-card-wrap"
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
          >
            <ProjectCard
              project={project}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              index={i}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
