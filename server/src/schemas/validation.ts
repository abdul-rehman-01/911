export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class ValidationResult {
  constructor(
    public isValid: boolean,
    public errors: ValidationErrorDetail[] = []
  ) {}
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_ID_REGEX = /^[a-zA-Z0-9_\-\.]+$/;

export const validation = {
  isValidEmail(email: unknown): boolean {
    if (typeof email !== 'string') return false;
    const trimmed = email.trim();
    if (trimmed.length > 254) return false;
    return EMAIL_REGEX.test(trimmed);
  },

  validateId(id: unknown, fieldName: string = 'id'): ValidationResult {
    if (typeof id !== 'string' || !id.trim()) {
      return new ValidationResult(false, [{ field: fieldName, message: `${fieldName} is required.` }]);
    }
    const cleanId = id.trim();
    if (cleanId.length > 128) {
      return new ValidationResult(false, [{ field: fieldName, message: `${fieldName} exceeds maximum allowable length.` }]);
    }
    if (!SAFE_ID_REGEX.test(cleanId)) {
      return new ValidationResult(false, [{ field: fieldName, message: `${fieldName} contains illegal characters.` }]);
    }
    return new ValidationResult(true);
  },

  validatePagination(queryPage: unknown, queryLimit: unknown): { page: number; limit: number; error?: string } {
    let page = 1;
    let limit = 20;

    if (queryPage !== undefined) {
      const p = Number(queryPage);
      if (isNaN(p) || p < 1 || !Number.isInteger(p)) {
        return { page: 1, limit: 20, error: 'Pagination parameter "page" must be a positive integer.' };
      }
      page = p;
    }

    if (queryLimit !== undefined) {
      const l = Number(queryLimit);
      if (isNaN(l) || l < 1 || l > 100 || !Number.isInteger(l)) {
        return { page, limit: 20, error: 'Pagination parameter "limit" must be an integer between 1 and 100.' };
      }
      limit = l;
    }

    return { page, limit };
  },

  validateContactInput(body: any): ValidationResult {
    const errors: ValidationErrorDetail[] = [];

    if (!body || typeof body !== 'object') {
      return new ValidationResult(false, [{ field: 'body', message: 'Request body must be a JSON object' }]);
    }

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Name is required and must be between 2 and 100 characters' });
    }

    if (!body.email || !this.isValidEmail(body.email)) {
      errors.push({ field: 'email', message: 'A valid email address is required' });
    }

    if (!body.subject || typeof body.subject !== 'string' || body.subject.trim().length < 3 || body.subject.trim().length > 200) {
      errors.push({ field: 'subject', message: 'Subject is required and must be between 3 and 200 characters' });
    }

    if (!body.message || typeof body.message !== 'string' || body.message.trim().length < 10 || body.message.trim().length > 5000) {
      errors.push({ field: 'message', message: 'Message is required and must be between 10 and 5000 characters' });
    }

    return new ValidationResult(errors.length === 0, errors);
  },

  validateBookingCreation(body: any): ValidationResult {
    const errors: ValidationErrorDetail[] = [];

    if (!body || typeof body !== 'object') {
      return new ValidationResult(false, [{ field: 'body', message: 'Request body must be a JSON object' }]);
    }

    if (!body.serviceId || typeof body.serviceId !== 'string' || !body.serviceId.trim()) {
      errors.push({ field: 'serviceId', message: 'Service ID is required' });
    }

    if (!body.serviceName || typeof body.serviceName !== 'string' || !body.serviceName.trim()) {
      errors.push({ field: 'serviceName', message: 'Service name is required' });
    }

    if (!body.preferredDate || typeof body.preferredDate !== 'string') {
      errors.push({ field: 'preferredDate', message: 'Preferred date is required' });
    } else {
      const date = new Date(body.preferredDate);
      if (isNaN(date.getTime())) {
        errors.push({ field: 'preferredDate', message: 'Preferred date must be a valid calendar date' });
      }
    }

    if (!body.preferredTime || typeof body.preferredTime !== 'string' || !body.preferredTime.trim()) {
      errors.push({ field: 'preferredTime', message: 'Preferred time slot is required' });
    }

    if (!body.clientName || typeof body.clientName !== 'string' || body.clientName.trim().length < 2 || body.clientName.trim().length > 100) {
      errors.push({ field: 'clientName', message: 'Client name is required (2-100 characters)' });
    }

    if (!body.clientEmail || !this.isValidEmail(body.clientEmail)) {
      errors.push({ field: 'clientEmail', message: 'A valid client email address is required' });
    }

    if (!body.clientPhone || typeof body.clientPhone !== 'string' || body.clientPhone.trim().length < 5 || body.clientPhone.trim().length > 30) {
      errors.push({ field: 'clientPhone', message: 'Client contact phone number is required (5-30 characters)' });
    }

    return new ValidationResult(errors.length === 0, errors);
  },

  validateBookingStatusUpdate(status: unknown): ValidationResult {
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (typeof status !== 'string') {
      return new ValidationResult(false, [{ field: 'status', message: 'Status must be a string' }]);
    }

    const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    if (!validStatuses.includes(normalized)) {
      return new ValidationResult(false, [
        {
          field: 'status',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
      ]);
    }

    return new ValidationResult(true);
  },

  validateUserUpdate(body: any): { result: ValidationResult; sanitizedData?: any } {
    const errors: ValidationErrorDetail[] = [];

    if (!body || typeof body !== 'object') {
      return {
        result: new ValidationResult(false, [{ field: 'body', message: 'Request body must be a JSON object' }]),
      };
    }

    // Role protection: A normal client must NEVER be able to change role=admin or elevate privileges
    if (body.role !== undefined) {
      if (body.role === 'admin' || body.role !== 'user') {
        errors.push({
          field: 'role',
          message: 'Client privilege escalation is forbidden. Role modification is not permitted via this endpoint.',
        });
      }
    }

    const sanitizedData: any = {};

    if (body.fullName !== undefined) {
      if (typeof body.fullName !== 'string' || body.fullName.trim().length < 2 || body.fullName.trim().length > 100) {
        errors.push({ field: 'fullName', message: 'Full name must be between 2 and 100 characters' });
      } else {
        sanitizedData.fullName = body.fullName.trim();
      }
    }

    if (body.phone !== undefined) {
      if (typeof body.phone !== 'string' || body.phone.trim().length > 30) {
        errors.push({ field: 'phone', message: 'Phone must be a valid string under 30 characters' });
      } else {
        sanitizedData.phone = body.phone.trim();
      }
    }

    if (body.membershipTier !== undefined) {
      const validTiers = ['Platinum', 'Track VIP', 'Private Collector'];
      if (!validTiers.includes(body.membershipTier)) {
        errors.push({
          field: 'membershipTier',
          message: `Membership tier must be one of: ${validTiers.join(', ')}`,
        });
      } else {
        sanitizedData.membershipTier = body.membershipTier;
      }
    }

    return {
      result: new ValidationResult(errors.length === 0, errors),
      sanitizedData: errors.length === 0 ? sanitizedData : undefined,
    };
  },

  validateBrand(body: any): ValidationResult {
    const errors: ValidationErrorDetail[] = [];
    if (!body || typeof body !== 'object') {
      return new ValidationResult(false, [{ field: 'body', message: 'Request body must be a JSON object' }]);
    }
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 80) {
      errors.push({ field: 'name', message: 'Brand name is required (2-80 characters)' });
    }
    if (body.country && (typeof body.country !== 'string' || body.country.trim().length > 80)) {
      errors.push({ field: 'country', message: 'Country must be a string under 80 characters' });
    }
    return new ValidationResult(errors.length === 0, errors);
  },

  validateCategory(body: any): ValidationResult {
    const errors: ValidationErrorDetail[] = [];
    if (!body || typeof body !== 'object') {
      return new ValidationResult(false, [{ field: 'body', message: 'Request body must be a JSON object' }]);
    }
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 80) {
      errors.push({ field: 'name', message: 'Category name is required (2-80 characters)' });
    }
    return new ValidationResult(errors.length === 0, errors);
  },

  validateVehicle(body: any): ValidationResult {
    const errors: ValidationErrorDetail[] = [];
    if (!body || typeof body !== 'object') {
      return new ValidationResult(false, [{ field: 'body', message: 'Request body must be a JSON object' }]);
    }
    if (!body.make || typeof body.make !== 'string' || !body.make.trim()) {
      errors.push({ field: 'make', message: 'Make is required' });
    }
    if (!body.model || typeof body.model !== 'string' || !body.model.trim()) {
      errors.push({ field: 'model', message: 'Model is required' });
    }
    if (body.year !== undefined) {
      const year = Number(body.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1948 || year > currentYear + 2) {
        errors.push({ field: 'year', message: `Year must be between 1948 and ${currentYear + 2}` });
      }
    }
    if (body.priceUsd !== undefined) {
      const price = Number(body.priceUsd);
      if (isNaN(price) || price < 0) {
        errors.push({ field: 'priceUsd', message: 'Price must be a non-negative number' });
      }
    }
    return new ValidationResult(errors.length === 0, errors);
  },

  validateLogin(body: any): ValidationResult {
    const errors: ValidationErrorDetail[] = [];
    if (!body || typeof body !== 'object') {
      return new ValidationResult(false, [{ field: 'body', message: 'Request body must be a JSON object' }]);
    }
    if (!body.email || !this.isValidEmail(body.email)) {
      errors.push({ field: 'email', message: 'Valid email address is required' });
    }
    if (!body.password || typeof body.password !== 'string' || body.password.length < 4) {
      errors.push({ field: 'password', message: 'Password is required (minimum 4 characters)' });
    }
    return new ValidationResult(errors.length === 0, errors);
  },

  validateRegister(body: any): ValidationResult {
    const errors: ValidationErrorDetail[] = [];
    if (!body || typeof body !== 'object') {
      return new ValidationResult(false, [{ field: 'body', message: 'Request body must be a JSON object' }]);
    }
    if (!body.fullName || typeof body.fullName !== 'string' || body.fullName.trim().length < 2) {
      errors.push({ field: 'fullName', message: 'Full name is required (minimum 2 characters)' });
    }
    if (!body.email || !this.isValidEmail(body.email)) {
      errors.push({ field: 'email', message: 'Valid email address is required' });
    }
    if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }
    return new ValidationResult(errors.length === 0, errors);
  },
};
