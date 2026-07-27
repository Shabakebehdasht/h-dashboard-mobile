// Jalali date, IP/MAC masking, and other utilities
// Ported from vue-dash/src/utils/helpers.ts

import * as jalaali from 'jalaali-js';

/**
 * Format an IP address with dots as the user types (IP Masking)
 */
export function maskIP(value) {
  const digits = value.replace(/[^0-9]/g, '');
  const parts = [];
  for (let i = 0; i < digits.length && parts.length < 4; i++) {
    if (!parts[parts.length - 1]) {
      parts.push('');
    }
    if (parts[parts.length - 1].length < 3) {
      parts[parts.length - 1] += digits[i];
    } else {
      parts.push(digits[i]);
    }
  }
  return parts.join('.');
}

/**
 * Format a MAC address with colons as the user types (MAC Masking)
 */
export function maskMAC(value) {
  const hex = value.replace(/[^0-9a-fA-F]/g, '');
  const parts = [];
  for (let i = 0; i < hex.length && parts.length < 6; i++) {
    if (!parts[parts.length - 1]) {
      parts.push('');
    }
    if (parts[parts.length - 1].length < 2) {
      parts[parts.length - 1] += hex[i].toUpperCase();
    } else {
      parts.push(hex[i].toUpperCase());
    }
  }
  return parts.join(':');
}

/**
 * Convert Persian/Arabic digits to English
 */
export function persianToEnglish(str) {
  const persianMap = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };
  return str.replace(/[۰-۹٠-٩]/g, (ch) => persianMap[ch] || ch);
}

/**
 * Parse Jalali date string (YYYY/MM/DD or YYYY-MM-DD)
 */
