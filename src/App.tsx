import { useState, useEffect, useCallback, useRef } from 'react';
import type { Booking, Service } from './types';
import { getStoredServices, SERVICES_STORAGE_KEY } from './data/services';
import { getStoredBookings, subscribeToBookingUpdates } from './utils/storage';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeatureStrip } from './components/FeatureStrip';
import { ServicesShowcase } from './components/ServicesShowcase';
import { BookingWizard } from './components/BookingWizard';
import { AdminDashboard } from './components/AdminDashboard';
import { LookbookModal } from './components/LookbookModal';
import { Footer } from './components/Footer';
import { ModePicker } from './components/ModePicker';
import { ZaloFab } from './components/ZaloFab';
import { GoldBlingOverlay } from './components/GoldBlingOverlay';
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
  const [preselect, setPreselect] = useState<{ id: string; nonce: number } | undefined>(undefined);
  const [pickerReopened, setPickerReopened] = useState<boolean>(false);

  // Lookbook modal state
  const [isLookbookOpen, setIsLookbookOpen] = useState<boolean>(false);

  // Định tuyến bằng hash: #/admin là trang quản lý, còn lại là trang chủ
  useEffect(() => {
    const onHash = () => setIsAdminView(isAdminHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Đổi giữa trang chủ và trang quản lý thì cuộn về đầu trang
  const firstView = useRef(true);
  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
  }, [isAdminView]);

  // Dịch vụ đổi ở tab khác (trang quản lý) thì làm mới danh sách
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SERVICES_STORAGE_KEY) setServices(getStoredServices());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
  const preselectNonce = useRef(0);
  const handleSelectServiceFromShowcase = (serviceId: string) => {
    preselectNonce.current += 1;
    setPreselect({ id: serviceId, nonce: preselectNonce.current });
    handleScrollToBooking();
  };

  // Chọn mẫu từ Lookbook
  const handleSelectFromLookbook = handleSelectServiceFromShowcase;

  const closePicker = useCallback(() => setPickerReopened(false), []);
  const closeLookbook = useCallback(() => setIsLookbookOpen(false), []);

  return (
    <div className="app-layout">
      <GoldBlingOverlay />
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
          />

          <FeatureStrip />

          <div id="services-section">
            <ServicesShowcase
              services={services}
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
                preselect={preselect}
                onOpenLookbook={() => setIsLookbookOpen(true)}
              />
            </div>
          </section>
        </main>
      )}

      <LookbookModal
        isOpen={isLookbookOpen}
        onClose={closeLookbook}
        onSelectLookbookService={handleSelectFromLookbook}
      />

      <Footer />

      {!isAdminView && (
        <>
          <ModePicker reopened={pickerReopened} onClose={closePicker} />
          <ZaloFab />
        </>
      )}
    </div>
  );
}

export default App;
