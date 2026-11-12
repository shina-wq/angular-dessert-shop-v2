import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';

/**
 * Application-level providers, registered once when the app boots.
 *
 * Services marked `providedIn: 'root'` register themselves and don't need to be
 * listed here. This is the place for configuration values and for replacing
 * Angular's built-in providers.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Send uncaught errors and unhandled promise rejections to Angular's ErrorHandler.
    provideBrowserGlobalErrorListeners(),

    // Every `currency` pipe in the app formats prices in US dollars.
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'USD' },
  ],
};
