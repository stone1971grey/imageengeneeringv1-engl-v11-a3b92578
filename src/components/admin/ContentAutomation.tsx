import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Globe, 
  Download, 
  FileText, 
  Video, 
  List, 
  Table, 
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ParsedContent {
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  specifications: { name: string; value: string }[];
  useCases: { title: string; description: string }[];
  downloads: { title: string; description: string; url: string; language: string }[];
  videoUrl: string | null;
  images: { url: string; title: string }[];
}

interface ContentAutomationProps {
  pageSlug: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onImportComplete?: () => void;
}

export const ContentAutomation = ({ pageSlug, language, onImportComplete }: ContentAutomationProps) => {
  const [sourceUrl, setSourceUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<{
    productHero: boolean;
    intro: boolean;
    specification: boolean;
    featureOverview: boolean;
    downloads: boolean;
    video: boolean;
  }>({
    productHero: true,
    intro: true,
    specification: true,
    featureOverview: true,
    downloads: true,
    video: true,
  });
  const [isImporting, setIsImporting] = useState(false);

  const handleFetchContent = async () => {
    if (!sourceUrl) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setParsedContent(null);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-external-content', {
        body: { url: sourceUrl, language },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setParsedContent(data.data);
        toast.success('Content fetched successfully!');
      } else {
        throw new Error(data?.error || 'Failed to parse content');
      }
    } catch (error: unknown) {
      console.error('Error fetching content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch content';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportContent = async () => {
    if (!parsedContent) return;

    setIsImporting(true);

    try {
      // Get the current max segment ID
      const { data: maxIdData } = await supabase
        .from('segment_registry')
        .select('segment_id')
        .order('segment_id', { ascending: false })
        .limit(1)
        .single();

      let nextSegmentId = (maxIdData?.segment_id || 0) + 1;

      // Get existing segments for this page
      const { data: existingRegistry } = await supabase
        .from('segment_registry')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('deleted', false);

      const existingSegmentTypes = new Set(existingRegistry?.map(s => s.segment_type) || []);

      // Prepare new segments to add
      const newRegistryEntries: any[] = [];
      const newSegments: any[] = [];
      let position = existingRegistry?.length || 0;

      // Filter downloads by language
      const filteredDownloads = parsedContent.downloads.filter(d => d.language === language);

      // Product Hero / Intro (if not exists)
      if (selectedSegments.productHero && !existingSegmentTypes.has('product-hero-gallery')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-hero-${segId}`,
          segment_type: 'product-hero-gallery',
          position: position++,
        });
        newSegments.push({
          id: String(segId),
          type: 'product-hero-gallery',
          data: {
            title: parsedContent.title,
            subtitle: parsedContent.subtitle || 'Product',
            description: parsedContent.description,
            imagePosition: 'right',
            layoutRatio: '2-5',
            topSpacing: 'small',
            cta1Text: 'Contact Sales',
            cta1Link: '/contact',
            cta1Style: 'standard',
            cta2Text: 'Learn More',
            cta2Link: '#specifications',
            cta2Style: 'outline-white',
            images: [],
            imageMaxWidth: 480,
          },
          position: position - 1,
        });
      }

      // Intro with benefits
      if (selectedSegments.intro && parsedContent.benefits.length > 0 && !existingSegmentTypes.has('intro')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-intro-${segId}`,
          segment_type: 'intro',
          position: position++,
        });
        const benefitsHtml = '<ul>' + parsedContent.benefits.map(b => `<li><strong>${b.split(' ').slice(0, 3).join(' ')}</strong> ${b.split(' ').slice(3).join(' ')}</li>`).join('') + '</ul>';
        newSegments.push({
          id: String(segId),
          type: 'intro',
          data: {
            title: 'Key Benefits',
            body: benefitsHtml,
            alignment: 'left',
            showDivider: false,
          },
          position: position - 1,
        });
      }

      // Specifications
      if (selectedSegments.specification && parsedContent.specifications.length > 0 && !existingSegmentTypes.has('specification')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-specs-${segId}`,
          segment_type: 'specification',
          position: position++,
        });
        newSegments.push({
          id: String(segId),
          type: 'specification',
          data: {
            title: 'Technical Specifications',
            rows: parsedContent.specifications.map(s => ({
              specification: s.name,
              value: s.value,
            })),
          },
          position: position - 1,
        });
      }

      // Feature Overview (Use Cases)
      if (selectedSegments.featureOverview && parsedContent.useCases.length > 0 && !existingSegmentTypes.has('feature-overview')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-features-${segId}`,
          segment_type: 'feature-overview',
          position: position++,
        });
        newSegments.push({
          id: String(segId),
          type: 'feature-overview',
          data: {
            title: 'Applications & Features',
            subtext: '',
            layout: '2',
            rows: '2',
            items: parsedContent.useCases.map(uc => ({
              title: uc.title,
              description: uc.description,
            })),
          },
          position: position - 1,
        });
      }

      // Downloads (Tiles)
      if (selectedSegments.downloads && filteredDownloads.length > 0 && !existingSegmentTypes.has('tiles')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-downloads-${segId}`,
          segment_type: 'tiles',
          position: position++,
        });
        newSegments.push({
          id: String(segId),
          type: 'tiles',
          data: {
            title: 'Downloads',
            columns: String(Math.min(filteredDownloads.length, 3)),
            items: filteredDownloads.map(d => ({
              title: d.title,
              description: d.description,
              icon: 'FileText',
              ctaText: 'Download PDF',
              ctaLink: d.url,
              showButton: true,
            })),
          },
          position: position - 1,
        });
      }

      // Video
      if (selectedSegments.video && parsedContent.videoUrl && !existingSegmentTypes.has('video')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-video-${segId}`,
          segment_type: 'video',
          position: position++,
        });
        newSegments.push({
          id: String(segId),
          type: 'video',
          data: {
            title: 'Product Video',
            videoUrl: parsedContent.videoUrl,
            aspectRatio: '16:9',
            autoplay: false,
            muted: true,
            loop: false,
          },
          position: position - 1,
        });
      }

      if (newRegistryEntries.length === 0) {
        toast.info('No new segments to import (segments already exist or none selected)');
        setIsImporting(false);
        return;
      }

      // Insert into segment_registry
      const { error: registryError } = await supabase
        .from('segment_registry')
        .insert(newRegistryEntries);

      if (registryError) throw registryError;

      // Load existing page_content
      const { data: existingContent } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .single();

      let existingSegments: any[] = [];
      if (existingContent?.content_value) {
        existingSegments = JSON.parse(existingContent.content_value);
      }

      // Merge segments
      const mergedSegments = [...existingSegments, ...newSegments];

      // Update tab_order
      const { data: tabOrderData } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'tab_order')
        .eq('language', language)
        .single();

      let tabOrder: string[] = [];
      if (tabOrderData?.content_value) {
        tabOrder = JSON.parse(tabOrderData.content_value);
      }
      const newTabOrder = [...tabOrder, ...newSegments.map(s => s.id)];

      // Save page_content
      const { error: contentError } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: 'page_segments',
          language,
          content_type: 'json',
          content_value: JSON.stringify(mergedSegments),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,section_key,language',
        });

      if (contentError) throw contentError;

      // Save tab_order
      const { error: tabError } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: 'tab_order',
          language,
          content_type: 'json',
          content_value: JSON.stringify(newTabOrder),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,section_key,language',
        });

      if (tabError) throw tabError;

      toast.success(`Successfully imported ${newSegments.length} segments!`);
      onImportComplete?.();

    } catch (error: unknown) {
      console.error('Error importing content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import content';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const toggleSegment = (key: keyof typeof selectedSegments) => {
    setSelectedSegments(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredDownloads = parsedContent?.downloads.filter(d => d.language === language) || [];

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#f9dc24]/20 rounded-lg">
            <Sparkles className="h-6 w-6 text-[#f9dc24]" />
          </div>
          <div>
            <CardTitle className="text-white text-xl">Content Automation</CardTitle>
            <CardDescription className="text-gray-400">
              Import content from external URLs and create segments automatically
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="sourceUrl" className="text-white flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Source URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.example.com/products/your-product"
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 flex-1"
            />
            <Button
              onClick={handleFetchContent}
              disabled={isLoading || !sourceUrl}
              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Fetch Content
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Note: Images and PDFs should be pre-uploaded to the Media Management folder for this page.
          </p>
        </div>

        {/* Parsed Content Preview */}
        {parsedContent && (
          <>
            <Separator className="bg-gray-700" />
            
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Content Preview
              </h3>

              <ScrollArea className="h-[400px] rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                <div className="space-y-4">
                  {/* Title & Description */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="productHero"
                        checked={selectedSegments.productHero}
                        onCheckedChange={() => toggleSegment('productHero')}
                      />
                      <Label htmlFor="productHero" className="text-white font-medium">
                        Product Hero Gallery
                      </Label>
                      <Badge variant="outline" className="text-xs">product-hero-gallery</Badge>
                    </div>
                    <div className="ml-6 p-3 bg-gray-900 rounded-lg">
                      <p className="text-lg font-bold text-white">{parsedContent.title}</p>
                      {parsedContent.subtitle && (
                        <p className="text-sm text-gray-400">{parsedContent.subtitle}</p>
                      )}
                      {parsedContent.description && (
                        <p className="text-sm text-gray-300 mt-2 line-clamp-3">{parsedContent.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  {parsedContent.benefits.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="intro"
                          checked={selectedSegments.intro}
                          onCheckedChange={() => toggleSegment('intro')}
                        />
                        <Label htmlFor="intro" className="text-white font-medium flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Key Benefits ({parsedContent.benefits.length})
                        </Label>
                        <Badge variant="outline" className="text-xs">intro</Badge>
                      </div>
                      <div className="ml-6 p-3 bg-gray-900 rounded-lg">
                        <ul className="text-sm text-gray-300 space-y-1">
                          {parsedContent.benefits.slice(0, 4).map((b, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#f9dc24]">•</span>
                              <span className="line-clamp-1">{b}</span>
                            </li>
                          ))}
                          {parsedContent.benefits.length > 4 && (
                            <li className="text-gray-500">+{parsedContent.benefits.length - 4} more...</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Specifications */}
                  {parsedContent.specifications.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="specification"
                          checked={selectedSegments.specification}
                          onCheckedChange={() => toggleSegment('specification')}
                        />
                        <Label htmlFor="specification" className="text-white font-medium flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          Specifications ({parsedContent.specifications.length})
                        </Label>
                        <Badge variant="outline" className="text-xs">specification</Badge>
                      </div>
                      <div className="ml-6 p-3 bg-gray-900 rounded-lg">
                        <div className="text-sm space-y-1">
                          {parsedContent.specifications.slice(0, 4).map((s, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-gray-400">{s.name}</span>
                              <span className="text-white">{s.value}</span>
                            </div>
                          ))}
                          {parsedContent.specifications.length > 4 && (
                            <p className="text-gray-500">+{parsedContent.specifications.length - 4} more...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Use Cases */}
                  {parsedContent.useCases.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="featureOverview"
                          checked={selectedSegments.featureOverview}
                          onCheckedChange={() => toggleSegment('featureOverview')}
                        />
                        <Label htmlFor="featureOverview" className="text-white font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Features & Use Cases ({parsedContent.useCases.length})
                        </Label>
                        <Badge variant="outline" className="text-xs">feature-overview</Badge>
                      </div>
                      <div className="ml-6 p-3 bg-gray-900 rounded-lg space-y-2">
                        {parsedContent.useCases.slice(0, 3).map((uc, i) => (
                          <div key={i}>
                            <p className="text-white font-medium">{uc.title}</p>
                            <p className="text-sm text-gray-400 line-clamp-2">{uc.description}</p>
                          </div>
                        ))}
                        {parsedContent.useCases.length > 3 && (
                          <p className="text-gray-500 text-sm">+{parsedContent.useCases.length - 3} more...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Downloads */}
                  {filteredDownloads.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="downloads"
                          checked={selectedSegments.downloads}
                          onCheckedChange={() => toggleSegment('downloads')}
                        />
                        <Label htmlFor="downloads" className="text-white font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Downloads ({filteredDownloads.length} {language.toUpperCase()})
                        </Label>
                        <Badge variant="outline" className="text-xs">tiles</Badge>
                      </div>
                      <div className="ml-6 p-3 bg-gray-900 rounded-lg">
                        <div className="text-sm space-y-1">
                          {filteredDownloads.map((d, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-[#f9dc24]" />
                              <span className="text-white">{d.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video */}
                  {parsedContent.videoUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="video"
                          checked={selectedSegments.video}
                          onCheckedChange={() => toggleSegment('video')}
                        />
                        <Label htmlFor="video" className="text-white font-medium flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Product Video
                        </Label>
                        <Badge variant="outline" className="text-xs">video</Badge>
                      </div>
                      <div className="ml-6 p-3 bg-gray-900 rounded-lg">
                        <p className="text-sm text-gray-400 break-all">{parsedContent.videoUrl}</p>
                      </div>
                    </div>
                  )}

                  {/* No content warning */}
                  {!parsedContent.benefits.length && 
                   !parsedContent.specifications.length && 
                   !parsedContent.useCases.length && 
                   !filteredDownloads.length && (
                    <div className="flex items-center gap-2 text-yellow-500 p-3 bg-yellow-500/10 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                      <span>Limited content found. The page structure may not be fully supported.</span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Import Button */}
              <Button
                onClick={handleImportContent}
                disabled={isImporting}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Importing Segments...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Import Selected Segments
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
