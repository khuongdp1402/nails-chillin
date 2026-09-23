import React, { useState, useMemo, useEffect } from 'react';
import type { Service, Booking } from '../../types';
import {
  formatDuration,
  generateAvailableSlots,
  minutesToTime,
  timeToMinutes,
  getServiceNames,
} from '../../utils/scheduler';
import { attemptCreateBooking } from '../../utils/storage';
import {
  generateGoogleCalendarUrl,
  downloadIcsFile,
} from '../../utils/calendar';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Check,
  CalendarPlus,
  Download,
  Images,
} from 'lucide-react';

interface BookingWizardProps {
  services: Service[];
  allBookings: Booking[];
  onBookingSuccess: () => void;
  targetDate?: string;
  preselectedServiceId?: string;
  onOpenLookbook: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  services,
  allBookings,
  onBookingSuccess,
  targetDate,
  preselectedServiceId,
  onOpenLookbook,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form inputs
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [date, setDate] = useState<string>(targetDate || '2026-09-25');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    preselectedServiceId ? [preselectedServiceId] : ['son-gel-thach', 'goi-duong-sinh-bo-ket']
  );
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);

  // Alerts & created result
  const [concurrencyAlert, setConcurrencyAlert] = useState<string | null>(null);
  const [lastCreatedBooking, setLastCreatedBooking] = useState<Booking | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (targetDate) {
      setDate(targetDate);
    }
  }, [targetDate]);

  useEffect(() => {
    if (preselectedServiceId && !selectedServiceIds.includes(preselectedServiceId)) {
      setSelectedServiceIds((prev) => [...prev, preselectedServiceId]);
      setCurrentStep(2);
    }
  }, [preselectedServiceId]);

  // Tổng thời gian (phút)
  const totalDurationMinutes = useMemo(() => {
    return selectedServiceIds.reduce((total, id) => {
      const s = services.find((srv) => srv.id === id);
      return total + (s ? s.durationMinutes : 0);
    }, 0);
  }, [selectedServiceIds, services]);

  // Tổng giá tiền (VND)
  const totalPrice = useMemo(() => {
    return selectedServiceIds.reduce((total, id) => {
      const s = services.find((srv) => srv.id === id);
      return total + (s ? s.price : 0);
    }, 0);
  }, [selectedServiceIds, services]);

  // Khung giờ khả dụng & khóa
  const availableSlots = useMemo(() => {
    return generateAvailableSlots(date, totalDurationMinutes, allBookings);
  }, [date, totalDurationMinutes, allBookings]);

  useEffect(() => {
    if (selectedStartTime) {
      const foundSlot = availableSlots.find((s) => s.timeStr === selectedStartTime);
      if (!foundSlot || !foundSlot.isAvailable) {
        setSelectedStartTime(null);
      }
    }
  }, [availableSlots, selectedStartTime]);

  const handleToggleService = (serviceId: string) => {
    setConcurrencyAlert(null);
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!customerName.trim()) {
      errors.customerName = 'Vui lòng nhập họ và tên của bạn';
    }
    if (!phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/(0[3|5|7|8|9])+([0-9]{8})\b/.test(phone.replace(/\s+/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ (Ví dụ: 0901234567)';
    }
    if (!date) {
      errors.date = 'Vui lòng chọn ngày làm đẹp';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setCurrentStep(2);
  };

  const handleProceedToStep3 = () => {
    if (selectedServiceIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 dịch vụ để tiếp tục!');
      return;
    }
    setConcurrencyAlert(null);
    setCurrentStep(3);
  };

  const calculatedEndTime = useMemo(() => {
    if (!selectedStartTime || totalDurationMinutes <= 0) return null;
    const startMin = timeToMinutes(selectedStartTime);
    return minutesToTime(startMin + totalDurationMinutes);
  }, [selectedStartTime, totalDurationMinutes]);

  const handleConfirmBooking = () => {
    if (!selectedStartTime || !calculatedEndTime) {
      alert('Vui lòng chọn một khung giờ hợp lệ!');
      return;
    }

    setConcurrencyAlert(null);

    const result = attemptCreateBooking({
      customerName: customerName.trim(),
      phone: phone.trim(),
      date,
      startTime: selectedStartTime,
      endTime: calculatedEndTime,
      serviceIds: selectedServiceIds,
      totalMinutes: totalDurationMinutes,
      totalPrice,
      note: 'Đặt online qua Landing Page Nail & Gội Đầu Dưỡng Sinh',
    });

    if (!result.success) {
      setConcurrencyAlert(result.error || 'Khung giờ này vừa có người đặt. Vui lòng chọn khung giờ khác.');
      setSelectedStartTime(null);
      return;
    }

    if (result.booking) {
      setLastCreatedBooking(result.booking);
      setCurrentStep(4);
      onBookingSuccess();

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#dc5000', '#2a1c10', '#cbb896', '#fbf6ee'],
        });
      } catch (err) {
        console.log('Confetti effect:', err);
      }
    }
  };

  const handleResetForNewBooking = () => {
    setSelectedStartTime(null);
    setLastCreatedBooking(null);
    setCurrentStep(1);
    setConcurrencyAlert(null);
  };

  // Tách dịch vụ theo 2 module
  const nailServices = services.filter((s) => s.category === 'nail');
  const headspaServices = services.filter((s) => s.category === 'headspa');

  return (
    <div id="booking-wizard-container" className="glass-panel" style={{ position: 'relative' }}>
      {/* Wizard Step Navigation */}
      <div className="wizard-steps">
        <div className={`step-indicator ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-bubble">{currentStep > 1 ? <Check size={18} /> : '1'}</div>
          <span className="step-title">Thông tin & Ngày</span>
        </div>

        <div className={`step-indicator ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-bubble">{currentStep > 2 ? <Check size={18} /> : '2'}</div>
          <span className="step-title">Chọn dịch vụ</span>
        </div>

        <div className={`step-indicator ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
          <div className="step-bubble">{currentStep > 3 ? <Check size={18} /> : '3'}</div>
          <span className="step-title">Chọn khung giờ</span>
        </div>

        <div className={`step-indicator ${currentStep === 4 ? 'active' : ''}`}>
          <div className="step-bubble">4</div>
          <span className="step-title">Hoàn tất & Lịch</span>
        </div>
      </div>

      {/* Cảnh báo xung đột nếu khung giờ bị chiếm */}
      {concurrencyAlert && (
        <div
          style={{
            background: 'var(--accent-red-bg)',
            border: '1px dashed var(--accent-red)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-main)',
          }}
        >
          <AlertCircle size={22} color="var(--accent-red)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>Đặt lịch không thành công</strong>
            <span style={{ fontSize: '0.88rem' }}>{concurrencyAlert}</span>
          </div>
        </div>
      )}

      {/* BƯỚC 1: THÔNG TIN KHÁCH & NGÀY */}
      {currentStep === 1 && (
        <form onSubmit={handleProceedToStep2}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
              Bước 1: Thông Tin Khách Hàng & Ngày Hẹn
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Vui lòng cung cấp số điện thoại chính xác để hệ thống gửi tin nhắn nhắc hẹn và tự động thêm vào lịch cá nhân của bạn.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="customer-name">
                <User size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Họ và tên của bạn:
              </label>
              <input
                id="customer-name"
                type="text"
                className="form-input"
                placeholder="Ví dụ: Nguyễn Thị Mai"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              {formErrors.customerName && (
                <span style={{ color: 'var(--accent-red)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                  {formErrors.customerName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customer-phone">
                <Phone size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                Số điện thoại liên hệ:
              </label>
              <input
                id="customer-phone"
                type="tel"
                className="form-input"
                placeholder="Ví dụ: 0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {formErrors.phone && (
                <span style={{ color: 'var(--accent-red)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                  {formErrors.phone}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="booking-date">
              <Calendar size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Chọn ngày hẹn làm đẹp:
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                id="booking-date"
                type="date"
                className="form-input"
                style={{ maxWidth: '240px' }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min="2026-01-01"
              />

              <button
                type="button"
                className={`date-pill-btn ${date === '2026-09-25' ? 'active' : ''}`}
                onClick={() => setDate('2026-09-25')}
              >
                ★ Chọn ngày mẫu demo (25/09/2026)
              </button>
            </div>
            {formErrors.date && (
              <span style={{ color: 'var(--accent-red)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                {formErrors.date}
              </span>
            )}
          </div>

          <div className="wizard-nav" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              <span>Tiếp Tục: Chọn Dịch Vụ</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </form>
      )}

      {/* BƯỚC 2: CHỌN DỊCH VỤ VỚI 2 MODULE NAIL & GỘI ĐẦU */}
      {currentStep === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>
                Bước 2: Chọn Dịch Vụ Nail & Dưỡng Sinh
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Bạn có thể kết hợp cả làm Nail lẫn Gội đầu dưỡng sinh trong cùng 1 lần đặt. Hệ thống sẽ tự động cộng dồn thời gian.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              onClick={onOpenLookbook}
            >
              <Images size={15} color="var(--accent-gold)" />
              <span>Xem Lookbook Mẫu Ảnh</span>
            </button>
          </div>

          {/* Thanh tổng thời gian và giá */}
          <div className="booking-summary-bar">
            <div>
              <span className="summary-item-label">Dịch vụ đã chọn</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                {selectedServiceIds.length > 0
                  ? `${selectedServiceIds.length} dịch vụ đã chọn`
                  : 'Chưa chọn dịch vụ nào'}
              </div>
            </div>

            <div>
              <span className="summary-item-label">Tổng thời gian làm</span>
              <div className="summary-item-val">
                ⏱ {formatDuration(totalDurationMinutes)}
              </div>
            </div>

            <div>
              <span className="summary-item-label">Tổng chi phí dự kiến</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                {totalPrice.toLocaleString('vi-VN')} đ
              </div>
            </div>
          </div>

          {/* NHÓM 1: LÀM MÓNG NGHỆ THUẬT */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--accent-gold)', fontSize: '1.05rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💅 Gói Dịch Vụ Làm Móng Nghệ Thuật (Nail Art)</span>
            </h4>
            <div className="services-grid">
              {nailServices.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                return (
                  <div
                    key={service.id}
                    className={`service-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleService(service.id)}
                  >
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {service.name}
                          </h5>
                          <div className="checkbox-custom">
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                        </div>
                        <span className="service-badge-duration" style={{ marginTop: '4px' }}>
                          <Clock size={11} />
                          <span>{formatDuration(service.durationMinutes)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="service-card-footer" style={{ marginTop: '8px' }}>
                      <span className="service-price" style={{ fontSize: '0.98rem' }}>
                        {service.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NHÓM 2: GỘI ĐẦU DƯỠNG SINH THẢO DƯỢC */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--accent-emerald)', fontSize: '1.05rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🌿 Gói Dịch Vụ Gội Đầu Dưỡng Sinh & Spa Thảo Dược</span>
            </h4>
            <div className="services-grid">
              {headspaServices.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                return (
                  <div
                    key={service.id}
                    className={`service-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleService(service.id)}
                  >
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {service.name}
                          </h5>
                          <div className="checkbox-custom">
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                        </div>
                        <span className="service-badge-duration" style={{ marginTop: '4px' }}>
                          <Clock size={11} />
                          <span>{formatDuration(service.durationMinutes)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="service-card-footer" style={{ marginTop: '8px' }}>
                      <span className="service-price" style={{ color: 'var(--accent-emerald)', fontSize: '0.98rem' }}>
                        {service.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="wizard-nav">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentStep(1)}
            >
              <ChevronLeft size={18} />
              <span>Quay Lại</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleProceedToStep3}
              disabled={selectedServiceIds.length === 0}
            >
              <span>Tiếp Tục: Chọn Giờ ({formatDuration(totalDurationMinutes)})</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* BƯỚC 3: CHỌN KHUNG GIỜ THÔNG MINH */}
      {currentStep === 3 && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
              Bước 3: Chọn Khung Giờ Bắt Đầu
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Ngày hẹn: <strong style={{ color: 'var(--accent-gold)' }}>{date}</strong>. Tổng thời lượng phục vụ:{' '}
              <strong style={{ color: 'var(--accent-gold)' }}>{formatDuration(totalDurationMinutes)}</strong>.
            </p>
          </div>

          <div className="slot-notice-box">
            <ShieldCheck size={18} color="var(--accent-gold)" style={{ float: 'left', marginRight: '10px', marginTop: '2px' }} />
            <div>
              <strong>Quy tắc khóa giờ an toàn:</strong> Khi bạn chọn một khung giờ bắt đầu, hệ thống sẽ tự động khóa toàn bộ khoảng thời gian tương ứng với tổng thời lượng ({formatDuration(totalDurationMinutes)}). Những khung giờ bị trùng hoặc đè lên lịch đã có khách khác sẽ bị vô hiệu hóa hoàn toàn.
            </div>
          </div>

          {/* Lưới khung giờ */}
          <div className="slots-grid">
            {availableSlots.map((slot) => {
              const isSelected = selectedStartTime === slot.timeStr;
              return (
                <button
                  key={slot.timeStr}
                  type="button"
                  disabled={!slot.isAvailable}
                  data-reason={slot.conflictReason || 'Đã có khách đặt'}
                  className={`slot-btn ${slot.isAvailable ? 'available' : 'disabled'} ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (slot.isAvailable) {
                      setSelectedStartTime(slot.timeStr);
                      setConcurrencyAlert(null);
                    }
                  }}
                >
                  <span className="slot-time">{slot.timeStr}</span>
                  <span className="slot-end">
                    {slot.isAvailable ? `đến ${slot.endTimeStr}` : '—'}
                  </span>
                  <span className="slot-status-tag">
                    {slot.isAvailable ? 'Còn trống' : 'Đã có khách'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Box tóm tắt */}
          {selectedStartTime && calculatedEndTime && (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--text-main)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-gold)', textTransform: 'uppercase' }}>
                    Khung giờ bạn đang giữ chỗ:
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {selectedStartTime} – {calculatedEndTime} ({formatDuration(totalDurationMinutes)})
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Dịch vụ: {getServiceNames(selectedServiceIds, services)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-gold)' }}>Tạm tính:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                    {totalPrice.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="wizard-nav">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentStep(2)}
            >
              <ChevronLeft size={18} />
              <span>Quay Lại Chọn Dịch Vụ</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={!selectedStartTime}
              onClick={handleConfirmBooking}
            >
              <CheckCircle size={18} />
              <span>Xác Nhận Đặt Lịch Ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* BƯỚC 4: THÀNH CÔNG VỚI TÍCH HỢP GOOGLE CALENDAR & FILE .ICS */}
      {currentStep === 4 && lastCreatedBooking && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div className="modal-icon-success">
            <Sparkles size={36} color="var(--accent-emerald)" />
          </div>

          <h3 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--accent-gold)' }}>
            Đặt Lịch Thành Công!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '500px', margin: '0 auto 24px' }}>
            Hệ thống đã khóa trọn vẹn khung giờ này cho bạn. Bạn có thể lưu ngay vào lịch trên điện thoại hoặc Google Calendar để nhận thông báo nhắc nhở tự động.
          </p>

          <div className="modal-receipt" style={{ maxWidth: '520px', margin: '0 auto 24px' }}>
            <div className="receipt-row">
              <span className="receipt-label">Mã lịch hẹn:</span>
              <span className="receipt-value" style={{ fontFamily: 'monospace', color: 'var(--accent-gold)' }}>
                #{lastCreatedBooking.id.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Khách hàng:</span>
              <span className="receipt-value">{lastCreatedBooking.customerName}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Số điện thoại:</span>
              <span className="receipt-value">{lastCreatedBooking.phone}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Ngày làm hẹn:</span>
              <span className="receipt-value">{lastCreatedBooking.date}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Khung giờ thực hiện:</span>
              <span className="receipt-value" style={{ color: 'var(--accent-gold)' }}>
                {lastCreatedBooking.startTime} – {lastCreatedBooking.endTime}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Dịch vụ đã chọn:</span>
              <span className="receipt-value">
                {getServiceNames(lastCreatedBooking.serviceIds, services)}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Tổng thời gian:</span>
              <span className="receipt-value">{formatDuration(lastCreatedBooking.totalMinutes)}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Tổng thanh toán dự kiến:</span>
              <span className="receipt-value">{lastCreatedBooking.totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          {/* TÍCH HỢP LỊCH GOOGLE CALENDAR & FILE .ICS */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <a
              href={generateGoogleCalendarUrl(
                lastCreatedBooking,
                getServiceNames(lastCreatedBooking.serviceIds, services)
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '10px 18px', border: '1px solid var(--accent-gold)' }}
            >
              <CalendarPlus size={16} color="var(--accent-gold)" />
              <span>Thêm Vào Google Calendar</span>
            </a>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '10px 18px' }}
              onClick={() =>
                downloadIcsFile(
                  lastCreatedBooking,
                  getServiceNames(lastCreatedBooking.serviceIds, services)
                )
              }
            >
              <Download size={16} />
              <span>Tải File Lịch .ics (Điện Thoại / Apple)</span>
            </button>
          </div>

          <div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleResetForNewBooking}
            >
              <span>Đặt thêm một lịch hẹn mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
