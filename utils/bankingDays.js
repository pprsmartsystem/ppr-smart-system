/**
 * Indian Banking Day Utility
 * Excludes: Sundays, 2nd & 4th Saturdays, Government/Bank holidays
 */

// RBI declared bank holidays for 2025 (national + major state holidays)
const BANK_HOLIDAYS_2025 = new Set([
  '2025-01-01', // New Year's Day
  '2025-01-14', // Makar Sankranti / Pongal
  '2025-01-26', // Republic Day
  '2025-02-19', // Chhatrapati Shivaji Maharaj Jayanti
  '2025-03-14', // Holi (2nd day)
  '2025-03-31', // Id-ul-Fitr (Eid)
  '2025-04-10', // Mahavir Jayanti
  '2025-04-14', // Dr. Ambedkar Jayanti / Tamil New Year
  '2025-04-18', // Good Friday
  '2025-05-01', // Maharashtra Day / Labour Day
  '2025-06-07', // Id-ul-Zuha (Bakrid)
  '2025-07-06', // Muharram
  '2025-08-15', // Independence Day
  '2025-08-27', // Janmashtami
  '2025-09-05', // Milad-un-Nabi (Prophet's Birthday)
  '2025-10-02', // Gandhi Jayanti / Dussehra
  '2025-10-20', // Diwali (Laxmi Puja)
  '2025-10-21', // Diwali (Balipratipada)
  '2025-11-05', // Guru Nanak Jayanti
  '2025-11-15', // Jharkhand Foundation Day
  '2025-12-25', // Christmas Day
]);

const BANK_HOLIDAYS_2026 = new Set([
  '2026-01-01', // New Year's Day
  '2026-01-26', // Republic Day
  '2026-03-20', // Holi
  '2026-04-02', // Mahavir Jayanti
  '2026-04-03', // Good Friday
  '2026-04-14', // Dr. Ambedkar Jayanti
  '2026-05-01', // Labour Day
  '2026-08-15', // Independence Day
  '2026-10-02', // Gandhi Jayanti
  '2026-10-19', // Diwali
  '2026-11-24', // Guru Nanak Jayanti
  '2026-12-25', // Christmas Day
]);

/**
 * Returns YYYY-MM-DD string in IST for a given Date object
 */
function toISTDateString(date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // en-CA gives YYYY-MM-DD
}

/**
 * Get IST date parts for a given Date object
 */
function getISTDate(date) {
  const ist = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return {
    year: ist.getFullYear(),
    month: ist.getMonth() + 1, // 1-12
    day: ist.getDate(),
    dayOfWeek: ist.getDay(), // 0=Sun, 6=Sat
    date: ist,
  };
}

/**
 * Check if a date is a 2nd or 4th Saturday (IST)
 * RBI rule: 2nd and 4th Saturdays of every month are bank holidays
 */
function isSecondOrFourthSaturday(date) {
  const { dayOfWeek, day } = getISTDate(date);
  if (dayOfWeek !== 6) return false; // not Saturday
  const weekNumber = Math.ceil(day / 7);
  return weekNumber === 2 || weekNumber === 4;
}

/**
 * Check if a date is a bank holiday
 */
function isBankHoliday(date) {
  const dateStr = toISTDateString(date);
  return BANK_HOLIDAYS_2025.has(dateStr) || BANK_HOLIDAYS_2026.has(dateStr);
}

/**
 * Check if a date is a Sunday
 */
function isSunday(date) {
  return getISTDate(date).dayOfWeek === 0;
}

/**
 * Main check: is today a valid Indian banking day?
 * Returns { isBankingDay, reason }
 */
export function checkIsBankingDay(date = new Date()) {
  if (isSunday(date)) {
    return { isBankingDay: false, reason: 'Sunday — banks are closed' };
  }
  if (isSecondOrFourthSaturday(date)) {
    const { day } = getISTDate(date);
    const weekNum = Math.ceil(day / 7);
    return { isBankingDay: false, reason: `${weekNum === 2 ? '2nd' : '4th'} Saturday — RBI bank holiday` };
  }
  if (isBankHoliday(date)) {
    return { isBankingDay: false, reason: 'Government/bank holiday' };
  }
  return { isBankingDay: true, reason: 'Banking day' };
}

/**
 * Get the next valid banking day from a given date
 */
export function getNextBankingDay(from = new Date()) {
  const next = new Date(from);
  next.setDate(next.getDate() + 1);
  while (!checkIsBankingDay(next).isBankingDay) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

/**
 * Get next settlement run time (10:30 AM IST on next banking day)
 */
export function getNextSettlementTime(from = new Date()) {
  const nextDay = getNextBankingDay(from);
  // Set to 10:30 AM IST = 05:00 UTC
  nextDay.setUTCHours(5, 0, 0, 0);
  return nextDay;
}
