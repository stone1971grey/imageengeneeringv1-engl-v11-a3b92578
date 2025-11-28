/**
 * Utility function to update slug references in navigationData files
 * This function should be called after updating a slug in the database
 * 
 * Usage: Call this manually when a slug is changed via EditSlugDialog
 */

export const generateUpdatedNavigationData = (fileContent: string, oldSlug: string, newSlug: string): string => {
  // Escape special characters in the old slug for regex
  const escapedOldSlug = oldSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Replace all occurrences of the old slug in link properties
  // Pattern matches: link: "/old-slug" or link: '/old-slug'
  const linkPattern = new RegExp(`(link:\\s*["'\`])${escapedOldSlug}(["'\`])`, 'g');
  
  return fileContent.replace(linkPattern, `$1${newSlug}$2`);
};

/**
 * File paths for all navigationData language versions
 */
export const NAVIGATION_DATA_FILES = [
  'src/translations/navigationData.ts',
  'src/translations/navigationData.de.ts',
  'src/translations/navigationData.zh.ts',
  'src/translations/navigationData.ja.ts',
  'src/translations/navigationData.ko.ts'
] as const;

/**
 * Remove all navigation entries matching the given slug
 */
export const generateNavigationDataWithoutSlug = (fileContent: string, slugToRemove: string): string => {
  // Escape special characters in the slug for regex
  const escapedSlug = slugToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Remove entire objects that contain the slug as a link
  // Pattern matches: { ...properties... link: "/slug-to-remove" ...properties... },
  const objectPattern = new RegExp(
    `\\{[^}]*link:\\s*["'\`]${escapedSlug}["'\`][^}]*\\},?\\s*`,
    'g'
  );
  
  return fileContent.replace(objectPattern, '');
};

/**
 * Instructions for automatic slug update in navigationData files:
 * 
 * When a slug is changed via EditSlugDialog:
 * 1. The database (page_registry, segment_registry, page_content) is automatically updated
 * 2. To update navigationData files, use lov-view to read each file
 * 3. Apply generateUpdatedNavigationData() to transform the content
 * 4. Use lov-write to save the updated file
 * 
 * When a page is deleted via CMSPageOverview:
 * 1. The database entries are removed
 * 2. Apply generateNavigationDataWithoutSlug() to remove the link from navigationData
 * 3. Use lov-write to save the updated file
 * 
 * This ensures all navigation links across all 5 language versions are synchronized
 * with the new slug without manual intervention.
 */
