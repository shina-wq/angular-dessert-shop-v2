import { Injectable } from '@angular/core';
import { PRODUCTS } from '../data/products';
import { Product } from '../models/product';

/**
 * Owns the product catalogue.
 *
 * Components ask this service for products instead of importing the data
 * file directly, so the data source can change (e.g. to an HTTP API) without
 * touching any component.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly products: readonly Product[] = PRODUCTS;

  getAll(): readonly Product[] {
    return this.products;
  }
}
