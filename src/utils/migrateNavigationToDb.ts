import { supabase } from "@/integrations/supabase/client";
import { navigationDataEn } from "@/translations/navigationData";
import { navigationDataDe } from "@/translations/navigationData.de";
import { navigationDataZh } from "@/translations/navigationData.zh";
import { navigationDataJa } from "@/translations/navigationData.ja";
import { navigationDataKo } from "@/translations/navigationData.ko";

interface NavigationLink {
  slug: string;
  label_key: string;
  language: string;
  category: string;
  parent_category?: string;
  parent_label?: string;
  position: number;
  active: boolean;
  description?: string;
}

/**
 * Migrate navigation data from static files to database
 * This function extracts all links from navigationData files and inserts them into navigation_links table
 */
export const migrateNavigationToDb = async () => {
  const allLinks: NavigationLink[] = [];
  
  // Helper to extract links from navigation structure
  const extractLinks = (
    data: any,
    language: string,
    category: string
  ) => {
    let position = 0;
    
    Object.entries(data).forEach(([parentKey, parentValue]: [string, any]) => {
      if (parentValue.subgroups) {
        // Has subgroups (like industries, products)
        parentValue.subgroups.forEach((subgroup: any, index: number) => {
          if (subgroup.link && subgroup.link !== "#") {
            allLinks.push({
              slug: subgroup.link,
              label_key: `${category}.${parentKey}.${subgroup.name}`,
              language,
              category,
              parent_category: parentKey,
              parent_label: subgroup.name,
              position: position++,
              active: subgroup.active || true,
              description: parentValue.description
            });
          }
        });
      } else if (parentValue.services) {
        // Has services (like testServices)
        parentValue.services.forEach((service: any, index: number) => {
          if (service.link && service.link !== "#") {
            allLinks.push({
              slug: service.link,
              label_key: `${category}.${parentKey}.${service.name}`,
              language,
              category,
              parent_category: parentKey,
              parent_label: service.name,
              position: position++,
              active: service.active || true,
              description: parentValue.description
            });
          }
        });
      }
    });
  };

  // Extract from all language versions
  const datasets = [
    { data: navigationDataEn, lang: 'en' },
    { data: navigationDataDe, lang: 'de' },
    { data: navigationDataZh, lang: 'zh' },
    { data: navigationDataJa, lang: 'ja' },
    { data: navigationDataKo, lang: 'ko' }
  ];

  datasets.forEach(({ data, lang }) => {
    // Extract from each category
    if (data.industries) extractLinks(data.industries, lang, 'industries');
    if (data.products) extractLinks(data.products, lang, 'products');
    if (data.testServices) extractLinks(data.testServices, lang, 'testServices');
  });

  console.log(`Migrating ${allLinks.length} navigation links to database...`);

  // Clear existing data (optional - only on first migration)
  const { error: deleteError } = await supabase
    .from('navigation_links')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.error('Error clearing navigation_links:', deleteError);
    throw deleteError;
  }

  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < allLinks.length; i += batchSize) {
    const batch = allLinks.slice(i, i + batchSize);
    const { error } = await supabase
      .from('navigation_links')
      .insert(batch);

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }
  }

  console.log('Navigation migration completed successfully!');
  return allLinks.length;
};
