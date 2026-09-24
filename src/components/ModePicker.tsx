import { useEffect, useRef, useState } from 'react';
import { Hand, Sparkles, Waves, X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import '../styles/chrome.css';
import { useMode } from '../context/ModeContext';
import type { ServiceMode } from '../context/ModeContext';

interface ModePickerProps {
  /** Mở lại từ header (khi đã có mode). */
  reopened: boolean;
  onClose: () => void;
}

const OPTIONS: { id: ServiceMode; title: string; hint: string; price: string; icon: ReactNode }[] = [
  { id: 'nail', title: 'Làm nail', hint: 'Sơn gel, đắp móng, nail art', price: 'Từ 150.000đ · 45 phút', icon: <Hand size={28} /> },
  { id: 'headspa', title: 'Gội đầu dưỡng sinh', hint: 'Thư giãn, dưỡng tóc, massage đầu', price: 'Từ 150.000đ · 45 phút', icon: <Waves size={28} /> },
  { id: 'both', title: 'Cả hai', hint: 'Làm nail và gội đầu trong một buổi', price: 'Từ 300.000đ · 1 giờ 30 phút', icon: <Sparkles size={28} /> },
];

export function ModePicker({ reopened, onClose }: ModePickerProps) {
  const { mode, setMode } = useMode();
  const [picked, setPicked] = useState<ServiceMode | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = mode === null || reopened;
  const canClose = mode !== null;

  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const prevFocus = document.activeElement as HTMLElement | null;
    rootRef.current?.querySelector<HTMLElement>('.ch-card')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canClose) {
        onClose();
        return;
      }
      if (e.key === 'Tab' && rootRef.current) {
        const items = Array.from(rootRef.current.querySelectorAll<HTMLElement>('button:not(:disabled)'));
        if (items.length === 0) return;
        const a = items[0];
        const z = items[items.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [visible, canClose, onClose]);

  useEffect(() => {
    if (!picked) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(() => {
      setMode(picked);
      setPicked(null);
      onClose();
    }, reduce ? 0 : 420);
    return () => window.clearTimeout(t);
  }, [picked, setMode, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className={`ch-picker${picked ? ' is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ch-picker-title"
    >
      {canClose && (
        <button type="button" className="ch-picker-close" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>
      )}
      <div className="ch-picker-inner">
        <div className="ch-picker-brand">Aura Nails &amp; Spa</div>
        <h2 id="ch-picker-title" className="ch-picker-title">Hôm nay bạn muốn làm gì?</h2>
        <p className="ch-picker-sub">Chọn một mục, mình sẽ gợi ý đúng dịch vụ cho bạn.</p>
        <div className="ch-picker-grid">
          {OPTIONS.map((o, i) => (
            <button
              key={o.id}
              type="button"
              className={`ch-card${picked === o.id ? ' is-picked' : ''}${mode === o.id ? ' is-current' : ''}`}
              style={{ '--ch-i': i } as CSSProperties}
              disabled={picked !== null}
              onClick={() => setPicked(o.id)}
            >
              <span className="ch-card-icon">{o.icon}</span>
              <span className="ch-card-title">{o.title}</span>
              <span className="ch-card-hint">{o.hint}</span>
              <span className="ch-card-price">{o.price}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
