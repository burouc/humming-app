"use client";

import { useEffect, useMemo, useState } from "react";

const HUMMING_SESSION_MS = 15000;

export default function HomePage() {
  const [elapsed, setElapsed] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [savedSessions, setSavedSessions] = useState(0);

  useEffect(() => {
    void fetch("/api/sessions")
      .then((response) => response.json())
      .then((data: { sessions?: unknown[] }) => setSavedSessions(data.sessions?.length ?? 0))
      .catch(() => setSavedSessions(0));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 200;
        if (next >= HUMMING_SESSION_MS) {
          setCompletedSessions((sessions) => Math.min(sessions + 1, 3));
          void fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ durationMs: HUMMING_SESSION_MS, bananasEarned: 1 })
          }).then(() => setSavedSessions((count) => count + 1));
          return 0;
        }
        return next;
      });
    }, 200);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (completedSessions === 3) {
      const timeout = window.setTimeout(() => setCompletedSessions(0), 2400);
      return () => window.clearTimeout(timeout);
    }
  }, [completedSessions]);

  const progress = useMemo(() => elapsed / HUMMING_SESSION_MS, [elapsed]);
  const celebrating = completedSessions === 3;

  return (
    <div className={`app-shell ${celebrating ? "app-shell--celebrating" : ""}`}>
      <header className="top-bar">
        <h1 className="app-title">HUMM</h1>
        <span className="saved-pill">Saved sessions: {savedSessions}</span>
      </header>

      <main className="play-space">
        <div className="note-cloud" aria-hidden>
          {["♪", "♫", "♬"].map((note, index) => (
            <span
              className={`note note--${index}`}
              key={note}
              style={{ transform: `translate(${(index - 1) * 64}px, ${index % 2 === 0 ? -70 : 45}px)` }}
            >
              {note}
            </span>
          ))}
        </div>
        <div className={`mammoth ${celebrating ? "mammoth--celebrate" : ""}`}>
          <img src="/mammoth.svg" alt="Baby mammoth dancing" />
        </div>
      </main>

      <footer className="session-footer">
        <div className="banana-row">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={`banana ${index < completedSessions ? "banana--earned" : ""}`}>
              <img src="/banana.svg" alt="Banana reward" />
            </div>
          ))}
        </div>
        <div className="progress-wrap">
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>
      </footer>
    </div>
  );
}
