# Soft Pink Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the entire visual system and page structure of the Aura Nails & Spa site with an original soft-pink, Instagram-editorial design (Playfair Display + Dancing Script + Be Vietnam Pro, warm blush palette, soft shadows/rounded cards), including a fully original animated hero (no reused video/image content) and a simplified 3-step booking flow.

**Architecture:** Frontend-only redesign on the existing Vite + React 19 + TypeScript stack. No new runtime dependencies are required — the hero's mouse-tilt and staggered-reveal effects are implemented with plain React state/refs and CSS, not an animation library. The underlying booking/scheduling logic (`utils/scheduler.ts`, `utils/storage.ts`) is untouched; only the UI around it changes.

**Tech Stack:** React 19, TypeScript, Vite, plain CSS custom properties (no CSS framework), lucide-react icons (already a dependency).

**Spec:** [docs/superpowers/specs/2026-09-23-soft-pink-redesign-design.md](../specs/2026-09-23-soft-pink-redesign-design.md)

## Global Constraints

- No content, imagery, or footage from the reference video/images is reused — all hero visuals are original placeholders the user will replace with their own photos later (use `service.imageUrl` values already in `src/data/services.ts` as stand-ins).
- `public/hero-banner.mp4` stays in the repo as an internal reference only — never rendered on the live site.
- No new npm dependencies unless a task explicitly says to add one (none do).
- `tsc --noEmit -p tsconfig.app.json` and `npm run build` must pass after every task.
- All UI copy stays in Vietnamese, matching the existing project's language.
- Fonts: Playfair Display (display serif), Dancing Script (script accent), Be Vietnam Pro (UI/body) — all loaded with the Vietnamese subset via Google Fonts.
- Palette: `--bg-main:#fdf3f1` `--bg-card:#fffaf8` `--bg-surface:#fbe9e6` `--accent-rose:#d98a94` `--accent-gold:#d4a373` `--text-main:#3c2321` `--text-muted:#8a6b66` `--border-subtle:#f0d9d4`.

---

## Task 1: Design Tokens, Fonts & Base Typography

**Files:**
- Modify: `index.html` (Google Fonts link)
- Modify: `src/index.css:1-100` (replace `:root` tokens and base rules; leave component-specific rules below untouched for now — later tasks rewrite those)

**Interfaces:**
- Produces: CSS custom properties consumed by every later task — `--bg-main`, `--bg-card`, `--bg-surface`, `--accent-rose`, `--accent-gold`, `--text-main`, `--text-muted`, `--border-subtle`, `--radius-card` (24px), `--radius-pill` (9999px), `--shadow-soft`, `--font-display` (Playfair Display), `--font-script` (Dancing Script), `--font-body` (Be Vietnam Pro). Produces base `.btn`, `.btn-primary`, `.btn-secondary` classes reused by Header/Hero/BookingWizard/AdminDashboard without renaming.

- [ ] **Step 1: Swap Google Fonts link in `index.html`**

Replace the existing `<link href="https://fonts.googleapis.com/css2?family=Inter...">` line with:

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Dancing+Script:wght@500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace `:root` tokens in `src/index.css`**

Replace the entire `:root { ... }` block (currently the light-Oryzo tokens) with:

```css
:root {
  /* Canvas & Surfaces — warm blush pastel */
  --bg-main: #fdf3f1;
  --bg-card: #fffaf8;
  --bg-surface: #fbe9e6;
  --bg-card-hover: #fdeae6;

  /* Accents */
  --accent-rose: #d98a94;
  --accent-rose-dark: #c06975;
  --accent-gold: #d4a373;

  /* Typography colors */
  --text-main: #3c2321;
  --text-muted: #8a6b66;
  --text-dim: #b79a94;
  --text-on-accent: #fffaf8;

  /* Borders */
  --border-subtle: #f0d9d4;
  --border-strong: #e3b9b3;

  /* Elevation — soft, diffused (opposite of flat) */
  --shadow-soft: 0 10px 30px -12px rgba(60, 35, 33, 0.18);
  --shadow-card: 0 6px 20px -8px rgba(60, 35, 33, 0.14);
  --shadow-lift: 0 16px 40px -14px rgba(60, 35, 33, 0.26);

  /* Fonts */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-script: 'Dancing Script', cursive;
  --font-body: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;

  /* Radii */
  --radius-card: 24px;
  --radius-md: 16px;
  --radius-sm: 10px;
  --radius-pill: 9999px;

  --transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  color-scheme: light;
}

body {
  font-family: var(--font-body);
  background-color: var(--bg-main);
  color: var(--text-main);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
}

h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-main);
}

.script-text {
  font-family: var(--font-script);
  font-weight: 600;
  color: var(--accent-rose-dark);
}

p {
  font-weight: 400;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.92rem;
  padding: 13px 26px;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
  user-select: none;
}

.btn-primary {
  background: var(--accent-rose);
  color: var(--text-on-accent);
  box-shadow: var(--shadow-card);
}

.btn-primary:hover {
  background: var(--accent-rose-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lift);
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--accent-rose-dark);
  border: 1px solid var(--border-strong);
}

.btn-secondary:hover {
  background: var(--bg-surface);
  border-color: var(--accent-rose);
}
```

