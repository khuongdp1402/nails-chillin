import '../../styles/admin.css';
import React, { useState, useMemo } from 'react';
import type { Booking, Service } from '../../types';
import {
  buildDailyTimeline,
  formatDuration,
  getServiceNames,
  timeToMinutes,
  minutesToTime,
} from '../../utils/scheduler';
import { cancelBooking, attemptCreateBooking } from '../../utils/storage';
import { ServicesManager } from './ServicesManager';
import { generateGoogleCalendarUrl } from '../../utils/calendar';
import {
  formatDayLabel,
  formatRangeLabel,
  getRange,
  toIso,
  todayIso,
  type RangePreset,
} from '../../utils/dateRange';
import {
  getReminderSettings,
  saveReminderSettings,
  type ReminderSettings,
} from '../../utils/reminderSettings';
import {
  Clock,
  PlusCircle,
  XCircle,
  Users,
  Phone,
  Bell,
  CalendarDays,
  ListOrdered,
  PackagePlus,
  Wallet,
  CalendarPlus,
} from 'lucide-react';

interface AdminDashboardProps {
  services: Service[];
  allBookings: Booking[];
  onDataChanged: () => void;
  onServicesChanged: (updatedServices: Service[]) => void;
  onExitAdmin: () => void;
}

type ViewTab = 'calendar' | 'timeline' | 'reminders' | 'services';

const PRESETS: { id: RangePreset; label: string }[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: 'Tuần này' },
  { id: 'month', label: 'Tháng này' },
  { id: 'custom', label: 'Tùy chọn' },
];

