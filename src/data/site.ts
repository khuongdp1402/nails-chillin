export const SITE = {
  name: 'CHILLIN Nail & Spa',
  phoneDisplay: '0901 234 567',
  zaloPhone: '0901234567',
  instagramHandle: 'chillin.nailspa',
  instagramUrl: 'https://instagram.com/chillin.nailspa',
  address: '123 Đường Hoa Hồng, Quận 1, TP. Hồ Chí Minh',
  hours: '08:30 – 20:30 · Mở cửa mỗi ngày',
};

export function instagramLink(): string {
  return SITE.instagramUrl;
}

export function zaloLink(message?: string): string {
  void message;
  return SITE.instagramUrl;
}
