import { useMauticTracking } from '@/hooks/useMauticTracking';

interface MauticTrackerProps {
  email: string;
  enabled?: boolean;
}

/**
 * Component that tracks page views in Mautic for a given email address.
 * Add this component anywhere in your app where you want to track user activity.
 * 
 * @example
 * <MauticTracker email="test2@sptools.de" />
 */
export const MauticTracker = ({ email, enabled = true }: MauticTrackerProps) => {
  useMauticTracking({ email, enabled });
  return null;
};
