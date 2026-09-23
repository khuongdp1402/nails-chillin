import type { Booking } from '../types';
import { INITIAL_MOCK_BOOKINGS } from '../data/services';
import { checkBookingConflict } from './scheduler';

const STORAGE_KEY = 'aura_nail_bookings_v1';
const BROADCAST_CHANNEL_NAME = 'aura_nail_sync_channel';

// Khởi tạo BroadcastChannel để đồng bộ tức thời giữa các tab trình duyệt
let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported or error:', e);
}

/**
 * Lấy danh sách toàn bộ các lịch hẹn đã lưu
 */
export function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Khởi tạo dữ liệu mẫu ban đầu
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_BOOKINGS));
      return INITIAL_MOCK_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Lỗi khi đọc bookings từ localStorage:', e);
    return INITIAL_MOCK_BOOKINGS;
  }
}

/**
 * Lưu danh sách bookings vào localStorage và phát sự kiện broadcast
 */
export function saveBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    if (channel) {
      channel.postMessage({ type: 'BOOKINGS_UPDATED', timestamp: Date.now() });
    }
  } catch (e) {
    console.error('Lỗi khi lưu bookings vào localStorage:', e);
  }
}

/**
 * Khôi phục lại dữ liệu mẫu 25/09/2026 ban đầu
 */
export function resetBookingsToDefault(): Booking[] {
  saveBookings(INITIAL_MOCK_BOOKINGS);
  return INITIAL_MOCK_BOOKINGS;
}

/**
 * Thử đặt lịch với cơ chế Atomic Check (phòng chống 2 khách đặt cùng lúc)
 */
export function attemptCreateBooking(
  bookingInput: Omit<Booking, 'id' | 'createdAt' | 'status'>
): {
  success: boolean;
  booking?: Booking;
  error?: string;
} {
  // 1. Luôn đọc dữ liệu mới nhất trực tiếp từ storage (tránh dùng cache cũ)
  const currentBookings = getStoredBookings();

  // 2. Kiểm tra xung đột thời gian với các lịch hiện có
  const conflictCheck = checkBookingConflict(
    bookingInput.date,
    bookingInput.startTime,
    bookingInput.endTime,
    currentBookings
  );

  // 3. Nếu bị trùng -> Chặn và báo lỗi theo đúng yêu cầu
  if (conflictCheck.hasConflict) {
    return {
      success: false,
      error: 'Khung giờ này vừa có người đặt. Vui lòng chọn khung giờ khác.',
    };
  }

  // 4. Nếu khung giờ an toàn -> Tạo lịch và lưu lại
  const newBooking: Booking = {
    ...bookingInput,
    id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const updatedBookings = [...currentBookings, newBooking];
  saveBookings(updatedBookings);

  return {
    success: true,
    booking: newBooking,
  };
}

/**
 * Hủy lịch hẹn
 */
export function cancelBooking(bookingId: string): boolean {
  const currentBookings = getStoredBookings();
  const updatedBookings = currentBookings.map((b) =>
    b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
  );
  saveBookings(updatedBookings);
  return true;
}

/**
 * Đăng ký lắng nghe thay đổi dữ liệu từ các tab trình duyệt khác
 */
export function subscribeToBookingUpdates(onUpdate: () => void): () => void {
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onUpdate();
    }
  };

  const handleBroadcastMessage = (event: MessageEvent) => {
    if (event.data?.type === 'BOOKINGS_UPDATED') {
      onUpdate();
    }
  };

  window.addEventListener('storage', handleStorageEvent);
  if (channel) {
    channel.addEventListener('message', handleBroadcastMessage);
  }

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
    if (channel) {
      channel.removeEventListener('message', handleBroadcastMessage);
    }
  };
}
