export interface ReminderSettings {
  morningTime: string; // HH:mm
  leadMinutes: number; // 15 | 30 | 45 | 60
}

const KEY = 'aura_reminder_settings_v1';
export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  morningTime: '07:00',
  leadMinutes: 30,
};

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_REMINDER_SETTINGS };
    const p = JSON.parse(raw) as Partial<ReminderSettings>;
    const morningTime =
      typeof p.morningTime === 'string' && /^\d{2}:\d{2}$/.test(p.morningTime)
        ? p.morningTime
        : DEFAULT_REMINDER_SETTINGS.morningTime;
    const leadMinutes =
      typeof p.leadMinutes === 'number' && [15, 30, 45, 60].includes(p.leadMinutes)
        ? p.leadMinutes
        : DEFAULT_REMINDER_SETTINGS.leadMinutes;
    return { morningTime, leadMinutes };
  } catch {
    return { ...DEFAULT_REMINDER_SETTINGS };
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // bộ nhớ đầy hoặc bị chặn: bỏ qua
  }
}
