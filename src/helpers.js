export function dateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function prettyDate(key) {
    return new Date(`${key}T00:00:00`).toLocaleDateString("uk-UA", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

export function shortDate(key) {
    return new Date(`${key}T00:00:00`).toLocaleDateString("uk-UA", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
    });
}

export function normalizePhone(raw) {
  const cleaned = raw.replace(/[\s\-()]/g, "");
  if (/^\+380\d{9}$/.test(cleaned)) return cleaned;
  if (/^380\d{9}$/.test(cleaned)) return `+${cleaned}`;
  if (/^0\d{9}$/.test(cleaned)) return `+38${cleaned}`;
  return null;
}

export function bookingDateTime(b) {
    return new Date(`${b.date}Т${b.time}:00`);
}