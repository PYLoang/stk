export function money(value: number | string) {
  return "$" + Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function decimalForStorage(value: number | string, digits = 10) {
  return Number(Number(value).toFixed(digits));
}

export function decimalForDisplay(value: number | string, digits = 2) {
  return Number(value).toFixed(digits);
}

export function hasMaxFractionDigits(value: number, digits = 2) {
  const multiplier = 10 ** digits;
  return Math.abs(value * multiplier - Math.round(value * multiplier)) < Number.EPSILON * 100;
}

export function num(value: number | string) {
  return Number(value).toLocaleString("en-US");
}

export function stockQty(value: number | string, unit?: string | null) {
  return `${num(value)}${unit ? ` ${unit}` : ""}`;
}

export function fmtDate(value: Date) {
  const d = value.getDate().toString().padStart(2, "0");
  const m = (value.getMonth() + 1).toString().padStart(2, "0");
  const y = value.getFullYear();
  return `${d}/${m}/${y}`;
}

export function fmtTime(value: Date) {
  const h = value.getHours().toString().padStart(2, "0");
  const m = value.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function fmtDateTime(value: Date) {
  return `${fmtDate(value)} ${fmtTime(value)}`;
}

export const dateTime = fmtDateTime;
