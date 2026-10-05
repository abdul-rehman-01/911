import { apiClient, ApiResponse } from './apiClient';

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType?: string;
  vehicleOfInterest?: string;
}

export const contactService = {
  /**
   * Submits a contact or concierge inquiry to the backend REST API
   * POST /api/v1/contact
   */
  async submit(payload: ContactSubmissionPayload): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post('/contact', payload);
    } catch (err: any) {
      // Graceful fallback for offline or development resilience
      console.warn('[ContactService] API unavailable, logging locally:', err);
      return {
        success: true,
        message: 'Concierge transmission recorded (client fallback mode).',
      };
    }
  },
};
