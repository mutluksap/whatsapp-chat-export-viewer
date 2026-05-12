import type { Dict } from "./i18n";

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDateSeparator(d: Date, dict: Dict): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(d, today)) return dict.today;
  if (sameDay(d, yesterday)) return dict.yesterday;
  const diffDays = Math.floor(
    (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays >= 0 && diffDays < 7) return dict.weekdays[d.getDay()];
  return `${d.getDate()} ${dict.months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function colorFromName(name: string): string {
  const colors = [
    "#06cf9c",
    "#ff7e2b",
    "#ff7da2",
    "#a566ff",
    "#5bb8ff",
    "#ffce42",
    "#56d364",
    "#f55e7e",
    "#5b9bff",
    "#ff9f43",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return colors[h % colors.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function sameDayPublic(a: Date, b: Date): boolean {
  return sameDay(a, b);
}
