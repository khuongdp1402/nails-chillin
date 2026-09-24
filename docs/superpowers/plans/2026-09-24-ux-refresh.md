# UX Refresh Implementation Plan

> Execution: subagent-driven. Task F runs first on `soft-pink-redesign`. Tasks
> T2–T7 then run **in parallel**, each in its own git worktree/branch created
> from the F commit, with strictly disjoint file ownership. The controller
> merges the branches afterwards, then runs cleanup + whole-branch review.
> No test framework exists: verification is `npx tsc --noEmit -p
> tsconfig.app.json && npm run build`.

**Goal:** ombre palette, mode picker, friendly copy, compact animated cards and
booking, admin range filters + services manager, Zalo button, staff-ready data.

**Spec:** docs/superpowers/specs/2026-09-24-ux-refresh-design.md

## Global Constraints

- No new npm dependencies. Vite + React 19 + TS, plain CSS, lucide-react icons.
- Today is 2026-09-24; never hardcode 2026-09-25 or "09/2026" anywhere.
- Copy: Vietnamese, friendly, short, address the customer as "bạn". Forbidden
  wording: "hệ thống", "tự động khóa", "chống trùng", "demo", "mẫu", "đang xây
  dựng", "2026 Experience". Every text block gives real information (what,
  how long, how much, where, when).
- Shapes: cards `border-radius: var(--radius-card)` (20px); inner info panels
  also rounded on all four corners (`var(--radius-md)`); buttons/chips pills.
- Motion: use `var(--ease-lux)`; hover = lift 3–4px + soft glow; reveal-on-scroll
  via `useReveal`; ALL animation disabled under `prefers-reduced-motion`.
- CSS ownership: parallel tasks MUST NOT edit `src/index.css`. Each task puts
  its styles in its own file `src/styles/<name>.css`, imported at the top of its
  component `.tsx`, and prefixes every NEW class name with its own prefix (below)
  so nothing collides with legacy rules in index.css.
- Only reference tokens that exist (list below). Never introduce hex colors
  outside the palette except inside `rgba()` of palette colors.

### Tokens provided by Task F (all tasks may rely on these names)

