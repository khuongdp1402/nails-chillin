import '../styles/hero.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getStoredServices } from '../data/services';
import { getMinHints, formatPrice } from '../utils/servicesSummary';
import type { PriceHint } from '../utils/servicesSummary';
import { formatDuration } from '../utils/scheduler';
import { Calendar, Clock, Images, MapPin, MessageCircle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import type { ServiceMode } from '../context/ModeContext';
import { SITE, zaloLink } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { Squiggle } from './Squiggle';

interface HeroProps {
  onStartBooking: () => void;
  onOpenLookbook: () => void;
}

interface Slide {
  src: string;
  name: string;
}

const AUTO_MS = 5000;
const MAX_SLIDES = 4;

interface HeroCopy {
  title: string[];
  script: string[];
  desc: string;
  price: string;
  eyebrow: string;
}

const priceText = (h: PriceHint | null): string =>
  h ? `Từ ${formatPrice(h.price)} · ${formatDuration(h.minutes)}.` : '';

function buildCopy(hints: ReturnType<typeof getMinHints>): Record<ServiceMode, HeroCopy> {
  return {
    nail: {
      title: ['Đôi tay đẹp,'],
      script: ['tinh tế', 'từng chi tiết'],
      desc: 'Sơn gel lành tính, bền màu 3–4 tuần.',
      price: priceText(hints.nail),
      eyebrow: 'Làm nail',
    },
    headspa: {
      title: ['Thư thái', 'từng nhịp thở,'],
      script: ['nhẹ tênh', 'cả ngày dài'],
      desc: 'Gội đầu thảo mộc kèm massage cổ vai gáy.',
      price: priceText(hints.headspa),
      eyebrow: 'Gội đầu dưỡng sinh',
    },
    both: {
      title: ['Chăm từ đầu', 'ngón tay,'],
      script: ['đến', 'mái tóc mềm'],
      desc: 'Một buổi trọn vẹn cho đôi tay và mái tóc, bạn ghé một lần là đủ.',
      price: priceText(hints.both),
      eyebrow: 'Nail & Gội đầu dưỡng sinh',
    },
  };
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export const Hero: React.FC<HeroProps> = ({
  onStartBooking,
  onOpenLookbook,
}) => {
  const { mode, showsCategory } = useMode();
  const hints = useMemo(() => getMinHints(getStoredServices()), []);
  const copy = buildCopy(hints)[mode ?? 'both'];
  const infoRef = useReveal<HTMLDivElement>(200);
  const carWrapRef = useReveal<HTMLDivElement>(120);
  const trackRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const reducedMotion = useReducedMotion();

  // Slides come from the services matching the chosen mode; always at least three slots.
  const slides = useMemo<Slide[]>(() => {
    const all = getStoredServices();
    const pick = (list: typeof all): Slide[] => {
      const seen = new Set<string>();
      const out: Slide[] = [];
      for (const s of list) {
        if (!s.imageUrl || seen.has(s.imageUrl)) continue;
        seen.add(s.imageUrl);
        out.push({ src: s.imageUrl, name: s.name });
        if (out.length >= MAX_SLIDES) break;
      }
      return out;
    };
    let list = pick(all.filter((s) => showsCategory(s.category) && s.showOnLanding !== false));
    if (list.length === 0) list = pick(all);
    if (list.length === 0) return [];
    const base = list.length;
    for (let i = 0; list.length < 3; i++) list.push(list[i % base]);
    return list;
  }, [showsCategory]);

  const n = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = n > 0 ? active % n : 0;

  const goTo = useCallback((i: number) => setActive(n > 0 ? ((i % n) + n) % n : 0), [n]);

  useEffect(() => {
    setRevealed(true);
    const canHover = window.matchMedia('(hover: hover)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTiltEnabled(canHover && !reduced);
  }, []);

  // Auto-advance every 5s; paused on hover/focus, hidden tab and reduced motion.
  useEffect(() => {
    if (reducedMotion || paused || n < 2) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setActive((a) => (a + 1) % n);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused, n]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled || !trackRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    trackRef.current.style.setProperty('--tilt-x', `${relY * -5}deg`);
    trackRef.current.style.setProperty('--tilt-y', `${relX * 6}deg`);
  };

  const resetTilt = () => {
    if (!trackRef.current) return;
    trackRef.current.style.setProperty('--tilt-x', '0deg');
    trackRef.current.style.setProperty('--tilt-y', '0deg');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(current - 1);
    }
  };

  const posOf = (i: number): { pos: string; rel: number } => {
    let rel = (i - current + n) % n;
    if (rel > n / 2) rel -= n;
    let pos = 'center';
    if (rel === 1) pos = 'right';
    else if (rel === -1) pos = 'left';
    else if (rel > 1) pos = 'far-right';
    else if (rel < -1) pos = 'far-left';
    return { pos, rel };
  };

  const lastTitleIndex = copy.title.length - 1;

  return (
    <section className="hx-hero">
      <div className="hx-orb hx-orb-a" aria-hidden="true" />
      <div className="hx-orb hx-orb-b" aria-hidden="true" />

      <div className="hx-wide hx-grid">
        <div className={`hx-copy ${revealed ? 'is-revealed' : ''}`}>
          <span className="hx-eyebrow">
            <Sparkles size={14} />
            {copy.eyebrow}
          </span>

          <h1 className="hx-title">
            <span className="hx-line hx-line-title">
              {copy.title.map((chunk, i) => (
                <React.Fragment key={chunk}>
                  <span className="hx-word" style={{ transitionDelay: `${i * 90}ms` }}>
                    {i === lastTitleIndex ? (
                      <span className="hx-underlined">
                        {chunk}
                        <Squiggle className="hx-squiggle-word" />
                      </span>
                    ) : (
                      chunk
                    )}
                  </span>{' '}
                </React.Fragment>
              ))}
            </span>
            <span className="script-text hx-script hx-line">
              {copy.script.map((chunk, i) => (
                <React.Fragment key={chunk}>
                  <span className="hx-word" style={{ transitionDelay: `${(copy.title.length + i) * 90}ms` }}>
                    {chunk}
                  </span>
                  {i < copy.script.length - 1 ? ' ' : null}
                </React.Fragment>
              ))}
              <Squiggle className="hx-squiggle-script" />
            </span>
          </h1>

          <p className="hx-desc">
            {copy.desc}
            {copy.price ? (
              <>
                {' '}
                <span className="hx-price">{copy.price}</span>
              </>
            ) : null}
          </p>

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
            <Squiggle vertical className="hx-info-sep" />
            <span className="hx-info-item">
              <MapPin size={16} />
              {SITE.address}
            </span>
            <Squiggle vertical className="hx-info-sep" />
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

        <div className="hx-collage-wrap" ref={carWrapRef}>
          {n > 0 && (
            <div
              className="hx-car"
              role="group"
              aria-roledescription="carousel"
              aria-label="Mẫu nổi bật của tiệm"
              onKeyDown={handleKeyDown}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => {
                setPaused(false);
                resetTilt();
              }}
              onMouseMove={handleMouseMove}
              onFocus={(e) => {
                if (e.target.matches(':focus-visible')) setPaused(true);
              }}
              onBlur={() => setPaused(false)}
            >
              <div className="hx-car-stage">
                <div className="hx-car-track" ref={trackRef}>
                  {slides.map((slide, i) => {
                    const { pos } = posOf(i);
                    const isCenter = pos === 'center';
                    const isSide = pos === 'left' || pos === 'right';
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`hx-car-item hx-pos-${pos}`}
                        tabIndex={isCenter || isSide ? 0 : -1}
                        aria-hidden={isCenter || isSide ? undefined : true}
                        aria-roledescription="slide"
                        aria-label={
                          isCenter
                            ? `Xem mẫu: ${slide.name}`
                            : `Đưa ra giữa: ${slide.name}`
                        }
                        onClick={() => (isCenter ? onOpenLookbook() : goTo(i))}
                      >
                        <img src={slide.src} alt={slide.name} loading={isCenter ? 'eager' : 'lazy'} draggable={false} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hx-car-controls">
                <button
                  type="button"
                  className="hx-car-arrow hx-car-prev"
                  aria-label="Mẫu trước"
                  onClick={() => goTo(current - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="hx-car-dots">
                  {slides.map((slide, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`hx-car-dot ${i === current ? 'is-active' : ''}`}
                      aria-label={`Xem mẫu ${i + 1}: ${slide.name}`}
                      aria-current={i === current ? 'true' : undefined}
                      onClick={() => goTo(i)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="hx-car-arrow hx-car-next"
                  aria-label="Mẫu kế tiếp"
                  onClick={() => goTo(current + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </section>
  );
};
