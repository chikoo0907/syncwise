import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Utility function for safe date conversion
export function safeDateConversion(timestamp) {
  if (!timestamp) return new Date(0);
  
  try {
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return new Date(0);
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return new Date(0);
  }
}

// Utility function for safe sorting
export function safeSortByDate(array, dateField = 'createdAt', ascending = false) {
  return array.sort((a, b) => {
    const dateA = safeDateConversion(a[dateField]);
    const dateB = safeDateConversion(b[dateField]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

// Utility function for Firebase error handling
export function handleFirebaseError(error, context = '') {
  console.error(`Firebase error in ${context}:`, error);
  
  // Don't throw errors, just log them
  // This prevents the app from crashing due to Firebase issues
  return null;
}
