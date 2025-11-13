import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  robotsIndex?: 'index' | 'noindex';
  robotsFollow?: 'follow' | 'nofollow';
}

/**
 * Component to dynamically set SEO meta tags in the document head
 * Used on all frontend pages to apply SEO settings from the CMS
 */
export const SEOHead = ({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard = 'summary_large_image',
  robotsIndex = 'index',
  robotsFollow = 'follow'
}: SEOHeadProps) => {
  
  useEffect(() => {
    // Set document title
    if (title) {
      document.title = title;
    }

    // Helper function to set or update meta tag
    const setMetaTag = (selector: string, attribute: string, content: string) => {
      if (!content) return;
      
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('property=')) {
          element.setAttribute('property', selector.split('"')[1]);
        } else if (selector.includes('name=')) {
          element.setAttribute('name', selector.split('"')[1]);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Set meta description
    if (description) {
      setMetaTag('meta[name="description"]', 'content', description);
    }

    // Set canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // Set robots meta tag
    const robotsContent = `${robotsIndex}, ${robotsFollow}`;
    setMetaTag('meta[name="robots"]', 'content', robotsContent);

    // Set Open Graph tags
    if (ogTitle || title) {
      setMetaTag('meta[property="og:title"]', 'content', ogTitle || title || '');
    }
    if (ogDescription || description) {
      setMetaTag('meta[property="og:description"]', 'content', ogDescription || description || '');
    }
    if (ogImage) {
      setMetaTag('meta[property="og:image"]', 'content', ogImage);
    }
    setMetaTag('meta[property="og:type"]', 'content', 'website');

    // Set Twitter Card tags
    setMetaTag('meta[name="twitter:card"]', 'content', twitterCard);
    if (ogTitle || title) {
      setMetaTag('meta[name="twitter:title"]', 'content', ogTitle || title || '');
    }
    if (ogDescription || description) {
      setMetaTag('meta[name="twitter:description"]', 'content', ogDescription || description || '');
    }
    if (ogImage) {
      setMetaTag('meta[name="twitter:image"]', 'content', ogImage);
    }

  }, [title, description, canonical, ogTitle, ogDescription, ogImage, twitterCard, robotsIndex, robotsFollow]);

  // This component doesn't render anything
  return null;
};
