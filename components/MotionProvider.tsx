'use client';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import type { ReactNode } from 'react';

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.2 }}>
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
