'use client';
import * as m from 'motion/react-m';
import { useRef } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import AnimatedStat from '@/components/AnimatedStat';
import { keys, type State } from '@/engine/model';
import { districtRating } from '@/engine/rating';

export default function DistrictRating({
  state,
  previous,
  preview = false,
  comparisonLabel,
}: {
  state: State;
  previous?: State;
  preview?: boolean;
  comparisonLabel?: string;
}) {
  const chart = useRef<HTMLDivElement>(null);
  const visible = useInView(chart, { once: true, amount: 0.15 });
  const reduced = useReducedMotion();
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
          <AnimatedStat
            value={rating.score}
            from={previous ? districtRating(previous).score : rating.score}
          />
          <small>/100</small>
        </strong>
      </div>
      {delta !== null && (
        <p className={delta < 0 ? 'warning' : 'gold'}>
          {delta > 0 ? '+' : ''}
          {delta} points{' '}
          {comparisonLabel ??
            (preview
              ? 'from proposed immediate changes'
              : `since ${previous!.year}`)}
        </p>
      )}
      <div className="rating-categories" ref={chart}>
        {keys.map((key, index) => {
          const current = Math.round(state[key] * 100);
          const before = previous ? Math.round(previous[key] * 100) : current;
          const change = current - before;
          return (
            <div className="rating-category" key={key}>
              <span className="category-name">{key}</span>
              <div className="category-values">
                {previous && (
                  <span className="category-before">{before} → </span>
                )}
                <strong>
                  <AnimatedStat value={current} from={before} />
                </strong>
                {previous && (
                  <span
                    className={`category-delta ${change < 0 ? 'loss' : change > 0 ? 'gain' : 'steady'}`}
                  >
                    {change > 0 ? '↑ +' : change < 0 ? '↓ ' : ''}
                    {change} pts
                  </span>
                )}
              </div>
              <meter
                className="rating-accessible-meter"
                min={0}
                max={100}
                value={state[key] * 100}
                aria-label={key}
              />
              <div className="rating-bar" aria-hidden="true">
                <m.span
                  initial={false}
                  animate={{
                    scaleX: visible
                      ? state[key]
                      : (previous?.[key] ?? state[key]),
                  }}
                  transition={{
                    duration: reduced ? 0 : 0.65,
                    delay: reduced ? 0 : index * 0.04,
                    ease: 'easeOut',
                  }}
                />
                {previous && (
                  <>
                    <m.span
                      className={`rating-change-band ${change < 0 ? 'loss' : 'gain'}`}
                      initial={false}
                      animate={{
                        left: `${Math.min(previous[key], state[key]) * 100}%`,
                        width: `${visible ? Math.abs(state[key] - previous[key]) * 100 : 0}%`,
                      }}
                      transition={{ duration: reduced ? 0 : 0.65 }}
                    />
                    <span
                      className="rating-previous"
                      style={{ left: `${previous[key] * 100}%` }}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {previous && (
        <p className="rating-bar-key">
          White tick: comparison value · Highlight: change · Scale 0–100
        </p>
      )}
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
