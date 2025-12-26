import { useState, useEffect, memo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SimpleRichTextEditor } from "@/components/admin/SimpleRichTextEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { en } from "@/translations/en";
import { type ImageMetadata, extractImageMetadata, formatFileSize, formatUploadDate } from "@/types/imageMetadata";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { loadAltTextFromMapping } from "@/utils/loadAltTextFromMapping";
import { ensureMediaFolderHierarchy, createOrUpdateFileMapping } from "@/utils/ensureMediaFolder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
export type FooterEditorLanguage = "en" | "de" | "ja" | "ko" | "zh";

interface FooterEditorProps {
  pageSlug: string;
  language: FooterEditorLanguage;
  segmentId?: number | string;
  onSave?: () => void;
}

const FOOTER_SECTION_KEYS = [
  "footer_cta_title",
  "footer_cta_description",
  "footer_contact_headline",
  "footer_contact_subline",
  "footer_contact_description",
  "footer_team_image_url",
  "footer_team_image_metadata",
  "footer_team_quote",
  "footer_team_name",
  "footer_team_title",
  "footer_button_text",
  "footer_button_url",
] as const;

type FooterSectionKey = (typeof FOOTER_SECTION_KEYS)[number];
type FooterContentMap = Partial<Record<FooterSectionKey, string>>;

const getEnglishDefaults = (): FooterContentMap => ({
  footer_cta_title: en.footer.cta.default,
  footer_cta_description: en.footer.ctaDesc.default,
  footer_contact_headline: en.footer.contactHeadline.default,
  footer_contact_subline: en.footer.contactSubline.default,
  footer_contact_description: en.footer.contactDesc.default,
  footer_team_quote: en.footer.teamQuote.default,
  footer_team_name: en.footer.teamName.default,
  footer_team_title: en.footer.teamTitle.default,
  footer_button_text: en.footer.button.default,
  footer_button_url: "/contact",
});

