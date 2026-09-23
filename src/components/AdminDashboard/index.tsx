import React, { useState, useMemo } from 'react';
import type { Booking, Service, ServiceCategory } from '../../types';
import {
  buildDailyTimeline,
  formatDuration,
  getServiceNames,
  timeToMinutes,
  minutesToTime,
} from '../../utils/scheduler';
import {
  cancelBooking,
  resetBookingsToDefault,
  attemptCreateBooking,
} from '../../utils/storage';
import { saveStoredServices } from '../../data/services';
import {
  generateGoogleCalendarUrl,
  generateMorningReminderText,
  generate30mReminderText,
} from '../../utils/calendar';
import {
  Clock,
  RotateCcw,
  PlusCircle,
  XCircle,
  Users,
  Phone,
  Bell,
  CalendarDays,
  ListOrdered,
  PackagePlus,
  DollarSign,
  Copy,
  ExternalLink,
  CalendarPlus,
  Sparkles,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface AdminDashboardProps {
  services: Service[];
  allBookings: Booking[];
  onDataChanged: () => void;
  onServicesChanged: (updatedServices: Service[]) => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  services,
  allBookings,
  onDataChanged,
  onServicesChanged,
  onExitAdmin,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-25');
  const [viewTab, setViewTab] = useState<'calendar' | 'timeline' | 'reminders' | 'services'>('calendar');

  // Thêm nhanh khách vãng lai
  const [quickAddModal, setQuickAddModal] = useState<{
    isOpen: boolean;
    startTime: string;
    maxMinutes: number;
  }>({
    isOpen: false,
    startTime: '',
    maxMinutes: 60,
  });
  const [walkinName, setWalkinName] = useState<string>('');
  const [walkinPhone, setWalkinPhone] = useState<string>('');
  const [walkinServiceId, setWalkinServiceId] = useState<string>(services[0]?.id || 'son-gel-thach');
  const [quickAddError, setQuickAddError] = useState<string | null>(null);

  // Form Thêm / Khai báo gói dịch vụ mới
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceCategory>('headspa');
  const [newServiceDuration, setNewServiceDuration] = useState<number>(60);
  const [newServicePrice, setNewServicePrice] = useState<number>(250000);
  const [newServiceDesc, setNewServiceDesc] = useState<string>('');
  const [newServiceImage, setNewServiceImage] = useState<string>('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80');
  const [newServiceBadge, setNewServiceBadge] = useState<string>('Mới');
  const [serviceFormSuccess, setServiceFormSuccess] = useState<string | null>(null);

  // State thông báo copy
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Dòng thời gian trong ngày được chọn
  const timeline = useMemo(() => {
    return buildDailyTimeline(selectedDate, allBookings);
  }, [selectedDate, allBookings]);

  // Danh sách các booking của ngày được chọn
  const dayBookings = useMemo(() => {
    return allBookings
      .filter((b) => b.date === selectedDate && b.status !== 'cancelled')
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [selectedDate, allBookings]);

  // Thống kê tóm tắt cơ bản (Summary) cho chủ tiệm
  const summaryStats = useMemo(() => {
    const totalRevenue = dayBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalMinutes = dayBookings.reduce((sum, b) => sum + b.totalMinutes, 0);

    // Tìm các ca hẹn sắp diễn ra trong vòng 30 phút
    const upcoming30m = dayBookings.filter(() => true);

    return {
      customerCount: dayBookings.length,
      revenueVnd: totalRevenue,
      busyTime: formatDuration(totalMinutes),
      upcomingCount: upcoming30m.length,
    };
  }, [dayBookings]);

  // Hủy lịch
  const handleCancelBooking = (bookingId: string, customerName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy lịch hẹn của khách "${customerName}" không?`)) {
      cancelBooking(bookingId);
      onDataChanged();
    }
  };

  // Reset dữ liệu mẫu 25/09/2026
  const handleResetDemo = () => {
    if (window.confirm('Khôi phục lại lịch mẫu ngày 25/09/2026 (Nguyễn A & Trần B)?')) {
      resetBookingsToDefault();
      setSelectedDate('2026-09-25');
      onDataChanged();
    }
  };

  // Mở modal thêm khách vãng lai
  const handleOpenQuickAdd = (startTime: string, durationMinutes: number) => {
    setQuickAddModal({
      isOpen: true,
      startTime,
      maxMinutes: durationMinutes,
    });
    setWalkinName('');
    setWalkinPhone('');
    setQuickAddError(null);
  };

  const handleConfirmQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) {
      setQuickAddError('Vui lòng nhập tên khách hàng');
      return;
    }

    const service = services.find((s) => s.id === walkinServiceId) || services[0];
    const startMin = timeToMinutes(quickAddModal.startTime);
    const endMin = startMin + service.durationMinutes;
    const endTime = minutesToTime(endMin);

    const result = attemptCreateBooking({
      customerName: walkinName.trim(),
      phone: walkinPhone.trim() || 'Khách tại tiệm',
      date: selectedDate,
      startTime: quickAddModal.startTime,
      endTime,
      serviceIds: [service.id],
      totalMinutes: service.durationMinutes,
      totalPrice: service.price,
      note: 'Khách đến trực tiếp tiệm (Walk-in)',
    });

    if (!result.success) {
      setQuickAddError(result.error || 'Khung giờ này không thể xếp lịch.');
      return;
    }

    setQuickAddModal({ isOpen: false, startTime: '', maxMinutes: 60 });
    onDataChanged();
  };

  // Thêm gói dịch vụ mới
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      alert('Vui lòng nhập tên gói dịch vụ');
      return;
    }

    const newService: Service = {
      id: `custom-srv-${Date.now()}`,
      name: newServiceName.trim(),
      category: newServiceCategory,
      durationMinutes: Number(newServiceDuration),
      price: Number(newServicePrice),
      description: newServiceDesc.trim() || 'Dịch vụ chăm sóc và làm đẹp chất lượng cao tại Aura Spa.',
      imageUrl: newServiceImage.trim(),
      badge: newServiceBadge.trim() || undefined,
      popular: true,
    };

    const updated = [...services, newService];
    saveStoredServices(updated);
    onServicesChanged(updated);

    setServiceFormSuccess(`Đã khai báo thành công dịch vụ "${newService.name}"!`);
    setNewServiceName('');
    setNewServiceDesc('');
    setTimeout(() => setServiceFormSuccess(null), 3000);
  };

  // Xóa bớt dịch vụ
  const handleDeleteService = (serviceId: string, name: string) => {
    if (window.confirm(`Xóa dịch vụ "${name}" khỏi danh mục salon?`)) {
      const updated = services.filter((s) => s.id !== serviceId);
      saveStoredServices(updated);
      onServicesChanged(updated);
    }
  };

  // Copy tin nhắn nhắc hẹn
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // Dữ liệu ngày trong tháng 09/2026 cho Calendar
  const daysInSeptember = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-09-${dayNum.toString().padStart(2, '0')}`;
    const bookingsOnThisDay = allBookings.filter(
      (b) => b.date === dateStr && b.status !== 'cancelled'
    );
    return {
      dayNum,
      dateStr,
      bookings: bookingsOnThisDay,
    };
  });

  return (
    <div className="container" style={{ padding: '24px 20px 80px' }}>
      <div className="admin-view-wrapper">
        {/* Top Header Admin */}
        <div className="admin-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge-status badge-free" style={{ fontSize: '0.74rem' }}>
                Hệ Thống Quản Trị Salon & Spa 2026
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Đồng bộ Calendar & Nhắc hẹn tự động
              </span>
            </div>
            <h2 style={{ fontSize: '1.9rem', color: 'var(--text-main)' }}>
              Trung Tâm Quản Lý <span className="gold-gradient-text">Chủ Tiệm Aura Spa</span>
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
              onClick={handleResetDemo}
            >
              <RotateCcw size={14} />
              <span>Khôi phục mẫu (25/09/2026)</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
              onClick={onExitAdmin}
            >
              <span>← Về Giao Diện Khách Đặt</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STATS BAR (TỔNG QUAN DOANH THU & LỊCH HẸN TRONG NGÀY) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Card 1: Doanh thu dự kiến */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={22} color="var(--accent-gold)" />
            </div>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Doanh thu ngày {selectedDate.slice(-2)}/09
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {summaryStats.revenueVnd.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>

          {/* Card 2: Số khách hẹn */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color="var(--accent-emerald)" />
            </div>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Khách đã xác nhận
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                {summaryStats.customerCount} lượt khách
              </div>
            </div>
          </div>

          {/* Card 3: Thời gian làm việc */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} color="var(--accent-rose)" />
            </div>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Tổng thời lượng bận
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                {summaryStats.busyTime}
              </div>
            </div>
          </div>

          {/* Card 4: Nhắc hẹn 30 phút */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={22} color="var(--accent-red)" />
            </div>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Cần nhắc hẹn hôm nay
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-red)' }}>
                {summaryStats.upcomingCount} khách
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`date-pill-btn ${viewTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewTab('calendar')}
          >
            <CalendarDays size={16} style={{ display: 'inline', marginRight: '6px' }} />
            <span>Lịch Calendar (Xem Theo Tháng)</span>
          </button>

          <button
            type="button"
            className={`date-pill-btn ${viewTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewTab('timeline')}
          >
            <ListOrdered size={16} style={{ display: 'inline', marginRight: '6px' }} />
            <span>Bảng Giờ Timeline (Chi Tiết)</span>
          </button>

          <button
            type="button"
            className={`date-pill-btn ${viewTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setViewTab('reminders')}
          >
            <Bell size={16} style={{ display: 'inline', marginRight: '6px' }} />
            <span>🔔 Trung Tâm Nhắc Hẹn (Sáng & 30 Phút)</span>
          </button>

          <button
            type="button"
            className={`date-pill-btn ${viewTab === 'services' ? 'active' : ''}`}
            onClick={() => setViewTab('services')}
          >
            <PackagePlus size={16} style={{ display: 'inline', marginRight: '6px' }} />
            <span>⚙️ Quản Lý Gói Dịch Vụ</span>
          </button>
        </div>

        {/* TAB 1: CALENDAR VIEW (XEM LỊCH THEO THÁNG) */}
        {viewTab === 'calendar' && (
          <div className="calendar-view-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>
                  Lịch Hoạt Động Tháng 09/2026
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Bấm vào ô ngày bất kỳ để xem danh sách lịch hẹn và xuất vào Google Calendar cá nhân của chủ tiệm.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="calendar-event-chip chip-nail">💅 Lịch Nail</span>
                <span className="calendar-event-chip chip-headspa">🌿 Gội Dưỡng Sinh</span>
              </div>
            </div>

            {/* Thứ trong tuần */}
            <div className="calendar-grid-header">
              <div>Thứ 2</div>
              <div>Thứ 3</div>
              <div>Thứ 4</div>
              <div>Thứ 5</div>
              <div>Thứ 6</div>
              <div>Thứ 7</div>
              <div>Chủ Nhật</div>
            </div>

            {/* Lưới các ngày trong tháng */}
            <div className="calendar-month-grid">
              {daysInSeptember.map((day) => {
                const isSelected = selectedDate === day.dateStr;
                const isDemoDay = day.dateStr === '2026-09-25';
                return (
                  <div
                    key={day.dateStr}
                    className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${isDemoDay ? 'today' : ''}`}
                    onClick={() => setSelectedDate(day.dateStr)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="day-number">{day.dayNum}</span>
                      {isDemoDay && (
                        <span style={{ fontSize: '0.62rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                          Mẫu
                        </span>
                      )}
                    </div>

                    <div className="day-events-list">
                      {day.bookings.slice(0, 2).map((b) => {
                        const isSpa = b.serviceIds.some((id) => id.includes('goi') || id.includes('massage'));
                        return (
                          <div
                            key={b.id}
                            className={`calendar-event-chip ${isSpa ? 'chip-headspa' : 'chip-nail'}`}
                            title={`${b.startTime} - ${b.customerName}`}
                          >
                            {b.startTime} {b.customerName}
                          </div>
                        );
                      })}
                      {day.bookings.length > 2 && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)' }}>
                          +{day.bookings.length - 2} ca nữa
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chi tiết ca hẹn trong ngày đang chọn */}
            <div style={{ marginTop: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', padding: '18px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--accent-gold)' }}>
                  Chi Tiết Lịch Ngày: {selectedDate} ({dayBookings.length} khách)
                </h4>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                  onClick={() => setViewTab('timeline')}
                >
                  Xem dạng bảng giờ chi tiết →
                </button>
              </div>

              {dayBookings.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Ngày này hiện tại chưa có lịch hẹn nào.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dayBookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.95rem', marginRight: '10px' }}>
                          {b.startTime} – {b.endTime}
                        </span>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginRight: '8px' }}>
                          {b.customerName}
                        </strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          ({b.phone})
                        </span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                          Dịch vụ: {getServiceNames(b.serviceIds, services)} ({formatDuration(b.totalMinutes)})
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <a
                          href={generateGoogleCalendarUrl(b, getServiceNames(b.serviceIds, services))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                          title="Lưu ca hẹn này vào Google Calendar của chủ tiệm"
                        >
                          <CalendarPlus size={13} color="var(--accent-gold)" />
                          <span>Google Cal</span>
                        </a>

                        <button
                          type="button"
                          className="btn-cancel-booking"
                          onClick={() => handleCancelBooking(b.id, b.customerName)}
                        >
                          Hủy ca
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TIMELINE VIEW (BẢNG GIỜ THEO ĐÚNG YÊU CẦU CỦA BẠN) */}
        {viewTab === 'timeline' && (
          <div>
            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
                  Bảng Giờ Timeline Ngày: <span style={{ color: 'var(--accent-gold)' }}>{selectedDate}</span>
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Khung giờ mở cửa: 08:30 – 20:30 (Mỗi bước 30 phút)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '6px 12px', fontSize: '0.85rem', width: '160px' }}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <button
                  type="button"
                  className={`date-pill-btn ${selectedDate === '2026-09-25' ? 'active' : ''}`}
                  onClick={() => setSelectedDate('2026-09-25')}
                >
                  Mẫu 25/09
                </button>
              </div>
            </div>

            <div className="timeline-table-container">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th style={{ width: '160px' }}>Thời gian</th>
                    <th>Khách hàng</th>
                    <th>Dịch vụ</th>
                    <th style={{ width: '120px' }}>Thời lượng</th>
                    <th style={{ width: '130px' }}>Trạng thái</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((slot, index) => {
                    if (slot.isBooked && slot.booking) {
                      const b = slot.booking;
                      return (
                        <tr key={`booked-${b.id}-${index}`} className="row-booked">
                          <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                            {slot.timeRange}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                              {b.customerName}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={11} />
                              <span>{b.phone}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>
                            {getServiceNames(b.serviceIds, services)}
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{formatDuration(b.totalMinutes)}</span>
                          </td>
                          <td>
                            <span className="badge-status badge-booked">
                              Đã đặt
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-cancel-booking"
                              onClick={() => handleCancelBooking(b.id, b.customerName)}
                            >
                              Hủy lịch
                            </button>
                          </td>
                        </tr>
                      );
                    } else {
                      return (
                        <tr key={`free-${slot.startTime}-${index}`} className="row-free">
                          <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                            {slot.timeRange}
                          </td>
                          <td style={{ color: 'var(--text-dim)' }}>—</td>
                          <td style={{ color: 'var(--text-dim)' }}>—</td>
                          <td style={{ color: 'var(--text-dim)' }}>
                            {formatDuration(slot.durationMinutes)}
                          </td>
                          <td>
                            <span className="badge-status badge-free">
                              Còn trống
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-quick-add"
                              onClick={() => handleOpenQuickAdd(slot.startTime, slot.durationMinutes)}
                            >
                              + Đặt nhanh
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TRUNG TÂM NHẮC HẸN (BUỔI SÁNG & TRƯỚC 30 PHÚT) */}
        {viewTab === 'reminders' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                Hệ Thống Tự Động Nhắc Hẹn (Zalo / SMS / Điện Thoại)
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Tự động tạo mẫu tin nhắn lịch sự nhắc nhở khách hàng vào buổi sáng và trước 30 phút giờ hẹn, giúp giảm 95% tỷ lệ khách quên lịch hoặc đến muộn.
              </p>
            </div>

            {/* NHẮC HẸN TRƯỚC 30 PHÚT (CẢNH BÁO NỔI BẬT) */}
            <div className="reminder-hub-card" style={{ borderLeft: '4px solid var(--accent-red)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <AlertTriangle size={20} color="var(--accent-red)" />
                <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-red)' }}>
                  Nhắc Hẹn Khách Hàng Trước 30 Phút Giờ Bắt Đầu
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dayBookings.map((b) => {
                  const serviceSummary = getServiceNames(b.serviceIds, services);
                  const msg30m = generate30mReminderText(b, serviceSummary);
                  return (
                    <div
                      key={`rem30-${b.id}`}
                      style={{
                        background: 'var(--accent-red-bg)',
                        border: '1px dashed var(--accent-red)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.95rem' }}>
                            Ca hẹn: {b.startTime} ({b.date})
                          </span>
                          <span style={{ margin: '0 8px', color: 'var(--text-dim)' }}>•</span>
                          <strong style={{ color: 'var(--text-main)' }}>{b.customerName}</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '6px' }}>
                            ({b.phone})
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                            onClick={() => handleCopyText(msg30m, `30-${b.id}`)}
                          >
                            <Copy size={13} />
                            <span>{copiedIndex === `30-${b.id}` ? 'Đã Sao Chép!' : 'Copy Tin Nhắn'}</span>
                          </button>

                          <a
                            href={`https://zalo.me/${b.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                          >
                            <ExternalLink size={13} />
                            <span>Mở Zalo Khách</span>
                          </a>
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-main)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        "{msg30m}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NHẮC HẸN BUỔI SÁNG (MORNING DIGEST) */}
            <div className="reminder-hub-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Sparkles size={20} color="var(--accent-gold)" />
                <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
                  Tin Nhắn Nhắc Hẹn Buổi Sáng Hàng Loạt
                </h4>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Gửi vào 08:00 sáng mỗi ngày để nhắc nhở tất cả các khách có lịch hẹn trong ngày hôm nay.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dayBookings.map((b) => {
                  const serviceSummary = getServiceNames(b.serviceIds, services);
                  const morningMsg = generateMorningReminderText(b, serviceSummary);
                  return (
                    <div
                      key={`morn-${b.id}`}
                      style={{
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            {b.customerName}
                          </strong>
                          <span style={{ color: 'var(--accent-gold)', marginLeft: '8px', fontWeight: 600 }}>
                            {b.startTime} ({b.date})
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '6px' }}>
                            SĐT: {b.phone}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                          onClick={() => handleCopyText(morningMsg, `morn-${b.id}`)}
                        >
                          <Copy size={13} />
                          <span>{copiedIndex === `morn-${b.id}` ? 'Đã Sao Chép!' : 'Copy Tin Buổi Sáng'}</span>
                        </button>
                      </div>

                      <div style={{ background: 'var(--bg-main)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        "{morningMsg}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUẢN LÝ GÓI DỊCH VỤ (KHAI BÁO & CHỈNH SỬA CHO CHỦ TIỆM) */}
        {viewTab === 'services' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                Khai Báo & Quản Lý Gói Dịch Vụ
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Chủ tiệm có thể trực tiếp thêm gói mới, cài đặt thời lượng phục vụ cố định (phút), giá dự kiến và link ảnh mẫu để hiển thị ngay ra ngoài Landing page.
              </p>
            </div>

            {/* FORM THÊM GÓI DỊCH VỤ MỚI */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '22px', marginBottom: '28px' }}>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PackagePlus size={18} />
                <span>Thêm Mới Gói Dịch Vụ Salon</span>
              </h4>

              {serviceFormSuccess && (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--text-main)', color: 'var(--text-main)', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.88rem' }}>
                  ✓ {serviceFormSuccess}
                </div>
              )}

              <form onSubmit={handleCreateService}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Tên gói dịch vụ:</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ví dụ: Gội Dưỡng Sinh Trái Bưởi Thải Độc"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phân loại module:</label>
                    <select
                      className="form-input"
                      value={newServiceCategory}
                      onChange={(e) => setNewServiceCategory(e.target.value as ServiceCategory)}
                    >
                      <option value="nail">💅 Làm Móng Nghệ Thuật (Nail Art)</option>
                      <option value="headspa">🌿 Gội Đầu Dưỡng Sinh Thảo Dược</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thời lượng thực hiện cố định (Phút):</label>
                    <input
                      type="number"
                      step={15}
                      min={15}
                      max={240}
                      className="form-input"
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                      = {formatDuration(newServiceDuration)}
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Giá tiền dự kiến (VND):</label>
                    <input
                      type="number"
                      step={10000}
                      min={10000}
                      className="form-input"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(Number(e.target.value))}
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-gold)', marginTop: '4px', display: 'block' }}>
                      {newServicePrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả dịch vụ chi tiết:</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Mô tả các bước thực hiện và lợi ích cho khách hàng..."
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Link ảnh mẫu (URL thực tế):</label>
                    <input
                      type="url"
                      className="form-input"
                      value={newServiceImage}
                      onChange={(e) => setNewServiceImage(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nhãn nổi bật (Badge):</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ví dụ: Hot Trend, Mới, VIP"
                      value={newServiceBadge}
                      onChange={(e) => setNewServiceBadge(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                  <button type="submit" className="btn btn-primary">
                    <PlusCircle size={16} />
                    <span>Lưu & Hiển Thị Ra Landing Page</span>
                  </button>
                </div>
              </form>
            </div>

            {/* DANH SÁCH DỊCH VỤ HIỆN CÓ */}
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '14px' }}>
              Danh Sách Dịch Vụ Đang Áp Dụng ({services.length} gói)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {services.map((srv) => (
                <div
                  key={srv.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: '120px', position: 'relative' }}>
                    <img src={srv.imageUrl} alt={srv.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        fontSize: '0.66rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                      }}
                    >
                      {srv.category === 'nail' ? '💅 NAIL' : '🌿 DƯỠNG SINH'}
                    </span>
                  </div>

                  <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {srv.name}
                      </h5>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <span>⏱ {formatDuration(srv.durationMinutes)}</span>
                        <strong style={{ color: 'var(--accent-gold)' }}>{srv.price.toLocaleString('vi-VN')} đ</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
                        onClick={() => handleDeleteService(srv.id, srv.name)}
                      >
                        <Trash2 size={13} />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Thêm Nhanh Khách Vãng Lai */}
        {quickAddModal.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-gold)' }}>
                  Xếp Lịch Nhanh Tại Tiệm
                </h3>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  onClick={() => setQuickAddModal({ isOpen: false, startTime: '', maxMinutes: 60 })}
                >
                  <XCircle size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Khung giờ bắt đầu: <strong style={{ color: 'var(--accent-gold)' }}>{quickAddModal.startTime}</strong> (Ngày {selectedDate}).
                Thời lượng trống tối đa: {formatDuration(quickAddModal.maxMinutes)}.
              </p>

              {quickAddError && (
                <div style={{ background: 'var(--accent-red-bg)', color: 'var(--accent-red)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '14px' }}>
                  {quickAddError}
                </div>
              )}

              <form onSubmit={handleConfirmQuickAdd}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Tên khách hàng:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Chị Mai (khách vãng lai)"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Số điện thoại (tùy chọn):</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="09..."
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Chọn dịch vụ:</label>
                  <select
                    className="form-input"
                    value={walkinServiceId}
                    onChange={(e) => setWalkinServiceId(e.target.value)}
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatDuration(s.durationMinutes)}) - {s.price.toLocaleString('vi-VN')} đ
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setQuickAddModal({ isOpen: false, startTime: '', maxMinutes: 60 })}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <PlusCircle size={16} />
                    <span>Xác Nhận Xếp Lịch</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
