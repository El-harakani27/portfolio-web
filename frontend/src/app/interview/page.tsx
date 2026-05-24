"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const FONT = "var(--font-syne), var(--display), sans-serif";
const MONO = "'Elms Sans', sans-serif";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const MAX_QUESTIONS = 5;

type MicState = "idle" | "listening" | "thinking";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("interview_session");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    localStorage.setItem("interview_session", id);
  }
  return id;
}

async function convertToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const ctx = new AudioContext({ sampleRate: 16000 });
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  await ctx.close();

  const samples = audioBuffer.length;
  const channelData = audioBuffer.getChannelData(0);

  if (audioBuffer.numberOfChannels > 1) {
    const ch1 = audioBuffer.getChannelData(1);
    for (let i = 0; i < samples; i++) {
      channelData[i] = (channelData[i] + ch1[i]) / 2;
    }
  }

  const pcm = new Int16Array(samples);
  for (let i = 0; i < samples; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  const wavBuffer = new ArrayBuffer(44 + pcm.byteLength);
  const v = new DataView(wavBuffer);
  const str = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i));
  };
  str(0, "RIFF");
  v.setUint32(4, 36 + pcm.byteLength, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 16000, true);
  v.setUint32(28, 16000 * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, pcm.byteLength, true);
  new Int16Array(wavBuffer, 44).set(pcm);

  return new Blob([wavBuffer], { type: "audio/wav" });
}

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  isNew: boolean;
}