Leave every rule below this block untouched for now (later tasks replace them section by section).

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit -p tsconfig.app.json && npm run build`
Expected: both succeed with no errors (visual regressions in unmigrated sections are expected and fixed by later tasks).

- [ ] **Step 4: Commit**

```bash
git add index.html src/index.css
git commit -m "feat: introduce soft-pink design tokens and base typography"
```

---

## Task 2: Header & Footer Restyle

**Files:**
- Modify: `src/index.css` (replace `.site-header`, `.brand-*`, `.header-actions`, `.btn-admin-toggle`, `.site-footer`, `.footer-grid` rules)
- Modify: `src/components/Header.tsx` (icon color prop)
- Modify: `src/components/Footer.tsx` (icon color prop, quote line)

**Interfaces:**
- Consumes: tokens from Task 1 (`--bg-main`, `--accent-rose`, `--text-main`, `--shadow-soft`, `--radius-pill`, `--font-script`).
- Produces: `.site-header`, `.brand-logo`, `.brand-icon`, `.brand-name`, `.brand-sub`, `.btn-admin-toggle`, `.site-footer`, `.footer-grid`, `.footer-quote` classes used as-is by later tasks (no renames needed elsewhere).

- [ ] **Step 1: Replace header/footer CSS in `src/index.css`**

Find and replace the `.site-header` through `.btn-admin-toggle.active` block with:

```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(253, 243, 241, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border-subtle);
  padding: 16px 0;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text-main);
}

.brand-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--accent-rose);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: var(--shadow-card);
}

