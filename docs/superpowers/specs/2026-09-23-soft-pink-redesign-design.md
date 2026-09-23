# Aura Nails & Spa — Soft Pink Editorial Redesign

## Overview

Replace the current dark/light Oryzo visual system entirely with a soft
pink pastel, Instagram-editorial aesthetic aimed at Vietnamese women,
inspired by two reference images (a pastel salon ad poster and a
frosted-glass mobile booking app mockup). This is a **frontend-only,
visual and UX redesign** on the existing Vite + React + TypeScript
stack. All original creative content (hero collage photos, copy,
motion beats) is built fresh for this brand — nothing is copied from
the reference video or images.

## Non-Goals (deferred to a later sub-project)

- The advanced scheduling engine: parallel-capacity slots, interleaving
  a second client into a waiting gap, the waitlist/queue with automatic
  promotion on cancellation, Google Calendar sync, and configurable
  morning/pre-appointment notifications. These require a real backend
  (DB + server-side cron + Google OAuth) and are out of scope here.
- Stack migration to Next.js. Stays on Vite + React + TS.
- The underlying slot-computation logic in `utils/scheduler.ts` and
  `utils/storage.ts` (`attemptCreateBooking`, `generateAvailableSlots`)
  is unchanged in this pass — only the UI around it is simplified.

## Design Tokens

New `:root` palette in `src/index.css`, replacing the Oryzo tokens:

- `--bg-main`: `#fdf3f1` (warm blush canvas)
- `--bg-card`: `#fffaf8` (card surface, soft shadow instead of flat)
- `--bg-surface`: `#fbe9e6` (secondary pink surface, icon badges)
- `--accent-rose`: `#d98a94` (primary pink — buttons, active states)
- `--accent-gold`: `#d4a373` (sparing premium accent, badges)
- `--text-main`: `#3c2321` (warm dark plum, not pure black)
- `--text-muted`: `#8a6b66`
- `--border-subtle`: `#f0d9d4`
- Shadows are back (soft, diffused) — this system is the opposite of
  Oryzo's flat/no-shadow rule.
- Radii: cards/buttons use large rounded corners (16–28px), pill
  buttons stay fully round.

Typography (Google Fonts, all with Vietnamese subset):
- Display serif headlines: **Playfair Display**
- Script accent (taglines, quotes): **Dancing Script**
- UI/body: **Be Vietnam Pro** (designed for Vietnamese diacritics,
  rounded and warm)

## Hero (new `src/components/Hero.tsx` content, same file)

Fully original composition, no reused video/image assets:
1. **Botanical shadow overlay** — an SVG leaf-shadow layer, swaying via
   a CSS `@keyframes` animation, positioned absolute over the hero.
2. **Staggered 3-photo collage** — three vertically offset cards using
   the salon's own service photos (nail art close-up / jeweled nail
   art / head-spa relaxation), each tilting a few degrees toward the
   cursor on `mousemove` (plain React state + CSS `transform`, no new
   animation library).
3. **Kinetic typography** — the headline reveals word-by-word/letter-by
   -letter with a short stagger delay on mount (CSS transition delays
   per `<span>`, no GSAP dependency).
4. **Organic wave path** — a soft inline SVG `<path>` beneath the
   headline.
5. **Frosted glass reveal** — the hero's lower content band uses
   `backdrop-filter: blur()` with a thin inset highlight border,
   sliding/fading in on load.
6. Mobile: collage collapses to a single centered photo, tilt
   interaction disabled (no mouse), motion respects
   `prefers-reduced-motion` (falls back to a static, non-animated
   layout).

`public/hero-banner.mp4` (the reference clip the user downloaded)
stays in the repo as an internal creative reference only — it is not
played on the live site.

## Page Structure (replaces current layout order)

1. Header — sticky, transparent over hero, pink wordmark
2. Hero — as above
3. Feature icon strip — four circular pink-badge icons with short
   labels (mirrors the reference poster's 4-icon row)
4. Services Showcase — masonry-style grid, frosted glass cards,
   tag-pill filtering
5. Lookbook — Instagram-style photo grid, small tag pills
6. Booking — simplified flow (see below), floating glass card style
7. Script-quote + trust-badge strip
8. Footer

## Booking Flow Simplification

Collapse the current 4-step wizard into 3 lighter steps, per the
"đơn giản hóa, không nhiều thông tin" request:
1. Choose service package(s) — card grid, same data source
   (`services.ts`), now styled as soft pink cards
2. One screen: name, phone, date, and available check-in slot
   (shows estimated check-in–check-out range per slot, e.g.
   "14:00–15:15") — merges what were previously two separate steps
3. Confirmation — same receipt/calendar-export actions as today,
   restyled

The slot list, conflict detection, and booking persistence logic are
unchanged — only the number of visible fields and steps shrinks.

## Testing Plan

- `tsc --noEmit` and `npm run build` must stay clean throughout.
- No browser/screenshot tool is available in this environment — I
  cannot visually verify the redesign myself. I'll say so explicitly
  rather than claim it "looks right," and the user reviews visually
  via `npm run dev`.
- Manual check: reduced-motion and no-mouse (touch) fallbacks are
  present in code for the hero interactions.
