import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ImageOff, Minus, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react';
import type { CapacityOverride, Service, ServiceCategory } from '../../types';
import { getStoredServices, saveStoredServices } from '../../data/services';
import { SERVICE_BADGES } from '../../data/badges';
import { formatDuration } from '../../utils/scheduler';
import { PriceInput } from '../ui/PriceInput';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { ImageUpload } from '../ui/ImageUpload';
import { CapacityOverridesEditor } from './CapacityOverridesEditor';
import '../../styles/services-manager.css';

export interface ServicesManagerProps {
  services: Service[];
  onServicesChanged: (next: Service[]) => void;
}

const TABS: { id: ServiceCategory; label: string; empty: string }[] = [
  { id: 'nail', label: 'Nail', empty: 'Chưa có dịch vụ nail nào. Bấm “Thêm dịch vụ” để tạo món đầu tiên nhé.' },
  { id: 'headspa', label: 'Gội đầu', empty: 'Chưa có dịch vụ gội đầu nào. Bấm “Thêm dịch vụ” để tạo món đầu tiên nhé.' },
];

const DURATION_OPTIONS = Array.from({ length: 16 }, (_, i) => {
  const m = (i + 1) * 15;
  return { value: String(m), label: formatDuration(m) };
});
const NO_BADGE = '__none__';
const BADGE_OPTIONS = [
  { value: NO_BADGE, label: 'Không có nhãn' },
  ...SERVICE_BADGES.map((b) => ({ value: b, label: b })),
];
const DESC_MAX = 120;

interface Draft {
  name: string;
  durationMinutes: number;
  price: number;
  capacity: number;
  capacityOverrides: CapacityOverride[];
  description: string;
  badge: string;
  imageUrl: string;
  showOnLanding: boolean;
}

function toDraft(s?: Service): Draft {
  return {
    name: s?.name ?? '',
    durationMinutes: s?.durationMinutes ?? 60,
    price: s?.price ?? 0,
    capacity: s?.capacity ?? 1,
    capacityOverrides: s?.capacityOverrides ?? [],
    description: (s?.description ?? '').slice(0, DESC_MAX),
    badge: s?.badge && SERVICE_BADGES.includes(s.badge) ? s.badge : NO_BADGE,
    imageUrl: s?.imageUrl ?? '',
    showOnLanding: s?.showOnLanding !== false,
  };
}

/** Lưu và kiểm tra lại: saveStoredServices nuốt lỗi quota nên so sánh với bản đã lưu. */
function persist(next: Service[]): boolean {
  try {
    saveStoredServices(next);
    return JSON.stringify(getStoredServices()) === JSON.stringify(next);
  } catch {
    return false;
  }
}

const SAVE_FAIL_MSG =
  'Bộ nhớ trình duyệt đã đầy nên chưa lưu được. Bạn thử dùng ảnh nhỏ hơn hoặc dán đường dẫn ảnh thay vì tải ảnh lên nhé.';

interface DrawerProps {
  editing: Service | null;
  category: ServiceCategory;
  onClose: () => void;
  onSubmit: (draft: Draft) => string | null;
}

