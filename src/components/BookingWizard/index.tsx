import '../../styles/booking.css';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Service, Booking } from '../../types';
import {
  generateAvailableSlots,
  minutesToTime,
  timeToMinutes,
  getServiceNames,
} from '../../utils/scheduler';
import { attemptCreateBooking } from '../../utils/storage';
import { useMode } from '../../context/ModeContext';
import { instagramLink, SITE } from '../../data/site';
import { SALON_HOURS } from '../../data/services';
import { scrollToTarget } from '../../utils/scroll';
import confetti from 'canvas-confetti';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { InstagramIcon } from '../ui/InstagramIcon';
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
  Heart,
  Images,
} from 'lucide-react';

interface BookingWizardProps {
  services: Service[];
  allBookings: Booking[];
  onBookingSuccess: () => void;
  targetDate?: string;
  /** Đổi nonce mỗi lần chọn để chọn lại cùng một món vẫn được áp dụng. */
  preselect?: { id: string; nonce: number };
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

const LEAD_MINUTES = 30;
const LEAD_REASON = 'Cần đặt trước 30 phút';

/** Ngày mặc định: hôm nay, hoặc ngày mai nếu tiệm đã hết giờ nhận khách. */
function defaultDate(now: Date): string {
  const closeM = timeToMinutes(SALON_HOURS.closeTime);
  const nowM = now.getHours() * 60 + now.getMinutes();
  const lastStart = closeM - SALON_HOURS.slotStepMinutes;
  return nowM + LEAD_MINUTES > lastStart ? toIso(addDays(now, 1)) : toIso(now);
}

const STEP_LABELS =['Dịch vụ', 'Giờ hẹn', 'Xong'];

export const BookingWizard: React.FC<BookingWizardProps> = ({
  services,
  allBookings,
  onBookingSuccess,
  targetDate,
  preselect,
  onOpenLookbook,
}) => {
  const { showsCategory } = useMode();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [leaving, setLeaving] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState<string>(() => {
    const d = defaultDate(new Date());
    return targetDate && targetDate === toIso(new Date()) ? d : targetDate || d;
  });
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    preselect ? [preselect.id] : []
  );
  const [zaloNotice, setZaloNotice] = useState<{ ok: boolean; text: string } | null>(null);
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef(1);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // Mỗi lần chọn dịch vụ từ trang (kể cả chọn lại cùng món) đều được áp dụng và quay về bước 1
  useEffect(() => {
    if (!preselect) return;
    setStep1Error(null);
    if (currentStepRef.current === 3) {
      // Đang ở màn hình xong: bắt đầu lượt đặt mới với món vừa chọn
      setLastCreatedBooking(null);
      setZaloNotice(null);
      setSelectedStartTime(null);
      setSelectedServiceIds([preselect.id]);
      setDate(defaultDate(new Date()));
      goToStep(1);
      return;
    }
    setSelectedServiceIds((prev) => (prev.includes(preselect.id) ? prev : [...prev, preselect.id]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselect]);

  // Sau mỗi lần đổi bước: cuộn lên đầu wizard và focus tiêu đề
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    scrollToTarget(containerRef.current);
    headingRef.current?.focus({ preventScroll: true });
  }, [currentStep]);

  // Sau khi chép nội dung Zalo, cuộn vùng cuộn xuống để khách thấy thông báo
  useEffect(() => {
    if (zaloNotice && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [zaloNotice]);

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
    const base = generateAvailableSlots(date, totalDurationMinutes, allBookings, activeIds, services);
    if (date !== todayIso) return base;
    return base.map((s) => {
      const start = timeToMinutes(s.timeStr);
      if (start <= nowMinutes) return { ...s, isAvailable: false, conflictReason: 'Đã qua giờ' };
      if (start < nowMinutes + LEAD_MINUTES) return { ...s, isAvailable: false, conflictReason: LEAD_REASON };
      return s;
    });
  }, [date, todayIso, nowMinutes, totalDurationMinutes, allBookings, activeIds, services]);

