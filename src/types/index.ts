export type ServiceCategory = 'nail' | 'headspa';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number; // in minutes (e.g. 45, 60, 90)
  price: number; // in VND
  description: string;
  imageUrl: string;
  badge?: string; // e.g. "Hot Trend", "Bán chạy", "Thư giãn"
  popular?: boolean;
  showOnLanding?: boolean; // undefined = true
  capacity?: number; // Số nhân viên (thợ) phục vụ cùng lúc (1 thợ takecare 1 khách), mặc định 1
  capacityOverrides?: CapacityOverride[]; // Cấu hình số thợ theo ngày/khoảng ngày/thứ
}

export interface CapacityOverride {
  id: string;
  type: 'date' | 'dateRange' | 'weekday';
  startDate?: string; // for dateRange
  endDate?: string;   // for dateRange
  date?: string;      // for single date
  weekdays?: number[]; // for weekday (0=Sun, 1=Mon, ..., 6=Sat)
  capacity: number; // Số nhân viên (thợ) phục vụ cùng lúc cho ngày đặc biệt
}

export interface LookbookItem {
  id: string;
  title: string;
  category: ServiceCategory;
  imageUrl: string;
  serviceId: string;
  description: string;
  tags: string[];
}

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  serviceIds: string[];
  totalMinutes: number;
  totalPrice: number;
  status: BookingStatus;
  note?: string;
  createdAt: string;
  staffId?: string; // mặc định 'owner'
  reminderMorningSent?: boolean;
  reminder30mSent?: boolean;
}

export interface TimeSlot {
  timeStr: string;
  endTimeStr: string;
  isAvailable: boolean;
  conflictReason?: string;
  conflictingBooking?: Booking;
}

export interface DailyScheduleSlot {
  timeRange: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  booking?: Booking;
  durationMinutes: number;
}

export type CalendarViewMode = 'calendar' | 'timeline';
