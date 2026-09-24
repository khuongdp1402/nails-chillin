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
import { ModePicker } from './components/ModePicker';
import { ZaloFab } from './components/ZaloFab';
import { scrollToTarget } from './utils/scroll';

const isAdminHash = () => window.location.hash.replace(/^#\/?/, '').startsWith('admin');

function todayLocalISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function App() {
  const [isAdminView, setIsAdminView] = useState<boolean>(() => isAdminHash());
  const [services, setServices] = useState<Service[]>(() => getStoredServices());
  const [bookings, setBookings] = useState<Booking[]>(() => getStoredBookings());
  const [targetDate] = useState<string>(() => todayLocalISO());
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ServiceCategory | 'all'>('all');
  const [pickerReopened, setPickerReopened] = useState<boolean>(false);

  // Lookbook modal state
  const [isLookbookOpen, setIsLookbookOpen] = useState<boolean>(false);

  // Định tuyến bằng hash: #/admin là trang quản lý, còn lại là trang chủ
  useEffect(() => {
    const onHash = () => setIsAdminView(isAdminHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goHome = () => {
    if (window.location.hash) window.location.hash = '';
    else window.scrollTo({ top: 0 });
    setIsAdminView(false);
  };

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
    if (window.location.hash) window.location.hash = '';
    setIsAdminView(false);
    setTimeout(() => scrollToTarget(document.getElementById('booking-section')), 100);
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
    scrollToTarget(document.getElementById('services-section'));
  };

  return (
    <div className="app-layout">
      <Header
        isAdminView={isAdminView}
        onScrollToBooking={handleScrollToBooking}
        onGoHome={goHome}
        onOpenModePicker={() => setPickerReopened(true)}
      />

      {isAdminView ? (
        <main>
          <AdminDashboard
            services={services}
            allBookings={bookings}
            onDataChanged={refreshBookings}
            onServicesChanged={(updated) => setServices(updated)}
            onExitAdmin={goHome}
          />
        </main>
      ) : (
        <main>
          <Hero
            onStartBooking={handleScrollToBooking}
            onOpenLookbook={() => setIsLookbookOpen(true)}
            onSelectCategory={handleSelectCategoryFromHero}
          />

          <FeatureStrip />

          <div id="services-section">
            <ServicesShowcase
              services={services}
              selectedCategoryFilter={selectedCategoryFilter}
              onSelectService={handleSelectServiceFromShowcase}
              onOpenLookbook={() => setIsLookbookOpen(true)}
            />
          </div>

          <section id="booking-section" className="booking-section">
            <div className="container">
              <div className="section-header">
                <span className="section-tag">Đặt lịch</span>
                <h2 className="section-title">
                  Chọn giờ đẹp, <span className="emerald-gradient-text">mình giữ chỗ cho bạn</span>
                </h2>
                <p className="section-desc">
                  Chọn dịch vụ, chọn giờ và để lại số điện thoại, chỉ mất chưa đến một phút.
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

      <LookbookModal
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
        onSelectLookbookService={handleSelectFromLookbook}
      />

      <Footer />

      {!isAdminView && (
        <>
          <ModePicker reopened={pickerReopened} onClose={() => setPickerReopened(false)} />
          <ZaloFab />
        </>
      )}
    </div>
  );
}

export default App;
