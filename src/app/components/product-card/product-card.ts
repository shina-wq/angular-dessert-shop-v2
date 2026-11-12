import { Component, input, output } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Product } from '../../models/product';

/**
 * Presentational component: it only displays a product and reports clicks.
 * It knows nothing about services, which keeps it reusable anywhere.
 */
@Component({
  selector: 'app-product-card',
  imports: [NgClass, CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly quantity = input(0);

  readonly add = output<void>();
  readonly increment = output<void>();
  readonly decrement = output<void>();
}