function parseJalaliDate(jalaliStr) {
  if (!jalaliStr) return null;
  const normalized = persianToEnglish(jalaliStr);
  const cleaned = normalized.replace(/\//g, '-');
  const parts = cleaned.split('-');
  if (parts.length !== 3) return null;
  const jy = parseInt(parts[0], 10);
  const jm = parseInt(parts[1], 10);
  const jd = parseInt(parts[2], 10);
  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null;
  return { jy, jm, jd };
}

/**
 * Parse ISO/Gregorian date string
 */
function parseIsoDate(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

/**
 * Convert Jalali date (1403/06/15) to Gregorian ISO (2024-09-05)
 */
export function jalaliToIso(jalaliStr) {
  if (!jalaliStr) return '';
  const parsed = parseJalaliDate(jalaliStr);
  if (!parsed) return jalaliStr;
  try {
    const greg = jalaali.toGregorian(parsed.jy, parsed.jm, parsed.jd);
    const mm = String(greg.month).padStart(2, '0');
    const dd = String(greg.day).padStart(2, '0');
    return `${greg.year}-${mm}-${dd}`;
  } catch {
    return jalaliStr;
  }
}

/**
 * Convert Jalali date to ISO with time
 */
export function jalaliToIsoWithTime(jalaliDate, time = '00:00') {
  const iso = jalaliToIso(jalaliDate);
  if (iso === jalaliDate) return jalaliDate; // conversion failed
  return `${iso}T${time}:00`;
}

/**
 * Convert Gregorian date (2024-09-05) to Jalali (1403/06/15)
 */
export function isoToJalali(isoStr) {
  if (!isoStr) return '';
  const parsed = parseIsoDate(isoStr);
  if (!parsed) return isoStr;
  try {
    const jal = jalaali.toJalaali(parsed.year, parsed.month, parsed.day);
    const mm = String(jal.jm).padStart(2, '0');
    const dd = String(jal.jd).padStart(2, '0');
    return `${jal.jy}/${mm}/${dd}`;
  } catch {
    return isoStr;
  }
}

/**
 * Format date for display in Jalali
 */
export function formatJalali(dateStr) {
  if (!dateStr) return '-';
  const iso = parseIsoDate(dateStr);
  if (!iso) {
    // Maybe it's already Jalali
    const parsed = parseJalaliDate(dateStr);
    if (parsed) {
      const mm = String(parsed.jm).padStart(2, '0');
      const dd = String(parsed.jd).padStart(2, '0');
      return `${parsed.jy}/${mm}/${dd}`;
    }
    return dateStr;
  }
  try {
    const jal = jalaali.toJalaali(iso.year, iso.month, iso.day);
    const mm = String(jal.jm).padStart(2, '0');
    const dd = String(jal.jd).padStart(2, '0');
    return `${jal.jy}/${mm}/${dd}`;
  } catch {
    return dateStr;
  }
}

/**
 * Check if date string is Jalali
 */
export function isJalaliDate(str) {
  if (!str) return false;
  const parts = str.replace(/\//g, '-').split('-');
  if (parts.length !== 3) return false;
  const year = parseInt(parts[0], 10);
  return year >= 1200 && year <= 1500;
}

/**
 * Format date for input[type=date] (ISO)
 */
export function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  if (isJalaliDate(dateStr)) {
    return jalaliToIso(dateStr);
  }
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

/**
 * Get today's date in Jalali
 */
export function getTodayJalali() {
  const today = new Date();
  const jal = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const mm = String(jal.jm).padStart(2, '0');
  const dd = String(jal.jd).padStart(2, '0');
  return `${jal.jy}/${mm}/${dd}`;
}

/**
 * Get current Jalali month/year for calendar
 */
export function getCurrentJalaliMonth() {
  const today = new Date();
  const jal = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
  return { year: jal.jy, month: jal.jm };
}

/**
 * Days in a Jalali month
 */
export function daysInJalaliMonth(year, month) {
  // Last day of month
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  // Month 12 (Esfand) - check leap year
  const isLeap = jalaali.isLeapJalaaliYear(year);
  return isLeap ? 30 : 29;
}

/**
 * Get first day of week for Jalali month (0=Saturday, 6=Friday)
 * In Iran, week starts on Saturday
 */
export function getFirstDayOfJalaliMonth(year, month) {
  // Convert 1st of month to Gregorian, get day of week
  const greg = jalaali.toGregorian(year, month, 1);
  const date = new Date(greg.year, greg.month - 1, greg.day);
  // In Iran: Saturday=0, Sunday=1, ..., Friday=6
  // JS: Sunday=0, Monday=1, ..., Saturday=6
  const jsDay = date.getDay(); // 0=Sun
  // Convert: Sat=0, Sun=1, Mon=2, ..., Fri=6
  return (jsDay + 1) % 7;
}

/**
 * Generate calendar weeks for a Jalali month
 */
export function generateJalaliCalendar(year, month) {
  const firstDay = getFirstDayOfJalaliMonth(year, month);
  const daysInMonth = daysInJalaliMonth(year, month);
  const today = getTodayJalali();
  const [todayYear, todayMonth, todayDay] = today.split('/').map(Number);
  
  const weeks = [];
  let week = [];
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    week.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    const isToday = year === todayYear && month === todayMonth && day === todayDay;
    week.push({ day, dayStr, isToday });
    
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  
  // Fill remaining days of last week
  while (week.length > 0 && week.length < 7) {
    week.push(null);
  }
  if (week.length > 0) {
    weeks.push(week);
  }
  
  return weeks;
}

/**
 * Navigate to previous/next month
 */
export function getAdjacentJalaliMonth(year, month, delta) {
  let newMonth = month + delta;
  let newYear = year;
  
  if (newMonth < 1) {
    newMonth = 12;
    newYear -= 1;
  } else if (newMonth > 12) {
    newMonth = 1;
    newYear += 1;
  }
  
  return { year: newYear, month: newMonth };
}

export const HARDWARE_TYPE_LABELS = {
  pc: 'کامپیوتر',
  laptop: 'لپ‌تاپ',
  server: 'سرور',
};

export const NET_TYPE_LABELS = {
  wired: 'کابلی',
  wireless: 'بی‌سیم',
  both: 'هردو',
};

export const QUICK_FILTERS = [
  { label: 'لپ‌تاپ‌ها', icon: '💻', filters: { type: 'laptop' } },
  { label: 'فقط SSD', icon: '⚡', filters: { hdd: 'SSD' } },
  { label: 'رم ≥ ۱۶ گیگ', icon: '🧠', filters: { ram: '16' } },
  { label: 'علامت‌دارها', icon: '⭐', filters: { mark: 'true' } },
  { label: 'سرورها', icon: '🖥️', filters: { type: 'server' } },
];

export const TICKET_STATUS_LABELS = {
  created: 'ایجاد شده',
  forwarded: 'ارجاع داده شده',
  accepted: 'پذیرفته شده',
  completed: 'تکمیل شده',
  rejected: 'رد شده',
};

export const TICKET_PRIORITY_LABELS = {
  urgent: 'فوری',
  normal: 'معمولی',
  low: 'کم',
};

export const TICKET_STATUS_COLORS = {
  created: 'badge-info',
  forwarded: 'badge-warning',
  accepted: 'badge-primary',
  completed: 'badge-success',
  rejected: 'badge-error',
};

export const TICKET_PRIORITY_COLORS = {
  urgent: 'badge-error',
  normal: 'badge-warning',
  low: 'badge-info',
};