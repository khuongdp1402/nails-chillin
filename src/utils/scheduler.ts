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
 * Lấy số khách có thể nhận tối đa cho dịch vụ trong 1 khung giờ vào ngày chỉ định
 * (Tự hiểu 1 khách 1 thợ trong 1 ca, mở N khách tương ứng có N thợ takecare)
 */
export function getServiceCapacityOnDate(service: Service, dateIso: string): number {
  const defaultCapacity = service.capacity || 1;
  if (!service.capacityOverrides || service.capacityOverrides.length === 0) {
    return defaultCapacity;
  }

  // Tách năm, tháng, ngày an toàn tuyệt đối với timezone trình duyệt
  const [y, m, d] = dateIso.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  const dayOfWeek = targetDate.getDay(); // 0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7

  // 1. Ưu tiên ngày cụ thể chính xác nhất (date)
  const dateOverride = service.capacityOverrides.find(
    (o) => o.type === 'date' && o.date === dateIso
  );
  if (dateOverride) return dateOverride.capacity;

  // 2. Kế đến là khoảng ngày (dateRange)
  const rangeOverride = service.capacityOverrides.find(
    (o) =>
      o.type === 'dateRange' &&
      o.startDate &&
      o.endDate &&
      dateIso >= o.startDate &&
      dateIso <= o.endDate
  );
  if (rangeOverride) return rangeOverride.capacity;

  // 3. Kế đến là theo thứ trong tuần lặp lại (weekday)
  const weekdayOverride = service.capacityOverrides.find(
    (o) => o.type === 'weekday' && o.weekdays && o.weekdays.includes(dayOfWeek)
  );
  if (weekdayOverride) return weekdayOverride.capacity;

  return defaultCapacity;
}

/**
 * Kiểm tra xem trong khoảng thời gian [slotStart, slotEnd), dịch vụ serviceId có bị kín chỗ hay không.
 *
 * Bản chất vận hành salon:
 * - 1 khách 1 thợ trong 1 ca làm việc.
 * - capacityLimit = số khách tối đa phục vụ cùng 1 khung giờ (mặc định hoặc theo ngày đặc biệt).
 * - Một khung giờ [slotStart, slotEnd) chỉ bị xem là KÍN LỊCH khi và chỉ khi TẠI MỘT THỜI ĐIỂM BẤT KỲ t trong ca,
 *   số lượng khách đang phục vụ đạt tới capacityLimit.
 *
 * Thuật toán kiểm tra đỉnh điểm đồng thời (Peak Concurrency Check):
 * - Concurrency chỉ tăng lên tại slotStart hoặc tại thời điểm bắt đầu của một booking khác trong ca.
 * - Do đó kiểm tra tại các mốc thời gian này đảm bảo chính xác 100%, không bị lỗi cộng dồn sai các ca nối tiếp nhau.
 */
export function isCapacityExceeded(
  slotStart: number,
  slotEnd: number,
  serviceId: string,
  capacityLimit: number,
  activeBookings: Booking[]
): { exceeded: boolean; peakBusyCount: number; peakTimeStr?: string } {
  // Lọc các booking có dịch vụ này đang diễn ra và có giao với [slotStart, slotEnd)
  const overlappingBookings = activeBookings.filter((b) => {
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);
    const hasService = !b.serviceIds || b.serviceIds.length === 0 || b.serviceIds.includes(serviceId);
    return hasService && isOverlapping(slotStart, slotEnd, bStart, bEnd);
  });

  // Nếu tổng số booking chạm vào khoảng này còn ít hơn số thợ, chắc chắn luôn có thợ rảnh
  if (overlappingBookings.length < capacityLimit) {
    return { exceeded: false, peakBusyCount: overlappingBookings.length };
  }

  // Thu thập các mốc thời gian kiểm tra: slotStart và các bStart nằm trong [slotStart, slotEnd)
  const checkPoints = new Set<number>([slotStart]);
  for (const b of overlappingBookings) {
    const bStart = timeToMinutes(b.startTime);
    if (bStart >= slotStart && bStart < slotEnd) {
      checkPoints.add(bStart);
    }
  }

  const sortedPoints = Array.from(checkPoints).sort((a, b) => a - b);
  let peakBusyCount = 0;
  let peakTime = slotStart;

  for (const t of sortedPoints) {
    let busyCount = 0;
    for (const b of overlappingBookings) {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      // Khách đang được làm tại phút t (từ bStart đến trước bEnd)
      if (bStart <= t && t < bEnd) {
        busyCount++;
      }
    }

    if (busyCount > peakBusyCount) {
      peakBusyCount = busyCount;
      peakTime = t;
    }

    if (busyCount >= capacityLimit) {
      return {
        exceeded: true,
        peakBusyCount: busyCount,
        peakTimeStr: minutesToTime(t),
      };
    }
  }

  return { exceeded: false, peakBusyCount, peakTimeStr: minutesToTime(peakTime) };
}

