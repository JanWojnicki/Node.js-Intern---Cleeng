import { Preferences } from './types';

// Using a Map for efficient user preference lookups.
// This is our simple in-memory database.
const userPreferencesStore = new Map<string, Preferences>();

/**
 * Retrieves preferences for a given user.
 * @param userId The ID of the user.
 * @returns The user's preferences object or undefined if not found.
 */
export const getPreferences = (userId: string): Preferences | undefined => {
  return userPreferencesStore.get(userId);
};

/**
 * Saves or updates preferences for a given user.
 * @param userId The ID of the user.
 * @param preferences The preferences object to save.
 */
export const savePreferences = (userId: string, preferences: Preferences): void => {
  userPreferencesStore.set(userId, preferences);
};
