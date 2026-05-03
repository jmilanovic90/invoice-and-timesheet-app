const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const ibanPattern = /^[A-Z0-9]{15,34}$/;
const swiftPattern = /^[A-Z0-9]{8}([A-Z0-9]{3})?$/;

export function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.trim().length <= maxLength;
}

export function isIsoDate(value: string): boolean {
  return isoDatePattern.test(value);
}

export function isValidEmail(value: string): boolean {
  return emailPattern.test(value.trim());
}

export function isValidIban(value: string): boolean {
  return ibanPattern.test(value.trim().toUpperCase());
}

export function isValidSwift(value: string): boolean {
  return swiftPattern.test(value.trim().toUpperCase());
}
