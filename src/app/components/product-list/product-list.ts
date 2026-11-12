import { Component, computed, inject, signal } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ProductService, ProductSort, SORT_OPTIONS } from '../../services/product.service';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  private readonly productService = inject(ProductService);
  protected readonly cart = inject(CartService);

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly query = signal('');
  protected readonly sort = signal<ProductSort>('featured');

  // Re-runs only when the query or sort changes.
  protected readonly products = computed(() => {
    const all = this.productService.getAll();
    const matches = this.productService.search(all, this.query());
    return this.productService.sort(matches, this.sort());
  });

  protected setSort(value: string): void {
    this.sort.set(value as ProductSort);
  }
}
