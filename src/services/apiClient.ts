/**
 * Car 911 Central API Client
 * Centralizes all network communication to the /api/v1 backend endpoints.
 * Integrates error handling and structured response formatting.
 */

import { getStorageItem, STORAGE_KEYS } from '../utils/storage';
import { SessionState } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp?: string;
}

export class ApiError extends Error {
  public code: string;
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, code: string = 'API_ERROR', statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const session = getStorageItem<SessionState | null>(STORAGE_KEYS.SESSION, null);
      if (session?.user?.id) {
        headers['x-user-id'] = session.user.id;
        headers['Authorization'] = `Bearer ${session.user.id}`;
      }
    } catch {
      // Safe fallback
    }

    return headers;
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.pathname + url.search;
  }

  public async get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(this.buildUrl(path, params), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const json = await response.json();
      if (!response.ok || json.success === false) {
        throw new ApiError(
          json.error?.message || `Request failed with status ${response.status}`,
          json.error?.code || 'FETCH_ERROR',
          response.status,
          json.error?.details
        );
      }

      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err.message || 'Network request failed', 'NETWORK_ERROR', 0);
    }
  }

  public async post<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(this.buildUrl(path), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const json = await response.json();
      if (!response.ok || json.success === false) {
        throw new ApiError(
          json.error?.message || `Request failed with status ${response.status}`,
          json.error?.code || 'FETCH_ERROR',
          response.status,
          json.error?.details
        );
      }

      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err.message || 'Network request failed', 'NETWORK_ERROR', 0);
    }
  }

  public async put<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(this.buildUrl(path), {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const json = await response.json();
      if (!response.ok || json.success === false) {
        throw new ApiError(
          json.error?.message || `Request failed with status ${response.status}`,
          json.error?.code || 'FETCH_ERROR',
          response.status,
          json.error?.details
        );
      }

      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err.message || 'Network request failed', 'NETWORK_ERROR', 0);
    }
  }

  public async patch<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(this.buildUrl(path), {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const json = await response.json();
      if (!response.ok || json.success === false) {
        throw new ApiError(
          json.error?.message || `Request failed with status ${response.status}`,
          json.error?.code || 'FETCH_ERROR',
          response.status,
          json.error?.details
        );
      }

      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err.message || 'Network request failed', 'NETWORK_ERROR', 0);
    }
  }

  public async delete<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(this.buildUrl(path), {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const json = await response.json();
      if (!response.ok || json.success === false) {
        throw new ApiError(
          json.error?.message || `Request failed with status ${response.status}`,
          json.error?.code || 'FETCH_ERROR',
          response.status,
          json.error?.details
        );
      }

      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err.message || 'Network request failed', 'NETWORK_ERROR', 0);
    }
  }
}

export const apiClient = new ApiClient();
