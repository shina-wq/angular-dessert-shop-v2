import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { CartItem, Product } from '../models/product';
import { LoggerService } from './logger.service';
import { ProductService } from './product.service';
import { CART_STORAGE_KEY, StorageService } from './storage.service';
import { UtilService } from './util.service';

/** What gets written to storage: just enough to rebuild the cart. */
interface SavedCartItem {
  name: string;
  quantity: number;
}

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
  private readonly products = inject(ProductService);
  private readonly storage = inject(StorageService);
  private readonly storageKey = inject(CART_STORAGE_KEY);

  // Private and writable: only this service can change the cart.
  // Starts with whatever was saved on the last visit.
  private readonly _items = signal<CartItem[]>(this.restore());

  // Public and read-only: components can read the cart but not modify it directly.
  readonly items = this._items.asReadonly();

  readonly count = computed(() => this.util.sum(this._items(), (item) => item.quantity));

  readonly total = computed(() =>
    this.util.roundToCents(this.util.sum(this._items(), (item) => this.util.lineTotal(item))),
  );

  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    // Runs whenever the cart changes, so storage is always up to date.
    // An empty cart removes the saved data instead of storing [].
    effect(() => {
      const items = this._items();

      if (items.length === 0) {
        this.storage.remove(this.storageKey);
        return;
      }

      const saved: SavedCartItem[] = items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
      }));
      this.storage.set(this.storageKey, saved);
    });
  }

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

  /**
   * Rebuilds the cart from storage. Only names and quantities are saved, so
   * each product is looked up in the current catalogue: prices stay up to
   * date, and anything no longer sold (or malformed) is skipped.
   */
  private restore(): CartItem[] {
    const saved = this.storage.get<unknown>(this.storageKey);
    if (!Array.isArray(saved)) return [];

    const catalogue = this.products.getAll();
    const items: CartItem[] = [];

    for (const entry of saved) {
      const product = catalogue.find((p) => p.name === entry?.name);
      const quantity = entry?.quantity;

      if (product && Number.isInteger(quantity) && quantity > 0) {
        items.push({ product, quantity });
      }
    }

    if (items.length > 0) {
      this.logger.info(`Restored ${items.length} cart item(s) from your last visit`);
    }
    return items;
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
