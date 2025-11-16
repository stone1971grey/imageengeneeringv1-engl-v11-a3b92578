// Mautic Tracking Utilities
const MAUTIC_EMAIL_KEY = 'mautic_tracking_email';

/**
 * Store email for Mautic tracking
 */
export const storeMauticEmail = (email: string): void => {
  try {
    localStorage.setItem(MAUTIC_EMAIL_KEY, email);
    console.log('Mautic tracking email stored:', email);
  } catch (error) {
    console.error('Failed to store Mautic email:', error);
  }
};

/**
 * Get stored email for Mautic tracking
 */
export const getMauticEmail = (): string | null => {
  try {
    return localStorage.getItem(MAUTIC_EMAIL_KEY);
  } catch (error) {
    console.error('Failed to get Mautic email:', error);
    return null;
  }
};

/**
 * Clear stored email (e.g., on logout)
 */
export const clearMauticEmail = (): void => {
  try {
    localStorage.removeItem(MAUTIC_EMAIL_KEY);
    console.log('Mautic tracking email cleared');
  } catch (error) {
    console.error('Failed to clear Mautic email:', error);
  }
};
