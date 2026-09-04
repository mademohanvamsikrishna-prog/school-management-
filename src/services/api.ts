import { ENV } from '../config/env';
import { storage } from '../utils/storage';
import { ApiError } from './types';

const TOKEN_STORAGE_KEY = '@auth_access_token';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    return await storage.getItem(TOKEN_STORAGE_KEY);
  }

  public async setAuthToken(token: string | null): Promise<void> {
    if (token) {
      await storage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      await storage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ENV.TIMEOUT_MS);

    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: response.statusText };
        }

        const message =
          errorData.detail ||
          errorData.message ||
          `Request failed with status ${response.status}`;

        const apiError: ApiError = {
          statusCode: response.status,
          message,
          errors: errorData.errors,
        };
        throw apiError;
      }

      if (response.status === 204) {
        return null as unknown as T;
      }

      return (await response.json()) as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.statusCode) {
        throw err;
      }
      if (err.name === 'AbortError') {
        const timeoutError: ApiError = {
          statusCode: 408,
          message: 'Request timed out. Please check your network connection.',
        };
        throw timeoutError;
      }
      const networkError: ApiError = {
        statusCode: 0,
        message: err.message || 'Network request failed. Is the backend server running?',
      };
      throw networkError;
    }
  }

  public async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  public async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  public async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const api = new ApiClient(ENV.API_BASE_URL);
