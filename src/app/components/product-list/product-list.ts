import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ProductFilterService } from '../../services/product-filter.service';
import { SORT_OPTIONS } from '../../services/product.service';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  // Component-level provider: each ProductList gets its own filter state,
  // which is created and destroyed along with the component.
  providers: [ProductFilterService],
})
export class ProductList {
  protected readonly cart = inject(CartService); // shared root singleton
  protected readonly filter = inject(ProductFilterService); // this list's own instance

  protected readonly sortOptions = SORT_OPTIONS;
}
