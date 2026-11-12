import { Injectable, inject, signal } from '@angular/core';
import { CartService } from './cart.service';
import { LoggerService } from './logger.service';

/**
 * Checkout flow: confirming an order and starting a new one.
 *
 * Built on top of CartService rather than duplicating it, which shows a
 * service depending on other services through DI.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly cart = inject(CartService);
  private readonly logger = inject(LoggerService);

  private readonly _confirmed = signal(false);
  readonly confirmed = this._confirmed.asReadonly();

  confirm(): void {
    if (this.cart.isEmpty()) {
      this.logger.warn('Tried to confirm an empty order');
      return;
    }

    this._confirmed.set(true);
    this.logger.info('Order confirmed', { items: this.cart.count(), total: this.cart.total() });
  }

  startNew(): void {
    this.cart.clear();
    this._confirmed.set(false);
    this.logger.info('Started a new order');
  }
}
