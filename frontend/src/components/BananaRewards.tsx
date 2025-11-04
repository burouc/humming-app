import bananaIcon from '../assets/banana.svg';

interface BananaRewardsProps {
  count: number;
  total?: number;
}

const MAX_BANANAS = 3;

export const BananaRewards = ({ count, total = MAX_BANANAS }: BananaRewardsProps) => {
  const bananas = new Array(total).fill(null);

  return (
    <div className="banana-row" role="status" aria-live="polite">
      {bananas.map((_, index) => {
        const filled = index < count;
        return (
          <div key={`banana-${index}`} className={`banana ${filled ? 'banana--earned' : ''}`}>
            <img src={bananaIcon} alt="Banana reward" />
          </div>
        );
      })}
    </div>
  );
};
