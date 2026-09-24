# Hero modes report

Files: src/components/Hero.tsx, src/components/FeatureStrip.tsx, src/styles/hero.css (uncommitted).

- Headline: title and script split into phrase chunks (inline-block spans), `text-wrap: balance` on lines, desc `text-wrap: pretty`, price in a nowrap span (period included). Font sizes use `cqw` clamp against `.hx-copy` (container-type: inline-size); old mobile font-size overrides removed.
- Carousel: MAX_SLIDES = 4; clone-to-3 fallback and dots unchanged (dots follow real slides).
- FeatureStrip: per-mode sets (nail / headspa / both) via useMode; grid keyed by mode with an opacity-only fade (disabled under reduced motion).
- Verification: tsc --noEmit and npm run build pass. Line widths only estimated mentally (no browser check).
