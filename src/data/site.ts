export const SITE = {
  name: 'CHILLIN Nail & Spa',
  phoneDisplay: '0901 234 567',
  zaloPhone: '0901234567',
  address: '123 Đường Hoa Hồng, Quận 1, TP. Hồ Chí Minh',
  hours: '08:30 – 20:30 · Mở cửa mỗi ngày',
};

export function zaloLink(message?: string): string {
  // zalo.me không hỗ trợ điền sẵn tin nhắn qua URL; tham số message dành cho tương lai.
  void message;
  return `https://zalo.me/${SITE.zaloPhone}`;
}
