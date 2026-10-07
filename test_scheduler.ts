import { generateAvailableSlots, timeToMinutes } from './src/utils/scheduler.ts';

const services = [
  { id: 's1', name: 'Sơn Gel Thạch', durationMinutes: 90, capacity: 1, capacityOverrides: [{ type: 'date', date: '2026-10-10', capacity: 3 }] }
];
const bookings = [
  { id: '1', date: '2026-10-10', startTime: '10:00', endTime: '11:30', serviceIds: ['s1'], status: 'confirmed' },
  { id: '2', date: '2026-10-10', startTime: '10:00', endTime: '11:30', serviceIds: ['s1'], status: 'confirmed' },
  { id: '3', date: '2026-10-10', startTime: '10:00', endTime: '13:00', serviceIds: ['s1'], status: 'completed' },
];

const slots = generateAvailableSlots('2026-10-10', 90, bookings as any, ['s1'], services as any);
console.log(slots.find(s => s.timeStr === '10:00'));
