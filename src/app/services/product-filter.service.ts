import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductService, ProductSort } from './product.service';

/**
 * Search and sort state for one product list.
 *
 * There is deliberately no `providedIn` here. A component must list this
 * service in its own `providers` array, and each instance of that component
 * then gets its own copy. Two product lists on the same page could be
 * searched and sorted independently.
 *
 * Compare with ProductService and CartService, which are root singletons
 * shared by the whole app.
 */
@Injectable()
export class ProductFilterService {
  // A component-scoped service can still inject root services.
  private readonly productService = inject(ProductService);

  readonly query = signal('');
  readonly sort = signal<ProductSort>('featured');

  readonly products = computed(() => {
    const all = this.productService.getAll();
    const matches = this.productService.search(all, this.query());
    return this.productService.sort(matches, this.sort());
  });

  setQuery(query: string): void {
    this.query.set(query);
  }

  setSort(sort: string): void {
    this.sort.set(sort as ProductSort);
  }
}