.brand-name {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.brand-sub {
  font-size: 0.72rem;
  color: var(--accent-rose-dark);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-admin-toggle {
  background: var(--bg-card);
  color: var(--accent-rose-dark);
  border: 1px solid var(--border-subtle);
  padding: 9px 18px;
  font-size: 0.85rem;
  border-radius: var(--radius-pill);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-admin-toggle:hover {
  background: var(--bg-surface);
  border-color: var(--accent-rose);
}

.btn-admin-toggle.active {
  background: var(--accent-rose);
  color: var(--text-on-accent);
  border-color: var(--accent-rose);
}
```

Find and replace the `.site-footer` and `.footer-grid` block with:

```css
.site-footer {
  border-top: 1px solid var(--border-subtle);
  padding: 48px 0 32px;
  margin-top: 60px;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 0.9rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
}

.footer-quote {
  font-family: var(--font-script);
  font-size: 1.6rem;
  color: var(--accent-rose-dark);
  text-align: center;
  margin: 32px 0;
}
```

- [ ] **Step 2: Update `src/components/Header.tsx` icon color**

Replace `<Sparkles size={22} color="var(--bg-main)" />` with `<Sparkles size={22} color="var(--text-on-accent)" />`.

- [ ] **Step 3: Update `src/components/Footer.tsx` icon color and add a script quote line**

Replace `<Sparkles size={16} color="var(--bg-main)" />` with `<Sparkles size={16} color="var(--text-on-accent)" />`.

Insert, immediately after the opening `<div className="container">` and before `<div className="footer-grid">`:

```tsx
        <p className="footer-quote">Good nails, Good mood, Good day! ♡</p>
```

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit -p tsconfig.app.json && npm run build`
Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/components/Header.tsx src/components/Footer.tsx
git commit -m "feat: restyle header and footer for soft-pink design"
```

---

## Task 3: Hero — Original Editorial Composition

**Files:**
- Modify: `src/components/Hero.tsx` (full rewrite)
- Modify: `src/index.css` (replace `.hero-section` through `.hero-side-card` block with new hero rules)

**Interfaces:**
- Consumes: `services` is not passed to Hero today and still isn't — Hero keeps its existing prop signature `{ onStartBooking, onOpenLookbook, onSelectCategory }` from `src/App.tsx:97-101` (no change needed in `App.tsx` for this task).
- Consumes: `service.imageUrl` values as collage stand-in photos — import `NAIL_SERVICES`/`getStoredServices` is **not** needed; instead hardcode three representative image URLs already used elsewhere in the project's `src/data/services.ts` (read that file first to pick three real `imageUrl` values — do not invent new URLs).
- Produces: `.hero-organic`, `.hero-leaf-shadow`, `.hero-collage`, `.collage-card`, `.hero-kinetic-title`, `.hero-wave-svg`, `.hero-glass-band` classes, used only within this component.

- [ ] **Step 1: Read `src/data/services.ts` to pick three real image URLs**

Run: `grep -o "imageUrl: '[^']*'" src/data/services.ts | head -3` (or open the file) and note three URLs — one nail-art photo, one jeweled/decorative nail photo, one head-spa/relaxation photo if available; otherwise pick any three distinct service photos.

- [ ] **Step 2: Rewrite `src/components/Hero.tsx`**

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Images, Sparkles } from 'lucide-react';

interface HeroProps {
  onStartBooking: () => void;
  onOpenLookbook: () => void;
  onSelectCategory: (cat: 'nail' | 'headspa') => void;
}

const COLLAGE_PHOTOS: { src: string; alt: string; className: string }[] = [
  { src: 'REPLACE_WITH_URL_1', alt: 'Sơn gel nghệ thuật', className: 'collage-card collage-card-1' },
  { src: 'REPLACE_WITH_URL_2', alt: 'Đính đá sang trọng', className: 'collage-card collage-card-2' },
  { src: 'REPLACE_WITH_URL_3', alt: 'Thư giãn gội đầu dưỡng sinh', className: 'collage-card collage-card-3' },
];

const HEADLINE_WORDS = ['Vẻ', 'Đẹp', 'Từ', 'Đôi', 'Tay,'];
const HEADLINE_SCRIPT = 'Đến Suối Tóc';

export const Hero: React.FC<HeroProps> = ({
  onStartBooking,
  onOpenLookbook,
  onSelectCategory,
}) => {
  const collageRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  useEffect(() => {
    setRevealed(true);
    const canHover = window.matchMedia('(hover: hover)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTiltEnabled(canHover && !reducedMotion);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled || !collageRef.current) return;
    const rect = collageRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    collageRef.current.style.setProperty('--tilt-x', `${relY * -8}deg`);
    collageRef.current.style.setProperty('--tilt-y', `${relX * 8}deg`);
  };

  const handleMouseLeave = () => {
    if (!collageRef.current) return;
    collageRef.current.style.setProperty('--tilt-x', '0deg');
    collageRef.current.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <section className="hero-organic">
      <div className="hero-leaf-shadow" aria-hidden="true" />

      <div className="container hero-organic-grid">
        <div className={`hero-copy ${revealed ? 'is-revealed' : ''}`}>
          <span className="hero-eyebrow">
            <Sparkles size={14} />
            Aura Nails & Spa
          </span>

          <h1 className="hero-kinetic-title">
            {HEADLINE_WORDS.map((word, i) => (
              <span
                key={word + i}
                className="kinetic-word"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                {word}&nbsp;
              </span>
            ))}
            <span className="script-text hero-kinetic-script">{HEADLINE_SCRIPT}</span>
          </h1>

          <svg className="hero-wave-svg" viewBox="0 0 300 24" fill="none" aria-hidden="true">
            <path
              d="M2 12C40 2 60 22 100 12C140 2 160 22 200 12C240 2 260 22 298 12"
              stroke="var(--accent-rose)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          <div className="hero-glass-band">
            <p className="hero-desc">
              Không gian làm móng nghệ thuật và gội đầu dưỡng sinh chuẩn thư giãn,
              tự động giữ chỗ theo thời gian thực, không lo trùng lịch.
            </p>

            <div className="hero-cta-row">
              <button type="button" className="btn btn-primary" onClick={onStartBooking}>
                <Calendar size={18} />
                <span>Đặt Lịch Ngay</span>
              </button>
              <button type="button" className="btn btn-secondary" onClick={onOpenLookbook}>
                <Images size={18} />
                <span>Xem Lookbook</span>
              </button>
            </div>
          </div>
        </div>

        <div
          className="hero-collage"
          ref={collageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {COLLAGE_PHOTOS.map((photo) => (
            <button
              key={photo.className}
              type="button"
              className={photo.className}
              onClick={() => onSelectCategory(photo.className === 'collage-card collage-card-3' ? 'headspa' : 'nail')}
            >
              <img src={photo.src} alt={photo.alt} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 3: Fill in the three real image URLs from Step 1**

Edit the `COLLAGE_PHOTOS` array in the file just written, replacing `REPLACE_WITH_URL_1/2/3` with the three URLs noted in Step 1.

- [ ] **Step 4: Replace hero CSS in `src/index.css`**

Find and replace the entire block from `.hero-section {` through the end of `.hero-side-card { ... }` with:

```css
.hero-organic {
  position: relative;
  padding: 70px 0 50px;
  overflow: hidden;
}

.hero-leaf-shadow {
  position: absolute;
  top: -10%;
  right: -5%;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(217, 138, 148, 0.14) 0%, transparent 70%);
  filter: blur(2px);
  transform-origin: center;
  animation: swayLeaves 9s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes swayLeaves {
  0%, 100% { transform: rotate(-3deg) translateY(0); }
  50% { transform: rotate(3deg) translateY(12px); }
}

.hero-organic-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 48px;
  align-items: center;
}

.hero-copy {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.hero-copy.is-revealed {
  opacity: 1;
  transform: translateY(0);
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  background: var(--bg-surface);
  color: var(--accent-rose-dark);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 18px;
}

.hero-kinetic-title {
  font-size: 3rem;
  line-height: 1.1;
  margin-bottom: 14px;
}

.kinetic-word {
  display: inline-block;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.hero-copy.is-revealed .kinetic-word {
  opacity: 1;
  transform: translateY(0);
}

.hero-kinetic-script {
  font-size: 3.2rem;
  display: inline-block;
}

.hero-wave-svg {
  width: 220px;
  height: 20px;
  margin-bottom: 22px;
}

.hero-glass-band {
  background: rgba(255, 250, 248, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-soft);
}

.hero-desc {
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 20px;
  max-width: 480px;
}

.hero-cta-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.hero-collage {
  --tilt-x: 0deg;
  --tilt-y: 0deg;
  position: relative;
  height: 460px;
  perspective: 1000px;
}

.collage-card {
  position: absolute;
  width: 58%;
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-card);
  overflow: hidden;
  border: none;
  padding: 0;
  cursor: pointer;
  box-shadow: var(--shadow-lift);
  transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
  transition: transform 0.15s ease-out;
}

.collage-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.collage-card-1 {
  top: 0;
  left: 0;
  z-index: 1;
}

.collage-card-2 {
  top: 12%;
  left: 30%;
  z-index: 2;
  width: 48%;
}

.collage-card-3 {
  top: 42%;
  left: 6%;
  z-index: 3;
  width: 44%;
}

@media (prefers-reduced-motion: reduce) {
  .hero-leaf-shadow {
    animation: none;
  }
  .hero-copy,
  .kinetic-word {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

@media (max-width: 900px) {
  .hero-organic-grid {
    grid-template-columns: 1fr;
  }
  .hero-collage {
    height: 320px;
    margin-top: 24px;
  }
}
```

- [ ] **Step 5: Verify the build**

Run: `npx tsc --noEmit -p tsconfig.app.json && npm run build`
Expected: both succeed.

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.tsx src/index.css
git commit -m "feat: rebuild hero with original leaf-shadow, tilt collage, and kinetic type"
```

---

## Task 4: Feature Icon Strip & Trust Badge Strip

**Files:**
- Create: `src/components/FeatureStrip.tsx`
- Create: `src/components/TrustBadgeStrip.tsx`
- Modify: `src/index.css` (append new rules)
- Modify: `src/App.tsx` (import and render both, wired into the non-admin layout)

**Interfaces:**
- Produces: `FeatureStrip` and `TrustBadgeStrip`, both zero-prop `React.FC` components.
- Consumes: none (static content only).

- [ ] **Step 1: Create `src/components/FeatureStrip.tsx`**

```tsx
import React from 'react';
import { Sparkles, Gem, TrendingUp, Heart } from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, title: 'Thiết Kế Hoàn Mỹ', desc: 'Mẫu nail được thiết kế riêng cho bạn.' },
  { icon: Gem, title: 'Chất Lượng Cao Cấp', desc: 'Sản phẩm tốt nhất cho móng khỏe đẹp.' },
  { icon: TrendingUp, title: 'Xu Hướng Mới Nhất', desc: 'Luôn cập nhật phong cách thịnh hành.' },
  { icon: Heart, title: 'Yêu Thương Bản Thân', desc: 'Vì bạn xứng đáng được chăm sóc.' },
];

export const FeatureStrip: React.FC = () => {
  return (
    <section className="feature-strip">
      <div className="container feature-strip-grid">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="feature-item">
            <div className="feature-icon-badge">
              <Icon size={22} />
            </div>
            <div>
              <h4 className="feature-title">{title}</h4>
              <p className="feature-desc">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Create `src/components/TrustBadgeStrip.tsx`**

```tsx
import React from 'react';
import { ShieldCheck, Clock, Palette, Award } from 'lucide-react';

const BADGES = [
  { icon: ShieldCheck, label: 'Vệ Sinh & An Toàn' },
  { icon: Clock, label: 'Bền Màu Lâu Dài' },
  { icon: Palette, label: 'Đa Dạng Mẫu Thiết Kế' },
  { icon: Award, label: 'Chuyên Gia Tay Nghề Cao' },
];

export const TrustBadgeStrip: React.FC = () => {
  return (
    <section className="trust-badge-strip">
      <div className="container trust-badge-grid">
        {BADGES.map(({ icon: Icon, label }) => (
          <div key={label} className="trust-badge-item">
            <Icon size={18} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
```

- [ ] **Step 3: Append CSS rules to `src/index.css`**

```css
.feature-strip {
  padding: 40px 0;
}

.feature-strip-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.feature-icon-badge {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--bg-surface);
  color: var(--accent-rose-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-main);
}

.feature-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.trust-badge-strip {
  background: var(--accent-rose);
  padding: 20px 0;
  margin-top: 40px;
}

.trust-badge-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.trust-badge-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-on-accent);
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
}

@media (max-width: 900px) {
  .feature-strip-grid,
  .trust-badge-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

- [ ] **Step 4: Wire both components into `src/App.tsx`**

Add the import near the other component imports (after `import { Hero } from './components/Hero';`):

```tsx
import { FeatureStrip } from './components/FeatureStrip';
import { TrustBadgeStrip } from './components/TrustBadgeStrip';
```

In the non-admin `<main>` block, insert `<FeatureStrip />` immediately after the `<Hero ... />` element and before the `<div id="services-section">` block. Insert `<TrustBadgeStrip />` immediately before the closing `</main>` tag (after the `<section id="booking-section" ...>` block).

- [ ] **Step 5: Verify the build**

Run: `npx tsc --noEmit -p tsconfig.app.json && npm run build`
Expected: both succeed.

- [ ] **Step 6: Commit**

```bash
git add src/components/FeatureStrip.tsx src/components/TrustBadgeStrip.tsx src/index.css src/App.tsx
git commit -m "feat: add feature icon strip and trust badge strip"
```

---

## Task 5: Services Showcase — Masonry Restyle

**Files:**
- Modify: `src/index.css` (replace `.filter-pill`, `.service-card-v2`, `.service-category-badge`, `.service-badge-tag`, `.section-*` rules)
- Modify: `src/components/ServicesShowcase.tsx` (grid layout change from uniform grid to CSS-columns masonry)

**Interfaces:**
- Consumes: tokens from Task 1; `Service`/`ServiceCategory` types from `src/types/index.ts` (unchanged).
- Produces: no new class names beyond what already exists in the component (`.services-masonry` added for the grid wrapper).

- [ ] **Step 1: Replace the inline grid style in `src/components/ServicesShowcase.tsx`**

Find:

```tsx
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
```

Replace with:

```tsx
        <div className="services-masonry">
```

(the closing `</div>` for this block stays as-is).

- [ ] **Step 2: Replace section-header, filter-pill, and service-card CSS in `src/index.css`**

Find and replace `.section-header` through `.section-desc` with:

```css
.section-header {
  max-width: 720px;
  margin: 0 auto 36px;
  text-align: center;
}

.section-tag {
  display: inline-block;
  font-family: var(--font-script);
  font-size: 1.3rem;
  color: var(--accent-rose-dark);
  margin-bottom: 8px;
}

.section-title {
  font-size: 2.1rem;
  margin-bottom: 14px;
}

.section-desc {
  font-size: 0.98rem;
  color: var(--text-muted);
}
```

Find and replace `.filter-pill` through the `.filter-pill.active-spa` rule with:

```css
.filter-pill {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 9px 20px;
  border-radius: var(--radius-pill);
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.filter-pill:hover,
.filter-pill.active,
.filter-pill.active-spa {
  background: var(--accent-rose);
  border-color: var(--accent-rose);
  color: var(--text-on-accent);
}
```

Find and replace `.service-card-v2` through `.service-card-content` with:

```css
.services-masonry {
  columns: 3 280px;
  column-gap: 20px;
}

.service-card-v2 {
  break-inside: avoid;
  margin-bottom: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: var(--transition);
}

.service-card-v2:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lift);
}

.service-card-v2.selected {
  border-color: var(--accent-rose);
  box-shadow: var(--shadow-lift);
}

.service-card-img-wrap {
  position: relative;
  overflow: hidden;
}

.service-card-img-wrap img {
  width: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.service-card-v2:hover .service-card-img-wrap img {
  transform: scale(1.05);
}

.service-category-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: rgba(255, 250, 248, 0.9);
  backdrop-filter: blur(6px);
  color: var(--accent-rose-dark);
}

.service-badge-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: var(--accent-gold);
  color: var(--text-on-accent);
}

.service-card-content {
  padding: 18px;
}

@media (max-width: 900px) {
  .services-masonry {
    columns: 2 240px;
  }
}

@media (max-width: 600px) {
  .services-masonry {
    columns: 1;
  }
}
```

Note the img height is no longer fixed (`height: 160px` removed) so the masonry columns can vary card heights naturally — this is intentional for the masonry look. Since `service-card-img-wrap` no longer sets a fixed height, remove any lingering `height: 160px` rule if still present after the replace (search `src/index.css` for `height: 160px` and delete that line if found standalone).

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit -p tsconfig.app.json && npm run build`
Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add src/components/ServicesShowcase.tsx src/index.css
git commit -m "feat: restyle services showcase as soft-pink masonry grid"
```

---

## Task 6: Lookbook Modal Restyle

**Files:**
- Modify: `src/index.css` (replace `.modal-overlay`, `.modal-content`, `.date-pill-btn` rules)
- Modify: `src/components/LookbookModal.tsx` (inline style color/background updates)

**Interfaces:**
- Consumes: tokens from Task 1. No prop/type changes.

- [ ] **Step 1: Replace modal CSS in `src/index.css`**

Find and replace `.modal-overlay` through `.modal-content` with:

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(60, 35, 33, 0.45);
  backdrop-filter: blur(6px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: var(--bg-main);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  max-width: 540px;
  width: 100%;
  padding: 32px;
  box-shadow: var(--shadow-lift);
  position: relative;
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

Find and replace `.date-pill-btn` through `.date-pill-btn.active` with:

```css
.date-pill-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.date-pill-btn:hover,
.date-pill-btn.active {
  background: var(--accent-rose);
  border-color: var(--accent-rose);
  color: var(--text-on-accent);
}
```

- [ ] **Step 2: Update `src/components/LookbookModal.tsx` inline styles**

Replace the close-button style object's `border: '1px solid var(--border-subtle)'` line — no change needed there (already token-based); instead update the lookbook card image badge and tag-pill background which still reference light-Oryzo tones:

Find:
```tsx
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
```
(inside the category badge `<span>` style object) — leave as-is, these already resolve to the new pink tokens automatically since the token names are unchanged.

Find:
```tsx
                        style={{
                          fontSize: '0.7rem',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-dim)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
```
Replace `borderRadius: '4px'` with `borderRadius: 'var(--radius-pill)'` so the small tag pills match the new fully-rounded pill language.

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit -p tsconfig.app.json && npm run build`
Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/components/LookbookModal.tsx
git commit -m "feat: restyle lookbook modal for soft-pink design"
```

---

## Task 7: Booking Flow Simplification (4 steps → 3 steps)

**Files:**
- Modify: `src/components/BookingWizard/index.tsx` (merge current Step 1 "info & date" into Step 2 "services", making the new flow: Step 1 = choose services, Step 2 = name/phone/date/slot in one screen, Step 3 = confirmation)
- Modify: `src/index.css` (replace `.wizard-steps`, `.step-indicator`, `.step-bubble`, `.step-title`, `.form-input`, `.slot-btn` rules)

**Interfaces:**
- Consumes: `Service`, `Booking` types (unchanged), `generateAvailableSlots`, `attemptCreateBooking` from `src/utils/scheduler.ts` and `src/utils/storage.ts` (signatures unchanged — this task only reorders which step renders which fields, it does not change what data is collected before booking).
- Produces: `currentStep` now ranges 1–3 instead of 1–4; `BookingWizardProps` is unchanged (same prop names/types as today).

- [ ] **Step 1: Change the step count and merge logic**

In `src/components/BookingWizard/index.tsx`, find `const [currentStep, setCurrentStep] = useState<number>(1);` — no change needed to this line itself.

Find `handleProceedToStep2` (validates name/phone/date, then `setCurrentStep(2)`) and rename all its usages to skip directly into what is currently "Step 2" content. Concretely: the JSX block currently guarded by `{currentStep === 1 && (...)}` (the info+date form) and the block guarded by `{currentStep === 2 && (...)}` (service selection) swap order and merge as follows:

Replace the two guards `{currentStep === 1 && (` ... `)}` and `{currentStep === 2 && (` ... `)}` so that:
- **New Step 1** renders the existing service-selection JSX (currently under `currentStep === 2`), guarded by `{currentStep === 1 && (`.
- **New Step 2** renders a merged form combining the existing name/phone/date fields (currently under `currentStep === 1`) together with the slot grid (currently under `currentStep === 3`), guarded by `{currentStep === 2 && (`.
- **New Step 3** renders the existing success screen (currently under `currentStep === 4`), guarded by `{currentStep === 3 && (`.

Update every `setCurrentStep(N)` call site accordingly:
- The service-selection "Tiếp Tục" button (`handleProceedToStep3`) now calls `setCurrentStep(2)` instead of `setCurrentStep(3)`, and no longer needs the `handleProceedToStep3` name — rename it to `handleProceedToStep2` and delete the old `handleProceedToStep2` function (its validation logic — name/phone/date required-field checks — moves into a new `handleConfirmBooking` guard, described in Step 2 below, since those fields now live on the same screen as the slot picker rather than behind a separate "Next" button).
- The merged Step 2 no longer has a form `onSubmit`; instead validate name/phone/date inline inside `handleConfirmBooking` before calling `attemptCreateBooking`, and render `formErrors` next to their respective merged fields.
- `handleResetForNewBooking` sets `setCurrentStep(1)` (unchanged — 1 is still "start").
- The wizard-steps indicator (see Step 3 below) renders 3 bubbles instead of 4.

- [ ] **Step 2: Update `handleConfirmBooking` to validate name/phone/date inline**

Replace the existing `handleConfirmBooking` function body with:

```tsx
  const handleConfirmBooking = () => {
    const errors: { [key: string]: string } = {};
    if (!customerName.trim()) {
      errors.customerName = 'Vui lòng nhập họ và tên của bạn';
    }
    if (!phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/(0[3|5|7|8|9])+([0-9]{8})\b/.test(phone.replace(/\s+/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ (Ví dụ: 0901234567)';
    }
    if (!date) {
      errors.date = 'Vui lòng chọn ngày làm đẹp';
    }
    if (!selectedStartTime || !calculatedEndTime) {
      errors.slot = 'Vui lòng chọn một khung giờ hợp lệ';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setConcurrencyAlert(null);

    const result = attemptCreateBooking({
      customerName: customerName.trim(),
      phone: phone.trim(),
      date,
      startTime: selectedStartTime as string,
      endTime: calculatedEndTime as string,
      serviceIds: selectedServiceIds,
      totalMinutes: totalDurationMinutes,
      totalPrice,
      note: 'Đặt online qua Landing Page Nail & Gội Đầu Dưỡng Sinh',
    });

    if (!result.success) {
      setConcurrencyAlert(result.error || 'Khung giờ này vừa có người đặt. Vui lòng chọn khung giờ khác.');
      setSelectedStartTime(null);
      return;
    }

    if (result.booking) {
      setLastCreatedBooking(result.booking);
      setCurrentStep(3);
      onBookingSuccess();
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#d98a94', '#d4a373', '#fffaf8', '#3c2321'],
        });
      } catch (err) {
        console.log('Confetti effect:', err);
      }
    }
  };
```

Remove the now-unused `handleProceedToStep2` function entirely (its logic is folded into the block above).

- [ ] **Step 3: Update the wizard-steps indicator JSX**

Replace the four `<div className={`step-indicator ...`}>` blocks with three:

```tsx
      <div className="wizard-steps">
        <div className={`step-indicator ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-bubble">{currentStep > 1 ? <Check size={18} /> : '1'}</div>
          <span className="step-title">Chọn dịch vụ</span>
        </div>

        <div className={`step-indicator ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-bubble">{currentStep > 2 ? <Check size={18} /> : '2'}</div>
          <span className="step-title">Thông tin & Giờ hẹn</span>
        </div>

        <div className={`step-indicator ${currentStep === 3 ? 'active' : ''}`}>
          <div className="step-bubble">3</div>
          <span className="step-title">Hoàn tất</span>
        </div>
      </div>
```

- [ ] **Step 4: Build the merged Step 2 JSX**

Replace the whole `{currentStep === 3 && (` block (the old slot-picking step) — after the reordering in Step 1 above, this content becomes part of new Step 2 — with a merged block that renders, in order: the name/phone/date fields (reusing the exact `form-group`/`form-input` JSX from the old Step 1 block, but with a `handleConfirmBooking`-triggered `<form>` removed in favor of a plain `<div>` since there's no longer an intermediate "Next" submit — keep the `<input>`s and their `formErrors` displays exactly as they were), then the existing slot-notice-box and slots-grid JSX (unchanged from today), then a single "Xác Nhận Đặt Lịch Ngay" button calling `handleConfirmBooking` directly (reuse the existing button from the old Step 3 block), replacing the old two-button `wizard-nav` (Back/Next between old steps 1 and 2, and old steps 2 and 3) with a single `wizard-nav` containing a "Quay Lại" button (`onClick={() => setCurrentStep(1)}`) and the confirm button.

Since this restructuring touches most of the component body, after making the edit, run a visual diff check: `grep -n "currentStep ===" src/components/BookingWizard/index.tsx` should show exactly three occurrences (`1`, `2`, `3`), and `grep -n "setCurrentStep(" src/components/BookingWizard/index.tsx` should show no call with an argument greater than `3`.

- [ ] **Step 5: Replace wizard/form/slot CSS in `src/index.css`**

Find and replace `.wizard-steps` through `.step-indicator.active .step-title` with:

```css
.wizard-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
  position: relative;
}

.wizard-steps::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 30px;
  right: 30px;
  height: 2px;
  background: var(--border-subtle);
  transform: translateY(-50%);
  z-index: 1;
}

.step-indicator {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-bubble {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-dim);
  transition: var(--transition);
}

.step-indicator.active .step-bubble {
  background: var(--accent-rose);
  border-color: var(--accent-rose);
  color: var(--text-on-accent);
}

.step-indicator.completed .step-bubble {
  background: var(--bg-surface);
  border-color: var(--accent-rose);
  color: var(--accent-rose-dark);
}

.step-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-dim);
  text-align: center;
}

.step-indicator.active .step-title {
  color: var(--accent-rose-dark);
}
```

Find and replace `.form-input` through `.form-input:focus` with:

```css
.form-input {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  color: var(--text-main);
  font-size: 0.95rem;
  font-family: var(--font-body);
  outline: none;
  transition: var(--transition);
}

.form-input:focus {
  border-color: var(--accent-rose);
  box-shadow: 0 0 0 3px rgba(217, 138, 148, 0.18);
}
```

Find and replace `.slot-btn` through `.slot-btn.disabled:hover::after` with:

```css
.slot-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
}

.slot-time {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
}

.slot-end {
  font-size: 0.74rem;
  color: var(--text-dim);
}

.slot-status-tag {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-pill);
}

.slot-btn.available:hover {
  background: var(--bg-surface);
  border-color: var(--accent-rose);
  transform: scale(1.03);
}

.slot-btn.available .slot-status-tag {
  background: var(--bg-surface);
  color: var(--accent-rose-dark);
}

.slot-btn.selected {
  background: var(--accent-rose);
  border-color: var(--accent-rose);
  box-shadow: var(--shadow-card);
}

.slot-btn.selected .slot-time,
.slot-btn.selected .slot-end,
.slot-btn.selected .slot-status-tag {
  color: var(--text-on-accent) !important;
  font-weight: 700;
}

.slot-btn.disabled {
  opacity: 0.45;
  background: var(--bg-main);
  border-color: var(--border-subtle);
  cursor: not-allowed;
  filter: grayscale(0.4);
}

.slot-btn.disabled .slot-status-tag {
  background: rgba(217, 138, 148, 0.12);
  color: var(--accent-rose-dark);
}

.slot-btn.disabled:hover::after {
  content: attr(data-reason);
  position: absolute;
  bottom: 105%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text-main);
  color: var(--text-on-accent);
  font-size: 0.74rem;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}
```

- [ ] **Step 6: Verify the build**

Run: `npx tsc --noEmit -p tsconfig.app.json && npm run build`
Expected: both succeed with zero TypeScript errors — pay particular attention to unused-variable errors from the removed `handleProceedToStep2` and confirm no leftover reference to it remains (`grep -n "handleProceedToStep2" src/components/BookingWizard/index.tsx` should return nothing).

- [ ] **Step 7: Commit**

```bash
git add src/components/BookingWizard/index.tsx src/index.css
git commit -m "feat: simplify booking wizard from 4 steps to 3 and restyle for soft-pink design"
```

---

## Task 8: Admin Dashboard Restyle

**Files:**
- Modify: `src/index.css` (replace `.calendar-*`, `.reminder-*`, `.schedule-table`, `.badge-*`, `.btn-quick-add`, `.btn-cancel-booking` rules)
- Modify: `src/components/AdminDashboard/index.tsx` (only literal inline colors that don't already resolve via tokens — same class as Task 1–7's approach of leaving var()-based inline styles alone)

**Interfaces:**
- Consumes: tokens from Task 1. No prop/type/logic changes — this is styling only.

- [ ] **Step 1: Replace calendar/reminder/table CSS in `src/index.css`**

Find and replace `.calendar-view-panel` through `.chip-headspa` with:

```css
.calendar-view-panel {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  padding: 24px;
  margin-top: 20px;
  box-shadow: var(--shadow-card);
}

.calendar-grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--accent-rose-dark);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 12px;
}

.calendar-month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day-cell {
  background: var(--bg-main);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  min-height: 100px;
  padding: 8px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
}

.calendar-day-cell:hover {
  background: var(--bg-surface);
  border-color: var(--accent-rose);
}

.calendar-day-cell.selected {
  border-color: var(--accent-rose);
  box-shadow: var(--shadow-card);
  background: var(--bg-surface);
}

.calendar-day-cell.today {
  border-color: var(--accent-gold);
}

.day-number {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}

.day-events-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.calendar-event-chip {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.chip-nail {
  background: var(--bg-surface);
  color: var(--accent-rose-dark);
  border: 1px solid var(--border-subtle);
}

.chip-headspa {
  background: rgba(212, 163, 115, 0.15);
  color: var(--accent-gold);
  border: 1px solid rgba(212, 163, 115, 0.35);
}
```

Find and replace `.reminder-hub-card` through `@keyframes pulseGlow { ... }` with:

```css
.reminder-hub-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card);
  padding: 20px;
  margin-bottom: 24px;
}

.reminder-alert-banner {
  background: rgba(217, 138, 148, 0.1);
  border: 1px solid var(--accent-rose);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  color: var(--accent-rose-dark);
}
```

Find and replace `.timeline-table-container` through `.row-free:hover` with:

```css
.timeline-table-container {
  overflow-x: auto;
  border-radius: var(--radius-card);
  border: 1px solid var(--border-subtle);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
  text-align: left;
}

.schedule-table th {
  background: var(--bg-surface);
  color: var(--accent-rose-dark);
  padding: 14px 18px;
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border-subtle);
}

.schedule-table td {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-subtle);
}

.row-booked {
  background: rgba(217, 138, 148, 0.04);
}

.row-booked:hover {
  background: rgba(217, 138, 148, 0.08);
}

.row-free {
  background: rgba(212, 163, 115, 0.03);
}

.row-free:hover {
  background: rgba(212, 163, 115, 0.07);
}
```

Find and replace `.badge-status` through `.btn-cancel-booking:hover` with:

```css
.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.78rem;
  font-weight: 700;
}

.badge-booked {
  background: rgba(217, 138, 148, 0.15);
  color: var(--accent-rose-dark);
  border: 1px solid rgba(217, 138, 148, 0.3);
}

.badge-free {
  background: rgba(212, 163, 115, 0.15);
  color: var(--accent-gold);
  border: 1px solid rgba(212, 163, 115, 0.3);
}

.btn-quick-add {
  font-size: 0.78rem;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: rgba(212, 163, 115, 0.15);
  color: var(--accent-gold);
  border: 1px solid rgba(212, 163, 115, 0.4);
  cursor: pointer;
  transition: var(--transition);
}

.btn-quick-add:hover {
  background: var(--accent-gold);
  color: var(--text-on-accent);
  font-weight: 700;
}

.btn-cancel-booking {
  font-size: 0.78rem;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: rgba(217, 138, 148, 0.12);
  color: var(--accent-rose-dark);
  border: 1px solid rgba(217, 138, 148, 0.3);
  cursor: pointer;
  transition: var(--transition);
}

.btn-cancel-booking:hover {
  background: var(--accent-rose);
  color: var(--text-on-accent);
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit -p tsconfig.app.json && npm run build`
Expected: both succeed. No changes to `src/components/AdminDashboard/index.tsx` are needed in this task since it already reads colors through the same CSS variable names, which now resolve to the pink palette.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: restyle admin dashboard calendar, timeline, and reminders for soft-pink design"
```

---

## Task 9: Final Integration Pass

**Files:**
- Modify: `src/index.css` (sweep for any remaining Oryzo-era literal values missed by earlier tasks)

**Interfaces:** none — verification only.

- [ ] **Step 1: Search for leftover dark/Oryzo-era references**

Run: `grep -n "walnut\|#100904\|#ffedd7\|#dc5000\|#382416\|#40372e\|Playfair Display\|Plus Jakarta" src/index.css src/components/**/*.tsx src/App.tsx index.html`
Expected: no matches (all should have been replaced by Tasks 1–8). If any are found, replace them with the equivalent soft-pink token from the Global Constraints palette above, matching the surrounding rule's purpose (background vs. text vs. border).

- [ ] **Step 2: Confirm no remaining 4-step booking references**

Run: `grep -rn "currentStep === 4\|setCurrentStep(4)" src/components/BookingWizard/index.tsx`
Expected: no matches (Task 7 reduced the flow to 3 steps).

- [ ] **Step 3: Full verification build**

Run: `npx tsc --noEmit -p tsconfig.app.json && npm run build`
Expected: both succeed with zero errors or warnings about unused variables/imports.

- [ ] **Step 4: Commit (only if Step 1 found and fixed anything)**

```bash
git add -A
git commit -m "chore: sweep remaining dark-theme literals from soft-pink redesign"
```

If Step 1 found nothing to fix, skip this commit — there is nothing to commit.
