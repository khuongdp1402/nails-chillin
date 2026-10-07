import '../styles/hero.css';
import React from 'react';
import { MapPin, Phone, Clock, Sparkles } from 'lucide-react';
import { SITE, instagramLink } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { InstagramIcon } from './ui/InstagramIcon';

export const Footer: React.FC = () => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <footer className="hx-footer">
      <div className="container hx-container hx-footer-top">
        <p className="hx-quote">Good nails, Good mood, Good day! ♡</p>
      </div>
      <div className="container hx-container hx-footer-body" ref={ref}>
        <div className="hx-footer-grid">
          <div>
            <div className="hx-brand">
              <span className="hx-brand-icon">
                <Sparkles size={16} />
              </span>
              <span>{SITE.name}</span>
            </div>
            <p className="hx-footer-text">
              Tiệm làm nail và gội đầu dưỡng sinh. Sơn gel lành tính, dụng cụ tiệt trùng cho từng khách,
              không gian nhẹ nhàng để bạn thư giãn.
            </p>
          </div>

          <div>
            <h4 className="hx-footer-title">Liên hệ</h4>
            <ul className="hx-footer-list">
              <li>
                <Phone size={14} />
                <a href={`tel:${SITE.zaloPhone}`}>{SITE.phoneDisplay}</a>
              </li>
              <li>
                <MapPin size={14} />
                <span>{SITE.address}</span>
              </li>
            </ul>
            <a
              className="btn btn-secondary hx-footer-zalo hx-footer-instagram"
              href={instagramLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon size={16} />
              <span>Nhắn Instagram cho tiệm</span>
            </a>
          </div>

          <div>
            <h4 className="hx-footer-title">Giờ mở cửa</h4>
            <ul className="hx-footer-list">
              <li>
                <Clock size={14} />
                <span>{SITE.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="hx-copyright">
          © {new Date().getFullYear()} {SITE.name}. Hẹn gặp bạn tại tiệm!
        </div>
      </div>
    </footer>
  );
};
