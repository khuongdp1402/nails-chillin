import type { Booking, Service, TimeSlot, DailyScheduleSlot } from '../types';
import { SALON_HOURS } from '../data/services';

/**
 * Chuyển chuỗi "HH:mm" thành số phút trong ngày (tính từ 00:00)
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Chuyển số phút trong ngày thành chuỗi "HH:mm"
 */
export function minutesToTime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Định dạng thời lượng (phút) sang tiếng Việt tự nhiên
 * Ví dụ: 60 -> "1 giờ", 90 -> "1,5 giờ", 120 -> "2 giờ", 150 -> "2 giờ 30 phút"
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0 phút';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs > 0 && mins === 0) {
    return `${hrs} giờ`;
  }
  if (hrs > 0 && mins === 30) {
    return `${hrs},5 giờ`;
  }
  if (hrs > 0 && mins > 0) {
    return `${hrs} giờ ${mins} phút`;
  }
  return `${mins} phút`;
}

/**
 * Kiểm tra 2 khoảng thời gian [startA, endA) và [startB, endB) có giao nhau (bị trùng) hay không
 * Công thức: startA < endB && endA > startB
 */
export function isOverlapping(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && endA > startB;
}

/**
 * Sinh danh sách các khung giờ trong ngày và kiểm tra tính khả dụng
 * dựa trên tổng thời lượng khách đã chọn.
 */
export function generateAvailableSlots(
  date: string,
  totalDurationMinutes: number,
  allBookings: Booking[]
): TimeSlot[] {
  const openMinutes = timeToMinutes(SALON_HOURS.openTime);
  const closeMinutes = timeToMinutes(SALON_HOURS.closeTime);
  const step = SALON_HOURS.slotStepMinutes;

  // Lọc các lịch đang hoạt động (không tính lịch đã hủy) trong ngày được chọn
  const activeBookingsOnDate = allBookings.filter(
    (b) => b.date === date && b.status !== 'cancelled'
  );

  const slots: TimeSlot[] = [];

  for (let current = openMinutes; current < closeMinutes; current += step) {
    const slotStart = current;
    const slotEnd = slotStart + (totalDurationMinutes > 0 ? totalDurationMinutes : step);

    const timeStr = minutesToTime(slotStart);
    const endTimeStr = minutesToTime(slotEnd);

    // Điều kiện 1: Kết thúc không được vượt quá giờ đóng cửa
    if (slotEnd > closeMinutes) {
      slots.push({
        timeStr,
        endTimeStr,
        isAvailable: false,
        conflictReason: `Vượt quá giờ đóng cửa (${SALON_HOURS.closeTime})`,
      });
      continue;
    }

    // Điều kiện 2: Khoảng [slotStart, slotEnd) không được giao với bất kỳ lịch đã đặt nào
    const conflictingBooking = activeBookingsOnDate.find((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return isOverlapping(slotStart, slotEnd, bStart, bEnd);
    });

    if (conflictingBooking) {
      slots.push({
        timeStr,
        endTimeStr,
        isAvailable: false,
        conflictReason: `Trùng với lịch hẹn (${conflictingBooking.startTime} – ${conflictingBooking.endTime})`,
        conflictingBooking,
      });
    } else {
      slots.push({
        timeStr,
        endTimeStr,
        isAvailable: true,
      });
    }
  }

  return slots;
}

/**
 * Kiểm tra xem một lịch đặt cụ thể có bị xung đột với các lịch hiện có hay không
 */
export function checkBookingConflict(
  date: string,
  startTime: string,
  endTime: string,
  allBookings: Booking[],
  excludeBookingId?: string
): { hasConflict: boolean; conflictingBooking?: Booking; reason?: string } {
  const reqStart = timeToMinutes(startTime);
  const reqEnd = timeToMinutes(endTime);
  const closeMinutes = timeToMinutes(SALON_HOURS.closeTime);

  if (reqEnd > closeMinutes) {
    return {
      hasConflict: true,
      reason: `Thời gian kết thúc (${endTime}) vượt quá giờ đóng cửa (${SALON_HOURS.closeTime})`,
    };
  }

  const activeBookings = allBookings.filter(
    (b) => b.date === date && b.status !== 'cancelled' && b.id !== excludeBookingId
  );

  const conflict = activeBookings.find((b) => {
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);
    return isOverlapping(reqStart, reqEnd, bStart, bEnd);
  });

  if (conflict) {
    return {
      hasConflict: true,
      conflictingBooking: conflict,
      reason: `Đã có khách (${conflict.customerName}) đặt từ ${conflict.startTime} đến ${conflict.endTime}`,
    };
  }

  return { hasConflict: false };
}

/**
 * Xây dựng dòng thời gian (Timeline) cho chủ tiệm xem trong một ngày
 * Tự động chia các khoảng thời gian Đã có khách và Còn trống
 */
export function buildDailyTimeline(
  date: string,
  allBookings: Booking[]
): DailyScheduleSlot[] {
  const openMinutes = timeToMinutes(SALON_HOURS.openTime);
  const closeMinutes = timeToMinutes(SALON_HOURS.closeTime);

  // Lọc và sắp xếp các lịch theo giờ bắt đầu
  const dayBookings = allBookings
    .filter((b) => b.date === date && b.status !== 'cancelled')
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const timeline: DailyScheduleSlot[] = [];
  let currentMinutes = openMinutes;

  for (const booking of dayBookings) {
    const bStart = timeToMinutes(booking.startTime);
    const bEnd = timeToMinutes(booking.endTime);

    // Nếu có khoảng trống trước lịch này
    if (bStart > currentMinutes) {
      timeline.push({
        timeRange: `${minutesToTime(currentMinutes)} – ${minutesToTime(bStart)}`,
        startTime: minutesToTime(currentMinutes),
        endTime: minutesToTime(bStart),
        isBooked: false,
        durationMinutes: bStart - currentMinutes,
      });
    }

    // Khoảng thời gian đã đặt của khách
    timeline.push({
      timeRange: `${booking.startTime} – ${booking.endTime}`,
      startTime: booking.startTime,
      endTime: booking.endTime,
      isBooked: true,
      booking,
      durationMinutes: bEnd - bStart,
    });

    currentMinutes = Math.max(currentMinutes, bEnd);
  }

  // Nếu còn khoảng trống từ lịch cuối cùng đến giờ đóng cửa
  if (currentMinutes < closeMinutes) {
    timeline.push({
      timeRange: `${minutesToTime(currentMinutes)} – ${minutesToTime(closeMinutes)}`,
      startTime: minutesToTime(currentMinutes),
      endTime: minutesToTime(closeMinutes),
      isBooked: false,
      durationMinutes: closeMinutes - currentMinutes,
    });
  }

  return timeline;
}

/**
 * Chuyển danh sách ID dịch vụ thành tên chuỗi nối nhau
 */
export function getServiceNames(serviceIds: string[], servicesList: Service[]): string {
  return serviceIds
    .map((id) => servicesList.find((s) => s.id === id)?.name || id)
    .join(' + ');
}
