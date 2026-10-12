
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private get storage(): Storage | null {
    try {
      return typeof localStorage !== 'undefined'
        ? localStorage
        : null;
    } catch {
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    const storage = this.storage;

    if (!storage) {
      return;
    }

    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(
        `Failed to store data for key "${key}".`,
        error,
      );
    }
  }

  getItem<T>(key: string): T | null {
    const storage = this.storage;

    if (!storage) {
      return null;
    }

    try {
      const value = storage.getItem(key);

      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(
        `Failed to retrieve storage data for key "${key}".`,
        error,
      );

      return null;
    }
  }

  removeItem(key: string): void {
    const storage = this.storage;

    if (!storage) {
      return;
    }

    try {
      storage.removeItem(key);
    } catch (error) {
      console.error(
        `Failed to remove storage key "${key}".`,
        error,
      );
    }
  }

  clear(): void {
    const storage = this.storage;

    if (!storage) {
      return;
    }

    try {
      const keysToRemove: string[] = [];

      for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index);

        if (key?.startsWith('stockly_')) {
          keysToRemove.push(key);
        }
      }

      for (const key of keysToRemove) {
        storage.removeItem(key);
      }
    } catch (error) {
      console.error(
        'Failed to clear Stockly local storage.',
        error,
      );
    }
  }

  hasItem(key: string): boolean {
    const storage = this.storage;

    if (!storage) {
      return false;
    }

    try {
      return storage.getItem(key) !== null;
    } catch (error) {
      console.error(
        `Failed to check storage key "${key}".`,
        error,
      );

      return false;
    }
  }
}
