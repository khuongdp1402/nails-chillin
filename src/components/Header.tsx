import React, { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import '../styles/chrome.css';
import { useMode } from '../context/ModeContext';

interface HeaderProps {
  onScrollToBooking: () => void;
  onGoHome: () => void;
  onOpenModePicker: () => void;
  /** Trong trang quản lý: ẩn chip chọn dịch vụ và nút đặt lịch. */
  isAdminView?: boolean;
}

const MODE_LABEL = { nail: 'Nail', headspa: 'Gội đầu', both: 'Nail + Gội đầu' } as const;
const MODE_SHORT = { nail: 'Nail', headspa: 'Gội đầu', both: 'Cả hai' } as const;

export const Header: React.FC<HeaderProps> = ({ onScrollToBooking, onGoHome, onOpenModePicker, isAdminView }) => {
  const { mode } = useMode();
  const [compact, setCompact] = useState(false);

  // Thu gọn header khi cuộn xuống, mở lại khi về gần đầu trang (ngưỡng lệch nhau để không chớp)
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setCompact((prev) => (prev ? y > 24 : y > 90));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`site-header ch-header${compact ? ' is-compact' : ''}`}>
      <div className="container header-inner">
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); onGoHome(); }}>
          <img src="/chillin-logo.jpg" alt="CHILLIN Logo" className="brand-icon-img" style={{ height: '32px', borderRadius: '4px', objectFit: 'contain' }} />
          <div>
            <div className="brand-name">CHILLIN</div>
            <div className="brand-sub">Nail &amp; Gội đầu dưỡng sinh</div>
          </div>
        </a>

        {!isAdminView && (
          <div className="header-actions">
            <button
              type="button"
              className="ch-chip"
              onClick={onOpenModePicker}
              aria-haspopup="dialog"
              aria-label={`Đang xem: ${mode ? MODE_LABEL[mode] : 'chưa chọn'}. Bấm để đổi`}
            >
              <span className="ch-chip-full">{mode ? MODE_LABEL[mode] : 'Chọn dịch vụ'}</span>
              <span className="ch-chip-short" aria-hidden="true">{mode ? MODE_SHORT[mode] : 'Chọn'}</span>
              <ChevronDown size={16} />
            </button>
            <button type="button" className="btn btn-primary ch-cta" onClick={onScrollToBooking} aria-label="Đặt lịch">
              <CalendarDays size={18} />
              <span className="ch-cta-text">Đặt lịch</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
