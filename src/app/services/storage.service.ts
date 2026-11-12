import { Injectable, InjectionToken, inject } from '@angular/core';
import { LoggerService } from './logger.service';

/** The localStorage key the cart is saved under. Provided in app.config.ts. */
export const CART_STORAGE_KEY = new InjectionToken<string>('CART_STORAGE_KEY');

/**
 * Safe wrapper around localStorage that stores values as JSON.
 *
 * localStorage can throw (private browsing, storage full, blocked by
 * settings) and can hold invalid JSON, so every call is guarded. A storage
 * problem is logged and the app keeps working, just without persistence.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly logger = inject(LoggerService);

  /** The parsed value, or null if it's missing or unreadable. */
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch (error) {
      this.logger.warn(`Could not read "${key}" from storage`, error);
      return null;
    }
  }

  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      this.logger.warn(`Could not save "${key}" to storage`, error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      this.logger.warn(`Could not remove "${key}" from storage`, error);
    }
  }
}
