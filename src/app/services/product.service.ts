import { Injectable } from '@angular/core';
import { PRODUCTS } from '../data/products';
import { Product } from '../models/product';

export type ProductSort = 'featured' | 'name' | 'price-asc' | 'price-desc';

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

/**
 * Owns the product catalogue and the reusable operations on it.
 *
 * Methods are pure (they never mutate the input array), so any component can
 * combine them freely without affecting the catalogue or other components.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly products: readonly Product[] = PRODUCTS;

  getAll(): readonly Product[] {
    return this.products;
  }

  /** Products whose name or category contains the query (case-insensitive). */
  search(products: readonly Product[], query: string): Product[] {
    const term = query.trim().toLowerCase();
    if (!term) return [...products];

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term),
    );
  }

  /** Returns a sorted copy; 'featured' keeps the catalogue order. */
  sort(products: readonly Product[], sort: ProductSort): Product[] {
    const copy = [...products];

    switch (sort) {
      case 'name':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      default:
        return copy;
    }
  }
}
