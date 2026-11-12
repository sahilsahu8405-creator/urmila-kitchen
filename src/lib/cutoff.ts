import { BusinessClosure, BusinessSchedule } from '../types/database.types';

// Convert current time to Asia/Kolkata date object
export function getNowInIST(): Date {
  const now = new Date();
  // Get time in UTC
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  // IST is UTC + 5:30 (330 minutes)
  return new Date(utc + (330 * 60000));
}

export interface CutoffCountdown {
  hours: number;
  minutes: number;
  seconds: number;
  isPastCutoff: boolean;
  targetCutoffDate: Date;
  nextEligibleDeliveryDate: string; // YYYY-MM-DD
  nextEligibleDeliveryFormatted: string; // e.g. "Tomorrow, May 16"
}

export function parseCutoffTimeString(cutoffStr: string = '20:00:00'): { hours: number; minutes: number; seconds: number } {
  const parts = cutoffStr.split(':').map(Number);
  return {
    hours: parts[0] || 20,
    minutes: parts[1] || 0,
    seconds: parts[2] || 0,
  };
}

export function calculateCutoffCountdown(
  cutoffTimeStr: string = '20:00:00',
  schedules: BusinessSchedule[] = [],
  closures: BusinessClosure[] = []
): CutoffCountdown {
  const nowIST = getNowInIST();
  const { hours, minutes, seconds } = parseCutoffTimeString(cutoffTimeStr);

  const cutoffToday = new Date(nowIST);
  cutoffToday.setHours(hours, minutes, seconds, 0);

  const isPastCutoff = nowIST.getTime() >= cutoffToday.getTime();

  // If before cutoff, minimum advance is tomorrow; if after, minimum is day after tomorrow
  let daysToAdd = isPastCutoff ? 2 : 1;
  let targetDate = new Date(nowIST);
  targetDate.setDate(nowIST.getDate() + daysToAdd);

  // Validate date against closures/schedules (advance until an open day is found, up to 14 days)
  let attempts = 0;
  while (attempts < 14) {
    const dateStr = formatDateToYYYYMMDD(targetDate);
    if (isDateOpenForDelivery(dateStr, schedules, closures)) {
      break;
    }
    targetDate.setDate(targetDate.getDate() + 1);
    attempts++;
  }

  // Calculate remaining time for today's cutoff (or next day's cutoff if already passed)
  const countdownTarget = isPastCutoff
    ? new Date(cutoffToday.getTime() + 24 * 60 * 60 * 1000)
    : cutoffToday;

  const diffMs = Math.max(0, countdownTarget.getTime() - nowIST.getTime());
  const diffSecTotal = Math.floor(diffMs / 1000);

  const remHours = Math.floor(diffSecTotal / 3600);
  const remMinutes = Math.floor((diffSecTotal % 3600) / 60);
  const remSeconds = diffSecTotal % 60;

  const nextEligibleDeliveryDate = formatDateToYYYYMMDD(targetDate);

  // Format label: "Tomorrow, [Month] [Day]" or "[DayOfWeek], [Month] [Day]"
  const tomorrowIST = new Date(nowIST);
  tomorrowIST.setDate(nowIST.getDate() + 1);
  const isTomorrow = formatDateToYYYYMMDD(tomorrowIST) === nextEligibleDeliveryDate;

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const formattedDate = targetDate.toLocaleDateString('en-US', options);
  const nextEligibleDeliveryFormatted = isTomorrow
    ? `Tomorrow, ${formattedDate}`
    : `${targetDate.toLocaleDateString('en-US', { weekday: 'short' })}, ${formattedDate}`;

  return {
    hours: remHours,
    minutes: remMinutes,
    seconds: remSeconds,
    isPastCutoff,
    targetCutoffDate: countdownTarget,
    nextEligibleDeliveryDate,
    nextEligibleDeliveryFormatted,
  };
}

export function formatDateToYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDateOpenForDelivery(
  dateStr: string,
  schedules: BusinessSchedule[] = [],
  closures: BusinessClosure[] = []
): boolean {
  // Check special opening override first (overrides everything)
  const specialOpening = closures.find(
    c => c.closure_type === 'special_opening' &&
         c.is_open_override &&
         dateStr >= c.start_date &&
         dateStr <= c.end_date
  );
  if (specialOpening) return true;

  // Check closure / holiday ranges
  const isClosed = closures.some(
    c => (c.closure_type === 'single_closure' || c.closure_type === 'holiday_range') &&
         dateStr >= c.start_date &&
         dateStr <= c.end_date
  );
  if (isClosed) return false;

  // Check weekly schedule
  if (schedules.length > 0) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun
    const daySchedule = schedules.find(s => s.day_of_week === dayOfWeek);
    if (daySchedule && !daySchedule.is_open) {
      return false;
    }
  }

  return true;
}

