export type RangePreset = 'today' | 'week' | 'month' | 'custom';

const pad = (n: number) => n.toString().padStart(2, '0');

/** Date -> YYYY-MM-DD theo giờ địa phương */
export function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** YYYY-MM-DD -> Date (giữa trưa địa phương, tránh lệch múi giờ) */
export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

export function todayIso(): string {
  return toIso(new Date());
}

export function getRange(
  preset: RangePreset,
  custom?: { from: string; to: string }
): { from: string; to: string } {
  const now = new Date();
  if (preset === 'today') {
    const t = toIso(now);
    return { from: t, to: t };
  }
  if (preset === 'week') {
    const offset = (now.getDay() + 6) % 7; // Thứ 2 = 0
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset + 6);
    return { from: toIso(monday), to: toIso(sunday) };
  }
  if (preset === 'month') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toIso(first), to: toIso(last) };
  }
  const from = custom?.from || toIso(now);
  const to = custom?.to && custom.to >= from ? custom.to : from;
  return { from, to };
}

export function enumerateDays(from: string, to: string): string[] {
  const days: string[] = [];
  if (!from || !to || to < from) return days;
  const cur = parseIso(from);
  const end = parseIso(to);
  let guard = 0;
  while (cur <= end && guard < 800) {
    days.push(toIso(cur));
    cur.setDate(cur.getDate() + 1);
    guard++;
  }
  return days;
}

const fmt = (iso: string) => {
  const d = parseIso(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const WEEKDAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function formatDayLabel(iso: string): string {
  const d = parseIso(iso);
  return `${WEEKDAYS[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

export function formatRangeLabel(from: string, to: string): string {
  if (from === to) return `${WEEKDAYS[parseIso(from).getDay()]}, ${fmt(from)}`;
  return `Từ ${fmt(from)} đến ${fmt(to)}`;
}
