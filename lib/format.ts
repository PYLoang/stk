export function money(value: number | string) {
  return "$" + Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function num(value: number | string) {
  return Number(value).toLocaleString("en-US");
}

export function dateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function fmtDate(value: Date) {
  const d = value.getDate().toString().padStart(2, "0");
  const m = value.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  return `${d} ${m}`;
}

export function fmtTime(value: Date) {
  return value.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}
