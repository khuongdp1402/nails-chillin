import React, { useEffect, useMemo, useState } from 'react';
import '../styles/services.css';
import type { ServiceCategory } from '../types';
import { getStoredServices } from '../data/services';
import { useMode } from '../context/ModeContext';
import { ServiceCard } from './ServicesShowcase';
import { X } from 'lucide-react';

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLookbookService: (serviceId: string) => void;
}

export const LookbookModal: React.FC<LookbookModalProps> = ({
  isOpen,
  onClose,
  onSelectLookbookService,
}) => {
  const { showsCategory } = useMode();
  const [filter, setFilter] = useState<'all' | ServiceCategory>('all');

  const all = useMemo(() => (isOpen ? getStoredServices() : []), [isOpen]);
  const items = all.filter((s) => showsCategory(s.category));
  const hasNail = items.some((s) => s.category === 'nail');
  const hasSpa = items.some((s) => s.category === 'headspa');
  const showTabs = hasNail && hasSpa;
  const activeFilter = showTabs ? filter : 'all';
  const shown = items.filter((s) => activeFilter === 'all' || s.category === activeFilter);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const count = (c?: ServiceCategory) => items.filter((s) => !c || s.category === c).length;
  const tab = (key: 'all' | ServiceCategory, label: string) => (
    <button
      type="button"
      className={`svc-tab ${activeFilter === key ? 'svc-tab-active' : ''}`}
      onClick={() => setFilter(key)}
    >
      {label} ({key === 'all' ? count() : count(key)})
    </button>
  );

  return (
    <div className="svc-overlay" onClick={onClose}>
      <div
        className="svc-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Tất cả mẫu và dịch vụ"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="svc-modal-head">
          <div>
            <h3 className="svc-modal-title">Tất cả mẫu & dịch vụ</h3>
            <p className="svc-modal-sub">Chọn món bạn thích, tiệm điền sẵn vào lịch hẹn cho bạn.</p>
          </div>
          <button type="button" className="svc-close" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {showTabs && (
          <div className="svc-tabs">
            {tab('all', 'Tất cả')}
            {tab('nail', 'Nail')}
            {tab('headspa', 'Gội đầu')}
          </div>
        )}

        <div className="svc-modal-body">
          {shown.length === 0 ? (
            <p className="svc-empty">Chưa có món nào ở mục này.</p>
          ) : (
            <ul className="svc-grid svc-grid-modal">
              {shown.map((s, i) => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  index={i}
                  onSelect={(id) => {
                    onSelectLookbookService(id);
                    onClose();
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