  // Hôm nay không còn giờ nào có thể nhận (đã qua, sát giờ hoặc vượt giờ đóng cửa)
  const closedToday =
    date === todayIso &&
    !availableSlots.some(
      (s) =>
        timeToMinutes(s.timeStr) >= nowMinutes + LEAD_MINUTES &&
        !(s.conflictReason || '').startsWith('Vượt quá')
    );

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
      // Cuộn bên trong vùng cuộn của wizard, rồi đưa đầu wizard xuống dưới header
      const scroller = scrollRef.current;
      if (scroller) {
        const delta = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
        scroller.scrollTo({ top: Math.max(0, scroller.scrollTop + delta - 12), behavior: prefersReduced() ? 'auto' : 'smooth' });
      }
      scrollToTarget(containerRef.current);
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
          colors: ['#ffffff', '#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b'],
          disableForReducedMotion: true,
        });
      } catch (err) {
        console.log('Confetti effect:', err);
      }
    }
  };

  const handleResetForNewBooking = () => {
    setSelectedStartTime(null);
    setSelectedServiceIds([]);
    setLastCreatedBooking(null);
    setConcurrencyAlert(null);
    setZaloNotice(null);
    setStep1Error(null);
    setDate(defaultDate(new Date()));
    goToStep(1);
  };

  const zaloMessage = (b: Booking) =>
    `Chào tiệm, mình là ${b.customerName}. Mình đã đặt lịch lúc ${b.startTime} ngày ${formatDateVi(
      b.date
    )}, dịch vụ: ${getServiceNames(b.serviceIds, services)}. Nhờ tiệm xác nhận giúp mình nhé.`;

  // zalo.me không điền sẵn tin nhắn được, nên chép nội dung để khách dán vào Zalo
  const handleZaloClick = (b: Booking) => {
    const text = zaloMessage(b);
    const done = (ok: boolean) => setZaloNotice({ ok, text });
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text).then(
          () => done(true),
          () => done(false)
        );
        return;
      }
    } catch {
      /* rơi xuống bước dự phòng */
    }
    done(false);
  };

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
        <span className="bk-svc-img">
          <img src={service.imageUrl} alt="" loading="lazy" />
        </span>
        <span className="bk-svc-info">
          <span className="bk-svc-name">{service.name}</span>
        </span>
        <span className="bk-svc-end">
          <span className="price">{service.price.toLocaleString('vi-VN')}đ</span>
          <span className="bk-check" aria-hidden="true">
            <Check size={13} strokeWidth={3} />
          </span>
        </span>
      </button>
    );
  };

  const bodyClass = `bk-body ${leaving ? 'is-leaving' : ''}`;

  const shopNote = (
    <p className="bk-shop-note">
      <Heart size={15} className="bk-shop-note-icon" aria-hidden="true" />
      <span>Tiệm nhỏ xinh nên chỉ nhận số lượng khách có hạn, bạn thông cảm cho shop nhé ♡</span>
    </p>
  );

  return (
    <div id="booking-wizard-container" ref={containerRef} className="bk-panel">
      <div className="bk-progress" aria-label={`Bước ${currentStep} trên 3`}>
        <div className="bk-progress-pills">
          {STEP_LABELS.map((l, i) => (
            <span
              key={l}
              className={`bk-pill ${currentStep >= i + 1 ? 'is-on' : ''} ${currentStep === i + 1 ? 'is-current' : ''}`}
            >
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
          <div className={`bk-scroll step-enter ${activeIds.length > 0 ? 'has-bar' : ''}`} ref={scrollRef}>
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
            {shopNote}

            {visibleServices.length === 0 && (
              <div className="bk-empty">Hiện chưa có dịch vụ nào trong mục này. Bạn nhắn Instagram cho tiệm để được tư vấn nhé.</div>
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

            {step1Error && <span className="bk-err" role="alert">{step1Error}</span>}
          </div>

          <div className={`bk-bar ${activeIds.length > 0 ? 'is-shown' : ''}`}>
            <div className="bk-bar-inner">
              <div className="bk-bar-sum" aria-live="polite">
                <span className="bk-bar-line">
                  <b>{activeIds.length}</b> dịch vụ
                </span>
              </div>
              <div className="bk-bar-btns">
                <button type="button" className="btn btn-primary" onClick={handleProceedToStep2}>
                  <span>Tiếp tục</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BƯỚC 2 */}
      {currentStep === 2 && (
        <div key="step2" className={bodyClass}>
          <div
            className="bk-scroll step-enter has-bar"
            ref={scrollRef}
          >
            <div className="bk-head bk-head-row">
              <div>
                <h3 className="bk-title" tabIndex={-1} ref={headingRef}>
                  Cho tiệm biết bạn là ai và đến lúc nào
                </h3>
                <p className="bk-sub">
                  Tiệm mở {SITE.hours} — bạn chọn giờ đến, tiệm giữ chỗ cho bạn.
                </p>
              </div>
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

            <div className="bk-field bk-date-field">
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
                <CustomDatePicker
                  value={date}
                  min={todayIso}
                  onChange={(d) => {
                    setDate(d);
                    setFormErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  hasError={Boolean(formErrors.date)}
                />
              </div>
              {formErrors.date && <span className="bk-err">{formErrors.date}</span>}
            </div>

            {shopNote}

            <span className="bk-label bk-slots-label">
              <Clock size={13} /> Giờ bạn đến
            </span>

            {anySlotFree ? (
              <div id="bk-slots" className="bk-slots" role="group" aria-label="Khung giờ hẹn">
                {availableSlots.filter((s) => s.isAvailable).map((slot) => {
                  const isSelected = selectedStartTime === slot.timeStr;
                  return (
                    <button
                      key={slot.timeStr}
                      type="button"
                      aria-pressed={isSelected}
                      className={`bk-slot ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSelectedStartTime(slot.timeStr);
                        setConcurrencyAlert(null);
                        setFormErrors((p) => ({ ...p, slot: '' }));
                      }}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} className="bk-slot-tick" />}
                      <span className="bk-slot-time">{slot.timeStr}</span>
                    </button>
                  );
                })}
              </div>
            ) : closedToday ? (
              <div id="bk-slots" className="bk-empty">
                Hôm nay tiệm đã hết giờ nhận khách.{' '}
                <button type="button" className="bk-link-btn" onClick={() => setDate(tomorrowIso)}>
                  Chọn ngày mai
                </button>
              </div>
            ) : (
              <div id="bk-slots" className="bk-empty">
                Ngày này tiệm đã kín giờ, bạn chọn ngày khác nhé ♡
              </div>
            )}
            {formErrors.slot && <span className="bk-err bk-slot-err">{formErrors.slot}</span>}

            <p className="bk-hint" aria-live="polite">
              {selectedStartTime && calculatedEndTime
                ? `${formatDateVi(date)} · ${getServiceNames(activeIds, services)}`
                : 'Bạn chọn một giờ để tiếp tục nhé.'}
            </p>
          </div>

          <div className="bk-bar is-shown">
            <div className="bk-bar-inner">
              <div className="bk-bar-sum" aria-live="polite">
                <span className="bk-bar-line">
                  {selectedStartTime && calculatedEndTime ? (
                    <>
                      <b>
                        {formatDateVi(date)} · {selectedStartTime}
                      </b>
                    </>
                  ) : (
                    <>Chọn giờ để tiếp tục</>
                  )}
                </span>
                <span className="bk-bar-line">
                  {activeIds.length} dịch vụ
                </span>
              </div>
              <div className="bk-bar-btns">
                <button type="button" className="btn btn-secondary" onClick={() => goToStep(1)} aria-label="Quay lại">
                  <ChevronLeft size={18} />
                  <span className="bk-btn-label">Quay lại</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-primary ${selectedStartTime && calculatedEndTime ? '' : 'is-waiting'}`}
                  disabled={!(selectedStartTime && calculatedEndTime)}
                  onClick={handleConfirmBooking}
                >
                  <CheckCircle size={18} />
                  <span>
                    Xác nhận<span className="bk-btn-label"> đặt lịch</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BƯỚC 3 */}
      {currentStep === 3 && lastCreatedBooking && (
        <div key="step3" className={bodyClass}>
          <div className="bk-scroll bk-done step-enter" ref={scrollRef}>
            <div className="bk-done-icon">
              <Check size={26} strokeWidth={3} />
            </div>
            <h3 className="bk-title" tabIndex={-1} ref={headingRef}>
              Đã giữ chỗ cho bạn rồi!
            </h3>
            <p className="bk-sub bk-done-sub">
              Hẹn gặp {lastCreatedBooking.customerName} lúc {lastCreatedBooking.startTime} ngày{' '}
              {formatDateVi(lastCreatedBooking.date)}. Bạn bấm nhắn Instagram dưới đây để tiệm giữ chỗ chu đáo cho bạn nhé.
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
                <span>Giờ hẹn</span>
                <span>{lastCreatedBooking.startTime}</span>
              </div>
              <div className="bk-row">
                <span>Dịch vụ</span>
                <span>{getServiceNames(lastCreatedBooking.serviceIds, services)}</span>
              </div>
            </div>

            <p className="bk-hint bk-done-hint">Nếu cần đổi giờ, bạn nhắn Instagram cho tiệm sớm giúp mình nhé ♡</p>
            {shopNote}
            {zaloNotice && (
              <p className="bk-hint" role="status">
                {zaloNotice.ok ? (
                  'Đã chép nội dung đặt lịch, bạn dán vào Instagram nhé'
                ) : (
                  <>
                    Bạn chép nội dung dưới đây rồi dán vào Instagram nhé:
                    <br />
                    <span style={{ userSelect: 'all' }}>{zaloNotice.text}</span>
                  </>
                )}
              </p>
            )}
            <div className="bk-actions">
              <a
                href={instagramLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bk-zalo bk-instagram"
                onClick={() => handleZaloClick(lastCreatedBooking)}
              >
                <InstagramIcon size={16} />
                <span>Nhắn Instagram cho tiệm</span>
              </a>
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
