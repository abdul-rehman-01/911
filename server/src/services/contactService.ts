import { contactRepository } from '../repositories/contactRepository.ts';
import { ContactSubmission } from '../models/index.ts';
import { validation } from '../schemas/validation.ts';

export class ContactBackendService {
  public async submitContactMessage(
    payload: any
  ): Promise<{ submission?: ContactSubmission; errors?: string[] }> {
    const valResult = validation.validateContactInput(payload);
    if (!valResult.isValid) {
      return {
        errors: valResult.errors.map((e) => `${e.field}: ${e.message}`),
      };
    }

    const submission = await contactRepository.create({
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone ? payload.phone.trim() : undefined,
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      inquiryType: payload.inquiryType ? payload.inquiryType.trim() : undefined,
      vehicleOfInterest: payload.vehicleOfInterest ? payload.vehicleOfInterest.trim() : undefined,
    });

    return { submission };
  }

  public async getAllSubmissions(): Promise<ContactSubmission[]> {
    return contactRepository.findAll();
  }

  public async updateContactStatus(id: string, status: 'unread' | 'read' | 'archived'): Promise<ContactSubmission | null> {
    return contactRepository.updateStatus(id, status);
  }

  public async deleteContact(id: string): Promise<boolean> {
    return contactRepository.delete(id);
  }
}

export const contactBackendService = new ContactBackendService();
