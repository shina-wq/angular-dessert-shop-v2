import { Component, inject } from '@angular/core';
import { Cart } from './components/cart/cart';
import { OrderConfirmation } from './components/order-confirmation/order-confirmation';
import { ProductList } from './components/product-list/product-list';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [ProductList, Cart, OrderConfirmation],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly cart = inject(CartService);

  orderConfirmed = false;

  startNewOrder(): void {
    this.cart.clear();
    this.orderConfirmed = false;
  }
}
