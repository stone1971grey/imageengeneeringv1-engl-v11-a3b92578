import { supabase } from "@/integrations/supabase/client";
import { extractFilePathFromUrl } from "./updateSegmentMapping";

/**
 * Loads the alt text for an image from the file_segment_mappings table.
 * Supports multilingual alt text via alt_text_translations jsonb field.
 * Falls back to English if the requested language is not available.
 * Returns the alt text if found, or an empty string if not found or on error.
 */
export async function loadAltTextFromMapping(
  imageUrl: string,
  bucketId: string = 'page-images',
  language: string = 'en'
): Promise<string> {
  if (!imageUrl) return '';
  
  const filePath = extractFilePathFromUrl(imageUrl);
  if (!filePath) return '';
  
  // Normalize language code (e.g., "de-DE" -> "de")
  const normalizedLang = language.split('-')[0];
  
  try {
    const { data, error } = await supabase
      .from('file_segment_mappings')
      .select('alt_text, alt_text_translations')
      .eq('file_path', filePath)
      .eq('bucket_id', bucketId)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading alt text:', error);
      return '';
    }
    
    if (!data) return '';
    
    // Try to get alt text from translations first
    const translations = data.alt_text_translations as Record<string, string> | null;
    if (translations) {
      // Try requested language first, then English fallback
      if (translations[normalizedLang]) {
        return translations[normalizedLang];
      }
      if (translations['en']) {
        return translations['en'];
      }
    }
    
    // Final fallback to legacy alt_text field
    return data.alt_text || '';
  } catch (error) {
    console.error('Error loading alt text:', error);
    return '';
  }
}

/**
 * Loads all alt text translations for an image.
 * Returns an object with language codes as keys and alt texts as values.
 */
export async function loadAltTextTranslationsFromMapping(
  imageUrl: string,
  bucketId: string = 'page-images'
): Promise<Record<string, string>> {
  if (!imageUrl) return {};
  
  const filePath = extractFilePathFromUrl(imageUrl);
  if (!filePath) return {};
  
  try {
    const { data, error } = await supabase
      .from('file_segment_mappings')
      .select('alt_text, alt_text_translations')
      .eq('file_path', filePath)
      .eq('bucket_id', bucketId)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading alt text translations:', error);
      return {};
    }
    
    if (!data) return {};
    
    // Return translations if available
    const translations = data.alt_text_translations as Record<string, string> | null;
    if (translations && Object.keys(translations).length > 0) {
      return translations;
    }
    
    // Fallback: if only legacy alt_text exists, return it as English
    if (data.alt_text) {
      return { en: data.alt_text };
    }
    
    return {};
  } catch (error) {
    console.error('Error loading alt text translations:', error);
    return {};
  }
}
