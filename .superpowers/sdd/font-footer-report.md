# Font, footer, feature cards report
Status: done, uncommitted. tsc + build pass.
1. --font-heading (= Dancing Script) in index.css; applied to h1-h4, brand, section tag/title, price, chip, hero, booking (title, pills, group titles, svc names, chips, prices), chrome (brand, mode chip, picker, cards), services (script, title, group, badge, name, price, modal), footer. Sizes bumped 15-40%, weight 600-700. Body copy/inputs stay Be Vietnam Pro. Admin untouched. index.html already loads Dancing Script 500/600/700 (Google serves vietnamese subset automatically).
2. TrustBadgeStrip.tsx and .hx-trust* CSS removed; Squiggle kept (Hero uses it). Footer is pink ombre with --text-main text, rose-dark icons, no fixed min-height.
3. Feature copy rewritten; title nowrap+ellipsis, desc 2-line clamp with min-height; grid minmax(0,1fr), stretch.
