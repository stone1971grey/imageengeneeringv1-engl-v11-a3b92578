import { useMauticTracking } from '@/hooks/useMauticTracking';

interface MauticTrackerProps {
  email?: string;
  enabled?: boolean;
}

/**
 * Component that tracks page views in Mautic.
 * If no email is provided, it will automatically use the stored email from localStorage.
 * Email is stored automatically after event registration or download form submission.
 * 
 * @example
 * // Auto-tracking from localStorage
 * <MauticTracker />
 * 
 * // Manual tracking with specific email
 * <MauticTracker email="user@example.com" />
 */
export const MauticTracker = ({ email, enabled = true }: MauticTrackerProps = {}) => {
  useMauticTracking({ email, enabled });
  return null;
};
