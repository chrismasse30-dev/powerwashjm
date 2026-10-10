export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface QuoteFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  services: string[];
  propertyType: string;
  package: string;
}

export function validateQuoteForm(data: QuoteFormData, servicedStates: string[], skipServicesValidation: boolean = false): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.address.trim()) {
    errors.address = 'Address is required';
  }

  if (!data.city.trim()) {
    errors.city = 'City is required';
  }

  if (!data.state.trim()) {
    errors.state = 'State is required';
  } else if (!servicedStates.some(s => s.toLowerCase() === data.state.toLowerCase())) {
    errors.state = 'We currently service MA, RI, and CT only';
  }

  if (!data.zipCode.trim()) {
    errors.zipCode = 'Zip code is required';
  } else if (!/^\d{5}(-\d{4})?$/.test(data.zipCode)) {
    errors.zipCode = 'Invalid zip code format';
  }

  if (!data.phone.trim()) {
    errors.phone = 'Phone is required';
  } else if (!/^[\d\s\-\(\)]+$/.test(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!skipServicesValidation && data.services.length === 0) {
    errors.services = 'Please select at least one service';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
