import type { Booking } from '../types';
import { SITE } from '../data/site';

/**
 * Tạo URL mở Google Calendar thêm lịch hẹn vào tài khoản cá nhân
 */
export function generateGoogleCalendarUrl(booking: Booking, serviceSummary: string): string {
  // Chuyển date và time thành định dạng YYYYMMDDTHHmmssZ
  const cleanDate = booking.date.replace(/-/g, '');
  const startHours = booking.startTime.replace(':', '');
  const endHours = booking.endTime.replace(':', '');

  const startIso = `${cleanDate}T${startHours}00`;
  const endIso = `${cleanDate}T${endHours}00`;

  const title = encodeURIComponent(`[CHILLIN Spa] Lịch hẹn làm đẹp: ${booking.customerName}`);
  const details = encodeURIComponent(
    `Lịch hẹn dịch vụ: ${serviceSummary}\nKhách hàng: ${booking.customerName}\nSố điện thoại: ${booking.phone}\nThời gian: ${booking.startTime} - ${booking.endTime} (${booking.date})\nTổng thanh toán: ${booking.totalPrice.toLocaleString('vi-VN')} đ\nGhi chú: ${booking.note || 'Không có'}`
  );
  const location = encodeURIComponent(`${SITE.name} - ${SITE.address}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

/**
 * Tải file .ics chuẩn cho Apple Calendar / Outlook / Điện thoại di động
 */
export function downloadIcsFile(booking: Booking, serviceSummary: string): void {
  const cleanDate = booking.date.replace(/-/g, '');
  const startHours = booking.startTime.replace(':', '');
  const endHours = booking.endTime.replace(':', '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CHILLIN Nail & Spa//VN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:chillin-booking-${booking.id}@chillin.vn`,
    `DTSTAMP:${cleanDate}T000000Z`,
    `DTSTART:${cleanDate}T${startHours}00`,
    `DTEND:${cleanDate}T${endHours}00`,
    `SUMMARY:[CHILLIN Spa] Hẹn làm đẹp: ${booking.customerName}`,
    `DESCRIPTION:Dịch vụ: ${serviceSummary} \\n Khách hàng: ${booking.customerName} \\n SĐT: ${booking.phone}`,
    `LOCATION:${SITE.name}\\, ${SITE.address.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Nhắc lịch hẹn làm đẹp tại CHILLIN Spa sau 30 phút nữa',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `lich-hen-chillin-${booking.customerName}-${booking.date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sinh mẫu tin nhắn Nhắc hẹn buổi sáng (Gửi Zalo / SMS cho khách)
 */
export function generateMorningReminderText(booking: Booking, serviceSummary: string): string {
  return `Chào ${booking.customerName}, CHILLIN Nail & Spa xin phép nhắc bạn có lịch hẹn ${serviceSummary} vào lúc ${booking.startTime} hôm nay (${booking.date}). 
Tiệm đã chuẩn bị chu đáo để đón bạn. Nếu cần thay đổi thời gian, bạn vui lòng nhắn lại cho tiệm nhé!
📍 Địa chỉ: 128 Đường Hoa Hồng, Q.1. Hotline: 0988 123 456. Chúc bạn một ngày tốt lành! ✨`;
}

/**
 * Sinh mẫu tin nhắn Nhắc hẹn trước 30 phút (Gửi Zalo / SMS / Gọi điện)
 */
export function generate30mReminderText(booking: Booking, serviceSummary: string): string {
  return `Chào ${booking.customerName}, lịch hẹn ${serviceSummary} của bạn tại CHILLIN Spa sẽ bắt đầu sau 30 phút nữa (lúc ${booking.startTime}). 
Kỹ thuật viên đã sẵn sàng đón bạn rồi ạ. Hẹn gặp bạn tại tiệm nhé! 🌸`;
}
