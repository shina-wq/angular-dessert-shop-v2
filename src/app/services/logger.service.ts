import { Injectable, isDevMode, signal } from '@angular/core';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: Date;
}

/**
 * One place for recording user actions and errors.
 *
 * Every entry is kept in memory (the latest 100) so it can be inspected or
 * shown in the UI. Info and warnings are also printed to the console during
 * development only; errors are always printed.
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private static readonly MAX_ENTRIES = 100;

  private readonly _entries = signal<LogEntry[]>([]);
  readonly entries = this._entries.asReadonly();

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = { level, message, data, timestamp: new Date() };
    this._entries.update((entries) => [...entries, entry].slice(-LoggerService.MAX_ENTRIES));

    if (level === 'error' || isDevMode()) {
      const time = entry.timestamp.toLocaleTimeString();
      const extra = data === undefined ? [] : [data];
      console[level](`[${time}] ${message}`, ...extra);
    }
  }
}
