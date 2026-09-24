import '../../styles/booking.css';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Service, Booking } from '../../types';
import {
  formatDuration,
  generateAvailableSlots,
  minutesToTime,
  timeToMinutes,
  getServiceNames,
} from '../../utils/scheduler';
import { attemptCreateBooking } from '../../utils/storage';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../../utils/calendar';
import { useMode } from '../../context/ModeContext';
import { zaloLink, SITE } from '../../data/site';
import { scrollToTarget } from '../../utils/scroll';
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
  Check,
  CalendarPlus,
  Download,
  Images,
  MessageCircle,
} from 'lucide-react';

interface BookingWizardProps {
  services: Service[];
  allBookings: Booking[];
  onBookingSuccess: () => void;
  targetDate?: string;
  preselectedServiceId?: string;
  onOpenLookbook: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  return c;
}

function formatDateVi(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STEP_LABELS = ['Dịch vụ', 'Giờ hẹn', 'Xong'];

export const BookingWizard: React.FC<BookingWizardProps> = ({
  services,
  allBookings,
  onBookingSuccess,
  targetDate,
  preselectedServiceId,
  onOpenLookbook,
}) => {
  const { showsCategory } = useMode();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [leaving, setLeaving] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState<string>(() => targetDate || toIso(new Date()));
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    preselectedServiceId ? [preselectedServiceId] : []
  );
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);

  const [concurrencyAlert, setConcurrencyAlert] = useState<string | null>(null);
  const [lastCreatedBooking, setLastCreatedBooking] = useState<Booking | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // "Bây giờ" cập nhật mỗi phút để giờ đã qua tự khóa
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(t);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (targetDate) setDate(targetDate);
  }, [targetDate]);

  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedServiceIds((prev) =>
        prev.includes(preselectedServiceId) ? prev : [...prev, preselectedServiceId]
      );
      setStep1Error(null);
    }
  }, [preselectedServiceId]);

  // Sau mỗi lần đổi bước: cuộn lên đầu wizard và focus tiêu đề
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    scrollToTarget(containerRef.current);
    headingRef.current?.focus({ preventScroll: true });
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (prefersReduced()) {
      setCurrentStep(step);
      return;
    }
    setLeaving(true);
    window.setTimeout(() => {
      setCurrentStep(step);
      setLeaving(false);
    }, 180);
  }, []);

  const visibleServices = useMemo(
    () => services.filter((s) => showsCategory(s.category)),
    [services, showsCategory]
  );
  const nailServices = visibleServices.filter((s) => s.category === 'nail');
  const headspaServices = visibleServices.filter((s) => s.category === 'headspa');

  // Chỉ tính những dịch vụ đang hiển thị theo chế độ
  const activeIds = useMemo(
    () => selectedServiceIds.filter((id) => visibleServices.some((s) => s.id === id)),
    [selectedServiceIds, visibleServices]
  );

  const totalDurationMinutes = useMemo(
    () => activeIds.reduce((t, id) => t + (services.find((s) => s.id === id)?.durationMinutes ?? 0), 0),
    [activeIds, services]
  );
  const totalPrice = useMemo(
    () => activeIds.reduce((t, id) => t + (services.find((s) => s.id === id)?.price ?? 0), 0),
    [activeIds, services]
  );

  const todayIso = toIso(now);
  const tomorrowIso = toIso(addDays(now, 1));
  const weekendIso = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = (6 - d.getDay() + 7) % 7 || 7;
    return toIso(addDays(d, d.getDay() === 6 ? 1 : diff));
  }, [now]);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const availableSlots = useMemo(() => {
    const base = generateAvailableSlots(date, totalDurationMinutes, allBookings);
    if (date !== todayIso) return base;
    return base.map((s) =>
      timeToMinutes(s.timeStr) <= nowMinutes
        ? { ...s, isAvailable: false, conflictReason: 'Đã qua giờ' }
        : s
    );
  }, [date, todayIso, nowMinutes, totalDurationMinutes, allBookings]);

  useEffect(() => {
    if (selectedStartTime) {
      const found = availableSlots.find((s) => s.timeStr === selectedStartTime);
      if (!found || !found.isAvailable) setSelectedStartTime(null);
    }
  }, [availableSlots, selectedStartTime]);

  const anySlotFree = availableSlots.some((s) => s.isAvailable);

  const calculatedEndTime = useMemo(() => {
    if (!selectedStartTime || totalDurationMinutes <= 0) return null;
    return minutesToTime(timeToMinutes(selectedStartTime) + totalDurationMinutes);
  }, [selectedStartTime, totalDurationMinutes]);

  const handleToggleService = (id: string) => {
    setConcurrencyAlert(null);
    setStep1Error(null);
    setSelectedServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleProceedToStep2 = () => {
    if (activeIds.length === 0) {
      setStep1Error('Bạn chọn ít nhất 1 dịch vụ để tiếp tục nhé.');
      return;
    }
    setConcurrencyAlert(null);
    goToStep(2);
  };

  const scrollToField = (id: string) => {
    window.requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      scrollToTarget(el, { extraOffset: 40 });
      if (el instanceof HTMLInputElement || el instanceof HTMLButtonElement) {
        el.focus({ preventScroll: true });
      }
    });
  };

  const handleConfirmBooking = () => {
    const errors: { [key: string]: string } = {};
    if (!customerName.trim()) errors.customerName = 'Bạn cho mình biết tên nhé.';
    if (!phone.trim()) {
      errors.phone = 'Bạn nhập số điện thoại để tiệm liên hệ nhé.';
    } else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(phone.replace(/\s+/g, ''))) {
      errors.phone = 'Số điện thoại gồm 10 số, ví dụ 0901234567.';
    }
    if (!date) errors.date = 'Bạn chọn ngày hẹn nhé.';
    else if (date < todayIso) errors.date = 'Ngày này đã qua, bạn chọn hôm nay hoặc ngày sau nhé.';
    if (!selectedStartTime || !calculatedEndTime) errors.slot = 'Bạn chọn một giờ hẹn nhé.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstId = errors.customerName
        ? 'bk-name'
        : errors.phone
        ? 'bk-phone'
        : errors.date
        ? 'bk-date'
        : 'bk-slots';
      scrollToField(firstId);
      return;
    }
    setFormErrors({});
    setConcurrencyAlert(null);

    const result = attemptCreateBooking({
      customerName: customerName.trim(),
      phone: phone.trim(),
      date,
      startTime: selectedStartTime as string,
      endTime: calculatedEndTime as string,
      serviceIds: activeIds,
      totalMinutes: totalDurationMinutes,
      totalPrice,
      staffId: 'owner',
      note: 'Đặt online trên website',
    });

    if (!result.success) {
      setConcurrencyAlert(result.error || 'Giờ này vừa có bạn khác đặt. Bạn chọn giờ khác giúp mình nhé.');
      setSelectedStartTime(null);
      return;
    }

    if (result.booking) {
      setLastCreatedBooking(result.booking);
      setCurrentStep(3);
      onBookingSuccess();
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#e23e68', '#b3123b', '#ffe9ef', '#c9963a', '#ffffff'],
          disableForReducedMotion: true,
        });
      } catch (err) {
        console.log('Confetti effect:', err);
      }
    }
  };

  const handleResetForNewBooking = () => {
    setSelectedStartTime(null);
    setLastCreatedBooking(null);
    setConcurrencyAlert(null);
    setDate(toIso(new Date()));
    goToStep(1);
  };

  const zaloMessage = (b: Booking) =>
    `Chào tiệm, mình là ${b.customerName}. Mình đã đặt lịch ${b.startTime} – ${b.endTime} ngày ${formatDateVi(
      b.date
    )}, dịch vụ: ${getServiceNames(b.serviceIds, services)}. Nhờ tiệm xác nhận giúp mình nhé.`;

  const renderService = (service: Service) => {
    const isSelected = activeIds.includes(service.id);
    return (
      <button
        key={service.id}
        type="button"
        aria-pressed={isSelected}
        className={`bk-svc ${isSelected ? 'is-selected' : ''}`}
        onClick={() => handleToggleService(service.id)}
      >
        <span className="bk-svc-inner">
          <span className="bk-svc-img">
            <img src={service.imageUrl} alt={service.name} loading="lazy" />
            <span className="bk-check" aria-hidden="true">
              <Check size={14} strokeWidth={3} />
            </span>
          </span>
          <span className="bk-svc-info">
            <span className="bk-svc-name">{service.name}</span>
            <span className="bk-svc-meta">
              <span className="bk-dur">
                <Clock size={11} />
                {formatDuration(service.durationMinutes)}
              </span>
              <span className="price">{service.price.toLocaleString('vi-VN')}đ</span>
            </span>
          </span>
        </span>
      </button>
    );
  };

  const fillPct = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;
  const bodyClass = `bk-body ${leaving ? 'is-leaving' : ''}`;

  return (
    <div id="booking-wizard-container" ref={containerRef} className="bk-panel">
      <div className="bk-progress" aria-label={`Bước ${currentStep} trên 3`}>
        <div className="bk-progress-track">
          <div className="bk-progress-fill" style={{ width: `${fillPct}%` }} />
        </div>
        <div className="bk-progress-labels">
          {STEP_LABELS.map((l, i) => (
            <span key={l} className={currentStep >= i + 1 ? 'is-on' : ''}>
              {i + 1}. {l}
            </span>
          ))}
        </div>
      </div>

      {concurrencyAlert && (
        <div className="bk-alert" role="alert">
          <AlertCircle size={20} color="var(--accent-red)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Chưa đặt được lịch</strong>
            {concurrencyAlert}
          </div>
        </div>
      )}

      {/* BƯỚC 1 */}
      {currentStep === 1 && (
        <div key="step1" className={bodyClass}>
          <div className="step-enter">
            <div className="bk-head bk-head-row">
              <div>
                <h3 className="bk-title" tabIndex={-1} ref={headingRef}>
                  Bạn muốn làm gì hôm nay?
                </h3>
                <p className="bk-sub">Chọn một hoặc nhiều dịch vụ, tiệm tự cộng thời gian và giá cho bạn.</p>
              </div>
              <button type="button" className="bk-link-btn" onClick={onOpenLookbook}>
                <Images size={15} />
                Xem mẫu
              </button>
            </div>

            {visibleServices.length === 0 && (
              <div className="bk-empty">Hiện chưa có dịch vụ nào trong mục này. Bạn nhắn Zalo cho tiệm để được tư vấn nhé.</div>
            )}

            {nailServices.length > 0 && (
              <div className="bk-group">
                {headspaServices.length > 0 && <h4 className="bk-group-title">Làm nail</h4>}
                <div className="bk-grid">{nailServices.map(renderService)}</div>
              </div>
            )}
            {headspaServices.length > 0 && (
              <div className="bk-group">
                {nailServices.length > 0 && <h4 className="bk-group-title">Gội đầu dưỡng sinh</h4>}
                <div className="bk-grid">{headspaServices.map(renderService)}</div>
              </div>
            )}

            <div className="bk-total">
              <span>
                <b>{activeIds.length}</b> dịch vụ · <b>{formatDuration(totalDurationMinutes)}</b>
              </span>
              <span className="price">{totalPrice.toLocaleString('vi-VN')}đ</span>
            </div>
            {step1Error && <span className="bk-err" role="alert" style={{ marginBottom: 10 }}>{step1Error}</span>}

            <div className="bk-nav" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-primary" onClick={handleProceedToStep2}>
                <span>Chọn ngày giờ</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BƯỚC 2 */}
      {currentStep === 2 && (
        <div key="step2" className={bodyClass}>
          <div className="step-enter">
            <div className="bk-head">
              <h3 className="bk-title" tabIndex={-1} ref={headingRef}>
                Cho tiệm biết bạn là ai và đến lúc nào
              </h3>
              <p className="bk-sub">
                Tiệm mở {SITE.hours} — bạn chọn giờ bắt đầu, tiệm giữ trọn {formatDuration(totalDurationMinutes)} cho bạn.
              </p>
            </div>

            <div className="bk-fields">
              <div className="bk-field">
                <label className="bk-label" htmlFor="bk-name">
                  <User size={13} /> Tên của bạn
                </label>
                <input
                  id="bk-name"
                  type="text"
                  autoComplete="name"
                  className={`bk-input ${formErrors.customerName ? 'is-invalid' : ''}`}
                  placeholder="Ví dụ: Nguyễn Thị Mai"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                {formErrors.customerName && <span className="bk-err">{formErrors.customerName}</span>}
              </div>
              <div className="bk-field">
                <label className="bk-label" htmlFor="bk-phone">
                  <Phone size={13} /> Số điện thoại
                </label>
                <input
                  id="bk-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className={`bk-input ${formErrors.phone ? 'is-invalid' : ''}`}
                  placeholder="Ví dụ: 0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {formErrors.phone && <span className="bk-err">{formErrors.phone}</span>}
              </div>
            </div>

            <div className="bk-field" style={{ marginBottom: 6 }}>
              <label className="bk-label" htmlFor="bk-date">
                <Calendar size={13} /> Ngày hẹn
              </label>
              <div className="bk-chips">
                <button
                  type="button"
                  className={`bk-chip ${date === todayIso ? 'is-on' : ''}`}
                  onClick={() => setDate(todayIso)}
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  className={`bk-chip ${date === tomorrowIso ? 'is-on' : ''}`}
                  onClick={() => setDate(tomorrowIso)}
                >
                  Ngày mai
                </button>
                <button
                  type="button"
                  className={`bk-chip ${date === weekendIso ? 'is-on' : ''}`}
                  onClick={() => setDate(weekendIso)}
                >
                  Cuối tuần
                </button>
                <input
                  id="bk-date"
                  type="date"
                  className={`bk-input bk-date-input ${formErrors.date ? 'is-invalid' : ''}`}
                  value={date}
                  min={todayIso}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              {formErrors.date && <span className="bk-err">{formErrors.date}</span>}
            </div>

            <label className="bk-label" style={{ marginTop: 12 }}>
              <Clock size={13} /> Giờ bắt đầu (giờ lớn) và giờ xong dự kiến (giờ nhỏ)
            </label>

            {anySlotFree ? (
              <div id="bk-slots" className="bk-slots" role="group" aria-label="Khung giờ hẹn">
                {availableSlots.map((slot) => {
                  const isSelected = selectedStartTime === slot.timeStr;
                  return (
                    <button
                      key={slot.timeStr}
                      type="button"
                      disabled={!slot.isAvailable}
                      aria-pressed={isSelected}
                      title={slot.isAvailable ? undefined : slot.conflictReason || 'Đã có khách đặt'}
                      className={`bk-slot ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSelectedStartTime(slot.timeStr);
                        setConcurrencyAlert(null);
                        setFormErrors((p) => ({ ...p, slot: '' }));
                      }}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} className="bk-slot-tick" />}
                      <span className="bk-slot-time">{slot.timeStr}</span>
                      <span className="bk-slot-end">
                        {slot.isAvailable
                          ? `đến ${slot.endTimeStr}`
                          : slot.conflictReason === 'Đã qua giờ'
                          ? 'Đã qua giờ'
                          : 'Hết chỗ'}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div id="bk-slots" className="bk-empty">
                Ngày này không còn giờ nào đủ {formatDuration(totalDurationMinutes)} cho các dịch vụ bạn chọn.
                Bạn thử chọn ngày khác, hoặc bớt một dịch vụ để rút ngắn thời gian nhé.
              </div>
            )}
            {formErrors.slot && <span className="bk-err" style={{ marginTop: -8, marginBottom: 12 }}>{formErrors.slot}</span>}

            {selectedStartTime && calculatedEndTime ? (
              <div className="bk-summary" aria-live="polite">
                <span className="bk-summary-main">
                  {selectedStartTime} – {calculatedEndTime} · {formatDuration(totalDurationMinutes)} ·{' '}
                  <span className="price">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </span>
                <span className="bk-summary-sub">
                  {formatDateVi(date)} · {getServiceNames(activeIds, services)}
                </span>
              </div>
            ) : (
              <p className="bk-hint">Chọn một giờ để xem giờ xong và tổng tiền.</p>
            )}

            <div className="bk-nav">
              <button type="button" className="btn btn-secondary" onClick={() => goToStep(1)}>
                <ChevronLeft size={18} />
                <span>Quay lại</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={handleConfirmBooking}>
                <CheckCircle size={18} />
                <span>Xác nhận đặt lịch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BƯỚC 3 */}
      {currentStep === 3 && lastCreatedBooking && (
        <div key="step3" className={bodyClass}>
          <div className="step-enter bk-done">
            <div className="bk-done-icon">
              <Check size={32} strokeWidth={3} />
            </div>
            <h3 className="bk-title" tabIndex={-1} ref={headingRef} style={{ fontSize: '1.3rem' }}>
              Đã giữ chỗ cho bạn rồi!
            </h3>
            <p className="bk-sub" style={{ maxWidth: 440, margin: '0 auto' }}>
              Hẹn gặp {lastCreatedBooking.customerName} lúc {lastCreatedBooking.startTime} ngày{' '}
              {formatDateVi(lastCreatedBooking.date)}. Bạn lưu vào lịch hoặc nhắn Zalo để tiệm xác nhận nhé.
            </p>

            <div className="bk-receipt">
              <div className="bk-row">
                <span>Mã lịch</span>
                <span style={{ fontFamily: 'monospace' }}>#{lastCreatedBooking.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="bk-row">
                <span>Khách</span>
                <span>
                  {lastCreatedBooking.customerName} · {lastCreatedBooking.phone}
                </span>
              </div>
              <div className="bk-row">
                <span>Ngày</span>
                <span>{formatDateVi(lastCreatedBooking.date)}</span>
              </div>
              <div className="bk-row">
                <span>Giờ làm</span>
                <span>
                  {lastCreatedBooking.startTime} – {lastCreatedBooking.endTime} ({formatDuration(lastCreatedBooking.totalMinutes)})
                </span>
              </div>
              <div className="bk-row">
                <span>Dịch vụ</span>
                <span>{getServiceNames(lastCreatedBooking.serviceIds, services)}</span>
              </div>
              <div className="bk-row">
                <span>Tạm tính</span>
                <span className="price">{lastCreatedBooking.totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="bk-actions">
              <a
                href={zaloLink(zaloMessage(lastCreatedBooking))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bk-zalo"
              >
                <MessageCircle size={16} />
                <span>Nhắn Zalo cho tiệm</span>
              </a>
              <a
                href={generateGoogleCalendarUrl(
                  lastCreatedBooking,
                  getServiceNames(lastCreatedBooking.serviceIds, services)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <CalendarPlus size={16} />
                <span>Thêm vào Google Calendar</span>
              </a>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  downloadIcsFile(lastCreatedBooking, getServiceNames(lastCreatedBooking.serviceIds, services))
                }
              >
                <Download size={16} />
                <span>Tải file lịch</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={handleResetForNewBooking}>
                <span>Đặt thêm lịch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
