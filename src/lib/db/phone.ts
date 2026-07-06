/** Normalizes a Kenyan phone number to a bare "254XXXXXXXXX" digit string so lookups are consistent regardless of input formatting (e.g. "0712 345 678", "+254712345678", "254712345678"). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}
