import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-order-confirmation',
  imports: [CurrencyPipe],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css',
})
export class OrderConfirmation {
  protected readonly cart = inject(CartService);
  protected readonly util = inject(UtilService);

  @Output() newOrder = new EventEmitter<void>();
}
