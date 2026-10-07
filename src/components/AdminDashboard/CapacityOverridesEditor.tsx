import { useState } from 'react';
import type { CapacityOverride } from '../../types';
import { Plus, Trash2, Calendar, Repeat, CalendarRange, Minus, Sparkles } from 'lucide-react';
import { Select } from '../ui/Select';
import { CustomDatePicker } from '../ui/CustomDatePicker';

interface Props {
  overrides: CapacityOverride[];
  onChange: (overrides: CapacityOverride[]) => void;
}

function formatDisplayDate(iso?: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return iso;
}

function formatWeekdays(days?: number[]): string {
  if (!days || days.length === 0) return 'Chưa chọn';
  if (days.length === 7) return 'Mỗi ngày (T2 – CN)';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Thứ 7 & Chủ nhật (Cuối tuần)';
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Thứ 2 đến Thứ 6 (Trong tuần)';
  const dayNames: { [k: number]: string } = {
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
    6: 'Thứ 7',
    0: 'Chủ nhật',
  };
  return days
    .slice()
    .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
    .map((d) => dayNames[d])
    .join(', ');
}

export function CapacityOverridesEditor({ overrides, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<'date' | 'dateRange' | 'weekday'>('date');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weekdays, setWeekdays] = useState<number[]>([6, 0]); // default Sat, Sun
  const [capacity, setCapacity] = useState(2);

  const handleAdd = () => {
    if (type === 'date' && !date) return;
    if (type === 'dateRange' && (!startDate || !endDate)) return;
    if (type === 'weekday' && weekdays.length === 0) return;

    const newOverride: CapacityOverride = {
      id: `ov-${Date.now()}`,
      type,
      capacity,
      date: type === 'date' ? date : undefined,
      startDate: type === 'dateRange' ? startDate : undefined,
      endDate: type === 'dateRange' ? endDate : undefined,
      weekdays: type === 'weekday' ? weekdays : undefined,
    };
    onChange([...overrides, newOverride]);
    setAdding(false);
    setDate('');
    setStartDate('');
    setEndDate('');
  };

  const remove = (id: string) => onChange(overrides.filter((o) => o.id !== id));

  const typeOptions = [
    { value: 'date', label: 'Chỉ 1 ngày cụ thể (vd: ngày lễ, ngày khai trương...)' },
    { value: 'dateRange', label: 'Khoảng ngày liên tục (từ ngày... đến ngày...)' },
    { value: 'weekday', label: 'Lặp lại theo các thứ trong tuần (vd: cuối tuần)' },
  ];

  const toggleWeekday = (day: number) => {
    if (weekdays.includes(day)) {
      setWeekdays(weekdays.filter((d) => d !== day));
    } else {
      setWeekdays([...weekdays, day]);
    }
  };

  const WEEKDAY_ITEMS = [
    { id: 1, label: 'Thứ 2' },
    { id: 2, label: 'Thứ 3' },
    { id: 3, label: 'Thứ 4' },
    { id: 4, label: 'Thứ 5' },
    { id: 5, label: 'Thứ 6' },
    { id: 6, label: 'Thứ 7' },
    { id: 0, label: 'Chủ nhật' },
  ];

  return (
    <div className="sm-capacity-section">
      <div className="sm-capacity-head">
        <div>
          <h4 className="sm-capacity-title">
            <Sparkles size={16} className="text-terracotta" />
            Giới hạn số ca / khách theo ngày đặc biệt
          </h4>
          <p className="sm-capacity-sub">
            Thiết lập số ca nhận tối đa cho ngày đông khách, cuối tuần hoặc dịp lễ tết.
          </p>
        </div>
      </div>

      {/* Hiển thị danh sách các giới hạn đã cài đặt thành 2 CỘT */}
      {overrides.length > 0 && (
        <div className="sm-capacity-grid">
          {overrides.map((ov) => (
            <div key={ov.id} className="sm-override-card">
              <div className="sm-override-icon">
                {ov.type === 'date' && <Calendar size={18} />}
                {ov.type === 'dateRange' && <CalendarRange size={18} />}
                {ov.type === 'weekday' && <Repeat size={18} />}
              </div>

              <div className="sm-override-content">
                <div className="sm-override-date">
                  {ov.type === 'date' && `Ngày ${formatDisplayDate(ov.date)}`}
                  {ov.type === 'dateRange' &&
                    `${formatDisplayDate(ov.startDate)} – ${formatDisplayDate(ov.endDate)}`}
                  {ov.type === 'weekday' && formatWeekdays(ov.weekdays)}
                </div>
                <div className="sm-override-badge">
                  Tối đa: <strong>{ov.capacity} khách / ca</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(ov.id)}
                className="sm-override-del"
                title="Xóa giới hạn này"
                aria-label="Xóa giới hạn"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Form nhập thêm giới hạn mới - mở rộng toàn bộ chiều ngang của Drawer */}
      {adding ? (
        <div className="sm-capacity-form-box">
          <div className="sm-capacity-box-header">
            <strong>Thêm quy định số khách cho ngày đặc biệt</strong>
            <span className="sm-capacity-box-hint">Điền thông tin và bấm Lưu cài đặt bên dưới</span>
          </div>

          <div className="sm-capacity-fields-grid">
            <div className="sm-field">
              <label className="sm-label">Áp dụng theo hình thức nào?</label>
              <Select
                value={type}
                options={typeOptions}
                onChange={(v) => setType(v as any)}
              />
            </div>

            <div className="sm-field">
              <label className="sm-label">Số khách nhận tối đa cùng một lúc:</label>
              <div className="sm-stepper-wide">
                <button
                  type="button"
                  className="sm-step-btn"
                  onClick={() => setCapacity(Math.max(1, capacity - 1))}
                  disabled={capacity <= 1}
                  aria-label="Giảm"
                >
                  <Minus size={16} />
                </button>
                <span className="sm-step-val-wide">
                  <strong>{capacity}</strong> khách / ca
                </span>
                <button
                  type="button"
                  className="sm-step-btn"
                  onClick={() => setCapacity(Math.min(10, capacity + 1))}
                  disabled={capacity >= 10}
                  aria-label="Tăng"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Hàng chọn ngày/thứ */}
          <div className="sm-capacity-dates-row">
            {type === 'date' && (
              <div className="sm-field">
                <label className="sm-label">Chọn ngày áp dụng:</label>
                <CustomDatePicker value={date} onChange={setDate} />
              </div>
            )}

            {type === 'dateRange' && (
              <div className="sm-daterange-grid">
                <div className="sm-field">
                  <label className="sm-label">Từ ngày:</label>
                  <CustomDatePicker value={startDate} onChange={setStartDate} />
                </div>
                <div className="sm-field">
                  <label className="sm-label">Đến ngày:</label>
                  <CustomDatePicker
                    value={endDate}
                    onChange={setEndDate}
                    min={startDate}
                  />
                </div>
              </div>
            )}

            {type === 'weekday' && (
              <div className="sm-field">
                <label className="sm-label">Chọn các ngày trong tuần được áp dụng:</label>
                <div className="sm-weekday-pills">
                  {WEEKDAY_ITEMS.map((item) => {
                    const isSelected = weekdays.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleWeekday(item.id)}
                        className={`sm-weekday-pill${isSelected ? ' is-selected' : ''}`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2 nút bo tròn: Lưu cài đặt & Hủy */}
          <div className="sm-capacity-form-actions">
            <button
              type="button"
              className="btn btn-primary sm-pill-btn"
              onClick={handleAdd}
            >
              Lưu cài đặt này
            </button>
            <button
              type="button"
              className="btn btn-secondary sm-pill-btn"
              onClick={() => setAdding(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="sm-capacity-add-trigger"
          onClick={() => setAdding(true)}
        >
          <Plus size={17} />
          <span>Thêm ngày có giới hạn số khách riêng</span>
        </button>
      )}
    </div>
  );
}
