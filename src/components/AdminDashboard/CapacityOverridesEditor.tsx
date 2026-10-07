import { useState } from 'react';
import type { CapacityOverride } from '../../types';
import { Plus, Trash2 } from 'lucide-react';
import { Select } from '../ui/Select';
import { CustomDatePicker } from '../ui/CustomDatePicker';

interface Props {
  overrides: CapacityOverride[];
  onChange: (overrides: CapacityOverride[]) => void;
}

export function CapacityOverridesEditor({ overrides, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<'date' | 'dateRange' | 'weekday'>('date');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weekdays, setWeekdays] = useState<number[]>([0, 6]); // default Sun, Sat
  const [capacity, setCapacity] = useState(1);

  const handleAdd = () => {
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
  };

  const remove = (id: string) => onChange(overrides.filter(o => o.id !== id));

  const typeOptions = [
    { value: 'date', label: 'Theo ngày cụ thể' },
    { value: 'dateRange', label: 'Nhiều ngày liên tục' },
    { value: 'weekday', label: 'Theo thứ trong tuần' },
  ];

  const toggleWeekday = (day: number) => {
    if (weekdays.includes(day)) {
      setWeekdays(weekdays.filter(d => d !== day));
    } else {
      setWeekdays([...weekdays, day]);
    }
  };

  return (
    <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
      <label className="sm-label" style={{ marginBottom: 8, display: 'block' }}>Cài đặt giới hạn nâng cao (Tùy chọn)</label>
      
      {overrides.length > 0 && (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {overrides.map((ov) => (
            <div key={ov.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 8, fontSize: '0.9rem' }}>
              <div>
                {ov.type === 'date' && <span>Ngày: {ov.date}</span>}
                {ov.type === 'dateRange' && <span>Từ: {ov.startDate} - Đến: {ov.endDate}</span>}
                {ov.type === 'weekday' && <span>Thứ: {ov.weekdays?.map(d => d === 0 ? 'CN' : `T${d+1}`).join(', ')}</span>}
                <strong style={{ marginLeft: 8, color: 'var(--slate-blue-primary)' }}>➔ Nhận {ov.capacity} khách</strong>
              </div>
              <button type="button" onClick={() => remove(ov.id)} className="sm-icon-btn is-danger" style={{ padding: 4 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8 }}>
          <div style={{ marginBottom: 8 }}>
            <Select value={type} options={typeOptions} onChange={(v) => setType(v as any)} />
          </div>
          
          {type === 'date' && (
            <div style={{ marginBottom: 8 }}>
              <CustomDatePicker value={date} onChange={setDate} />
            </div>
          )}
          {type === 'dateRange' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              <CustomDatePicker value={startDate} onChange={setStartDate} />
              <CustomDatePicker value={endDate} onChange={setEndDate} min={startDate} />
            </div>
          )}
          {type === 'weekday' && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
              {[1,2,3,4,5,6,0].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleWeekday(d)}
                  style={{
                    padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem', cursor: 'pointer',
                    background: weekdays.includes(d) ? 'var(--slate-blue-primary)' : '#fff',
                    color: weekdays.includes(d) ? '#fff' : '#333',
                    border: '1px solid var(--border)'
                  }}
                >
                  {d === 0 ? 'CN' : `T${d+1}`}
                </button>
              ))}
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: '0.9rem' }}>Số khách tối đa:</span>
            <input type="number" min="0" max="20" className="ui-input" value={capacity} onChange={e => setCapacity(Number(e.target.value))} style={{ width: 80 }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-primary" onClick={handleAdd} style={{ padding: '6px 12px', fontSize: '0.9rem' }}>Lưu cài đặt</button>
            <button type="button" className="btn btn-secondary" onClick={() => setAdding(false)} style={{ padding: '6px 12px', fontSize: '0.9rem' }}>Hủy</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-secondary" onClick={() => setAdding(true)} style={{ width: '100%', padding: '6px 12px', fontSize: '0.9rem', justifyContent: 'center' }}>
          <Plus size={16} /> Thêm giới hạn đặc biệt
        </button>
      )}
    </div>
  );
}
