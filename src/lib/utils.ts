import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Handles navigation to a link, automatically detecting external vs internal links.
 * - External links (starting with http:// or https://) open in new tab
 * - Links that look like domains (www.example.com or example.com) get https:// prefix and open in new tab
 * - Anchor links (#section) trigger smooth scroll
 * - Internal relative links navigate within the app
 */
export function navigateToLink(link?: string) {
  if (!link) return;
  
  // Handle anchor links (smooth scroll)
  if (link.startsWith('#')) {
    const element = document.getElementById(link.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }
  
  // Check if link is external (starts with http:// or https://)
  const isExternalLink = link.startsWith('http://') || link.startsWith('https://');
  
  // Check if link looks like an external domain but is missing protocol
  const looksLikeExternalDomain = /^(www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(link);
  
  if (isExternalLink) {
    // Open external link in new tab
    window.open(link, '_blank', 'noopener,noreferrer');
  } else if (looksLikeExternalDomain) {
    // Add https:// prefix and open in new tab
    window.open(`https://${link}`, '_blank', 'noopener,noreferrer');
  } else {
    // Internal relative link
    window.location.href = link;
  }
}
