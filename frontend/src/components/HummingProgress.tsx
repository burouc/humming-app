interface HummingProgressProps {
  progress: number;
}

export const HummingProgress = ({ progress }: HummingProgressProps) => {
  const bounded = Math.min(Math.max(progress, 0), 1);

  return (
    <div className="progress-wrap" aria-label="Humming session progress">
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${bounded * 100}%` }} />
      </div>
    </div>
  );
};
