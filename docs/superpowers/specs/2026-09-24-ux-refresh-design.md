# Aura Nails & Spa — UX Refresh (Sub-project A)

Frontend-only refresh on the existing Vite + React + TS stack. Sub-project B
(Vercel serverless backend: single-owner Google login, Google Calendar as the
booking store + reminders, Vercel Blob images, multi-staff) is a separate spec.

## Goals (approved in chat 2026-09-24)

1. **Ombre palette** (pink → white → red), stronger and more luxurious than the
   current pale pastel. Prices and CTAs use a vivid red-pink.
2. **Mode picker**: first screen asks "Nail / Gội đầu / Cả hai". Choice is stored
   in localStorage with a 24h expiry. A small chip in the header reopens the
   picker. Services, copy and booking are filtered by mode. When mode is "cả hai"
   the two groups are shown as two separate sections.
3. **Friendly copy** for end users: short, conversational Vietnamese ("bạn"),
   no system-talk ("hệ thống", "tự động khóa", "demo", "mẫu").
4. **Cards**: compact, fully rounded, bigger image, small name/duration text,
   price in accent red. Hover lift + image zoom, staggered reveal on scroll.
5. **Booking**: compact; selected slot is strongly highlighted; shows check-in –
   check-out range; no seeded fake bookings; default date is today; each step
   change animates and scrolls to the top of the new step (below the sticky
   header). Zalo message button for customers.
6. **Admin** (not linked from the landing page; reached via `#/admin`):
   range filter (Hôm nay / Tuần này / Tháng này / từ ngày – đến ngày), no
   copy-message tools, reminder settings only (morning time default 07:00,
   before-appointment default 30 min — applied by sub-project B via Google
   Calendar). Services manager: two tabs (Nail / Gội đầu), price input,
   duration + capacity, 10 standard badges dropdown, image upload (compressed,
   stored in the browser for now), toggle "Hiện trên trang chủ". The landing
   page lists only flagged services; the lookbook modal lists all.
7. **Staff-ready model**: bookings carry `staffId` (default `owner`); no picker
   until sub-project B introduces more than one staff.

## Non-goals

Backend, Google login, Google Calendar, Vercel Blob, waitlist, slot
interleaving, real multi-staff assignment (all sub-project B).

## Constraints

- No new npm dependencies.
- `npx tsc --noEmit -p tsconfig.app.json` and `npm run build` must pass.
- All UI copy in Vietnamese; text must respect `prefers-reduced-motion` for
  animations.
- Mobile-first; 16px side gutters; no horizontal scroll.