Colors: `--bg-main #fff6f8`, `--bg-card #ffffff`, `--bg-surface #ffe9ef`,
`--accent-rose #e23e68`, `--accent-rose-dark #b3123b`, `--accent-red #c8102e`,
`--accent-red-bg` (tint), `--accent-gold #c9963a`, `--accent-gold-dark #8f6420`,
`--text-main #3a1220`, `--text-muted #7a5560`, `--text-dim #a98a93`,
`--text-on-accent #ffffff`, `--border-subtle #f5d3dc`, `--border-strong #eaa9ba`,
`--price-color #c8102e`. Legacy aliases stay defined (`--accent-emerald`,
`--text-gold`, `--radius-full`, `--accent-rose`…).
Gradients: `--gradient-ombre` (hồng phấn → trắng → đỏ hồng → đỏ), `--gradient-cta`
(#e23e68 → #b3123b), `--gradient-cta-hover`, `--gradient-soft` (hồng nhạt → trắng).
Shadows: `--shadow-soft`, `--shadow-card`, `--shadow-lift`, `--shadow-glow`.
Radii: `--radius-card 20px`, `--radius-md 16px`, `--radius-sm 12px`, `--radius-pill`.
Motion: `--ease-lux`, `--dur-fast 0.2s`, `--dur 0.45s`.
Fonts: `--font-display`, `--font-script`, `--font-body`.
Global classes: `.btn .btn-primary .btn-secondary .btn-ghost`, `.chip`, `.price`,
`.reveal` / `.reveal.is-visible` (fade-up, delay via `--reveal-delay`),
`.step-enter` (step transition), `.sr-only`, `.container`.

### Shared modules provided by Task F

- `src/context/ModeContext.tsx`: `type ServiceMode = 'nail' | 'headspa' | 'both'`;
  `ModeProvider` (wraps app in `main.tsx`); `useMode(): { mode: ServiceMode | null;
  setMode(m: ServiceMode): void; clearMode(): void; showsCategory(c: ServiceCategory): boolean }`.
  Persists `{mode, expiresAt}` in localStorage key `aura_mode_v1`, expiry 24h,
  expired/invalid → `null`.
- `src/data/site.ts`: `SITE = { name, phoneDisplay, zaloPhone, address, hours }`,
  `zaloLink(message?: string): string` → `https://zalo.me/<zaloPhone>`.
- `src/data/badges.ts`: `SERVICE_BADGES: string[]` (10 standard badges: Mới,
  Hot trend, Bán chạy, Được yêu thích, Combo tiết kiệm, Cao cấp, Thư giãn, Ưu đãi,
  Cô dâu, Mùa lễ hội).
- `src/types/index.ts`: `Service.showOnLanding?: boolean` (undefined = true),
  `Service.capacity?: number` (khách làm cùng lúc, default 1),
  `Booking.staffId?: string` (default `'owner'`).
- `src/utils/scroll.ts`: `scrollToTarget(el: HTMLElement | null, opts?: { extraOffset?: number }): void`
  (smooth, subtracts sticky `.site-header` height, instant under reduced motion).
- `src/hooks/useReveal.ts`: `useReveal<T extends HTMLElement>(delayMs?: number): RefObject<T>`
  adds `is-visible` once when intersecting.
- `src/components/AdminDashboard/ServicesManager.tsx`: stub with final props
  `{ services: Service[]; onServicesChanged: (next: Service[]) => void }`
  (mounted in AdminDashboard's services tab). Filled by Task T7.
- Storage: no seeded bookings; bookings key bumped to `aura_nail_bookings_v2`,
  services key to `aura_salon_services_v3`; `resetBookingsToDefault()` now clears.
  `INITIAL_MOCK_BOOKINGS` removed.

---

## Task F: Foundation (sequential, runs first, on branch soft-pink-redesign)

**Files:** modify `src/index.css` (`:root` tokens, `.btn*`, new global classes,
keyframes; leave other legacy rules), `src/main.tsx`, `src/types/index.ts`,
`src/data/services.ts`, `src/utils/storage.ts`, `src/components/AdminDashboard/index.tsx`
(replace services-tab body with `<ServicesManager/>`, delete now-unused
state/handlers/imports so tsc has no unused-variable errors); create the shared
modules listed above.

Requirements:
1. Implement every token, class and module in the lists above exactly as named.
   `.btn-primary`: `--gradient-cta`, white text, pill, hover lifts 2px + `--shadow-glow`,
   `:active` scale .98, `:disabled` 45% opacity. `.btn-secondary`: white bg, rose-dark
   text, 1.5px `--border-strong`, hover fills `--bg-surface`. `.btn-ghost`: transparent.
   `.price`: `--price-color`, weight 700. `body` background: `--bg-main`.
2. `DEFAULT_SERVICES`: map every `badge` to a value from `SERVICE_BADGES`; set
   `showOnLanding: true` on the first 3 services of each category and `false` on the 4th.
3. Remove seeded demo bookings (see Storage above). No remaining reference to
   `2026-09-25` in `src/` (AdminDashboard/BookingWizard hardcodes are fixed by
   T5/T6 — F only makes them compile; F must not touch BookingWizard).
4. AdminDashboard: delete the old inline services-management UI and its state
   (`newService*`, `handleCreateService`, `handleDeleteService`, `serviceFormSuccess`
   …), render `<ServicesManager services={services} onServicesChanged={onServicesChanged} />`.
5. `main.tsx` wraps `<App/>` in `<ModeProvider>`.

Verify: tsc + build pass. Commit: `feat: ombre tokens, mode context, shared utils, staff-ready types`.

---

## Parallel tasks (each in its own worktree `.worktrees/<id>` on branch `ux/<id>`)

Common rules: work only inside your worktree; touch only the files you own; do
not edit `src/index.css`; run `npm install` first if `node_modules` is missing;
run tsc + build before committing; commit with `git add <your files>` only.

### T2 `t2-chrome` — entry gate, header, Zalo button, routing

Owns: `src/App.tsx`, `src/components/Header.tsx`, create `src/components/ModePicker.tsx`,
`src/components/ZaloFab.tsx`, `src/styles/chrome.css` (prefix `ch-`).

1. `ModePicker`: full-screen overlay shown when `useMode().mode === null` (and when
   reopened from the header). Title "Hôm nay bạn muốn làm gì?", three large rounded
   ombre cards: "Làm nail", "Gội đầu dưỡng sinh", "Cả hai" (icon, one-line
   promise with time/price hint, e.g. "Từ 150.000đ · 45 phút"). Card hover lifts,
   selection animates out (fade/scale) then calls `setMode`. Focus trap-lite,
   Esc closes only when reopened (mode already set).
2. `Header`: brand left; right side: small pill chip showing current mode
   ("Nail" / "Gội đầu" / "Nail + Gội đầu") with a chevron that reopens the picker;
   primary pill "Đặt lịch" (scrolls to booking). **Remove** the "Chủ tiệm xem lịch"
   button entirely from the landing page. Keep sticky, ombre hairline, blur.
3. `App.tsx`: hash routing — `#/admin` renders `AdminDashboard` (with a "← Về trang
   chủ" action that sets `location.hash = ''`), anything else renders the landing
   page. Listen to `hashchange`. Replace the booking section header copy with
   friendly text (e.g. tag "Đặt lịch", title "Chọn giờ đẹp, mình giữ chỗ cho bạn",
   desc one short sentence). Use `scrollToTarget` for the existing scroll helpers.
   Render `<ModePicker/>` and `<ZaloFab/>` (landing only). Keep all existing props
   passed to Hero/ServicesShowcase/BookingWizard/LookbookModal unchanged.
4. `ZaloFab`: small round floating button bottom-right (Zalo blue #0068ff is
   allowed for this brand button only), tooltip "Nhắn Zalo cho tiệm", opens
   `zaloLink()` in a new tab, gentle pulse (disabled for reduced motion), sits
   above mobile safe area.

### T3 `t3-hero` — hero, feature strips, footer

Owns: `src/components/Hero.tsx`, `FeatureStrip.tsx`, `TrustBadgeStrip.tsx`,
`Footer.tsx`, create `src/styles/hero.css` (prefix `hx-`).

1. Restyle hero with `--gradient-ombre` background, stronger contrast, keep the
   3-photo tilt collage + kinetic headline behaviour and the mobile single-photo
   collapse (height auto). Headline and CTA copy depend on `useMode()` (nail /
   headspa / both); friendly copy, real info (giờ mở cửa, khoảng giá, thời gian).
   Primary CTA "Đặt lịch ngay" (scroll via `scrollToTarget`) + secondary
   "Xem mẫu" (opens lookbook via existing `onOpenLookbook`).
2. Add a compact info row in the hero: giờ mở cửa, địa chỉ ngắn, nút "Nhắn Zalo"
   (uses `SITE`/`zaloLink`).
3. Rewrite FeatureStrip and TrustBadgeStrip copy (short, concrete: e.g. "Dụng cụ
   tiệt trùng mỗi khách", "Sơn bền 3–4 tuần"). Trust strip uses ombre gradient.
4. Footer uses `SITE` (phone, address, hours) and a Zalo link; remove the
   "khóa lịch tự động" / system-talk lines; keep the script quote.
5. All sections use `useReveal` for entrance.

### T4 `t4-services` — services showcase + lookbook

Owns: `src/components/ServicesShowcase.tsx`, `LookbookModal.tsx`,
create `src/styles/services.css` (prefix `svc-`).

1. ServicesShowcase (props unchanged): filter by `useMode().showsCategory`, and
   only services with `showOnLanding !== false`. When mode is `both`, render two
   separate labelled sections ("Làm nail", "Gội đầu dưỡng sinh") each with its own
   grid; otherwise one section. Remove the old filter pills (mode replaces them).
2. Cards: compact, radius 20px, **large image (aspect 4/3 or 1/1)**, badge chip on
   the image, name (1–2 lines, small), duration chip ("1 giờ 15 phút") small,
   **price in `.price` accent red** and a rounded "Đặt" button. Inner info panel
   has all four corners rounded (card floats inside a rounded frame with
   padding). Hover: lift, image zoom 1.06, glow. Reveal with stagger.
3. Footer link below the grid: "Xem tất cả mẫu & dịch vụ" opens the lookbook
   (`onOpenLookbook`).
4. LookbookModal (props unchanged): on open read `getStoredServices()` and list
   ALL services (ignore `showOnLanding`), filtered by mode; tabs Tất cả / Nail /
   Gội đầu (only tabs relevant to mode). Same compact card language. Select →
   `onSelectLookbookService(service.id)` then close. Stop using `LOOKBOOK_GALLERY`
   (leave the export in place). Body scroll locked while open; close on Esc.

### T5 `t5-booking` — booking wizard

Owns: `src/components/BookingWizard/index.tsx`, create `src/styles/booking.css`
(prefix `bk-`). Keep `BookingWizardProps` unchanged.

1. Keep the 3-step flow (services → info + date + time → done) but make it compact
   and elegant: rounded panel, slim progress with animated fill, small type.
2. Service picker: only services of `useMode()` categories; compact selectable cards
   with large thumbnail, small name/duration, price in `.price`; selected state =
   gradient border + check. Two labelled groups when mode is `both`.
3. Default date = today (local time, computed at runtime), `min` = today. Quick date
   chips: "Hôm nay", "Ngày mai", "Cuối tuần" plus the date input. Past times today
   are unavailable ("Đã qua giờ").
4. Slots: grid of time chips showing check-in (big) and "đến HH:mm" (small). Selected
   slot: full `--gradient-cta`, white text, check icon, glow, scale-in. Unavailable:
   muted, struck-through, tooltip reason. Empty-state copy if no slot fits.
   Summary bar under the grid: "14:00 – 15:15 · 1 giờ 15 phút · 350.000đ".
5. Step transitions: outgoing step fades, incoming uses `.step-enter`; after every
   step change and after booking success call `scrollToTarget` on the wizard
   container top (and focus its heading). Validation errors scroll to the first
   invalid field.
6. Fields: name, phone only (plus date/time/services). `attemptCreateBooking` called
   with `staffId: 'owner'` in the payload (extend the input typing as needed).
7. Success: friendly confirmation, receipt as rounded info panel, buttons: "Thêm vào
   Google Calendar", "Tải file lịch", **"Nhắn Zalo cho tiệm"** (`zaloLink` with a
   prefilled message containing name, date, time, services), "Đặt thêm lịch".
8. Keep confetti but use the new palette. All copy friendly (see constraints).

### T6 `t6-admin` — admin dashboard

Owns: `src/components/AdminDashboard/index.tsx` (everything except the services
tab body, which is `<ServicesManager/>` and must stay), create
`src/utils/dateRange.ts`, `src/styles/admin.css` (prefix `ad-`).

1. `dateRange.ts`: `type RangePreset = 'today' | 'week' | 'month' | 'custom'`;
   `getRange(preset, custom?: {from: string; to: string}): { from: string; to: string }`
   (ISO `YYYY-MM-DD`, week = Mon–Sun containing today, month = calendar month);
   `enumerateDays(from, to): string[]`; `formatRangeLabel(from, to): string` (Vietnamese).
2. Top filter bar: segmented pills Hôm nay / Tuần này / Tháng này / Tùy chọn; custom
   shows two styled date inputs (từ ngày – đến ngày, `to >= from` enforced). Default
   = Hôm nay. Stat cards (doanh thu, số khách, tổng giờ làm) for the range.
3. Views over the selected range: (a) list grouped by day, sorted by time, each
   booking a compact rounded row (giờ, tên, SĐT tap-to-call, dịch vụ, tiền, nút hủy);
   (b) month calendar of the *current* month (dynamic, first-weekday aligned, day
   cells show booking count); clicking a day sets the range to that day; (c) daily
   timeline table for single-day ranges. Remove all `2026-09` hardcoding and the
   "Khôi phục mẫu" button (and its `resetBookingsToDefault` import).
4. Reminders tab: remove the copy-message / Zalo-message tools. Replace with a
   "Nhắc lịch" settings card: "Báo tổng hợp buổi sáng lúc" (time input, default
   07:00) and "Nhắc trước giờ hẹn" (select 15/30/45/60 phút, default 30) persisted in
   localStorage `aura_reminder_settings_v1`, with a note that reminders are sent by
   Google Calendar once the calendar is connected. Export
   `getReminderSettings()` / `saveReminderSettings()` from `src/utils/reminderSettings.ts`
   (create it; T6 owns it).
5. Header of the admin: title "Quản lý lịch", "← Về trang chủ" button (calls the
   existing `onExitAdmin` prop). Friendly copy. Remove "Google Cal" per-row links
   that duplicate later B behaviour? Keep them (they are useful now).

### T7 `t7-services-manager` — services management UI

Owns: `src/components/AdminDashboard/ServicesManager.tsx` (replace the stub),
create `src/components/ui/PriceInput.tsx`, `Select.tsx`, `Toggle.tsx`,
`ImageUpload.tsx`, `src/utils/image.ts`, `src/styles/services-manager.css`
(prefix `sm-`, shared ui components use prefix `ui-`).

1. Two tabs: "Nail" and "Gội đầu" (counts in the tab labels). Each tab lists that
   category's services as compact rounded rows: thumbnail, name, duration, price,
   badge chip, toggle "Hiện trên trang chủ", edit and delete (confirm) actions.
   "Thêm dịch vụ" button opens a rounded drawer/modal form (animated).
2. Form fields: name (required), duration `Select` (15–240 min step 15, shows
   "1 giờ 15 phút"), price `PriceInput` (digits only, live thousands separator,
   suffix "đ", stores number), capacity stepper "Số khách làm cùng lúc" (1–5,
   default 1), short description (max 120 chars with counter), badge `Select` with
   `SERVICE_BADGES` + "Không có nhãn", image via `ImageUpload`, `Toggle` "Hiện trên
   trang chủ". Category = current tab.
3. `Select`: fully custom accessible listbox (button + popup, arrow-key navigation,
   Esc closes, click-outside closes, rounded, animated) — no native `<select>`.
4. `ImageUpload`: drag-drop or click, preview, remove, validates image type; uses
   `utils/image.ts#compressImage(file, {maxSize:1000, quality:0.8}): Promise<string>`
   (canvas → JPEG data URL, ~<150KB) and shows a friendly error if localStorage
   would overflow (catch quota errors around `saveStoredServices`). Also allow
   pasting an image URL as fallback.
5. Persist through `saveStoredServices` + `onServicesChanged(next)`; ids
   `svc-${Date.now()}`; edits keep id. Empty state per tab.

---

## Task C: Integration & cleanup (controller, after merges)

1. Merge `ux/t2..t7` into `soft-pink-redesign` (disjoint files ⇒ clean merges).
2. `npm run build`; run the undefined-token check (`var(--x)` used but not defined)
   and the missing-class check (classNames with no CSS rule); fix findings.
3. Cleanup subagent: delete legacy CSS rules in `index.css` whose classes are no
   longer referenced by any `.tsx`.
4. Whole-branch review (most capable model); one fix wave; scoped re-review.
