'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Project {
  title: string;
  summary: string;
  description: string;
  context: string;
  tags: string[];
  github?: string;
  demo?: string;
}

interface ProjectCardProps {
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

const FONT = 'var(--font-syne), var(--display), sans-serif';
const MONO = "'Elms Sans', sans-serif";

export default function ProjectCard({ project, isOpen, onToggle, index }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const num = String(index + 1).padStart(2, '0');

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: isOpen ? '#111111' : hovered ? '#0f0f0f' : '#0a0a0a',
        border: `1px solid ${isOpen ? 'rgba(255,255,255,0.18)' : hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '12px',
        padding: '28px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Faded number watermark */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: '-6px',
          right: '14px',
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: '5.5rem',
          lineHeight: 1,
          color: 'rgba(255,255,255,0.04)',
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.04em',
        }}
      >
        {num}
      </span>

      {/* Title row */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: '12px', marginBottom: '14px',
      }}>
        <h3 style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: '1.05rem',
          lineHeight: 1.3,
          color: '#ffffff',
          letterSpacing: '-0.01em',
        }}>
          {project.title}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.22 }}
          style={{
            color: isOpen ? '#ffffff' : 'rgba(255,255,255,0.35)',
            flexShrink: 0,
            marginTop: '3px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>

      <p style={{
        fontSize: '0.875rem',
        color: 'rgba(255,255,255,0.45)',
        lineHeight: 1.65,
        marginBottom: '20px',
      }}>
        {project.summary}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {project.tags.map(tag => (
          <span key={tag} style={{
            padding: '3px 10px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.68rem',
            fontFamily: MONO,
            letterSpacing: '0.04em',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.75,
                marginBottom: '10px',
              }}>
                {project.description}
              </p>
              <p style={{
                fontSize: '0.7rem',
                fontFamily: MONO,
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '20px',
                letterSpacing: '0.04em',
              }}>
                {project.context}
              </p>

              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.72rem',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontFamily: MONO,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '7px 16px',
                    borderRadius: '4px',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
