import React from 'react';
import '../styles/services.css';
import type { Service } from '../types';
import { formatDuration } from '../utils/scheduler';
import { useMode } from '../context/ModeContext';
import { useReveal } from '../hooks/useReveal';
import { Clock } from 'lucide-react';

interface ServicesShowcaseProps {
  services: Service[];
  onSelectService: (serviceId: string) => void;
  onOpenLookbook: () => void;
}

export const ServiceCard: React.FC<{
  service: Service;
  index: number;
  onSelect: (id: string) => void;
}> = ({ service, index, onSelect }) => {
  const ref = useReveal<HTMLLIElement>(Math.min(index, 7) * 70);
  return (
    <li ref={ref} className="svc-cell">
      <article className="svc-card">
        <div className="svc-media">
          <img src={service.imageUrl} alt={service.name} loading="lazy" />
          {service.badge && <span className="svc-badge">{service.badge}</span>}
        </div>
        <div className="svc-info">
          <h3 className="svc-name">{service.name}</h3>
          <span className="svc-dur">
            <Clock size={12} />
            {formatDuration(service.durationMinutes)}
          </span>
          <div className="svc-foot">
            <span className="price svc-price">{service.price.toLocaleString('vi-VN')}đ</span>
            <button type="button" className="btn btn-primary svc-book" onClick={() => onSelect(service.id)}>
              Đặt
            </button>
          </div>
        </div>
      </article>
    </li>
  );
};

const Heading: React.FC = () => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="svc-head">
      <span className="svc-script">Dịch vụ của tiệm</span>
      <h2 className="svc-title">Chọn món bạn thích</h2>
      <p className="svc-desc">Giá và thời gian ghi rõ từng món. Bấm “Đặt” để chọn giờ ngay.</p>
    </div>
  );
};

export const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({
  services,
  onSelectService,
  onOpenLookbook,
}) => {
  const { mode, showsCategory } = useMode();
  const moreRef = useReveal<HTMLDivElement>();

  const visible = services.filter(
    (s) => showsCategory(s.category) && s.showOnLanding !== false,
  );

  const renderGrid = (list: Service[], label?: string) => (
    <div className="svc-group">
      {label && <h3 className="svc-group-title">{label}</h3>}
      {list.length === 0 ? (
        <p className="svc-empty">Tiệm đang cập nhật thêm món mới cho bạn.</p>
      ) : (
        <ul className="svc-grid">
          {list.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} onSelect={onSelectService} />
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <section className="svc-section" id="services">
      <div className="container">
        <Heading />
        {mode === 'both' ? (
          <>
            {renderGrid(visible.filter((s) => s.category === 'nail'), 'Làm nail')}
            {renderGrid(visible.filter((s) => s.category === 'headspa'), 'Gội đầu dưỡng sinh')}
          </>
        ) : (
          renderGrid(visible)
        )}
        <div ref={moreRef} className="svc-more">
          <button type="button" className="btn btn-secondary" onClick={onOpenLookbook}>
            Xem tất cả mẫu & dịch vụ
          </button>
        </div>
      </div>
    </section>
  );
};
