import React, { useState } from 'react';
import type { ServiceCategory } from '../types';
import { LOOKBOOK_GALLERY } from '../data/services';
import { X, Sparkles } from 'lucide-react';

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
  const [filter, setFilter] = useState<'all' | ServiceCategory>('all');

  if (!isOpen) return null;

  const filteredItems = LOOKBOOK_GALLERY.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 120 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left',
          padding: '28px',
        }}
      >
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge-status badge-free" style={{ fontSize: '0.72rem' }}>
                Bộ Sưu Tập Xu Hướng 2026
              </span>
            </div>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
              Lookbook Ảnh Mẫu <span className="gold-gradient-text">Nail & Gội Đầu Dưỡng Sinh</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Bấm chọn bất kỳ mẫu ảnh nào bạn yêu thích để hệ thống tự động điền dịch vụ vào lịch hẹn.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`date-pill-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({LOOKBOOK_GALLERY.length})
          </button>
          <button
            type="button"
            className={`date-pill-btn ${filter === 'nail' ? 'active' : ''}`}
            onClick={() => setFilter('nail')}
          >
            💅 Mẫu Móng Nghệ Thuật
          </button>
          <button
            type="button"
            className={`date-pill-btn ${filter === 'headspa' ? 'active' : ''}`}
            onClick={() => setFilter('headspa')}
          >
            🌿 Gội Đầu Dưỡng Sinh & Spa
          </button>
        </div>

        {/* Image Grid */}
        <div
          style={{
            overflowY: 'auto',
            paddingRight: '6px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="lookbook-card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'var(--transition)',
              }}
            >
              <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    fontSize: '0.68rem',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                  }}
                >
                  {item.category === 'nail' ? '💅 NAIL ART' : '🌿 DƯỠNG SINH'}
                </span>
              </div>

              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.7rem',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-dim)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem' }}
                  onClick={() => {
                    onSelectLookbookService(item.serviceId);
                    onClose();
                  }}
                >
                  <Sparkles size={14} />
                  <span>Chọn Làm Mẫu Này</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
