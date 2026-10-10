export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

export function validatePhone(phone: string): PhoneValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: true };
  }

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return {
      isValid: true,
      formatted: `+1${cleaned}`
    };
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return {
      isValid: true,
      formatted: `+${cleaned}`
    };
  }

  if (phone.startsWith('+1') && cleaned.length === 11) {
    return {
      isValid: true,
      formatted: `+${cleaned}`
    };
  }

  return {
    isValid: false,
    error: 'Phone must be 10 digits (e.g., 401-595-0726) or 11 digits with country code'
  };
}

export function formatPhoneDisplay(phone: string | null): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const areaCode = cleaned.slice(1, 4);
    const prefix = cleaned.slice(4, 7);
    const line = cleaned.slice(7);
    return `(${areaCode}) ${prefix}-${line}`;
  }

  if (cleaned.length === 10) {
    const areaCode = cleaned.slice(0, 3);
    const prefix = cleaned.slice(3, 6);
    const line = cleaned.slice(6);
    return `(${areaCode}) ${prefix}-${line}`;
  }

  return phone;
}
