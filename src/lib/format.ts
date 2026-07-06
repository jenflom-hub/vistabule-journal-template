// Join a list of names into a natural-language string:
//   []                     -> ""
//   ["Lou"]                -> "Lou"
//   ["Alex", "Sam"]        -> "Alex & Sam"
//   ["Alex", "Sam", "Jo"]  -> "Alex, Sam & Jo"
export function joinNames(names: readonly string[] = []): string {
  const list = names.filter((n) => n && n.trim());
  if (list.length <= 1) return list[0] ?? '';
  return `${list.slice(0, -1).join(', ')} & ${list[list.length - 1]}`;
}

// Format a trip's date or date range in a friendly, compact way:
//   single day      -> "June 14, 2026"
//   same month      -> "June 12–14, 2026"
//   same year       -> "June 30 – July 2, 2026"
//   spanning years  -> "December 30, 2026 – January 1, 2027"
export function formatDateRange(start: string, end?: string | null): string {
  const s = new Date(`${start}T00:00:00`);
  const full: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  if (!end || end === start) {
    return s.toLocaleDateString('en-US', full);
  }

  const e = new Date(`${end}T00:00:00`);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();

  if (sameMonth) {
    const month = s.toLocaleDateString('en-US', { month: 'long' });
    return `${month} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  }

  if (sameYear) {
    const sPart = s.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const ePart = e.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return `${sPart} – ${ePart}, ${s.getFullYear()}`;
  }

  return `${s.toLocaleDateString('en-US', full)} – ${e.toLocaleDateString('en-US', full)}`;
}
