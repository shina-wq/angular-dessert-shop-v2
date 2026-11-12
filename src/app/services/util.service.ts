import { Injectable } from '@angular/core';
import { CartItem } from '../models/product';

/**
 * General-purpose helpers shared across the app.
 *
 * Every method is pure (same input, same output, no side effects), so the
 * service holds no state and is safe to use anywhere.
 */
@Injectable({ providedIn: 'root' })
export class UtilService {
  /** Adds up one number from each item, e.g. sum(items, (i) => i.quantity). */
  sum<T>(items: readonly T[], value: (item: T) => number): number {
    return items.reduce((total, item) => total + value(item), 0);
  }

  /** Rounds to whole cents, avoiding floating-point drift such as 0.1 + 0.2 = 0.30000000000000004. */
  roundToCents(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  /** Price of one cart line: unit price × quantity. */
  lineTotal(item: CartItem): number {
    return this.roundToCents(item.product.price * item.quantity);
  }
}
