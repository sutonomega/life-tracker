export function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}
