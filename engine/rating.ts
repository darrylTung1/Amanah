import { keys, type Values } from './model.ts';

export function districtRating(values: Values) {
  const score = Math.round(
    (keys.reduce((sum, key) => sum + values[key], 0) * 100) / keys.length,
  );
  const critical = keys.filter((key) => values[key] < 0.3);
  const label =
    score >= 80
      ? 'Thriving'
      : score >= 60
        ? 'Healthy'
        : score >= 40
          ? 'Under pressure'
          : score >= 20
            ? 'Struggling'
            : 'In crisis';
  return { score, label, critical };
}