function AnimatedAIText({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ delay: i * 0.025, duration: 0.28, ease: "easeOut" }}
          style={{ display: "inline-block", marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

const WELCOME: Message = {
  id: "welcome",
  role: "ai",
  text: "Hi — I'm Mohamed's AI. Ask me anything about his work, skills, or projects. I'll answer in your language.",
  isNew: true,
};

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [micState, setMicState] = useState<MicState>("idle");
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);

  const [inputText, setInputText] = useState("");
  const [isFromVoice, setIsFromVoice] = useState(false);
  const [detectedLang, setDetectedLang] = useState("en");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [ttsState, setTtsState] = useState<"idle" | "generating" | "playing">("idle");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    const sessionId = getSessionId();
    fetch(`${API}/interview/remaining?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.json())
      .then(data => {
        if (typeof data.remaining === "number" && typeof data.limit === "number") {
          setQuestionsUsed(Math.max(0, data.limit - data.remaining));
          if (data.remaining <= 0) setRateLimited(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
  }, [inputText]);

  const addMessage = useCallback((role: "ai" | "user", text: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setMessages((prev) => [
      ...prev.map((m) => ({ ...m, isNew: false })),
      { id, role, text, isNew: true },
    ]);
  }, []);

  const startRecording = useCallback(async () => {
    if (questionsUsed >= MAX_QUESTIONS) { setRateLimited(true); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setMicState("listening");
    } catch {
      alert("Microphone access is required to use this feature.");
    }
  }, [questionsUsed]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setMicState("thinking");
    }
  }, []);

  const transcribeAudio = async (blob: Blob) => {
    const wav = await convertToWav(blob);
    const formData = new FormData();
    formData.append("audio", wav, "recording.wav");
    try {
      const res = await fetch(`${API}/interview/transcribe`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDetectedLang(data.language ?? "en");
      setInputText(data.transcript ?? "");
      setIsFromVoice(true);
      setMicState("idle");
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      addMessage("ai", "I couldn't catch that. Please try again.");
      setMicState("idle");
    }
  };

  const playTts = async (text: string) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setTtsState("generating");
    try {
      const res = await fetch(`${API}/interview/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: detectedLang }),
      });
      if (!res.ok) throw new Error();
      const buf = await res.arrayBuffer();
      const url = URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
      const audio = new Audio(url);
      audioRef.current = audio;
      setTtsState("playing");
      audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; setTtsState("idle"); };
      audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current = null; setTtsState("idle"); };
      audio.play();
    } catch {
      setTtsState("idle");
    }
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    setIsFromVoice(false);
    addMessage("user", text);
    setMicState("thinking");
    try {
      const res = await fetch(`${API}/interview/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language: detectedLang, session_id: getSessionId() }),
      });
      if (res.status === 429) { setRateLimited(true); setMicState("idle"); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      addMessage("ai", data.response);
      setQuestionsUsed((n) => n + 1);
      setMicState("idle");
      if (ttsEnabled) playTts(data.response);
    } catch {
      addMessage("ai", "Something went wrong. Please try again.");
      setMicState("idle");
    }
  };

  const handleMicClick = () => {
    if (micState === "idle") startRecording();
    else if (micState === "listening") stopRecording();
  };

  const remaining = MAX_QUESTIONS - questionsUsed;
  const canSend = !!inputText.trim() && micState === "idle" && ttsState === "idle" && !rateLimited;

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#000000",
      display: "flex",
      flexDirection: "column",
      cursor: "default",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 70%)",
      }} />

      <style>{`
        .interview-scrollbar::-webkit-scrollbar { width: 3px; }
        .interview-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .interview-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .back-link:hover { color: #ffffff !important; }
        .stop-btn:hover { color: rgba(255,255,255,0.6) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        padding: "16px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(12px)",
      }}>
        <Link
          href="/"
          className="back-link"
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            color: "rgba(255,255,255)",
            textDecoration: "none",
            fontFamily: MONO,
            fontSize: "0.65rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            transition: "color 0.2s",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>

        <span style={{
          fontFamily: MONO,
          fontSize: "0.6rem",
          color: "rgba(255,255,255)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>
          05 — AI Interview
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* TTS toggle */}
          <div style={{ position: "relative" }}>
            {!ttsEnabled && (
              <motion.span
                animate={{ scale: [1, 1.22, 1], opacity: [0.45, 0, 0.45] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", inset: "-4px", borderRadius: "22px",
                  background: "linear-gradient(135deg, #a855f7, #f97316)",
                  zIndex: 0, pointerEvents: "none",
                }}
              />
            )}
            <motion.button
              onClick={() => setTtsEnabled((v) => !v)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              aria-label={ttsEnabled ? "Disable voice responses" : "Enable voice responses"}
              style={{
                position: "relative", zIndex: 1,
                display: "flex", alignItems: "center", gap: "7px",
                padding: "6px 13px 6px 10px",
                borderRadius: "18px", border: "none",
                background: "rgb(255,255,255)",
                color: "#000",
                fontFamily: MONO,
                fontSize: "0.67rem", letterSpacing: "0.05em",
                cursor: "pointer", overflow: "hidden",
                boxShadow: ttsEnabled
                  ? "0 2px 14px rgba(168,85,247,0.4)"
                  : "0 2px 14px rgba(168,85,247,0.2)",
                opacity: ttsEnabled ? 1 : 0.85,
              }}
            >
              {!ttsEnabled && (
                <motion.span
                  animate={{ x: ["-140%", "260%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.8, ease: "easeInOut" }}
                  style={{
                    position: "absolute", inset: 0, width: "55%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent)",
                    pointerEvents: "none",
                  }}
                />
              )}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="rgba(255,255,255,0.25)" />
                {ttsEnabled ? (
                  <>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </>
                ) : (
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeOpacity="0.6" />
                )}
              </svg>
              <span>{ttsEnabled ? "Voice · on" : "Let me talk!"}</span>
              {ttsEnabled && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80", flexShrink: 0 }}
                />
              )}
            </motion.button>
          </div>

          {/* Rate limit */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
              background: rateLimited ? "#f97316" : "#22c55e",
              boxShadow: rateLimited ? "0 0 6px #f97316" : "0 0 6px #22c55e",
            }} />
            <span style={{
              color: "rgba(255,255,255)",
              fontSize: "0.65rem",
              fontFamily: MONO,
              letterSpacing: "0.08em",
            }}>
              {rateLimited ? "limit reached" : `${remaining} / ${MAX_QUESTIONS}`}
            </span>
          </div>
        </div>
      </header>

      {/* ── TTS warning banner ───────────────────────────────────── */}
      <AnimatePresence>
        {ttsEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ overflow: "hidden", position: "relative", zIndex: 9 }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "7px 40px",
              background: "rgba(255,255,255)",
              borderBottom: "1px solid rgba(249,115,22,0.12)",
              fontSize: "1rem",
              color: "rgb(255,0,0)",
              fontFamily: MONO,
              letterSpacing: "0.06em",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Voice responses enabled — replies may take a moment longer.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div
        className="interview-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "40px 40px 16px",
          maxWidth: "760px",
          width: "100%",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-start",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              {/* AI avatar */}
              {msg.role === "ai" && (
                <div style={{
                  width: "28px", height: "28px",
                  borderRadius: "6px", flexShrink: 0,
                  background: "rgb(255,255,255)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", color: "#000",
                  fontFamily: FONT, fontWeight: 800,
                  letterSpacing: "0.04em",
                  marginTop: "2px",
                  
                }}>
                  AI
                </div>
              )}

              {/* Bubble */}
              <div style={{
                maxWidth: "75%",
                padding: "13px 17px",
                borderRadius: msg.role === "ai" ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                background: msg.role === "ai" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)",
                border: "1px solid",
                borderColor: msg.role === "ai" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.12)",
                fontSize: "0.9rem",
                lineHeight: 1.72,
                color: msg.role === "ai" ? "rgba(255,255,255,0.72)" : "#ffffff",
                fontFamily: "inherit",
              }}>
                {msg.role === "ai" && msg.isNew
                  ? <AnimatedAIText text={msg.text} />
                  : msg.text}
              </div>

              {/* User avatar */}
              {msg.role === "user" && (
                <div style={{
                  width: "28px", height: "28px",
                  borderRadius: "6px", flexShrink: 0,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.46rem", color: "rgba(255,255,255)",
                  fontFamily: MONO, fontWeight: 700, letterSpacing: "0.04em",
                  marginTop: "2px",
                }}>
                  You
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Rate-limit notice */}
        <AnimatePresence>
          {rateLimited && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: "center",
                padding: "24px",
                borderRadius: "12px",
                background: "rgba(249,115,22,0.05)",
                border: "1px solid rgba(249,115,22,0.15)",
                color: "rgba(255,255,255,0.45)",
                fontSize: "0.875rem",
                marginTop: "4px",
                fontFamily: MONO,
                letterSpacing: "0.04em",
              }}
            >
              Daily limit reached. Come back tomorrow — or reach out directly.
              <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "14px" }}>
                <a href="mailto:mohamedelharakani@gmail.com" style={{
                  color: "#a855f7", fontSize: "0.75rem", fontFamily: MONO,
                  textDecoration: "none", letterSpacing: "0.08em",
                }}>
                  Email
                </a>
                <a href="https://linkedin.com/in/mohamed-el-harakani" target="_blank" rel="noopener noreferrer" style={{
                  color: "#a855f7", fontSize: "0.75rem", fontFamily: MONO,
                  textDecoration: "none", letterSpacing: "0.08em",
                }}>
                  LinkedIn
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── Bottom controls ──────────────────────────────────────── */}
      <div style={{
        padding: "12px 40px 32px",
        maxWidth: "760px",
        width: "100%",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>
        {/* TTS status */}
        <AnimatePresence>
          {ttsState !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", paddingLeft: "4px" }}
            >
              {ttsState === "generating" ? (
                <>
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#a855f7", flexShrink: 0 }}
                  />
                  <span style={{ color: "#a855f7", fontSize: "0.62rem", fontFamily: MONO, letterSpacing: "0.08em" }}>
                    generating audio…
                  </span>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "16px" }}>
                    {[0.6, 1, 0.75, 1, 0.6].map((h, i) => (
                      <motion.span
                        key={i}
                        animate={{ scaleY: [h, 1, h * 0.5, 1, h] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                        style={{
                          display: "block", width: "3px", height: "16px",
                          borderRadius: "2px", background: "#a855f7", transformOrigin: "bottom",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ color: "#a855f7", fontSize: "0.62rem", fontFamily: MONO, letterSpacing: "0.08em" }}>
                    speaking…
                  </span>
                  <button
                    className="stop-btn"
                    onClick={() => {
                      if (audioRef.current) {
                        const src = audioRef.current.src;
                        audioRef.current.pause();
                        audioRef.current = null;
                        if (src.startsWith("blob:")) URL.revokeObjectURL(src);
                      }
                      setTtsState("idle");
                    }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "rgba(255,255,255,0.25)", padding: "0 2px",
                      fontSize: "0.62rem", fontFamily: MONO, transition: "color 0.2s",
                    }}
                  >
                    stop
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice transcription indicator */}
        <AnimatePresence>
          {isFromVoice && inputText && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", paddingLeft: "4px" }}
            >
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#a855f7", flexShrink: 0 }} />
              <span style={{ color: "#a855f7", fontSize: "0.62rem", fontFamily: MONO, letterSpacing: "0.08em" }}>
                transcribed · edit before sending
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat input bar */}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: "8px",
          background: "rgba(255,255,255,0.04)",
          border: `1.5px solid ${micState === "listening" ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "14px",
          padding: "10px 10px 10px 16px",
          boxShadow: micState === "listening" ? "0 0 0 3px rgba(168,85,247,0.08)" : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}>
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setIsFromVoice(false); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder={rateLimited ? "Daily limit reached." : "Type a message or use the mic…"}
            disabled={rateLimited || micState === "listening" || micState === "thinking" || ttsState !== "idle"}
            aria-label="Message input"
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#ffffff",
              fontSize: "0.95rem", lineHeight: 1.6,
              resize: "none", minHeight: "26px", maxHeight: "160px", overflowY: "auto",
              fontFamily: "inherit",
              cursor: rateLimited ? "not-allowed" : "text",
              opacity: rateLimited ? 0.35 : 1,
            }}
          />

          {/* Mic button */}
          {!rateLimited && (
            <button
              onClick={handleMicClick}
              disabled={micState === "thinking"}
              title={micState === "listening" ? "Stop recording" : "Record voice"}
              style={{
                flexShrink: 0, width: "36px", height: "36px",
                borderRadius: "8px",
                border: `1.5px solid ${micState === "listening" ? "rgba(168,85,247,0.45)" : "rgba(255,255,255,0.1)"}`,
                background: micState === "listening" ? "rgba(168,85,247,0.1)" : "transparent",
                color: micState === "listening" ? "#a855f7" : "rgba(255,255,255,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: micState === "thinking" ? "not-allowed" : "pointer",
                transition: "all 0.18s",
                opacity: micState === "thinking" ? 0.35 : 1,
              }}
            >
              {micState === "listening" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              ) : micState === "thinking" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                    style={{ animation: "spin 1s linear infinite", transformOrigin: "center" }} />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="2" width="6" height="11" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="9" y1="22" x2="15" y2="22" />
                </svg>
              )}
            </button>
          )}

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={!canSend}
            title="Send message"
            style={{
              flexShrink: 0, width: "36px", height: "36px",
              borderRadius: "8px", border: "none",
              background: canSend
                ? "linear-gradient(135deg, #a855f7 0%, #f97316 100%)"
                : "rgba(255,255,255,0.06)",
              color: canSend ? "#fff" : "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: canSend ? "pointer" : "not-allowed",
              transition: "all 0.18s",
              opacity: canSend ? 1 : 0.5,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {/* Hint */}
        {!rateLimited && (
          <p style={{
            margin: "8px 0 0", fontSize: "0.6rem",
            color: "rgba(255,255,255)",
            fontFamily: MONO, letterSpacing: "0.08em",
            paddingLeft: "4px",
          }}>
            Enter to send · Shift+Enter for newline
          </p>
        )}
      </div>
    </div>
  );
}