const WEEKDAY_HEAD = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const vnd = (n: number) => `${n.toLocaleString('vi-VN')}đ`;
const telHref = (p: string) => `tel:${p.replace(/[^0-9+]/g, '')}`;
const hasDigits = (p: string) => /\d{6,}/.test(p);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  services,
  allBookings,
  onDataChanged,
  onServicesChanged,
  onExitAdmin,
}) => {
  const [preset, setPreset] = useState<RangePreset>('today');
  const [custom, setCustom] = useState<{ from: string; to: string }>(() => {
    const t = todayIso();
    return { from: t, to: t };
  });
  const [timelineDate, setTimelineDate] = useState<string>(() => todayIso());
  const [viewTab, setViewTab] = useState<ViewTab>('calendar');

  const [reminder, setReminder] = useState<ReminderSettings>(() => getReminderSettings());
  const [reminderSaved, setReminderSaved] = useState(false);

  const [quickAddModal, setQuickAddModal] = useState<{ isOpen: boolean; startTime: string; maxMinutes: number }>({
    isOpen: false,
    startTime: '',
    maxMinutes: 60,
  });
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinServiceId, setWalkinServiceId] = useState<string>(services[0]?.id || '');
  const [quickAddError, setQuickAddError] = useState<string | null>(null);

  const range = useMemo(() => getRange(preset, custom), [preset, custom]);
  const today = todayIso();

  // Lịch hẹn trong khoảng đã chọn, gom theo ngày
  const rangeBookings = useMemo(
    () =>
      allBookings
        .filter((b) => b.status !== 'cancelled' && b.date >= range.from && b.date <= range.to)
        .sort((a, b) =>
          a.date === b.date ? timeToMinutes(a.startTime) - timeToMinutes(b.startTime) : a.date < b.date ? -1 : 1
        ),
    [allBookings, range]
  );

  const groups = useMemo(() => {
    const map = new Map<string, Booking[]>();
    rangeBookings.forEach((b) => map.set(b.date, [...(map.get(b.date) || []), b]));
    return Array.from(map.entries());
  }, [rangeBookings]);

  const stats = useMemo(() => {
    const revenue = rangeBookings.reduce((s, b) => s + b.totalPrice, 0);
    const minutes = rangeBookings.reduce((s, b) => s + b.totalMinutes, 0);
    return { revenue, customers: rangeBookings.length, busy: formatDuration(minutes) };
  }, [rangeBookings]);

  // Lịch tháng hiện tại (động)
  const monthInfo = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const lead = (new Date(y, m, 1).getDay() + 6) % 7;
    const counts = new Map<string, number>();
    allBookings.forEach((b) => {
      if (b.status !== 'cancelled') counts.set(b.date, (counts.get(b.date) || 0) + 1);
    });
    const cells = Array.from({ length: daysInMonth }, (_, i) => {
      const iso = toIso(new Date(y, m, i + 1));
      return { day: i + 1, iso, count: counts.get(iso) || 0 };
    });
    return { title: `Tháng ${m + 1}/${y}`, lead, cells };
  }, [allBookings]);

  const timeline = useMemo(() => buildDailyTimeline(timelineDate, allBookings), [timelineDate, allBookings]);

  const handleCancelBooking = (bookingId: string, customerName: string) => {
    if (window.confirm(`Hủy lịch hẹn của "${customerName}"?`)) {
      cancelBooking(bookingId);
      onDataChanged();
    }
  };

  const pickDay = (iso: string) => {
    setCustom({ from: iso, to: iso });
    setPreset('custom');
    setTimelineDate(iso);
  };

  const handleOpenQuickAdd = (startTime: string, durationMinutes: number) => {
    setQuickAddModal({ isOpen: true, startTime, maxMinutes: durationMinutes });
    setWalkinName('');
    setWalkinPhone('');
    setQuickAddError(null);
  };

  const closeQuickAdd = () => setQuickAddModal({ isOpen: false, startTime: '', maxMinutes: 60 });

  const handleConfirmQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) {
      setQuickAddError('Bạn nhập tên khách giúp mình nhé.');
      return;
    }
    const service = services.find((s) => s.id === walkinServiceId) || services[0];
    if (!service) {
      setQuickAddError('Chưa có dịch vụ nào. Bạn thêm dịch vụ ở tab Dịch vụ trước nhé.');
      return;
    }
    const endTime = minutesToTime(timeToMinutes(quickAddModal.startTime) + service.durationMinutes);

    const result = attemptCreateBooking({
      customerName: walkinName.trim(),
      phone: walkinPhone.trim() || 'Khách tại tiệm',
      date: timelineDate,
      startTime: quickAddModal.startTime,
      endTime,
      serviceIds: [service.id],
      totalMinutes: service.durationMinutes,
      totalPrice: service.price,
      note: 'Khách đến trực tiếp tại tiệm',
      staffId: 'owner',
    });

    if (!result.success) {
      setQuickAddError(result.error || 'Khung giờ này chưa xếp được, bạn chọn giờ khác nhé.');
      return;
    }
    closeQuickAdd();
    onDataChanged();
  };

  const updateReminder = (patch: Partial<ReminderSettings>) => {
    const next = { ...reminder, ...patch };
    setReminder(next);
    saveReminderSettings(next);
    setReminderSaved(true);
    window.setTimeout(() => setReminderSaved(false), 2000);
  };

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'calendar', label: 'Lịch', icon: <CalendarDays size={16} /> },
    { id: 'timeline', label: 'Bảng giờ', icon: <ListOrdered size={16} /> },
    { id: 'reminders', label: 'Nhắc lịch', icon: <Bell size={16} /> },
    { id: 'services', label: 'Dịch vụ', icon: <PackagePlus size={16} /> },
  ];

  return (
    <div className="ad-wrap">
      {/* Đầu trang */}
      <div className="ad-header">
        <div>
          <h2 className="ad-title">Quản lý lịch</h2>
          <p className="ad-sub">Xem khách hẹn, doanh thu và chỉnh dịch vụ của tiệm.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onExitAdmin}>
          <span>← Về trang chủ</span>
        </button>
      </div>

      {/* Bộ lọc khoảng ngày */}
      <div className="ad-panel ad-filter">
        <div className="ad-seg" role="group" aria-label="Chọn khoảng ngày">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`ad-pill ${preset === p.id ? 'is-active' : ''}`}
              aria-pressed={preset === p.id}
              onClick={() => setPreset(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="ad-custom">
            <label className="ad-field">
              <span className="ad-label">Từ ngày</span>
              <input
                type="date"
                className="ad-input"
                value={custom.from}
                onChange={(e) => {
                  const from = e.target.value;
                  if (!from) return;
                  setCustom((c) => ({ from, to: c.to < from ? from : c.to }));
                }}
              />
            </label>
            <label className="ad-field">
              <span className="ad-label">Đến ngày</span>
              <input
                type="date"
                className="ad-input"
                min={custom.from}
                value={custom.to}
                onChange={(e) => {
                  const to = e.target.value;
                  if (!to) return;
                  setCustom((c) => ({ from: c.from, to: to < c.from ? c.from : to }));
                }}
              />
            </label>
          </div>
        )}

        <div className="ad-range-label">
          Đang xem: <strong>{formatRangeLabel(range.from, range.to)}</strong>
        </div>
      </div>

      {/* Số liệu */}
      <div className="ad-stats">
        <div className="ad-stat">
          <div className="ad-stat-icon"><Wallet size={20} /></div>
          <div>
            <div className="ad-stat-label">Doanh thu</div>
            <div className="ad-stat-value price">{vnd(stats.revenue)}</div>
          </div>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-icon"><Users size={20} /></div>
          <div>
            <div className="ad-stat-label">Số khách</div>
            <div className="ad-stat-value">{stats.customers} khách</div>
          </div>
        </div>
        <div className="ad-stat">
          <div className="ad-stat-icon"><Clock size={20} /></div>
          <div>
            <div className="ad-stat-label">Tổng giờ làm</div>
            <div className="ad-stat-value">{stats.busy}</div>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div className="ad-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={viewTab === t.id}
            className={`ad-tab ${viewTab === t.id ? 'is-active' : ''}`}
            onClick={() => setViewTab(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB LỊCH */}
      {viewTab === 'calendar' && (
        <>
          <div className="ad-panel">
            <h3 className="ad-panel-title">{monthInfo.title}</h3>
            <p className="ad-panel-desc">Bấm vào một ngày để xem khách của ngày đó. Con số là số khách hẹn.</p>
            <div className="ad-cal-head">
              {WEEKDAY_HEAD.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="ad-cal-grid">
              {Array.from({ length: monthInfo.lead }, (_, i) => (
                <div key={`blank-${i}`} className="ad-blank" aria-hidden="true" />
              ))}
              {monthInfo.cells.map((c) => {
                const selected = range.from === range.to && range.from === c.iso;
                const inRange = c.iso >= range.from && c.iso <= range.to;
                return (
                  <button
                    key={c.iso}
                    type="button"
                    className={`ad-day ${c.iso === today ? 'is-today' : ''} ${inRange ? 'in-range' : ''} ${selected ? 'is-selected' : ''}`}
                    onClick={() => pickDay(c.iso)}
                    aria-label={`Ngày ${c.day}, ${c.count} khách`}
                    aria-pressed={selected}
                  >
                    <span>{c.day}</span>
                    {c.count > 0 && <span className="ad-day-count">{c.count}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ad-panel">
            <h3 className="ad-panel-title">Khách hẹn</h3>
            <p className="ad-panel-desc">{formatRangeLabel(range.from, range.to)}</p>

            {groups.length === 0 ? (
              <div className="ad-empty">Chưa có khách hẹn trong khoảng này.</div>
            ) : (
              groups.map(([date, list]) => (
                <div key={date} className="ad-day-group">
                  <div className="ad-day-head">
                    <span className="ad-day-name">{formatDayLabel(date)}</span>
                    <span className="ad-day-meta">
                      {list.length} khách · <span className="price">{vnd(list.reduce((s, b) => s + b.totalPrice, 0))}</span>
                    </span>
                  </div>
                  <div className="ad-rows">
                    {list.map((b) => {
                      const names = getServiceNames(b.serviceIds, services);
                      return (
                        <div key={b.id} className="ad-row">
                          <div className="ad-time">
                            {b.startTime}
                            <small>đến {b.endTime}</small>
                          </div>
                          <div className="ad-who">
                            <div className="ad-who-name">{b.customerName}</div>
                            <div className="ad-who-svc">
                              {names} · {formatDuration(b.totalMinutes)}
                            </div>
                            {hasDigits(b.phone) ? (
                              <a className="ad-tel" href={telHref(b.phone)}>
                                <Phone size={12} />
                                {b.phone}
                              </a>
                            ) : (
                              <span className="ad-tel ad-muted">{b.phone}</span>
                            )}
                          </div>
                          <div className="ad-row-side">
                            <span className="ad-money price">{vnd(b.totalPrice)}</span>
                            <a
                              className="ad-mini"
                              href={generateGoogleCalendarUrl(b, names)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Lưu lịch hẹn này vào Google Calendar"
                            >
                              <CalendarPlus size={13} />
                              <span>Google Calendar</span>
                            </a>
                            <button
                              type="button"
                              className="ad-mini is-danger"
                              onClick={() => handleCancelBooking(b.id, b.customerName)}
                            >
                              Hủy lịch
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* TAB BẢNG GIỜ */}
      {viewTab === 'timeline' && (
        <div className="ad-panel">
          <div className="ad-header" style={{ marginBottom: 12 }}>
            <div>
              <h3 className="ad-panel-title">Bảng giờ trong ngày</h3>
              <p className="ad-panel-desc" style={{ margin: 0 }}>
                {formatRangeLabel(timelineDate, timelineDate)}. Bấm "Thêm khách" ở giờ còn trống để xếp khách tại tiệm.
              </p>
            </div>
            <div className="ad-seg">
              <input
                type="date"
                className="ad-input"
                aria-label="Chọn ngày"
                value={timelineDate}
                onChange={(e) => e.target.value && setTimelineDate(e.target.value)}
              />
              <button type="button" className="ad-pill" onClick={() => setTimelineDate(today)}>
                Hôm nay
              </button>
            </div>
          </div>

          <table className="ad-table">
            <thead>
              <tr>
                <th>Giờ</th>
                <th>Khách</th>
                <th>Dịch vụ</th>
                <th>Thời lượng</th>
                <th>Tình trạng</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {timeline.map((slot, index) => {
                if (slot.isBooked && slot.booking) {
                  const b = slot.booking;
                  return (
                    <tr key={`booked-${b.id}-${index}`} className="is-booked">
                      <td data-label="Giờ"><strong>{slot.timeRange}</strong></td>
                      <td data-label="Khách">
                        <div>{b.customerName}</div>
                        {hasDigits(b.phone) ? (
                          <a className="ad-tel" href={telHref(b.phone)}>
                            <Phone size={12} />
                            {b.phone}
                          </a>
                        ) : (
                          <span className="ad-muted">{b.phone}</span>
                        )}
                      </td>
                      <td data-label="Dịch vụ">{getServiceNames(b.serviceIds, services)}</td>
                      <td data-label="Thời lượng">{formatDuration(b.totalMinutes)}</td>
                      <td data-label="Tình trạng"><span className="ad-status is-booked">Đã có khách</span></td>
                      <td>
                        <button
                          type="button"
                          className="ad-mini is-danger"
                          onClick={() => handleCancelBooking(b.id, b.customerName)}
                        >
                          Hủy lịch
                        </button>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={`free-${slot.startTime}-${index}`}>
                    <td data-label="Giờ"><strong>{slot.timeRange}</strong></td>
                    <td className="ad-muted" data-label="Khách">—</td>
                    <td className="ad-muted" data-label="Dịch vụ">—</td>
                    <td className="ad-muted" data-label="Thời lượng">{formatDuration(slot.durationMinutes)}</td>
                    <td data-label="Tình trạng"><span className="ad-status is-free">Còn trống</span></td>
                    <td>
                      <button
                        type="button"
                        className="ad-mini"
                        onClick={() => handleOpenQuickAdd(slot.startTime, slot.durationMinutes)}
                      >
                        <PlusCircle size={13} />
                        <span>Thêm khách</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB NHẮC LỊCH */}
      {viewTab === 'reminders' && (
        <div className="ad-panel">
          <h3 className="ad-panel-title">
            Nhắc lịch
            {reminderSaved && <span className="ad-saved">Đã lưu</span>}
          </h3>
          <p className="ad-panel-desc">Chọn giờ bạn muốn được nhắc về khách hẹn.</p>
          <div className="ad-settings">
            <label className="ad-field">
              <span className="ad-label">Báo tổng hợp buổi sáng lúc</span>
              <input
                type="time"
                className="ad-input"
                value={reminder.morningTime}
                onChange={(e) => e.target.value && updateReminder({ morningTime: e.target.value })}
              />
            </label>
            <label className="ad-field">
              <span className="ad-label">Nhắc trước giờ hẹn</span>
              <select
                className="ad-input"
                value={reminder.leadMinutes}
                onChange={(e) => updateReminder({ leadMinutes: Number(e.target.value) })}
              >
                {[15, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>
                    {m} phút
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="ad-info">
            Nhắc lịch sẽ được gửi qua Google Calendar khi bạn kết nối lịch của tiệm. Trong lúc chờ, bạn vẫn có thể
            bấm "Google Calendar" ở từng khách để lưu lịch vào điện thoại.
          </div>
        </div>
      )}

      {/* TAB DỊCH VỤ */}
      {viewTab === 'services' && (
        <ServicesManager services={services} onServicesChanged={onServicesChanged} />
      )}

      {/* Thêm nhanh khách tại tiệm */}
      {quickAddModal.isOpen && (
        <div className="ad-overlay" onClick={closeQuickAdd}>
          <div className="ad-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-head">
              <h3>Thêm khách tại tiệm</h3>
              <button type="button" className="ad-x" aria-label="Đóng" onClick={closeQuickAdd}>
                <XCircle size={18} />
              </button>
            </div>
            <p className="ad-panel-desc">
              Bắt đầu lúc <strong>{quickAddModal.startTime}</strong>, {formatRangeLabel(timelineDate, timelineDate)}.
              Trống tối đa {formatDuration(quickAddModal.maxMinutes)}.
            </p>
            {quickAddError && <div className="ad-err">{quickAddError}</div>}
            <form className="ad-form" onSubmit={handleConfirmQuickAdd}>
              <label className="ad-field">
                <span className="ad-label">Tên khách</span>
                <input
                  type="text"
                  className="ad-input"
                  placeholder="Ví dụ: Chị Mai"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  autoFocus
                />
              </label>
              <label className="ad-field">
                <span className="ad-label">Số điện thoại (không bắt buộc)</span>
                <input
                  type="tel"
                  className="ad-input"
                  placeholder="09..."
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                />
              </label>
              <label className="ad-field">
                <span className="ad-label">Dịch vụ</span>
                <select
                  className="ad-input"
                  value={walkinServiceId}
                  onChange={(e) => setWalkinServiceId(e.target.value)}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {formatDuration(s.durationMinutes)} · {vnd(s.price)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="ad-actions">
                <button type="button" className="btn btn-secondary" onClick={closeQuickAdd}>
                  Đóng
                </button>
                <button type="submit" className="btn btn-primary">
                  <PlusCircle size={16} />
                  <span>Xếp lịch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
