import { useState, useEffect, useCallback } from 'react';
import type { Booking, Service, ServiceCategory } from './types';
import { getStoredServices } from './data/services';
import { getStoredBookings, subscribeToBookingUpdates } from './utils/storage';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeatureStrip } from './components/FeatureStrip';
import { TrustBadgeStrip } from './components/TrustBadgeStrip';
import { ServicesShowcase } from './components/ServicesShowcase';
import { BookingWizard } from './components/BookingWizard';
import { AdminDashboard } from './components/AdminDashboard';
import { LookbookModal } from './components/LookbookModal';
import { Footer } from './components/Footer';

export function App() {
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>(() => getStoredServices());
  const [bookings, setBookings] = useState<Booking[]>(() => getStoredBookings());
  const [targetDate] = useState<string>('2026-09-25');
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ServiceCategory | 'all'>('all');

  // Lookbook modal state
  const [isLookbookOpen, setIsLookbookOpen] = useState<boolean>(false);

  // Cập nhật lại bookings
  const refreshBookings = useCallback(() => {
    setBookings(getStoredBookings());
  }, []);

  // Đăng ký đồng bộ đa tab
  useEffect(() => {
    refreshBookings();
    const unsubscribe = subscribeToBookingUpdates(() => {
      refreshBookings();
    });
    return () => {
      unsubscribe();
    };
  }, [refreshBookings]);

  // Cuộn mượt đến phần đặt lịch
  const handleScrollToBooking = () => {
    setIsAdminView(false);
    setTimeout(() => {
      const el = document.getElementById('booking-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Chọn từ Showcase
  const handleSelectServiceFromShowcase = (serviceId: string) => {
    setPreselectedServiceId(serviceId);
    handleScrollToBooking();
  };

  // Chọn mẫu từ Lookbook
  const handleSelectFromLookbook = (serviceId: string) => {
    setPreselectedServiceId(serviceId);
    handleScrollToBooking();
  };

  // Lọc category từ Hero
  const handleSelectCategoryFromHero = (cat: 'nail' | 'headspa') => {
    setSelectedCategoryFilter(cat);
    const el = document.getElementById('services-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-layout">
      {/* Header Điều Hướng */}
      <Header
        isAdminView={isAdminView}
        onToggleView={(isAdmin) => setIsAdminView(isAdmin)}
        onScrollToBooking={handleScrollToBooking}
      />

      {/* NỘI DUNG CHÍNH */}
      {isAdminView ? (
        /* GIAO DIỆN CHỦ TIỆM: CALENDAR + REMINDER + QUẢN LÝ DỊCH VỤ */
        <main>
          <AdminDashboard
            services={services}
            allBookings={bookings}
            onDataChanged={refreshBookings}
            onServicesChanged={(updated) => setServices(updated)}
            onExitAdmin={() => setIsAdminView(false)}
          />
        </main>
      ) : (
        /* GIAO DIỆN LANDING PAGE NAIL & GỘI ĐẦU DƯỠNG SINH */
        <main>
          {/* Banner Hero Bento Grid */}
          <Hero
            onStartBooking={handleScrollToBooking}
            onOpenLookbook={() => setIsLookbookOpen(true)}
            onSelectCategory={handleSelectCategoryFromHero}
          />

          <FeatureStrip />

          {/* Menu Dịch Vụ & Ảnh Mẫu Thực Tế */}
          <div id="services-section">
            <ServicesShowcase
              services={services}
              selectedCategoryFilter={selectedCategoryFilter}
              onSelectService={handleSelectServiceFromShowcase}
              onOpenLookbook={() => setIsLookbookOpen(true)}
            />
          </div>

          {/* Bộ Đặt Lịch Thông Minh */}
          <section id="booking-section" className="booking-section">
            <div className="container">
              <div className="section-header">
                <span className="section-tag">Hệ Thống Đặt Chỗ Thông Minh</span>
                <h2 className="section-title">
                  Đặt Lịch Nail & <span className="emerald-gradient-text">Gội Đầu Dưỡng Sinh</span>
                </h2>
                <p className="section-desc">
                  Tự do kết hợp các dịch vụ yêu thích. Hệ thống tự động tính toán tổng thời gian và bảo vệ lịch hẹn của bạn tuyệt đối.
                </p>
              </div>

              <BookingWizard
                services={services}
                allBookings={bookings}
                onBookingSuccess={refreshBookings}
                targetDate={targetDate}
                preselectedServiceId={preselectedServiceId}
                onOpenLookbook={() => setIsLookbookOpen(true)}
              />
            </div>
          </section>

          <TrustBadgeStrip />
        </main>
      )}

      {/* Lookbook Modal Thư Viện Ảnh Mẫu */}
      <LookbookModal
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
        onSelectLookbookService={handleSelectFromLookbook}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
