import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Images, Sparkles } from 'lucide-react';

interface HeroProps {
  onStartBooking: () => void;
  onOpenLookbook: () => void;
  onSelectCategory: (cat: 'nail' | 'headspa') => void;
}

const COLLAGE_PHOTOS: { src: string; alt: string; className: string }[] = [
  {
    src: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    alt: 'Sơn gel nghệ thuật',
    className: 'collage-card collage-card-1',
  },
  {
    src: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    alt: 'Đính đá sang trọng',
    className: 'collage-card collage-card-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    alt: 'Thư giãn gội đầu dưỡng sinh',
    className: 'collage-card collage-card-3',
  },
];

const HEADLINE_WORDS = ['Vẻ', 'Đẹp', 'Từ', 'Đôi', 'Tay,'];
const HEADLINE_SCRIPT = 'Đến Suối Tóc';

export const Hero: React.FC<HeroProps> = ({
  onStartBooking,
  onOpenLookbook,
  onSelectCategory,
}) => {
  const collageRef = useRef<HTMLDivElement>(null);
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
    <section className="hero-organic">
      <div className="hero-leaf-shadow" aria-hidden="true" />

      <div className="container hero-organic-grid">
        <div className={`hero-copy ${revealed ? 'is-revealed' : ''}`}>
          <span className="hero-eyebrow">
            <Sparkles size={14} />
            Aura Nails & Spa
          </span>

          <h1 className="hero-kinetic-title">
            {HEADLINE_WORDS.map((word, i) => (
              <span
                key={word + i}
                className="kinetic-word"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                {word}&nbsp;
              </span>
            ))}
            <span className="script-text hero-kinetic-script">{HEADLINE_SCRIPT}</span>
          </h1>

          <svg className="hero-wave-svg" viewBox="0 0 300 24" fill="none" aria-hidden="true">
            <path
              d="M2 12C40 2 60 22 100 12C140 2 160 22 200 12C240 2 260 22 298 12"
              stroke="var(--accent-rose)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          <div className="hero-glass-band">
            <p className="hero-desc">
              Không gian làm móng nghệ thuật và gội đầu dưỡng sinh chuẩn thư giãn,
              tự động giữ chỗ theo thời gian thực, không lo trùng lịch.
            </p>

            <div className="hero-cta-row">
              <button type="button" className="btn btn-primary" onClick={onStartBooking}>
                <Calendar size={18} />
                <span>Đặt Lịch Ngay</span>
              </button>
              <button type="button" className="btn btn-secondary" onClick={onOpenLookbook}>
                <Images size={18} />
                <span>Xem Lookbook</span>
              </button>
            </div>
          </div>
        </div>

        <div
          className="hero-collage"
          ref={collageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {COLLAGE_PHOTOS.map((photo) => (
            <button
              key={photo.className}
              type="button"
              className={photo.className}
              onClick={() => onSelectCategory(photo.className === 'collage-card collage-card-3' ? 'headspa' : 'nail')}
            >
              <img src={photo.src} alt={photo.alt} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
