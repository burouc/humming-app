import { useEffect, useState } from 'react';

interface FloatingNotesProps {
  active?: boolean;
}

const NOTE_COUNT = 6;

const generateNoteStyle = (seed: number) => {
  const angle = (seed / NOTE_COUNT) * Math.PI * 2;
  const radius = 140 + (seed % 3) * 16;
  return {
    transform: `translate(-50%, -50%) translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`
  } as const;
};

export const FloatingNotes = ({ active = false }: FloatingNotesProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setPhase((prev) => (prev + 1) % NOTE_COUNT);
    }, 800);

    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <div className={`note-cloud ${active ? 'note-cloud--active' : ''}`}>
      {new Array(NOTE_COUNT).fill(null).map((_, index) => (
        <div
          key={`note-${index}`}
          className={`note note--${(index + phase) % 3}`}
          style={generateNoteStyle(index)}
        >
          ♫
        </div>
      ))}
    </div>
  );
};
