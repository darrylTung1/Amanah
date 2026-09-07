'use client';
import { useEffect, useRef } from 'react';
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import * as m from 'motion/react-m';

export default function AnimatedStat({
  value,
  from = value,
}: {
  value: number;
  from?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const progress = useMotionValue(from);
  const display = useTransform(progress, (v) => String(Math.round(v)));
  useEffect(() => {
    if (!visible) return;
    const animation = animate(progress, value, {
      duration: reduced ? 0 : 0.65,
      ease: 'easeOut',
    });
    return () => animation.stop();
  }, [value, visible, reduced, progress]);
  return (
    <span ref={ref} className="animated-stat">
      <span className="rating-accessible-meter">{value}</span>
      <m.span aria-hidden="true">{display}</m.span>
    </span>
  );
}
