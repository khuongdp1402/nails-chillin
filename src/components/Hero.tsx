import '../styles/hero.css';
import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, Images, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import type { ServiceMode } from '../context/ModeContext';
import { SITE, zaloLink } from '../data/site';
import { useReveal } from '../hooks/useReveal';

interface HeroProps {
  onStartBooking: () => void;
  onOpenLookbook: () => void;
  onSelectCategory: (cat: 'nail' | 'headspa') => void;
}

const COLLAGE_PHOTOS: { src: string; alt: string; className: string; category: 'nail' | 'headspa' }[] = [
  {
    src: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    alt: 'Bộ nail sơn gel nghệ thuật',
    className: 'hx-photo hx-photo-1',
    category: 'nail',
  },
  {
    src: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    alt: 'Bộ nail đính đá',
    className: 'hx-photo hx-photo-2',
    category: 'nail',
  },
  {
    src: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    alt: 'Gội đầu dưỡng sinh thư giãn',
    className: 'hx-photo hx-photo-3',
    category: 'headspa',
  },
];

interface HeroCopy {
  words: string[];
  script: string;
  desc: string;
  eyebrow: string;
}

const COPY: Record<ServiceMode, HeroCopy> = {
  nail: {
    words: ['Đôi', 'tay', 'xinh,'],
    script: 'tâm trạng vui',
    desc: 'Làm nail từ 150.000đ, khoảng 45–90 phút. Sơn gel bền 3–4 tuần, dụng cụ tiệt trùng cho từng khách.',
    eyebrow: 'Làm nail',
  },
  headspa: {
    words: ['Gội', 'đầu', 'dưỡng', 'sinh,'],
    script: 'nhẹ người ngay',
    desc: 'Gội đầu dưỡng sinh khoảng 60–90 phút, có massage cổ vai gáy. Giá từ 200.000đ, bạn chỉ việc nằm thư giãn.',
    eyebrow: 'Gội đầu dưỡng sinh',
  },
  both: {
    words: ['Làm', 'nail', 'và', 'gội', 'đầu,'],
    script: 'một buổi trọn vẹn',
    desc: 'Nail từ 150.000đ, gội đầu dưỡng sinh từ 200.000đ. Đặt cả hai trong một lần, bạn ghé một chuyến là xong.',
    eyebrow: 'Nail & Gội đầu dưỡng sinh',
  },
};

export const Hero: React.FC<HeroProps> = ({
  onStartBooking,
  onOpenLookbook,
  onSelectCategory,
}) => {
  const { mode } = useMode();
  const copy = COPY[mode ?? 'both'];
  const collageRef = useRef<HTMLDivElement>(null);
  const infoRef = useReveal<HTMLDivElement>(200);
  const collageWrapRef = useReveal<HTMLDivElement>(120);
  const [revealed, setRevealed] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  useEffect(() => {
    setRevealed(true);
    const canHover = window.matchMedia('(hover: hover)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTiltEnabled(canHover && !reducedMotion);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled || !collageRef.current) return;
    const rect = collageRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    collageRef.current.style.setProperty('--tilt-x', `${relY * -8}deg`);
    collageRef.current.style.setProperty('--tilt-y', `${relX * 8}deg`);
  };

  const handleMouseLeave = () => {
    if (!collageRef.current) return;
    collageRef.current.style.setProperty('--tilt-x', '0deg');
    collageRef.current.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <section className="hx-hero">
      <div className="hx-orb hx-orb-a" aria-hidden="true" />
      <div className="hx-orb hx-orb-b" aria-hidden="true" />

      <div className="container hx-container hx-grid">
        <div className={`hx-copy ${revealed ? 'is-revealed' : ''}`}>
          <span className="hx-eyebrow">
            <Sparkles size={14} />
            {copy.eyebrow}
          </span>

          <h1 className="hx-title">
            {copy.words.map((word, i) => (
              <span key={word + i} className="hx-word" style={{ transitionDelay: `${i * 70}ms` }}>
                {word}&nbsp;
              </span>
            ))}
            <span className="script-text hx-script">{copy.script}</span>
          </h1>

          <p className="hx-desc">{copy.desc}</p>

          <div className="hx-cta-row">
            <button type="button" className="btn btn-primary" onClick={onStartBooking}>
              <Calendar size={18} />
              <span>Đặt lịch ngay</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={onOpenLookbook}>
              <Images size={18} />
              <span>Xem mẫu</span>
            </button>
          </div>

          <div className="hx-info" ref={infoRef}>
            <span className="hx-info-item">
              <Clock size={16} />
              {SITE.hours}
            </span>
            <span className="hx-info-item">
              <MapPin size={16} />
              {SITE.address}
            </span>
            <a
              className="hx-info-item hx-info-zalo"
              href={zaloLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} />
              Nhắn Zalo
            </a>
          </div>
        </div>

        <div className="hx-collage-wrap" ref={collageWrapRef}>
          <div
            className="hx-collage"
            ref={collageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {COLLAGE_PHOTOS.map((photo) => (
              <button
                key={photo.className}
                type="button"
                className={photo.className}
                onClick={() => onSelectCategory(photo.category)}
              >
                <img src={photo.src} alt={photo.alt} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
