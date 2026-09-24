import type { Service } from '../types';
import { formatDuration } from './scheduler';

export interface PriceHint {
  price: number;
  minutes: number;
}

/** Giá và thời gian thấp nhất của từng nhóm, tính từ danh sách dịch vụ đang lưu. */
export function getMinHints(services: Service[]): {
  nail: PriceHint | null;
  headspa: PriceHint | null;
  both: PriceHint | null;
} {
  const min = (cat: Service['category']): PriceHint | null => {
    const list = services.filter((s) => s.category === cat);
    if (list.length === 0) return null;
    return {
      price: Math.min(...list.map((s) => s.price)),
      minutes: Math.min(...list.map((s) => s.durationMinutes)),
    };
  };
  const nail = min('nail');
  const headspa = min('headspa');
  const both = nail && headspa ? { price: nail.price + headspa.price, minutes: nail.minutes + headspa.minutes } : null;
  return { nail, headspa, both };
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}

/** Ví dụ: "Từ 150.000đ · 45 phút" */
export function formatHint(h: PriceHint | null): string {
  return h ? `Từ ${formatPrice(h.price)} · ${formatDuration(h.minutes)}` : '';
}
