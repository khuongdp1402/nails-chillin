# Booking one-screen report

Status: done (tsc + build pass, changes uncommitted, not viewed in a browser).

Files: src/components/Hero.tsx (copy only), src/components/BookingWizard/index.tsx, src/styles/booking.css.

- Hero: new headline/script/desc for nail (Đôi tay đẹp, / tinh tế từng chi tiết), headspa (Thư thái từng nhịp thở, / nhẹ tênh cả ngày dài), both (Chăm từ đầu ngón tay, / đến mái tóc mềm); hint now " Từ 120.000đ · 30 phút." and stays empty without data.
- Wizard card: flex column, max-height calc(100vh/100dvh - header var 64px (76px >=640px) - 24px), pills on top, .bk-scroll (overflow-y auto, overscroll contain, thin pink scrollbar, no x-scroll), floating .bk-bar absolutely positioned inside the card (owner follow-up): hidden until a service (step 1) / slot (step 2) is chosen, rises with overshoot, gradient rounded outline + glow, primary button pulses 3 times, aria-live summary, scroll area gets bottom padding (.has-bar) while shown. Step 2 shows a "Quay lại" pill at the top until a slot is chosen. Step 3 has inline buttons.
- Service cards: horizontal rows (64px thumb, name 2 lines, duration chip, price, check), 1 column, 2 columns >=900px.
- Step 2: name/phone in 2 columns >=480px, date chips + picker, dense slot grid (3/4/6 per row), compact receipt on step 3.
- Shop note (soft pink pill, heart, no border) in step 1, step 2 above slots, and step 3 with "Nếu cần đổi giờ..." line.
- Behaviour kept: mode filtering, preselect nonce, step-change scroll (scrollToTarget on the panel plus inner scrollTop reset), validation scrolls inside the scroll area then brings the panel under the header, Zalo copy (notice scrolls into view), lead-time logic, CustomDatePicker (untouched), props unchanged.
- Note: step1Error is now unreachable in practice (button is hidden with empty selection) but is still rendered in the scroll area.
- The CustomDatePicker popover is absolute inside the scroll area, so it scrolls with it; the date field is near the top so it stays visible.

## Follow-up 2
- Service cards medium (88px thumb, 96px >=900px, name 1.12rem, price 1.15rem, padding 12-14px); duration chip removed.
- Step 2 action panel shown immediately (Quay lại + Xác nhận, primary disabled/dimmed with "Chọn giờ để tiếp tục" until a slot is picked); top back pill removed.
- Unavailable slots are not rendered (filter isAvailable); no reasons/tooltips; slot grid auto-fill, start time only; empty state "Ngày này tiệm đã kín giờ, bạn chọn ngày khác nhé ♡" (closed-today keeps "Chọn ngày mai").
- No estimated duration/end time displayed in the wizard (cards, panel, slots, receipt, Zalo text); calculations unchanged.