/**
 * Sinh danh sách các khung giờ trong ngày và kiểm tra tính khả dụng
 * dựa trên tổng thời lượng khách đã chọn, có tính toán sức chứa thợ theo ngày.
 */
export function generateAvailableSlots(
  date: string,
  totalDurationMinutes: number,
  allBookings: Booking[],
  selectedServiceIds: string[] = [],
  servicesList: Service[] = []
): TimeSlot[] {
  const openMinutes = timeToMinutes(SALON_HOURS.openTime);
  const closeMinutes = timeToMinutes(SALON_HOURS.closeTime);
  const step = SALON_HOURS.slotStepMinutes;

  const activeBookingsOnDate = allBookings.filter(
    (b) => b.date === date && b.status !== 'cancelled'
  );

  const slots: TimeSlot[] = [];

  for (let current = openMinutes; current < closeMinutes; current += step) {
    const slotStart = current;
    const slotEnd = slotStart + (totalDurationMinutes > 0 ? totalDurationMinutes : step);

    const timeStr = minutesToTime(slotStart);
    const endTimeStr = minutesToTime(slotEnd);

    if (slotEnd > closeMinutes) {
      slots.push({
        timeStr,
        endTimeStr,
        isAvailable: false,
        conflictReason: `Vượt quá giờ đóng cửa (${SALON_HOURS.closeTime})`,
      });
      continue;
    }

    let hasConflict = false;
    let conflictReason = '';

    if (selectedServiceIds.length > 0 && servicesList.length > 0) {
      for (const sId of selectedServiceIds) {
        const service = servicesList.find((s) => s.id === sId);
        if (!service) continue;

        const capacityLimit = getServiceCapacityOnDate(service, date);
        const check = isCapacityExceeded(slotStart, slotEnd, sId, capacityLimit, activeBookingsOnDate);

        if (check.exceeded) {
          hasConflict = true;
          conflictReason = `Dịch vụ "${service.name}" đã kín lịch (tối đa ${capacityLimit} khách/khung giờ) lúc ${check.peakTimeStr}`;
          break;
        }
      }
    } else {
      // Fallback khi chưa chọn dịch vụ cụ thể: 1 khách 1 ca
      const conflictingBooking = activeBookingsOnDate.find((b) => {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return isOverlapping(slotStart, slotEnd, bStart, bEnd);
      });
      if (conflictingBooking) {
        hasConflict = true;
        conflictReason = `Trùng với lịch hẹn (${conflictingBooking.startTime} – ${conflictingBooking.endTime})`;
      }
    }

    slots.push({
      timeStr,
      endTimeStr,
      isAvailable: !hasConflict,
      conflictReason: hasConflict ? conflictReason : undefined,
    });
  }

  return slots;
}

/**
 * Kiểm tra xem một lịch đặt cụ thể có bị xung đột với các lịch hiện có hay không (có tính số khách/khung giờ)
 */
export function checkBookingConflict(
  date: string,
  startTime: string,
  endTime: string,
  allBookings: Booking[],
  excludeBookingId?: string,
  serviceIds: string[] = [],
  servicesList: Service[] = []
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

  if (serviceIds.length > 0 && servicesList.length > 0) {
    for (const sId of serviceIds) {
      const service = servicesList.find((s) => s.id === sId);
      if (!service) continue;

      const capacityLimit = getServiceCapacityOnDate(service, date);
      const check = isCapacityExceeded(reqStart, reqEnd, sId, capacityLimit, activeBookings);

      if (check.exceeded) {
        return {
          hasConflict: true,
          reason: `Dịch vụ "${service.name}" đã kín lịch (tối đa ${capacityLimit} khách/khung giờ) lúc ${check.peakTimeStr}`,
        };
      }
    }
  } else {
    // Fallback
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
