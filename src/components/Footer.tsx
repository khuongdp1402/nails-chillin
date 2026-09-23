import React from 'react';
import { MapPin, Phone, Clock, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div className="brand-icon" style={{ width: '32px', height: '32px', fontSize: '16px' }}>
                <Sparkles size={16} color="var(--bg-main)" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-main)' }}>
                AURA NAILS & BEAUTY
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '380px', lineHeight: 1.6 }}>
              Không gian làm móng nghệ thuật phong cách thư giãn, sử dụng sản phẩm sơn organic lành tính và kỹ thuật định hình chuẩn salon quốc tế.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-gold)', marginBottom: '14px', fontSize: '0.95rem', fontWeight: 600 }}>
              Thông Tin Liên Hệ
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--accent-gold)" />
                <span>Hotline: 0988 123 456</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="var(--accent-gold)" />
                <span>128 Đường Hoa Hồng, Phường Bến Nghé, Quận 1, TP. HCM</span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-gold)', marginBottom: '14px', fontSize: '0.95rem', fontWeight: 600 }}>
              Giờ Hoạt Động
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} color="var(--accent-gold)" />
                <span>Thứ 2 – Chủ Nhật: 08:30 – 20:30</span>
              </div>
              <div style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>
                ● Khóa lịch tự động theo thời gian thực
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          © 2026 Aura Nails Studio. Hệ thống đặt lịch làm móng thông minh chống trùng lịch 100%.
        </div>
      </div>
    </footer>
  );
};
