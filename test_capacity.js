const service = {
  capacity: 1,
  capacityOverrides: [
    { type: 'date', date: '2026-10-10', capacity: 3 }
  ]
};
function getCapacity(service, dateIso) {
  let capacity = service.capacity || 1;
  if (service.capacityOverrides && service.capacityOverrides.length > 0) {
    const targetDate = new Date(dateIso);
    const dayOfWeek = targetDate.getDay();
    const dateOverride = service.capacityOverrides.find(o => o.type === 'date' && o.date === dateIso);
    if (dateOverride) return dateOverride.capacity;
  }
  return capacity;
}
console.log(getCapacity(service, '2026-10-10'));
