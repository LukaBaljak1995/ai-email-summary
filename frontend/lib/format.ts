function formatDateValue(value: string) {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatDisplayDate(value: string) {
  return formatDateValue(value);
}

export function formatExpiryDate(value: string) {
  return formatDateValue(value);
}
