import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem, Product } from '../models/product';
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
  }

  increment(product: Product): void {
    this.changeQuantity(product, 1);
  }

  decrement(product: Product): void {
    this.changeQuantity(product, -1);
  }

  remove(product: Product): void {
    this._items.update((items) => items.filter((item) => !this.matches(item, product)));
  }

  clear(): void {
    this._items.set([]);
  }

  private changeQuantity(product: Product, delta: number): void {
    this._items.update((items) =>
      items
        .map((item) =>
          this.matches(item, product) ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
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
