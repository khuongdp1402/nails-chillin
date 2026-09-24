import React from 'react';
import { Sparkles, CalendarDays, ChevronDown } from 'lucide-react';
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
  return (
    <header className="site-header ch-header">
      <div className="container header-inner">
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); onGoHome(); }}>
          <div className="brand-icon">
            <Sparkles size={20} color="var(--text-on-accent)" />
          </div>
          <div>
            <div className="brand-name">AURA NAILS</div>
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
