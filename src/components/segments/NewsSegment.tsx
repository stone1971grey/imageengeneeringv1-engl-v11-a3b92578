import { useMemo, useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Check, X, Loader2, Settings } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface NewsSegmentProps {
  id?: string;
  pageSlug?: string;
  // Fallback props if no dedicated config exists
  sectionTitle?: string;
  sectionDescription?: string;
  articleLimit?: number;
  categories?: string[];
  segmentKey?: string;
  language?: string;
  onContentUpdate?: () => void;
}

interface NewsConfig {
  title: string;
  description: string;
  articleLimit: number;
  categories: string[];
}

// All standard categories (must match NewsSegmentEditor)
const ALL_CATEGORIES = [
  "Company",
  "Product Launch",
  "Technology",
  "Standards",
  "Innovation",
  "Partnership",
  "Event",
  "Research",
  "Technical Report",
  "Industry News"
];

const NewsSegment = ({
  id,
  pageSlug = "index",
  sectionTitle: fallbackTitle = "Latest News",
  sectionDescription: fallbackDescription = "Stay updated with the latest developments in image quality testing and measurement technology",
  articleLimit: fallbackLimit = 12,
  categories: fallbackCategories = [],
  segmentKey = '',
  language: propLanguage,
  onContentUpdate
}: NewsSegmentProps) => {
  const { language } = useLanguage();
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;
  
  // Normalize language code (e.g., 'de-DE' -> 'de')
  const normalizedLang = propLanguage || language?.split('-')[0] || 'en';
  
  // Local state for editing
  const [showSettings, setShowSettings] = useState(false);
  const [editArticleLimit, setEditArticleLimit] = useState(fallbackLimit);
  const [editCategories, setEditCategories] = useState<string[]>(fallbackCategories);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load dedicated config for this news segment - language-specific with English fallback
  const { data: config, refetch: refetchConfig } = useQuery({
    queryKey: ["news-segment-config", pageSlug, id, normalizedLang],
    queryFn: async () => {
      if (!id) return null;
      
      const configSectionKey = `news-config-${id}`;
      
      // Try to load language-specific config first
      const { data: langData, error: langError } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", configSectionKey)
        .eq("language", normalizedLang)
        .maybeSingle();

      if (!langError && langData?.content_value) {
        return JSON.parse(langData.content_value) as NewsConfig;
      }
      
      // Fallback to English config
      const { data: enData, error: enError } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", configSectionKey)
        .eq("language", "en")
        .maybeSingle();

      if (enError || !enData?.content_value) return null;
      
      return JSON.parse(enData.content_value) as NewsConfig;
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  // Use dedicated config if available, otherwise fall back to props
  const sectionTitle = config?.title || fallbackTitle;
  const sectionDescription = config?.description || fallbackDescription;
  const articleLimit = config?.articleLimit || fallbackLimit;
  const filterCategories = config?.categories || fallbackCategories;

  // Sync local state with loaded config
  useEffect(() => {
    setEditArticleLimit(articleLimit);
    setEditCategories(filterCategories);
    setHasChanges(false);
  }, [articleLimit, filterCategories]);

  // Fetch news articles with category filter - language-specific with English fallback
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news-articles-segment", isEditing ? editArticleLimit : articleLimit, isEditing ? editCategories : filterCategories, normalizedLang],
    queryFn: async () => {
      const limit = isEditing ? editArticleLimit : articleLimit;
      const cats = isEditing ? editCategories : filterCategories;
      
      // First try to get articles in the current language
      let query = supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .eq("language", normalizedLang)
        .order("date", { ascending: false })
        .limit(limit);

      // Apply category filter if categories are selected
      if (cats && cats.length > 0) {
        query = query.in("category", cats);
      }

      const { data: langData, error: langError } = await query;
      
      // If we found articles in the target language, return them
      if (!langError && langData && langData.length > 0) {
        return langData;
      }
      
      // Fallback to English articles
      let fallbackQuery = supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .eq("language", "en")
        .order("date", { ascending: false })
        .limit(limit);

      if (cats && cats.length > 0) {
        fallbackQuery = fallbackQuery.in("category", cats);
      }

      const { data, error } = await fallbackQuery;
      if (error) throw error;
      return data;
    },
  });

  // Fetch all unique categories from database
  const { data: dbCategories } = useQuery({
    queryKey: ["news-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("category")
        .eq("published", true)
        .not("category", "is", null);
      
      if (error) throw error;
      
      // Get unique categories and sort alphabetically
      const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))].sort();
      return uniqueCategories as string[];
    },
  });

  // Use ALL_CATEGORIES as the standard list (matching backend editor)
  const availableCategories = ALL_CATEGORIES;

  const handleArticleLimitChange = (value: string) => {
    setEditArticleLimit(Number(value));
    setHasChanges(true);
  };

  const handleCategoryToggle = (category: string) => {
    setEditCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
    setHasChanges(true);
  };

  const handleSaveSettings = useCallback(async () => {
    if (!hasChanges) {
      setShowSettings(false);
      return;
    }

    setIsSaving(true);

    try {
      // Extract segment ID from segmentKey or use id
      const segmentId = segmentKey ? segmentKey.split('-').pop() : id;
      
      // Load page_segments
      let { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', normalizedLang)
        .maybeSingle();

      if (loadError) {
        console.error('[NewsSegment] Error loading:', loadError);
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      if (pageSegmentsData) {
        let segments: any[] = [];
        try {
          segments = JSON.parse(pageSegmentsData.content_value || '[]');
        } catch (e) {
          console.error('[NewsSegment] Error parsing:', e);
          toast.error('Error parsing content');
          setIsSaving(false);
          return;
        }

        const segmentIndex = segments.findIndex((seg: any) => {
          const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
          return segId === String(segmentId);
        });

        if (segmentIndex === -1) {
          console.error('[NewsSegment] Segment not found');
          toast.error('Segment not found');
          setIsSaving(false);
          return;
        }

        // Update segment data
        if (!segments[segmentIndex].data) {
          segments[segmentIndex].data = {};
        }
        segments[segmentIndex].data.articleLimit = editArticleLimit;
        segments[segmentIndex].data.categories = editCategories;

        const { data: { user } } = await supabase.auth.getUser();
        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString(),
            updated_by: user?.id
          })
          .eq('id', pageSegmentsData.id);

        if (updateError) {
          console.error('[NewsSegment] Error updating:', updateError);
          toast.error('Error saving');
          setIsSaving(false);
          return;
        }
      }

      toast.success('Settings saved!');
      setHasChanges(false);
      setShowSettings(false);
      refetchConfig();
      onContentUpdate?.();
    } catch (error) {
      console.error('[NewsSegment] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, segmentKey, id, pageSlug, normalizedLang, editArticleLimit, editCategories, refetchConfig, onContentUpdate]);

  const handleCancelSettings = () => {
    setEditArticleLimit(articleLimit);
    setEditCategories(filterCategories);
    setHasChanges(false);
    setShowSettings(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <section id={id} className="py-24 bg-[#373737]">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-white">Loading news...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    if (isEditing) {
      // Show empty state in edit mode
      return (
        <section id={id} className="pt-[70px] pb-24 bg-[#373737]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <EditableText
                value={sectionTitle}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={normalizedLang}
                className="text-4xl font-bold text-white mb-4"
                as="h2"
                onUpdate={onContentUpdate}
                fieldLabel="News Section Title"
              />
              <EditableText
                value={sectionDescription}
                sectionKey={`${segmentKey}-description`}
                pageSlug={pageSlug}
                language={normalizedLang}
                className="text-xl text-white/80 max-w-3xl mx-auto"
                as="p"
                multiline
                onUpdate={onContentUpdate}
                fieldLabel="News Section Description"
              />
            </div>
            <div className="text-center py-12">
              <p className="text-white/60">No news articles found with current filters</p>
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section id={id} className="pt-[70px] pb-24 bg-[#373737]">
      <div className="container mx-auto px-4">
        {/* Settings Panel */}
        {isEditing && showSettings && (
          <div className="bg-black/90 rounded-xl p-4 mb-6 border border-[#f9dc24]">
            <div className="flex flex-wrap items-start gap-6">
              {/* Article Limit */}
              <div className="flex flex-col gap-2">
                <label className="text-[#f9dc24] text-sm font-medium">Articles to show:</label>
                <Select value={String(editArticleLimit)} onValueChange={handleArticleLimitChange}>
                  <SelectTrigger className="w-24 bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 6, 9, 12, 15, 18].map(num => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[#f9dc24] text-sm font-medium">Filter by categories:</label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(category => (
                    <label
                      key={category}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-sm",
                        editCategories.includes(category)
                          ? "bg-[#f9dc24] text-black"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      )}
                    >
                      <Checkbox
                        checked={editCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                        className="hidden"
                      />
                      {category}
                    </label>
                  ))}
                </div>
                {editCategories.length === 0 && (
                  <p className="text-gray-400 text-xs">All categories will be shown when none selected</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end">
                <Button
                  onClick={handleCancelSettings}
                  variant="ghost"
                  size="sm"
                  disabled={isSaving}
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  size="sm"
                  disabled={isSaving || !hasChanges}
                  className="bg-[#f9dc24] text-black hover:bg-[#e5c91f]"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          {isEditing ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <EditableText
                  value={sectionTitle}
                  sectionKey={`${segmentKey}-title`}
                  pageSlug={pageSlug}
                  language={normalizedLang}
                  className="text-4xl font-bold text-white"
                  as="h2"
                  onUpdate={onContentUpdate}
                  fieldLabel="News Section Title"
                />
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "ml-2",
                    showSettings 
                      ? "bg-[#f9dc24] text-black hover:bg-[#e5c91f]" 
                      : "bg-black/50 text-[#f9dc24] hover:bg-black/70"
                  )}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <EditableText
                value={sectionDescription}
                sectionKey={`${segmentKey}-description`}
                pageSlug={pageSlug}
                language={normalizedLang}
                className="text-xl text-white/80 max-w-3xl mx-auto"
                as="p"
                multiline
                onUpdate={onContentUpdate}
                fieldLabel="News Section Description"
              />
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-white mb-4">{sectionTitle}</h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                {sectionDescription}
              </p>
            </>
          )}
        </div>

        <div className="relative max-w-7xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {newsItems.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="h-full hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] group flex flex-col">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="aspect-video overflow-hidden rounded-t-lg relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {item.category && (
                            <Badge className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 text-sm px-3 py-1">
                              {item.category}
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground font-medium">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed flex-1">
                          {item.teaser}
                        </p>
                        <Link to={`/${language}/news/${item.slug}`} className="w-full block">
                          <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 transition-colors duration-300 mt-auto">
                            {language === 'de' ? 'Mehr lesen' : language === 'ja' ? '続きを読む' : language === 'ko' ? '더 읽기' : language === 'zh' ? '阅读更多' : 'Read more'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default NewsSegment;
