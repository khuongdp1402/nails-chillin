import React from 'react';

interface WaveDividerProps {
  variant?: 1 | 2 | 3;
  /** Flip vertically: the fill sits at the top and the curve runs along the bottom edge. */
  flip?: boolean;
  /** Any CSS colour, normally a palette token such as `var(--bg-main)`. */
  color: string;
  className?: string;
}

// Each path fills the area below a flowing curve inside a 1440 x 100 viewBox.
const PATHS: Record<1 | 2 | 3, string> = {
  1: 'M0 52 C 180 8, 360 8, 540 44 S 900 96, 1120 52 S 1340 12, 1440 40 L1440 100 L0 100 Z',
  2: 'M0 34 C 240 96, 480 96, 720 50 S 1200 -6, 1440 46 L1440 100 L0 100 Z',
  3: 'M0 60 C 160 20, 320 20, 480 56 S 800 100, 960 54 S 1280 6, 1440 48 L1440 100 L0 100 Z',
};

export const WaveDivider: React.FC<WaveDividerProps> = ({
  variant = 1,
  flip = false,
  color,
  className = '',
}) => (
  <svg
    className={`wave-divider ${flip ? 'is-flipped' : ''} ${className}`.trim()}
    viewBox="0 0 1440 100"
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d={PATHS[variant]} style={{ fill: color }} />
  </svg>
);
