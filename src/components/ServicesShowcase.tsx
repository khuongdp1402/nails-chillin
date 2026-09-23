import React, { useState } from 'react';
import type { Service, ServiceCategory } from '../types';
import { formatDuration } from '../utils/scheduler';
import { Clock, Sparkles, Images } from 'lucide-react';

interface ServicesShowcaseProps {
  services: Service[];
  selectedCategoryFilter?: ServiceCategory | 'all';
  onSelectService: (serviceId: string) => void;
  onOpenLookbook: () => void;
}

export const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({
  services,
  selectedCategoryFilter = 'all',
  onSelectService,
  onOpenLookbook,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | ServiceCategory>(selectedCategoryFilter);

  const filteredServices = services.filter((s) => {
    if (activeTab === 'all') return true;
    return s.category === activeTab;
  });

  return (
    <section className="services-showcase" style={{ padding: '30px 0 50px' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Thực Đơn Làm Đẹp & Trị Liệu</span>
          <h2 className="section-title">
            Gói Dịch Vụ <span className="gold-gradient-text">Nail & Gội Đầu Dưỡng Sinh</span>
          </h2>
          <p className="section-desc">
            Thời gian phục vụ tiêu chuẩn được ấn định cố định cho từng gói dịch vụ để đảm bảo trải nghiệm thư giãn trọn vẹn nhất cho khách hàng.
          </p>
        </div>

        {/* Filter Navigation & Lookbook Trigger */}
        <div className="filter-tabs-container">
          <div className="filter-pills">
            <button
              type="button"
              className={`filter-pill ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Tất cả dịch vụ ({services.length})
            </button>

            <button
              type="button"
              className={`filter-pill ${activeTab === 'nail' ? 'active' : ''}`}
              onClick={() => setActiveTab('nail')}
            >
              💅 Làm Móng Nghệ Thuật (Nail Art)
            </button>

            <button
              type="button"
              className={`filter-pill ${activeTab === 'headspa' ? 'active-spa' : ''}`}
              onClick={() => setActiveTab('headspa')}
            >
              🌿 Gội Đầu Dưỡng Sinh Thảo Dược
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            onClick={onOpenLookbook}
          >
            <Images size={16} color="var(--accent-gold)" />
            <span>Xem Tất Cả Ảnh Mẫu (Lookbook)</span>
          </button>
        </div>

        {/* Services Grid with Visual Photography */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredServices.map((service) => (
            <div key={service.id} className="service-card-v2">
              <div className="service-card-img-wrap">
                <img src={service.imageUrl} alt={service.name} />
                <span className="service-category-badge">
                  {service.category === 'nail' ? '💅 NAIL ART' : '🌿 DƯỠNG SINH'}
                </span>

                {service.badge && (
                  <span className="service-badge-tag">
                    {service.badge}
                  </span>
                )}
              </div>

              <div className="service-card-content">
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.35 }}>
                      {service.name}
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                    {service.description}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="service-badge-duration" style={{ fontSize: '0.78rem' }}>
                      <Clock size={12} />
                      <span>{formatDuration(service.durationMinutes)}</span>
                    </span>

                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {service.price.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '9px 14px', fontSize: '0.85rem' }}
                    onClick={() => onSelectService(service.id)}
                  >
                    <Sparkles size={14} />
                    <span>Chọn Làm Dịch Vụ Này</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
