import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  min?: string; // YYYY-MM-DD
  onChange: (dateIso: string) => void;
  hasError?: boolean;
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const POPOVER_W = 320;
const EDGE = 8;
const GAP = 8;

const pad = (n: number) => String(n).padStart(2, '0');

/** Ngày hôm nay theo giờ máy (không dùng UTC để khỏi lệch ngày). */
function localTodayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  min,
  onChange,
  hasError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const parseDate = (iso: string) => {
    if (!iso) return new Date();
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const selectedDate = parseDate(value);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth()); // 0-indexed

  // Đồng bộ tháng đang xem khi giá trị đổi từ bên ngoài
  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Đặt popover theo vị trí nút: hiện phía dưới, nếu thiếu chỗ thì lật lên trên,
  // luôn nằm trong màn hình và không bị vùng cuộn hay thanh nổi che.
  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Trên màn hình mobile: căn giữa màn hình như modal giúp thao tác thoải mái
    if (vw <= 540) {
      const width = Math.min(320, vw - 28);
      const left = Math.round((vw - width) / 2);
      const popH = popoverRef.current?.offsetHeight ?? 340;
      const top = Math.round(Math.max(16, (vh - popH) / 2));
      setPos({ top, left, width, maxHeight: vh - 32 });
      return;
    }

    const width = Math.min(POPOVER_W, vw - EDGE * 2);
    const left = Math.min(Math.max(rect.left, EDGE), vw - width - EDGE);
    const popH = popoverRef.current?.offsetHeight ?? 360;
    const spaceBelow = vh - rect.bottom - GAP - EDGE;
    const spaceAbove = rect.top - GAP - EDGE;
    const below = spaceBelow >= popH || spaceBelow >= spaceAbove;
    const maxHeight = Math.max(240, below ? spaceBelow : spaceAbove);
    const height = Math.min(popH, maxHeight);
    const top = below ? rect.bottom + GAP : Math.max(EDGE, rect.top - GAP - height);
    setPos({ top, left, width, maxHeight });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPos(null);
      return;
    }
    place();
  }, [isOpen, viewMonth, viewYear, place]);

  useEffect(() => {
    if (!isOpen) return;
    const onScrollOrResize = () => place();
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (containerRef.current?.contains(t) || popoverRef.current?.contains(t)) return;
      setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, place]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Thứ 2 = 0

  const formatDisplayDate = (iso: string) => {
    if (!iso) return 'Chọn ngày hẹn';
    const [y, m, d] = iso.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${dayNames[dateObj.getDay()]}, ${pad(d)}/${pad(m)}/${y}`;
  };

  const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

  const isDayDisabled = (d: number) => {
    if (!min) return false;
    return toIso(viewYear, viewMonth, d) < min;
  };

  const handleSelectDay = (d: number) => {
    if (isDayDisabled(d)) return;
    onChange(toIso(viewYear, viewMonth, d));
    setIsOpen(false);
  };

  const todayIso = localTodayIso();
  const todayDisabled = !!min && todayIso < min;

  const popover = isOpen
    ? createPortal(
        <>
          <div className="cdp-backdrop" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div
            ref={popoverRef}
            className="cdp-popover is-floating"
            role="dialog"
            aria-label="Lịch chọn ngày"
            style={
              pos
                ? { top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }
                : { top: 0, left: 0, visibility: 'hidden' }
            }
          >
          <div className="cdp-head">
            <button type="button" className="cdp-nav-btn" onClick={handlePrevMonth} aria-label="Tháng trước">
              <ChevronLeft size={16} />
            </button>
            <span className="cdp-month-label">
              Tháng {pad(viewMonth + 1)}, {viewYear}
            </span>
            <button type="button" className="cdp-nav-btn" onClick={handleNextMonth} aria-label="Tháng sau">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="cdp-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w} className="cdp-weekday">
                {w}
              </span>
            ))}
          </div>

          <div className="cdp-grid">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <span key={`empty-${idx}`} className="cdp-day is-empty" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayIso = toIso(viewYear, viewMonth, dayNum);
              const isSelected = value === dayIso;
              const isToday = todayIso === dayIso;
              const disabled = isDayDisabled(dayNum);

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={disabled}
                  className={`cdp-day ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''} ${
                    disabled ? 'is-disabled' : ''
                  }`}
                  onClick={() => handleSelectDay(dayNum)}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          <div className="cdp-foot">
            <button
              type="button"
              className="cdp-quick-btn"
              disabled={todayDisabled}
              onClick={() => {
                onChange(todayIso);
                setIsOpen(false);
              }}
            >
              Hôm nay
            </button>
            <button type="button" className="cdp-quick-btn cdp-close-btn" onClick={() => setIsOpen(false)}>
              Đóng
            </button>
          </div>
        </div>
      </>,
      document.body
    )
    : null;

  return (
    <div ref={containerRef} className="cdp-container">
      <button
        ref={triggerRef}
        type="button"
        className={`cdp-trigger ${hasError ? 'is-invalid' : ''} ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="cdp-icon">
          <Calendar size={18} />
        </span>
        <span className="cdp-value">{formatDisplayDate(value)}</span>
      </button>
      {popover}
    </div>
  );
};