function ServiceDrawer({ editing, category, onClose, onSubmit }: DrawerProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(editing ?? undefined));
  const initialRef = useRef(JSON.stringify(toDraft(editing ?? undefined)));
  const dirty = JSON.stringify(draft) !== initialRef.current;
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [saveError, setSaveError] = useState('');
  const [closing, setClosing] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const requestClose = () => {
    setClosing(true);
    window.setTimeout(onClose, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
  };
  const closeRef = useRef(requestClose);
  closeRef.current = requestClose;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!draft.name.trim()) next.name = 'Bạn nhập tên dịch vụ giúp mình nhé.';
    if (draft.price <= 0) next.price = 'Bạn nhập giá tiền của dịch vụ nhé.';
    setErrors(next);
    if (next.name) {
      nameRef.current?.focus();
      return;
    }
    if (next.price) {
      panelRef.current?.querySelector<HTMLInputElement>('#sm-price')?.focus();
      return;
    }
    const err = onSubmit(draft);
    if (err) setSaveError(err);
  };

  const catLabel = category === 'nail' ? 'Nail' : 'Gội đầu';

  return (
    <div
      className={`sm-overlay${closing ? ' is-closing' : ''}`}
      onMouseDown={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div
        className="sm-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sm-drawer-title"
        ref={panelRef}
      >
        <header className="sm-drawer-head">
          <div>
            <span className="sm-drawer-tag">{catLabel}</span>
            <h3 id="sm-drawer-title">{editing ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}</h3>
          </div>
          <button type="button" className="sm-icon-btn" onClick={requestClose} aria-label="Đóng">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <form className="sm-form" onSubmit={submit} noValidate>
          <div className="sm-field">
            <label htmlFor="sm-name" className="sm-label">Tên dịch vụ</label>
            <input
              id="sm-name"
              ref={nameRef}
              className={`ui-input${errors.name ? ' is-invalid' : ''}`}
              value={draft.name}
              maxLength={80}
              placeholder="Ví dụ: Sơn gel thạch Hàn Quốc"
              aria-invalid={!!errors.name}
              onChange={(e) => {
                set('name', e.target.value);
                if (errors.name) setErrors((x) => ({ ...x, name: undefined }));
              }}
            />
            {errors.name && <p className="sm-error" role="alert">{errors.name}</p>}
          </div>

          <div className="sm-row">
            <div className="sm-field">
              <label htmlFor="sm-duration" className="sm-label">Thời gian làm</label>
              <Select
                id="sm-duration"
                value={String(draft.durationMinutes)}
                options={DURATION_OPTIONS}
                onChange={(v) => set('durationMinutes', Number(v))}
              />
            </div>
            <div className="sm-field">
              <label htmlFor="sm-price" className="sm-label">Giá</label>
              <PriceInput
                id="sm-price"
                value={draft.price}
                invalid={!!errors.price}
                describedBy={errors.price ? 'sm-price-err' : undefined}
                onChange={(v) => {
                  set('price', v);
                  if (errors.price) setErrors((x) => ({ ...x, price: undefined }));
                }}
              />
              {errors.price && <p className="sm-error" id="sm-price-err" role="alert">{errors.price}</p>}
            </div>
          </div>

          <div className="sm-row">
            <div className="sm-field">
              <span className="sm-label" id="sm-cap-label">Số thợ phục vụ cùng lúc</span>
              <div className="sm-stepper" role="group" aria-labelledby="sm-cap-label">
                <button
                  type="button"
                  className="sm-step-btn"
                  onClick={() => set('capacity', Math.max(1, draft.capacity - 1))}
                  disabled={draft.capacity <= 1}
                  aria-label="Giảm số thợ"
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <output className="sm-step-val" aria-live="polite">{draft.capacity} thợ</output>
                <button
                  type="button"
                  className="sm-step-btn"
                  onClick={() => set('capacity', Math.min(5, draft.capacity + 1))}
                  disabled={draft.capacity >= 5}
                  aria-label="Tăng số thợ"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
              <p className="sm-hint">1 thợ takecare 1 khách (1-on-1). Mặc định cho ngày thường.</p>
            </div>
            <div className="sm-field">
              <label htmlFor="sm-badge" className="sm-label">Nhãn nổi bật</label>
              <Select
                id="sm-badge"
                value={draft.badge}
                options={BADGE_OPTIONS}
                onChange={(v) => set('badge', v)}
              />
            </div>
          </div>

          {/* Phần cài đặt giới hạn nâng cao: Mở rộng 100% bằng drawer, hiển thị 2 cột */}
          <div className="sm-field sm-field-full">
            <CapacityOverridesEditor 
              overrides={draft.capacityOverrides} 
              onChange={v => set('capacityOverrides', v)} 
            />
          </div>

          <div className="sm-row sm-row-bottom">
            <div className="sm-field">
              <label htmlFor="sm-desc" className="sm-label">Mô tả ngắn</label>
              <textarea
                id="sm-desc"
                className="ui-input sm-textarea"
                rows={3}
                maxLength={DESC_MAX}
                value={draft.description}
                placeholder="Một hai câu để khách hiểu dịch vụ này gồm những gì"
                onChange={(e) => set('description', e.target.value.slice(0, DESC_MAX))}
              />
              <span className="sm-counter" aria-live="polite">{draft.description.length}/{DESC_MAX}</span>

              <div className="sm-toggle-field" style={{ marginTop: 10 }}>
                <Toggle
                  checked={draft.showOnLanding}
                  onChange={(v) => set('showOnLanding', v)}
                  label="Hiện trên trang chủ"
                />
              </div>
            </div>

            <div className="sm-field">
              <span className="sm-label">Ảnh dịch vụ</span>
              <div className="sm-image-box">
                <ImageUpload value={draft.imageUrl} onChange={(v) => set('imageUrl', v)} />
              </div>
            </div>
          </div>

          {saveError && <p className="sm-error sm-save-error" role="alert">{saveError}</p>}

          <footer className={`sm-bar${dirty ? ' is-ready' : ''}`}>
            <div className="sm-bar-inner">
              <span className="sm-bar-note" aria-live="polite">
                {dirty ? 'Bạn có thay đổi chưa lưu' : 'Chưa có thay đổi'}
              </span>
              <div className="sm-bar-btns">
                <button type="button" className="sm-btn-pill-cancel" onClick={requestClose}>
                  Hủy
                </button>
                <button type="submit" className="sm-btn-pill-save">
                  {editing ? 'Lưu thay đổi' : 'Thêm dịch vụ'}
                </button>
              </div>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}

export function ServicesManager({ services, onServicesChanged }: ServicesManagerProps) {
  const [tab, setTab] = useState<ServiceCategory>('nail');
  const [drawer, setDrawer] = useState<{ editing: Service | null } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const counts = useMemo(
    () => ({
      nail: services.filter((s) => s.category === 'nail').length,
      headspa: services.filter((s) => s.category === 'headspa').length,
    }),
    [services],
  );
  const list = services.filter((s) => s.category === tab);
  const tabInfo = TABS.find((t) => t.id === tab)!;

  const flash = (kind: 'ok' | 'err', text: string) => {
    setNotice({ kind, text });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), kind === 'ok' ? 3000 : 8000);
  };

  const commit = (next: Service[]): boolean => {
    if (!persist(next)) {
      flash('err', SAVE_FAIL_MSG);
      return false;
    }
    onServicesChanged(next);
    return true;
  };

  const handleSubmit = (draft: Draft): string | null => {
    const editing = drawer?.editing ?? null;
    const base: Service = {
      id: editing?.id ?? `svc-${Date.now()}`,
      name: draft.name.trim(),
      category: editing?.category ?? tab,
      durationMinutes: draft.durationMinutes,
      price: draft.price,
      description: draft.description.trim(),
      imageUrl: draft.imageUrl,
      badge: draft.badge === NO_BADGE ? undefined : draft.badge,
      popular: editing?.popular,
      showOnLanding: draft.showOnLanding,
      capacity: draft.capacity,
      capacityOverrides: draft.capacityOverrides,
    };
    const next = editing ? services.map((s) => (s.id === editing.id ? base : s)) : [...services, base];
    if (!persist(next)) return SAVE_FAIL_MSG;
    onServicesChanged(next);
    setDrawer(null);
    flash('ok', editing ? 'Đã lưu thay đổi.' : 'Đã thêm dịch vụ mới.');
    return null;
  };

  const toggleLanding = (s: Service, v: boolean) => {
    commit(services.map((x) => (x.id === s.id ? { ...x, showOnLanding: v } : x)));
  };

  const remove = (s: Service) => {
    setConfirmId(null);
    if (commit(services.filter((x) => x.id !== s.id))) flash('ok', `Đã xóa “${s.name}”.`);
  };

  return (
    <section className="sm-root" aria-label="Quản lý dịch vụ">
      <div className="sm-top">
        <div className="sm-tabs" role="tablist" aria-label="Nhóm dịch vụ">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`sm-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls="sm-panel"
              className={`sm-tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => {
                setTab(t.id);
                setConfirmId(null);
              }}
            >
              {t.label} <span className="sm-tab-count">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary sm-add" onClick={() => setDrawer({ editing: null })}>
          <Plus size={18} aria-hidden="true" /> Thêm dịch vụ
        </button>
      </div>

      {notice && (
        <p className={`sm-notice is-${notice.kind}`} role={notice.kind === 'err' ? 'alert' : 'status'}>
          {notice.text}
        </p>
      )}

      <div id="sm-panel" role="tabpanel" aria-labelledby={`sm-tab-${tab}`}>
        {list.length === 0 ? (
          <div className="sm-empty">
            <Sparkles size={28} aria-hidden="true" />
            <p>{tabInfo.empty}</p>
          </div>
        ) : (
          <ul className="sm-list">
            {list.map((s) => (
              <li key={s.id} className="sm-item">
                <div className="sm-thumb">
                  {s.imageUrl ? <img src={s.imageUrl} alt="" loading="lazy" /> : <ImageOff size={24} aria-hidden="true" />}
                </div>
                <div className="sm-info">
                  <strong className="sm-name">{s.name}</strong>
                  <div className="sm-meta">
                    <span>{formatDuration(s.durationMinutes)}</span>
                    <span className="price">{s.price.toLocaleString('vi-VN')}đ</span>
                    {s.badge && <span className="chip sm-badge">{s.badge}</span>}
                    {(s.capacity ?? 1) > 1 && (
                      <span className="sm-cap">{s.capacity} thợ ({s.capacity} khách cùng lúc)</span>
                    )}
                  </div>
                </div>
                <div className="sm-actions">
                  <Toggle
                    checked={s.showOnLanding !== false}
                    onChange={(v) => toggleLanding(s, v)}
                    label="Hiện trên trang chủ"
                  />
                  {confirmId === s.id ? (
                    <div className="sm-confirm" role="group" aria-label={`Xóa ${s.name}?`}>
                      <span>Xóa món này?</span>
                      <button type="button" className="sm-confirm-yes" onClick={() => remove(s)}>Xóa</button>
                      <button type="button" className="sm-confirm-no" onClick={() => setConfirmId(null)}>Giữ lại</button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="sm-icon-btn"
                        onClick={() => setDrawer({ editing: s })}
                        aria-label={`Sửa ${s.name}`}
                        title="Sửa"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="sm-icon-btn is-danger"
                        onClick={() => setConfirmId(s.id)}
                        aria-label={`Xóa ${s.name}`}
                        title="Xóa"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {drawer && (
        <ServiceDrawer
          editing={drawer.editing}
          category={drawer.editing?.category ?? tab}
          onClose={() => setDrawer(null)}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}

export default ServicesManager;
