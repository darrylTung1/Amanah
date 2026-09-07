import { keys, type State } from '@/engine/model';
import { districtRating } from '@/engine/rating';

export default function DistrictRating({
  state,
  previous,
  preview = false,
}: {
  state: State;
  previous?: State;
  preview?: boolean;
}) {
  const rating = districtRating(state);
  const delta = previous ? rating.score - districtRating(previous).score : null;
  return (
    <section className="district-rating" aria-label="Overall district rating">
      <div className="rating-heading">
        <div>
          <p className="eyebrow">
            {preview ? 'Programme preview' : state.year} · Overall district
            rating
          </p>
          <h2>{rating.label}</h2>
        </div>
        <strong className="rating-number">
          {rating.score}
          <small>/100</small>
        </strong>
      </div>
      {delta !== null && (
        <p className={delta < 0 ? 'warning' : 'gold'}>
          {delta > 0 ? '+' : ''}
          {delta} points{' '}
          {preview
            ? 'from proposed immediate changes'
            : `since ${previous!.year}`}
        </p>
      )}
      <div className="rating-categories">
        {keys.map((key) => (
          <div key={key}>
            <span>{key}</span>
            <strong>{Math.round(state[key] * 100)}</strong>
            <meter
              min={0}
              max={100}
              value={state[key] * 100}
              aria-label={key}
            />
          </div>
        ))}
      </div>
      {rating.critical.length > 0 && (
        <p className="warning">
          Needs urgent attention: {rating.critical.join(', ')} below 30/100.
        </p>
      )}
      <details>
        <summary>How this rating works</summary>
        <p>
          Equal-weight average of affordability, continuity, vitality, equity
          and habitability, rounded once. Each category contributes 20%.
          Capacity is your spending budget and is excluded. This is a game
          score, not a real-world assessment; lasting harms remain on your
          record even if the score recovers.
        </p>
      </details>
    </section>
  );
}
