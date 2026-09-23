import React from 'react';
import { Sparkles, CalendarDays, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  isAdminView: boolean;
  onToggleView: (isAdmin: boolean) => void;
  onScrollToBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdminView,
  onToggleView,
  onScrollToBooking,
}) => {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); onToggleView(false); }}>
          <div className="brand-icon">
            <Sparkles size={22} color="var(--bg-main)" />
          </div>
          <div>
            <div className="brand-name">AURA NAILS</div>
            <div className="brand-sub">LUXURY BEAUTY STUDIO</div>
          </div>
        </a>

        <div className="header-actions">
          {!isAdminView ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onScrollToBooking}
              >
                <CalendarDays size={18} />
                <span>Đặt Lịch Ngay</span>
              </button>

              <button
                type="button"
                className="btn btn-admin-toggle"
                onClick={() => onToggleView(true)}
                title="Dành cho chủ tiệm và kỹ thuật viên xem bảng lịch"
              >
                <ShieldCheck size={16} />
                <span>Chủ Tiệm Xem Lịch</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-admin-toggle active"
              onClick={() => onToggleView(false)}
            >
              <span>← Trở về Trang Khách Đặt Lịch</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