const FooterEditorComponent = ({ pageSlug, language, segmentId, onSave }: FooterEditorProps) => {
  const [footerCtaTitle, setFooterCtaTitle] = useState("");
  const [footerCtaDescription, setFooterCtaDescription] = useState("");
  const [footerContactHeadline, setFooterContactHeadline] = useState("");
  const [footerContactSubline, setFooterContactSubline] = useState("");
  const [footerContactDescription, setFooterContactDescription] = useState("");
  const [footerTeamQuote, setFooterTeamQuote] = useState("");
  const [footerTeamName, setFooterTeamName] = useState("");
  const [footerTeamTitle, setFooterTeamTitle] = useState("");
  const [footerButtonText, setFooterButtonText] = useState("");
  const [footerButtonUrl, setFooterButtonUrl] = useState("");
  const [teamImageUrl, setTeamImageUrl] = useState("");
  const [teamImageMetadata, setTeamImageMetadata] = useState<ImageMetadata | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!pageSlug) return;
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSlug, language]);

  // Listen for Rainbow SplitScreen translate button (footer-translate)
  useEffect(() => {
    if (language === "en") return;

    const handleExternalTranslate = () => {
      handleTranslate();
    };

    window.addEventListener("footer-translate", handleExternalTranslate);
    return () => window.removeEventListener("footer-translate", handleExternalTranslate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, pageSlug]);

  const applyFields = async (map: FooterContentMap) => {
    setFooterCtaTitle(map.footer_cta_title ?? "");
    setFooterCtaDescription(map.footer_cta_description ?? "");
    setFooterContactHeadline(map.footer_contact_headline ?? "");
    setFooterContactSubline(map.footer_contact_subline ?? "");
    setFooterContactDescription(map.footer_contact_description ?? "");
    setFooterTeamQuote(map.footer_team_quote ?? "");
    setFooterTeamName(map.footer_team_name ?? "");
    setFooterTeamTitle(map.footer_team_title ?? "");
    setFooterButtonText(map.footer_button_text ?? "");
    setFooterButtonUrl(map.footer_button_url ?? "");

    if (map.footer_team_image_url) {
      setTeamImageUrl(map.footer_team_image_url);
      console.log("[FooterEditor] Image URL found:", map.footer_team_image_url);
      
      // Load alt text from Media Management first
      const mediaAltText = await loadAltTextFromMapping(map.footer_team_image_url, 'page-images', language);
      console.log("[FooterEditor] Alt text from Media Management:", mediaAltText);
      
      // Load metadata including alt text, or create empty metadata if image exists
      if (map.footer_team_image_metadata) {
        try {
          const parsed = JSON.parse(map.footer_team_image_metadata);
          console.log("[FooterEditor] Parsed metadata:", parsed);
          // Prefer Media Management alt text over stored metadata
          setTeamImageMetadata({
            ...parsed,
            altText: mediaAltText || parsed.altText || ""
          });
        } catch (e) {
          console.log("[FooterEditor] Failed to parse metadata, creating default");
          setTeamImageMetadata({
            originalFileName: map.footer_team_image_url.split('/').pop() || 'image',
            width: 0,
            height: 0,
            fileSizeKB: 0,
            format: map.footer_team_image_url.split('.').pop() || 'unknown',
            uploadDate: new Date().toISOString(),
            url: map.footer_team_image_url,
            altText: mediaAltText || ""
          });
        }
      } else {
        console.log("[FooterEditor] No metadata found, creating default for existing image");
        setTeamImageMetadata({
          originalFileName: map.footer_team_image_url.split('/').pop() || 'image',
          width: 0,
          height: 0,
          fileSizeKB: 0,
          format: map.footer_team_image_url.split('.').pop() || 'unknown',
          uploadDate: new Date().toISOString(),
          url: map.footer_team_image_url,
          altText: mediaAltText || ""
        });
      }
    } else {
      console.log("[FooterEditor] No image URL found");
      setTeamImageUrl("");
      setTeamImageMetadata(null);
    }
  };

  const ensureEnglishDefaults = async (): Promise<FooterContentMap> => {
    const defaultMap = getEnglishDefaults();

    try {
      const { data, error } = await supabase
        .from("page_content")
        .select("section_key, content_value")
        .eq("page_slug", pageSlug)
        .eq("language", "en")
        .in("section_key", FOOTER_SECTION_KEYS as unknown as string[]);

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      const existingMap: FooterContentMap = {};
      if (data && data.length > 0) {
        data.forEach((row: any) => {
          existingMap[row.section_key as FooterSectionKey] = row.content_value ?? "";
        });
      }

      // If we already have complete English content, use it as baseline
      if (Object.keys(existingMap).length > 0) {
        return { ...defaultMap, ...existingMap };
      }

      // Otherwise seed the backend with English defaults (same for all pages)
      const user = (await supabase.auth.getUser()).data.user;
      const rows = FOOTER_SECTION_KEYS.map((key) => ({
        page_slug: pageSlug,
        section_key: key,
        content_type: "text",
        content_value: defaultMap[key] ?? "",
        language: "en" as const,
        updated_at: new Date().toISOString(),
        updated_by: user?.id ?? null,
      }));

      const { error: upsertError } = await supabase
        .from("page_content")
        .upsert(rows, { onConflict: "page_slug,section_key,language" });

      if (upsertError) {
        throw upsertError;
      }

      return defaultMap;
    } catch (error) {
      console.error("[FooterEditor] Error ensuring English defaults:", error);
      toast.error("Failed to prepare English default footer content");
      return defaultMap;
    }
  };

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const englishMap = await ensureEnglishDefaults();

      if (language === "en") {
        applyFields(englishMap);
        return;
      }

      const { data, error } = await supabase
        .from("page_content")
        .select("section_key, content_value")
        .eq("page_slug", pageSlug)
        .eq("language", language)
        .in("section_key", FOOTER_SECTION_KEYS as unknown as string[]);

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      const langMap: FooterContentMap = {};
      if (data && data.length > 0) {
        data.forEach((row: any) => {
          langMap[row.section_key as FooterSectionKey] = row.content_value ?? "";
        });
      }

      // If no specific content exists for this language, prefill from English
      if (Object.keys(langMap).length === 0) {
        applyFields(englishMap);
      } else {
        applyFields({ ...englishMap, ...langMap });
      }
    } catch (error) {
      console.error("[FooterEditor] Error loading footer content:", error);
      toast.error("Failed to load footer content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (language === "en") {
      toast.error("Translation not needed - English is the source language");
      return;
    }

    setIsTranslating(true);

    try {
      const englishMap = await ensureEnglishDefaults();

      const textsToTranslate: Record<string, string> = {
        footer_cta_title: englishMap.footer_cta_title ?? "",
        footer_cta_description: englishMap.footer_cta_description ?? "",
        footer_contact_headline: englishMap.footer_contact_headline ?? "",
        footer_contact_subline: englishMap.footer_contact_subline ?? "",
        footer_contact_description: englishMap.footer_contact_description ?? "",
        footer_team_quote: englishMap.footer_team_quote ?? "",
        footer_team_name: englishMap.footer_team_name ?? "",
        footer_team_title: englishMap.footer_team_title ?? "",
        footer_button_text: englishMap.footer_button_text ?? "",
      };

      const { data: translateData, error: translateError } = await supabase.functions.invoke(
        "translate-content",
        {
          body: {
            texts: textsToTranslate,
            targetLanguage: language,
          },
        }
      );

      if (translateError) throw translateError;

      if (translateData?.translatedTexts) {
        const translated = translateData.translatedTexts as Record<string, string>;
        setFooterCtaTitle(translated.footer_cta_title || englishMap.footer_cta_title || "");
        setFooterCtaDescription(translated.footer_cta_description || englishMap.footer_cta_description || "");
        setFooterContactHeadline(translated.footer_contact_headline || englishMap.footer_contact_headline || "");
        setFooterContactSubline(translated.footer_contact_subline || englishMap.footer_contact_subline || "");
        setFooterContactDescription(
          translated.footer_contact_description || englishMap.footer_contact_description || ""
        );
        setFooterTeamQuote(translated.footer_team_quote || englishMap.footer_team_quote || "");
        setFooterTeamName(translated.footer_team_name || englishMap.footer_team_name || "");
        setFooterTeamTitle(translated.footer_team_title || englishMap.footer_team_title || "");
        setFooterButtonText(translated.footer_button_text || englishMap.footer_button_text || "");
        // Copy button URL from English (URLs don't need translation)
        setFooterButtonUrl(englishMap.footer_button_url || "/contact");

        // CRITICAL: Also copy the image from English version if it exists
        if (englishMap.footer_team_image_url && !teamImageUrl) {
          console.log("[FooterEditor] Copying image from EN:", englishMap.footer_team_image_url);
          setTeamImageUrl(englishMap.footer_team_image_url);
          
          // Also load/create metadata for the image
          if (englishMap.footer_team_image_metadata) {
            try {
              const parsed = JSON.parse(englishMap.footer_team_image_metadata);
              setTeamImageMetadata(parsed);
            } catch {
              setTeamImageMetadata({
                originalFileName: englishMap.footer_team_image_url.split('/').pop() || 'image',
                width: 0,
                height: 0,
                fileSizeKB: 0,
                format: englishMap.footer_team_image_url.split('.').pop() || 'unknown',
                uploadDate: new Date().toISOString(),
                url: englishMap.footer_team_image_url,
                altText: ""
              });
            }
          } else {
            setTeamImageMetadata({
              originalFileName: englishMap.footer_team_image_url.split('/').pop() || 'image',
              width: 0,
              height: 0,
              fileSizeKB: 0,
              format: englishMap.footer_team_image_url.split('.').pop() || 'unknown',
              uploadDate: new Date().toISOString(),
              url: englishMap.footer_team_image_url,
              altText: ""
            });
          }
        }

        toast.success("Footer content translated successfully");
      }
    } catch (error: any) {
      console.error("[FooterEditor] Translation error", error);
      toast.error(error.message || "Failed to translate footer content");
    } finally {
      setTimeout(() => setIsTranslating(false), 600);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);

    try {
      // STEP 1: Ensure the folder hierarchy exists in media_folders
      const folderResult = await ensureMediaFolderHierarchy(pageSlug);
      if (!folderResult) {
        console.warn('[FooterEditor] Could not ensure folder hierarchy, uploading to root');
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `footer-team-${Date.now()}.${fileExt}`;
      
      // STEP 2: Use the storage path from folder hierarchy
      const storagePath = folderResult?.storagePath || pageSlug;
      const filePath = storagePath ? `${storagePath}/${fileName}` : fileName;

      console.log('[FooterEditor] Uploading image to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from("page-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("page-images").getPublicUrl(filePath);

      const metadata = await extractImageMetadata(file, publicUrl);

      setTeamImageUrl(publicUrl);
      setTeamImageMetadata({ ...metadata, altText: "" });

      const user = (await supabase.auth.getUser()).data.user;

      // STEP 3: Save to page_content
      const { error: dbError } = await supabase
        .from("page_content")
        .upsert(
          {
            page_slug: pageSlug,
            section_key: "footer_team_image_url",
            content_type: "image_url",
            content_value: publicUrl,
            language,
            updated_at: new Date().toISOString(),
            updated_by: user?.id ?? null,
          },
          { onConflict: "page_slug,section_key,language" }
        );

      if (dbError) throw dbError;

      // STEP 4: Create file_segment_mapping for proper Media Management assignment
      const segmentIdentifier = `footer-${pageSlug}`;
      await createOrUpdateFileMapping(filePath, segmentIdentifier, '');

      console.log('[FooterEditor] Image uploaded to folder:', filePath, 'with segment:', segmentIdentifier);
      toast.success("Team image uploaded successfully!");
    } catch (error: any) {
      console.error("[FooterEditor] Error uploading image", error);
      toast.error(error.message || "Error uploading team image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const saveContent = async () => {
    setIsSaving(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const rows: any[] = [
        {
          page_slug: pageSlug,
          section_key: "footer_cta_title",
          content_type: "text",
          content_value: footerCtaTitle,
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        {
          page_slug: pageSlug,
          section_key: "footer_cta_description",
          content_type: "text",
          content_value: footerCtaDescription,
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        {
          page_slug: pageSlug,
          section_key: "footer_contact_headline",
          content_type: "text",
          content_value: footerContactHeadline,
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        {
          page_slug: pageSlug,
          section_key: "footer_contact_subline",
          content_type: "text",
          content_value: footerContactSubline,
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        {
          page_slug: pageSlug,
          section_key: "footer_contact_description",
          content_type: "text",
          content_value: footerContactDescription,
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        {
          page_slug: pageSlug,
          section_key: "footer_team_quote",
          content_type: "text",
          content_value: footerTeamQuote,
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        {
          page_slug: pageSlug,
          section_key: "footer_team_name",
          content_type: "text",
          content_value: footerTeamName,
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        {
          page_slug: pageSlug,
          section_key: "footer_team_title",
          content_type: "text",
          content_value: footerTeamTitle,
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        {
          page_slug: pageSlug,
          section_key: "footer_button_text",
          content_type: "text",
          content_value: footerButtonText,
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        {
          page_slug: pageSlug,
          section_key: "footer_button_url",
          content_type: "text",
          content_value: footerButtonUrl,
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
      ];

      if (teamImageUrl) {
        rows.push({
          page_slug: pageSlug,
          section_key: "footer_team_image_url",
          content_type: "image_url",
          content_value: teamImageUrl,
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        });
      }
      // Note: Image deletion is handled directly via the trash icon dialog,
      // so we don't need to cascade here during save

      if (teamImageMetadata) {
        rows.push({
          page_slug: pageSlug,
          section_key: "footer_team_image_metadata",
          content_type: "json",
          content_value: JSON.stringify(teamImageMetadata),
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        });
      }

      const { error } = await supabase
        .from("page_content")
        .upsert(rows, { onConflict: "page_slug,section_key,language" });

      if (error) throw error;

      toast.success("Footer section saved successfully");
      if (onSave) onSave();
    } catch (error: any) {
      console.error("[FooterEditor] Error saving footer", error);
      toast.error(error.message || "Error saving footer section");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-sm text-white">Loading footer...</div>;
  }

  return (
    <div className="space-y-6 p-4 bg-background border rounded-lg">
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg p-4 text-center text-white font-semibold animate-pulse shadow-lg shadow-purple-500/50">
          ⏳ Translating footer content...
        </div>
      )}

      {/* Vision CTA Section */}
      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold text-white mb-4">1. Vision CTA Section</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="footer_cta_title" className="text-white">
              CTA Title
            </Label>
            <Input
              id="footer_cta_title"
              value={footerCtaTitle}
              onChange={(e) => setFooterCtaTitle(e.target.value)}
              placeholder="e.g., Ready to transform your vision?"
              className="border-2 border-gray-600"
            />
          </div>

          <div>
            <Label className="text-white">
              CTA Description
            </Label>
            <SimpleRichTextEditor
              value={footerCtaDescription}
              onChange={setFooterCtaDescription}
              placeholder="Describe your vision..."
              storageKey={`footer-cta-desc-${pageSlug}`}
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold text-white mb-4">2. Contact Section</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="footer_contact_headline" className="text-white">
              Contact Headline (Line 1)
            </Label>
            <Input
              id="footer_contact_headline"
              value={footerContactHeadline}
              onChange={(e) => setFooterContactHeadline(e.target.value)}
              placeholder="e.g., Have questions?"
              className="border-2 border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="footer_contact_subline" className="text-white">
              Contact Headline (Line 2)
            </Label>
            <Input
              id="footer_contact_subline"
              value={footerContactSubline}
              onChange={(e) => setFooterContactSubline(e.target.value)}
              placeholder="e.g., Speak with us."
              className="border-2 border-gray-600"
            />
          </div>

          <div>
            <Label className="text-white">
              Contact Description
            </Label>
            <SimpleRichTextEditor
              value={footerContactDescription}
              onChange={setFooterContactDescription}
              placeholder="Contact description..."
              storageKey={`footer-contact-desc-${pageSlug}`}
            />
          </div>

          <div>
            <Label htmlFor="footer_button_text" className="text-white">
              Button Text
            </Label>
            <Input
              id="footer_button_text"
              value={footerButtonText}
              onChange={(e) => setFooterButtonText(e.target.value)}
              placeholder="e.g., Get in contact with us"
              className="border-2 border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="footer_button_url" className="text-white">
              Button URL
            </Label>
            <Input
              id="footer_button_url"
              value={footerButtonUrl}
              onChange={(e) => setFooterButtonUrl(e.target.value)}
              placeholder="e.g., /contact or https://..."
              className="border-2 border-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Team Quote Section */}
      <div className="pb-6">
        <h3 className="text-lg font-semibold text-white mb-4">3. Team Quote Section</h3>

        <div className="space-y-4">
          <div>
            <Label className="text-white">Team Member Photo</Label>
            <MediaSelector
              label=""
              acceptedFileTypes="image/*"
              currentImageUrl={teamImageUrl}
              previewSize="small"
              onFileSelect={async (file) => {
                console.log("[FooterEditor] onFileSelect triggered with file:", file.name, file.type, file.size);
                if (!file.type.startsWith("image/")) {
                  toast.error("Please upload an image file");
                  return;
                }
                if (file.size > 5 * 1024 * 1024) {
                  toast.error("Image size must be less than 5MB");
                  return;
                }
                setIsUploadingImage(true);
                console.log("[FooterEditor] Starting upload for pageSlug:", pageSlug);
                try {
                  // Ensure folder hierarchy exists and get the storage path
                  const folderResult = await ensureMediaFolderHierarchy(pageSlug);
                  console.log("[FooterEditor] Folder result:", folderResult);
                  
                  const fileExt = file.name.split(".").pop();
                  const baseFileName = `footer-team-${Date.now()}.${fileExt}`;
                  
                  // Use folder path if available, otherwise fallback to root
                  const uploadPath = folderResult?.storagePath 
                    ? `${folderResult.storagePath}/${baseFileName}`
                    : baseFileName;
                  
                  console.log("[FooterEditor] Uploading to path:", uploadPath);
                  
                  const { error: uploadError } = await supabase.storage
                    .from("page-images")
                    .upload(uploadPath, file, { cacheControl: "3600", upsert: false });
                  
                  if (uploadError) {
                    console.error("[FooterEditor] Upload error:", uploadError);
                    throw uploadError;
                  }
                  
                  const { data: { publicUrl } } = supabase.storage.from("page-images").getPublicUrl(uploadPath);
                  console.log("[FooterEditor] Upload successful, URL:", publicUrl);
                  
                  // Create file-segment mapping for Media Management (use only segment ID)
                  if (segmentId) {
                    await createOrUpdateFileMapping(uploadPath, String(segmentId), "");
                    console.log("[FooterEditor] File mapping created for:", uploadPath, "-> segment", segmentId);
                  }
                  
                  const metadata = await extractImageMetadata(file, publicUrl);
                  setTeamImageUrl(publicUrl);
                  setTeamImageMetadata({ ...metadata, altText: "" });
                  toast.success("Team image uploaded successfully!");
                } catch (error: any) {
                  console.error("[FooterEditor] Error uploading image", error);
                  toast.error(error.message || "Error uploading team image");
                } finally {
                  setIsUploadingImage(false);
                }
              }}
              onMediaSelect={(url, metadata) => {
                setTeamImageUrl(url);
                // Create metadata object for alt text editing
                setTeamImageMetadata({
                  originalFileName: url.split('/').pop() || 'image',
                  width: 0,
                  height: 0,
                  fileSizeKB: 0,
                  format: url.split('.').pop() || 'unknown',
                  uploadDate: new Date().toISOString(),
                  url: url,
                  altText: metadata?.altText || ""
                });
                toast.success("Image selected from Media");
              }}
              onClear={() => {
                // In English: Show dialog asking if delete in all languages
                if (language === "en") {
                  setShowDeleteDialog(true);
                } else {
                  // Non-English: just remove locally
                  setTeamImageUrl("");
                  setTeamImageMetadata(null);
                  toast.info("Image removed for this language.");
                }
              }}
            />

            {/* Delete Image Dialog - only for English */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent className="bg-gray-900 border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Team Image</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Do you want to delete this image only in English or in all language versions?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="bg-gray-700 text-white hover:bg-gray-600 border-none"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-yellow-500 text-black hover:bg-yellow-400"
                    onClick={async () => {
                      console.log("[FooterEditor] Deleting image for English only...");
                      // Delete only in English
                      setTeamImageUrl("");
                      setTeamImageMetadata(null);
                      
                      // Also delete from database for EN only
                      const user = (await supabase.auth.getUser()).data.user;
                      if (user) {
                        const { error: error1 } = await supabase
                          .from("page_content")
                          .delete()
                          .eq("page_slug", pageSlug)
                          .eq("section_key", "footer_team_image_url")
                          .eq("language", "en");
                        const { error: error2 } = await supabase
                          .from("page_content")
                          .delete()
                          .eq("page_slug", pageSlug)
                          .eq("section_key", "footer_team_image_metadata")
                          .eq("language", "en");
                        console.log("[FooterEditor] Delete EN result:", { error1, error2 });
                      }
                      toast.success("Image deleted for English only.");
                      setShowDeleteDialog(false);
                    }}
                  >
                    English only
                  </Button>
                  <Button
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={async () => {
                      console.log("[FooterEditor] Deleting image for ALL languages...");
                      // Delete in all languages
                      setTeamImageUrl("");
                      setTeamImageMetadata(null);
                      
                      const user = (await supabase.auth.getUser()).data.user;
                      if (user) {
                        const allLanguages: FooterEditorLanguage[] = ["en", "de", "ja", "ko", "zh"];
                        for (const lang of allLanguages) {
                          const { error: error1 } = await supabase
                            .from("page_content")
                            .delete()
                            .eq("page_slug", pageSlug)
                            .eq("section_key", "footer_team_image_url")
                            .eq("language", lang);
                          const { error: error2 } = await supabase
                            .from("page_content")
                            .delete()
                            .eq("page_slug", pageSlug)
                            .eq("section_key", "footer_team_image_metadata")
                            .eq("language", lang);
                          console.log(`[FooterEditor] Delete ${lang} result:`, { error1, error2 });
                        }
                      }
                      toast.success("Image deleted for all languages.");
                      setShowDeleteDialog(false);
                    }}
                  >
                    All languages
                  </Button>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            {teamImageMetadata && (
              <div className="mt-4 p-4 bg-gray-950 rounded-lg border-2 border-gray-600 space-y-2">
                <h4 className="font-semibold text-white text-lg mb-3">Image Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Original Name:</span>
                    <p className="text-white font-medium">{teamImageMetadata.originalFileName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Dimensions:</span>
                    <p className="text-white font-medium">
                      {teamImageMetadata.width} × {teamImageMetadata.height} px
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">File Size:</span>
                    <p className="text-white font-medium">
                      {formatFileSize(teamImageMetadata.fileSizeKB)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Format:</span>
                    <p className="text-white font-medium uppercase">{teamImageMetadata.format}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Upload Date:</span>
                    <p className="text-white font-medium">
                      {formatUploadDate(teamImageMetadata.uploadDate)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="footer_image_alt" className="text-white text-base">
                    Alt Text (SEO)
                  </Label>
                  <Input
                    id="footer_image_alt"
                    type="text"
                    value={teamImageMetadata.altText || ""}
                    onChange={(e) => {
                      const updatedMetadata: ImageMetadata = {
                        ...teamImageMetadata,
                        altText: e.target.value,
                      };
                      setTeamImageMetadata(updatedMetadata);
                    }}
                    placeholder="Describe this image for accessibility and SEO"
                    className="mt-2 bg-gray-800 border-2 border-gray-600 focus:border-[#f9dc24] text-lg text-white placeholder:text-gray-500 h-12"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Provide a descriptive alt text for screen readers and search engines
                  </p>
                </div>

              </div>
            )}
          </div>

          <div>
            <Label htmlFor="footer_team_quote" className="text-white">
              Team Quote
            </Label>
            <Input
              id="footer_team_quote"
              value={footerTeamQuote}
              onChange={(e) => setFooterTeamQuote(e.target.value)}
              placeholder="Team member's quote..."
              className="border-2 border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="footer_team_name" className="text-white">
              Team Member Name
            </Label>
            <Input
              id="footer_team_name"
              value={footerTeamName}
              onChange={(e) => setFooterTeamName(e.target.value)}
              placeholder="e.g., Laura Neumann"
              className="border-2 border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="footer_team_title" className="text-white">
              Team Member Title
            </Label>
            <Input
              id="footer_team_title"
              value={footerTeamTitle}
              onChange={(e) => setFooterTeamTitle(e.target.value)}
              placeholder="e.g., Head of Optical Systems"
              className="border-2 border-gray-600"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-600">
        <Button
          onClick={saveContent}
          disabled={isSaving}
          className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 w-full"
        >
          {isSaving ? "Saving..." : "Save Footer"}
        </Button>
      </div>
    </div>
  );
};

export const FooterEditor = memo(FooterEditorComponent);
