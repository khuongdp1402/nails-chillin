# Admin restyle report

Status: done (tsc + build pass). Not visually checked in a browser.

Files: AdminDashboard/index.tsx, AdminDashboard/ServicesManager.tsx, styles/admin.css, styles/services-manager.css (also holds the shared ui-* control styles: input, price, select, upload preview).

- Dates: custom range from/to and timeline date use CustomDatePicker (unchanged component). Popover footer rule overridden in admin.css (.ad-wrap .cdp-foot) to drop its border-top.
- Selects: walk-in service and reminder lead time use ui/Select. Morning time is a rounded pill styled input type=time.
- Tabs/presets/services tabs: slim pill controls, heading font, active gradient + glow, no underlines.
- Cards: booking rows and services rows are 20px cards, soft shadow, hover lift, heading-font names, .price, phone as pill, time as pill, status chips soft. Service thumb 72/88/96px, radius 18px.
- Floating action panel (gradient outline + glow when a change is pending): services drawer (dirty tracking vs initial draft) and walk-in quick add (ready once name typed).
- Cancel booking: inline "Hủy lịch này? [Hủy lịch][Giữ lại]" replaces window.confirm. Service delete confirm stays inline (now a pill).
- Removed border-top/bottom, dashed rules, card outlines; replaced by spacing / soft backgrounds.
- Reduced motion covered; 44px targets; date popover right-aligned on >=720px in the timeline header.

Left as is: dashed border on the image drop zone (ui-upload-drop, functional drop target). booking.css .cdp-foot still has a border-top (not my file; only overridden inside admin).
Files are CRLF; edits preserved CRLF.
