import React from 'react';

interface SquiggleProps {
  className?: string;
  /** Short vertical wave, used as a separator between inline items. */
  vertical?: boolean;
}

/** Small hand-drawn wave stroke, used as an underline or as a separator. Purely decorative. */
export const Squiggle: React.FC<SquiggleProps> = ({ className = '', vertical = false }) =>
  vertical ? (
    <svg className={`hx-squiggle-v ${className}`.trim()} viewBox="0 0 10 40" aria-hidden="true" focusable="false">
      <path
        d="M5 2 C 9 8, 1 12, 5 18 S 9 30, 5 38"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  ) : (
    <svg
      className={`hx-squiggle ${className}`.trim()}
      viewBox="0 0 120 12"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 6 C 12 0, 22 12, 32 6 S 52 0, 62 6 S 82 12, 92 6 S 112 0, 118 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
