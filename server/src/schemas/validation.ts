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

export const validation = {
  isValidEmail(email: unknown): boolean {
    if (typeof email !== 'string') return false;
    return EMAIL_REGEX.test(email.trim());
  },

  validateContactInput(body: any): ValidationResult {
    const errors: ValidationErrorDetail[] = [];

    if (!body || typeof body !== 'object') {
      return new ValidationResult(false, [{ field: 'body', message: 'Request body must be a JSON object' }]);
    }

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name is required and must be at least 2 characters' });
    }

    if (!body.email || !this.isValidEmail(body.email)) {
      errors.push({ field: 'email', message: 'A valid email address is required' });
    }

    if (!body.subject || typeof body.subject !== 'string' || body.subject.trim().length < 3) {
      errors.push({ field: 'subject', message: 'Subject is required and must be at least 3 characters' });
    }

    if (!body.message || typeof body.message !== 'string' || body.message.trim().length < 10) {
      errors.push({ field: 'message', message: 'Message is required and must be at least 10 characters' });
    }

    return new ValidationResult(errors.length === 0, errors);
  },

  validateBookingCreation(body: any): ValidationResult {
    const errors: ValidationErrorDetail[] = [];

    if (!body || typeof body !== 'object') {
      return new ValidationResult(false, [{ field: 'body', message: 'Request body must be a JSON object' }]);
    }

    if (!body.serviceId || typeof body.serviceId !== 'string') {
      errors.push({ field: 'serviceId', message: 'Service ID is required' });
    }

    if (!body.serviceName || typeof body.serviceName !== 'string') {
      errors.push({ field: 'serviceName', message: 'Service name is required' });
    }

    if (!body.preferredDate || typeof body.preferredDate !== 'string') {
      errors.push({ field: 'preferredDate', message: 'Preferred date is required' });
    }

    if (!body.preferredTime || typeof body.preferredTime !== 'string') {
      errors.push({ field: 'preferredTime', message: 'Preferred time is required' });
    }

    if (!body.clientName || typeof body.clientName !== 'string' || body.clientName.trim().length < 2) {
      errors.push({ field: 'clientName', message: 'Client name is required' });
    }

    if (!body.clientEmail || !this.isValidEmail(body.clientEmail)) {
      errors.push({ field: 'clientEmail', message: 'A valid client email address is required' });
    }

    if (!body.clientPhone || typeof body.clientPhone !== 'string' || body.clientPhone.trim().length < 5) {
      errors.push({ field: 'clientPhone', message: 'Client contact phone number is required' });
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
      if (typeof body.fullName !== 'string' || body.fullName.trim().length < 2) {
        errors.push({ field: 'fullName', message: 'Full name must be at least 2 characters' });
      } else {
        sanitizedData.fullName = body.fullName.trim();
      }
    }

    if (body.phone !== undefined) {
      if (typeof body.phone !== 'string') {
        errors.push({ field: 'phone', message: 'Phone must be a string' });
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
};
