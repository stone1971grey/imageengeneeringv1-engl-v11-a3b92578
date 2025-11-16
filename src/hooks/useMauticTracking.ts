import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getMauticEmail } from '@/lib/mauticTracking';

interface MauticTrackingConfig {
  email?: string;
  enabled?: boolean;
}

export const useMauticTracking = ({ email, enabled = true }: MauticTrackingConfig = {}) => {
  const location = useLocation();
  
  // Use provided email or get from localStorage
  const trackingEmail = email || getMauticEmail();

  useEffect(() => {
    if (!enabled || !trackingEmail) {
      return;
    }

    const trackPageview = async () => {
      try {
        const pageUrl = window.location.href;
        const pageTitle = document.title;

        console.log('Tracking pageview:', { email: trackingEmail, pageUrl, pageTitle });

        const { data, error } = await supabase.functions.invoke('track-mautic-pageview', {
          body: {
            email: trackingEmail,
            pageUrl,
            pageTitle,
          },
        });

        if (error) {
          console.error('Failed to track pageview:', error);
          return;
        }

        console.log('Pageview tracked successfully:', data);
      } catch (error) {
        console.error('Error tracking pageview:', error);
      }
    };

    // Track pageview after a short delay to ensure page is loaded
    const timeoutId = setTimeout(trackPageview, 500);

    return () => clearTimeout(timeoutId);
  }, [location, trackingEmail, enabled]);
};
