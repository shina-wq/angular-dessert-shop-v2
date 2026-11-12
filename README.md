# Dessert Shop

A responsive dessert shop built with Angular. Browse desserts, add them to your cart, adjust quantities and confirm your order.

This version refactors the app around **Angular services and dependency injection (DI)**: all cart, order, product, logging and storage logic lives in services, and components only display data and forward clicks.

- **Live site:** https://angular-dessert-shop-v2.vercel.app/
- **Repository:** https://github.com/shina-wq/angular-dessert-shop-v2

## Features

- Product list with responsive mobile / tablet / desktop images
- Add to cart, then increase or decrease the quantity right on the product card
- Products already in the cart are highlighted with a red border
- Cart shows each item, line totals and the order total, and updates instantly
- Remove single items from the cart
- Order confirmation modal with a summary; "Start New Order" resets everything
- **The cart is saved in local storage**, so it survives a page reload; starting a new order clears it
- User actions and errors are logged in one place
- Prices formatted as US dollars (e.g. `$6.50`)
- Responsive layout from 320px phones to large desktops, with hover and keyboard focus states

## Services

All services live in `src/app/services/`.

| Service               | Responsibility                                                                                                                 | Injects                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `CartService`         | The cart: items, count, total, add / increment / decrement / remove / clear. Saves and restores the cart.                      | `UtilService`, `LoggerService`, `ProductService`, `StorageService`, `CART_STORAGE_KEY` |
| `ProductService`      | The product catalogue (`getAll()`). Components never import the data file directly.                                            | —                                                                                      |
| `OrderService`        | Checkout flow: `confirmed` state, `confirm()`, `startNew()`. Refuses to confirm an empty cart.                                 | `CartService`, `LoggerService`                                                         |
| `UtilService`         | Shared, stateless helpers: `sum()`, `roundToCents()`, `lineTotal()`.                                                           | —                                                                                      |
| `LoggerService`       | Records info / warnings / errors with timestamps (last 100 kept); prints to the console in development, and always for errors. | —                                                                                      |
| `StorageService`      | Safe JSON wrapper around `localStorage`. Never throws: problems are logged and the app keeps working.                          | `LoggerService`                                                                        |
| `LoggingErrorHandler` | Replaces Angular's default `ErrorHandler` so uncaught errors go to `LoggerService`.                                            | `LoggerService`                                                                        |

Services depend on other services the same way components do: by calling `inject()`. For example, `OrderService` builds on `CartService` instead of duplicating it.

## How dependency injection is used

### `@Injectable()` and `providedIn`

`@Injectable()` marks a class that Angular can create and inject. Adding `providedIn: 'root'` registers it with the application's root injector automatically, with no `providers` array needed. Root services are also tree-shakable: if nothing injects them, they are left out of the build.

```ts
@Injectable({ providedIn: 'root' })
export class CartService { ... }

// In any component or service:
private readonly cart = inject(CartService);
```

### Provider levels

| Level           | Where it's registered                                                                       | Used in this app for                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root**        | `@Injectable({ providedIn: 'root' })`                                                       | Every service above.                                                                                                                                                                                                                     |
| **Application** | `providers` in [`app.config.ts`](src/app/app.config.ts), passed to `bootstrapApplication()` | `DEFAULT_CURRENCY_CODE` (`useValue: 'USD'`) for every `currency` pipe; `ErrorHandler` replaced with `LoggingErrorHandler` (`useClass`); our own `CART_STORAGE_KEY` `InjectionToken` (`useValue`); `provideBrowserGlobalErrorListeners()` |
| **Component**   | `providers: [...]` in a `@Component`                                                        | Not needed by this app (see below).                                                                                                                                                                                                      |

### Singleton vs. multiple instances

- **Singleton (root or application level):** one instance for the whole app. That is why the product cards, the cart and the confirmation modal always agree: they inject the _same_ `CartService`.
- **Multiple instances (component level):** a service with no `providedIn`, listed in a component's own `providers`, gets a **new instance for every instance of that component**, and is destroyed with it. It suits state that belongs to one piece of UI, such as the search text of one list:

  ```ts
  @Injectable() // no providedIn
  export class ListFilterService { query = signal(''); }

  @Component({ ..., providers: [ListFilterService] })
  export class ProductList { filter = inject(ListFilterService); }
  ```

  Everything in this app is shared state, so every service here is a singleton.

Angular looks for a provider starting at the component and walks up to the application and root injectors, so a component-level provider overrides a root one for that component and its children.

## State management with services

Shared state lives in services as **signals** instead of in components:

- **One source of truth.** The cart exists only in `CartService`. Components read it; they never keep their own copy, so nothing can get out of sync.
- **Encapsulation.** The writable signal is private and only a read-only version is exposed (`items = _items.asReadonly()`), so the cart can only change through the service's methods.
- **Derived values with `computed()`.** `count`, `total` and `isEmpty` are recalculated only when the items change, and are cached in between.
- **Efficient updates.** Angular is notified exactly when a signal changes and refreshes only the views that read it, so it never has to guess what might have changed. No `@Input`/`@Output` chains are needed to pass the cart through `App`.
- **Side effects in one place.** An `effect()` in `CartService` saves the cart whenever it changes; no component has to remember to do it.
- **Reusability.** Components such as `ProductCard` stay presentational (inputs and outputs only) and can be reused anywhere, while the logic can be used by any component.

## Angular concepts used

| Concept                  | Where                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| Services & DI            | `inject()` in every component and service; providers in `app.config.ts`                              |
| Signals                  | `signal()`, `computed()`, `effect()` in the services; signal `input()` / `output()` in `ProductCard` |
| Components               | `ProductList`, `ProductCard`, `Cart`, `OrderConfirmation` in `src/app/components/`                   |
| Property & event binding | `[product]`, `[attr.aria-label]`, `(click)`, `(add)`, `(increment)`                                  |
| Built-in control flow    | `@for` / `@empty`, `@if` / `@else`                                                                   |
| Attribute directive      | `[ngClass]="{ 'in-cart': quantity() > 0 }"` highlights products in the cart                          |
| Pipes                    | `currency` formats prices as US dollars                                                              |

## Project structure

```
src/
├── main.ts                          # Boots the app with appConfig
└── app/
    ├── app.config.ts                # Application-level providers
    ├── app.ts / app.html            # Layout only: list, cart, confirmation modal
    ├── components/
    │   ├── product-list/            # Grid of products (CartService, ProductService)
    │   ├── product-card/            # Presentational: one dessert + quantity stepper
    │   ├── cart/                    # Cart items, total, Confirm Order
    │   └── order-confirmation/      # Confirmation modal
    ├── services/                    # All app logic and shared state (see above)
    ├── data/products.ts             # Dessert data (prices in USD)
    └── models/product.ts            # Product and CartItem interfaces
```

## Getting started

Requires Node.js 18 or later.

```bash
git clone https://github.com/shina-wq/angular-dessert-shop-v2.git
cd angular-dessert-shop-v2
npm install
npm start
```

Then open http://localhost:4200.

To create a production build in `dist/angular-dessert-shop/browser`:

```bash
npm run build
```

## Design

Based on the [Product list with cart](https://www.frontendmentor.io/challenges/product-list-with-cart-5MmqLVAp_d) challenge by Frontend Mentor.
