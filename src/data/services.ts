import type { Service, LookbookItem } from '../types';

export const DEFAULT_SERVICES: Service[] = [
  // --- MODULE 1: LÀM MÓNG NGHỆ THUẬT (NAIL ART & SPA) ---
  {
    id: 'son-gel-thach',
    name: 'Sơn Gel Thạch Phong Cách Hàn Quốc',
    category: 'nail',
    durationMinutes: 60,
    price: 180000,
    description: 'Sơn gel thạch trong trẻo, lớp bóng tráng gương bền màu 3-4 tuần, dưỡng móng keratin tự nhiên.',
    imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    badge: 'Hot trend',
    popular: true,
    showOnLanding: true,
  },
  {
    id: 'dap-mong-ombre',
    name: 'Đắp Móng Gel / Bột Form Ombre Chuẩn',
    category: 'nail',
    durationMinutes: 90,
    price: 320000,
    description: 'Nối móng đắp gel định hình form thang/hạnh nhân, tán màu ombre chuyển sắc tinh tế, nhẹ tay không cộm.',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    badge: 'Bán chạy',
    popular: true,
    showOnLanding: true,
  },
  {
    id: 've-mong-dinh-da',
    name: 'Vẽ Móng Nghệ Thuật & Đính Đá Design',
    category: 'nail',
    durationMinutes: 30,
    price: 120000,
    description: 'Thiết kế hoa nổi 3D, mắt mèo kim cương, vân đá cẩm thạch và đính đá pha lê Swarovski cao cấp.',
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    badge: 'Được yêu thích',
    popular: true,
    showOnLanding: true,
  },
  {
    id: 'up-mong-thiet-ke',
    name: 'Úp Móng Tip Thiết Kế Cao Cấp',
    category: 'nail',
    durationMinutes: 60,
    price: 250000,
    description: 'Úp móng phom chuẩn ôm sát chân móng, độ bền cao, không gây tổn thương bề mặt móng thật.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    badge: 'Ưu đãi',
    showOnLanding: false,
  },

  // --- MODULE 2: GỘI ĐẦU DƯỠNG SINH & TRỊ LIỆU THẢO DƯỢC ---
  {
    id: 'goi-duong-sinh-bo-ket',
    name: 'Gội Đầu Dưỡng Sinh Bồ Kết Thảo Dược',
    category: 'headspa',
    durationMinutes: 45,
    price: 150000,
    description: 'Nấu nước bồ kết tươi, sả chanh, vỏ bưởi, hà thủ ô tự nhiên. Làm sạch sâu da đầu, giảm rụng tóc và gàu.',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    badge: 'Thư giãn',
    popular: true,
    showOnLanding: true,
  },
  {
    id: 'goi-duong-sinh-trung-hoa',
    name: 'Gội Dưỡng Sinh Trung Hoa Đả Thông Kinh Lạc',
    category: 'headspa',
    durationMinutes: 60,
    price: 250000,
    description: 'Ấn huyệt đạo vùng đầu, xông tai bài độc, tưới nước tuần hoàn chữ U thư giãn, đả thông tuần hoàn máu não.',
    imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
    badge: 'Bán chạy',
    popular: true,
    showOnLanding: true,
  },
  {
    id: 'combo-goi-massage-co-vai-gay',
    name: 'Combo Gội Dưỡng Sinh + Massage Cổ Vai Gáy',
    category: 'headspa',
    durationMinutes: 90,
    price: 380000,
    description: 'Liệu trình toàn diện: Gội thảo dược + Massage bấm huyệt cổ vai gáy, đi đá nóng bazan giải tỏa căng thẳng.',
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    badge: 'Cao cấp',
    popular: true,
    showOnLanding: true,
  },
  {
    id: 'goi-hoang-cung-thai-doc',
    name: 'Liệu Trình Hoàng Cung Phục Hồi Thải Độc Da Đầu',
    category: 'headspa',
    durationMinutes: 75,
    price: 320000,
    description: 'Ủ bùn khoáng hữu cơ, đắp mặt nạ ngọc trai thảo mộc, chải lược kinh lạc sừng trâu, xông mắt thảo mộc.',
    imageUrl: 'https://images.unsplash.com/photo-1512290900672-1f55b92750e3?auto=format&fit=crop&w=800&q=80',
    badge: 'Mới',
    showOnLanding: false,
  },
];

// Lookbook Bộ Sưu Tập Ảnh Mẫu Thực Tế (Showcase cho khách hàng chọn)
export const LOOKBOOK_GALLERY: LookbookItem[] = [
  {
    id: 'lookbook-1',
    title: 'Mẫu Mắt Mèo Kim Cương Tráng Gương',
    category: 'nail',
    serviceId: 'son-gel-thach',
    imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    description: 'Hiệu ứng ánh sáng đổi màu dưới ánh đèn tiệc sang trọng.',
    tags: ['Mắt mèo', 'Tráng gương', 'Hàn Quốc'],
  },
  {
    id: 'lookbook-2',
    title: 'Ombre Hồng Thạch Nude Tự Nhiên',
    category: 'nail',
    serviceId: 'dap-mong-ombre',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    description: 'Tone da sáng nhẹ nhàng, thanh lịch phù hợp cho công sở và dạo phố.',
    tags: ['Ombre', 'Nude thạch', 'Tự nhiên'],
  },
  {
    id: 'lookbook-3',
    title: 'Nail Art Đính Đá Swarovski & Vân Đá',
    category: 'nail',
    serviceId: 've-mong-dinh-da',
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    description: 'Mẫu móng cô dâu và sự kiện nổi bật với kỹ thuật vẽ vân đá cẩm thạch.',
    tags: ['Đính đá', 'Vân đá', 'Party'],
  },
  {
    id: 'lookbook-4',
    title: 'Vòm Nước Tuần Hoàn Dưỡng Sinh Chữ U',
    category: 'headspa',
    serviceId: 'goi-duong-sinh-trung-hoa',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    description: 'Dòng nước thảo mộc ấm áp tuần hoàn liên tục kích thích da đầu thư thái.',
    tags: ['Vòm nước U', 'Thảo dược', 'Kinh lạc'],
  },
  {
    id: 'lookbook-5',
    title: 'Massage Cổ Vai Gáy & Đá Nóng Bazan',
    category: 'headspa',
    serviceId: 'combo-goi-massage-co-vai-gay',
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    description: 'Đánh tan nhức mỏi, giải tỏa áp lực văn phòng sau ngày dài làm việc.',
    tags: ['Đá nóng', 'Cổ vai gáy', 'Trị liệu'],
  },
  {
    id: 'lookbook-6',
    title: 'Nồi Nấu Thảo Dược Bồ Kết Tươi',
    category: 'headspa',
    serviceId: 'goi-duong-sinh-bo-ket',
    imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
    description: 'Nấu mới mỗi ngày từ nguyên liệu tự nhiên không hóa chất tạo bọt công nghiệp.',
    tags: ['Bồ kết', 'Hà thủ ô', 'Organic'],
  },
];

export const SALON_HOURS = {
  openTime: '08:30',
  closeTime: '20:30',
  slotStepMinutes: 30,
};

// Quản lý Dịch vụ trong LocalStorage (cho phép Chủ tiệm CRUD trực tiếp)
export const SERVICES_STORAGE_KEY = 'aura_salon_services_v3';

export function getStoredServices(): Service[] {
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SERVICES;
  }
}

export function saveStoredServices(services: Service[]): void {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  } catch (e) {
    console.error('Lỗi lưu services:', e);
  }
}

