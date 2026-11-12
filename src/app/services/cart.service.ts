import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem, Product } from '../models/product';
import { LoggerService } from './logger.service';
import { UtilService } from './util.service';

/**
 * Single source of truth for the shopping cart.
 *
 * `providedIn: 'root'` makes this a singleton: every component that injects
 * CartService gets the same instance, so they all see the same cart.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  // Services can inject other services, just like components can.
  private readonly util = inject(UtilService);
  private readonly logger = inject(LoggerService);

  // Private and writable: only this service can change the cart.
  private readonly _items = signal<CartItem[]>([]);

  // Public and read-only: components can read the cart but not modify it directly.
  readonly items = this._items.asReadonly();

  readonly count = computed(() => this.util.sum(this._items(), (item) => item.quantity));

  readonly total = computed(() =>
    this.util.roundToCents(this.util.sum(this._items(), (item) => this.util.lineTotal(item))),
  );

  readonly isEmpty = computed(() => this._items().length === 0);

  /** How many of this product are in the cart (0 if none). */
  quantityOf(product: Product): number {
    return this.find(product)?.quantity ?? 0;
  }

  add(product: Product): void {
    if (this.find(product)) {
      this.increment(product);
      return;
    }
    this._items.update((items) => [...items, { product, quantity: 1 }]);
    this.logger.info(`Added ${product.name} to cart`);
  }

  increment(product: Product): void {
    this.changeQuantity(product, 1);
  }

  decrement(product: Product): void {
    this.changeQuantity(product, -1);
  }

  remove(product: Product): void {
    if (!this.find(product)) {
      this.logger.warn(`Tried to remove ${product.name}, which is not in the cart`);
      return;
    }
    this._items.update((items) => items.filter((item) => !this.matches(item, product)));
    this.logger.info(`Removed ${product.name} from cart`);
  }

  clear(): void {
    this._items.set([]);
    this.logger.info('Cart cleared');
  }

  private changeQuantity(product: Product, delta: number): void {
    const item = this.find(product);
    if (!item) {
      this.logger.warn(`Tried to change ${product.name}, which is not in the cart`);
      return;
    }

    const quantity = item.quantity + delta;

    if (quantity <= 0) {
      this.remove(product);
      return;
    }

    this._items.update((items) =>
      items.map((item) => (this.matches(item, product) ? { ...item, quantity } : item)),
    );
    this.logger.info(`${product.name} quantity is now ${quantity}`);
  }

  private find(product: Product): CartItem | undefined {
    return this._items().find((item) => this.matches(item, product));
  }

  // Match by name rather than object reference, so a cart restored from
  // storage (a copy of the products) still matches the product list.
  private matches(item: CartItem, product: Product): boolean {
    return item.product.name === product.name;
  }
}
