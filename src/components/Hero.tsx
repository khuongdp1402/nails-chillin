import React from 'react';
import { Calendar, Clock, Sparkles, CheckCircle2, ShieldAlert, Images, HeartHandshake } from 'lucide-react';

interface HeroProps {
  onStartBooking: () => void;
  onOpenLookbook: () => void;
  onSelectCategory: (cat: 'nail' | 'headspa') => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartBooking,
  onOpenLookbook,
  onSelectCategory,
}) => {
  return (
    <section className="hero-section">
      <div className="container hero-bento-grid">
        {/* BENTO CARD 1: MAIN HERO INTRODUCTION */}
        <div className="bento-card">
          <div>
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>Aura Beauty Lounge • 2026 Experience</span>
            </div>

            <h1 className="hero-title">
              Nghệ Thuật Làm Móng & <br />
              <span className="emerald-gradient-text">Gội Đầu Dưỡng Sinh</span>
            </h1>

            <p className="hero-desc">
              Không gian thư giãn đẳng cấp chuẩn thị trường Việt Nam. Sự kết hợp hoàn mỹ giữa kỹ thuật làm nail nghệ thuật tinh xảo và liệu trình gội đầu thảo dược đả thông kinh lạc, kèm hệ thống giữ chỗ thông minh chống trùng lịch tuyệt đối.
            </p>

            {/* DUAL MODULE INTERACTIVE BOXES */}
            <div className="hero-dual-modules">
              {/* Module 1: Nail */}
              <div
                className="hero-module-box active-nail"
                onClick={() => onSelectCategory('nail')}
              >
                <div className="module-icon-wrap" style={{ background: 'var(--bg-surface)' }}>
                  <Sparkles size={18} color="var(--accent-gold)" />
                </div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-gold)', marginBottom: '4px' }}>
                  💅 Nail Art & Spa
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sơn gel thạch Hàn Quốc, đắp form móng Ombre, vẽ đính đá sang trọng.
                </p>
              </div>

              {/* Module 2: Gội Đầu Dưỡng Sinh */}
              <div
                className="hero-module-box active-spa"
                onClick={() => onSelectCategory('headspa')}
              >
                <div className="module-icon-wrap" style={{ background: 'var(--bg-surface)' }}>
                  <HeartHandshake size={18} color="var(--accent-emerald)" />
                </div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                  🌿 Gội Đầu Dưỡng Sinh
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Nấu bồ kết tươi, vòm nước chữ U, massage cổ vai gáy & đá nóng bazan.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '28px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onStartBooking}
            >
              <Calendar size={18} />
              <span>Đặt Lịch Giữ Chỗ Tức Thì</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenLookbook}
            >
              <Images size={18} color="var(--accent-gold)" />
              <span>Xem Lookbook Mẫu Ảnh Thực Tế</span>
            </button>
          </div>
        </div>

        {/* BENTO CARD 2: REALTIME SCHEDULING STATUS (ORYZO TACTILE CARD) */}
        <div className="bento-card hero-side-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--accent-gold)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-gold)' }}>
                  Hệ Thống Khóa Giờ Thông Minh
                </span>
              </div>
              <span className="badge-status badge-free" style={{ fontSize: '0.7rem' }}>
                Live Protection
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Minh họa ngày <strong style={{ color: 'var(--accent-gold)' }}>25/09/2026</strong> đã kín lịch:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                padding: '12px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    09:00 – 11:00 • Nguyễn A
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    💅 Sơn gel thạch + Vẽ đính đá (2 giờ)
                  </div>
                </div>
                <span className="badge-status badge-booked" style={{ fontSize: '0.68rem' }}>
                  ĐÃ KHÓA
                </span>
              </div>

              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                padding: '12px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    11:00 – 12:30 • Trần B
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    🌿 Combo Gội Dưỡng Sinh + Vai Gáy (1,5 giờ)
                  </div>
                </div>
                <span className="badge-status badge-booked" style={{ fontSize: '0.68rem' }}>
                  ĐÃ KHÓA
                </span>
              </div>

              <div style={{
                background: 'var(--bg-surface)',
                border: '1px dashed var(--text-main)',
                padding: '12px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    12:30 – 14:30: Khung Giờ Còn Trống
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Khách có thể đặt trọn vẹn 2 giờ tại đây
                  </div>
                </div>
                <CheckCircle2 size={18} color="var(--text-main)" />
              </div>
            </div>
          </div>

          <div style={{
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.76rem',
            color: 'var(--text-dim)'
          }}>
            <ShieldAlert size={14} color="var(--accent-gold)" />
            <span>Tự động ngăn chặn đặt trùng thời gian giữa 2 khách hàng đồng thời.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
