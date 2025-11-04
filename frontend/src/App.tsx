import { useEffect, useMemo, useState } from 'react';
import { BananaRewards } from './components/BananaRewards';
import { FloatingNotes } from './components/FloatingNotes';
import { HummingProgress } from './components/HummingProgress';
import mammothImage from './assets/mammoth.svg';
import gearIcon from './assets/gear.svg';

const HUMMING_SESSION_MS = 15000;

const App = () => {
  const [elapsed, setElapsed] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 200;
        if (next >= HUMMING_SESSION_MS) {
          setCompletedSessions((sessions) => Math.min(sessions + 1, 3));
          return 0;
        }
        return next;
      });
    }, 200);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (completedSessions === 3) {
      const celebrationTimeout = window.setTimeout(() => {
        setCompletedSessions(0);
      }, 2400);

      return () => window.clearTimeout(celebrationTimeout);
    }
    return undefined;
  }, [completedSessions]);

  const progress = useMemo(() => elapsed / HUMMING_SESSION_MS, [elapsed]);
  const celebrating = completedSessions === 3;

  return (
    <div className={`app-shell ${celebrating ? 'app-shell--celebrating' : ''}`}>
      <header className="top-bar">
        <h1 className="app-title">HUMM</h1>
        <button className="settings-button" aria-label="Settings">
          <img src={gearIcon} alt="Settings" />
        </button>
      </header>

      <main className="play-space">
        <FloatingNotes active />
        <div className={`mammoth ${celebrating ? 'mammoth--celebrate' : ''}`}>
          <img src={mammothImage} alt="Baby mammoth dancing" />
        </div>
      </main>

      <footer className="session-footer">
        <BananaRewards count={completedSessions} />
        <HummingProgress progress={progress} />
      </footer>
    </div>
  );
};

export default App;
