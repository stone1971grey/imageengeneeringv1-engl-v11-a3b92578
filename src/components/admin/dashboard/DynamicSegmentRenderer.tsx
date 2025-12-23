import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TabsContent } from "@/components/ui/tabs";
import { Trash2, PanelBottom } from "lucide-react";
import { SplitScreenSegmentEditor } from '@/components/admin/SplitScreenSegmentEditor';
import { SegmentHistoryButton } from '@/components/admin/SegmentHistoryButton';
import { buildSegmentLabel } from './AdminConstants';
import { getDefaultSegmentData } from './segmentUtils';

// Segment Editors
import { ProductHeroEditor } from '@/components/admin/ProductHeroEditor';
import MetaNavigationEditor from '@/components/admin/MetaNavigationEditor';
import { TilesSegmentEditor } from '@/components/admin/TilesSegmentEditor';
import { ImageTextEditor } from '@/components/admin/ImageTextEditor';
import FeatureOverviewEditor from '@/components/admin/FeatureOverviewEditor';
import TableEditor from '@/components/admin/TableEditor';
import FAQEditor from '@/components/admin/FAQEditor';
import { VideoSegmentEditor } from '@/components/admin/VideoSegmentEditor';
import NewsSegmentEditor from '@/components/admin/NewsSegmentEditor';
import NewsListSegmentEditor from '@/components/admin/NewsListSegmentEditor';
import { ActionHeroEditor } from '@/components/admin/ActionHeroEditor';
import { EventsSegmentEditor } from '@/components/admin/EventsSegmentEditor';
import { ProductListSegmentEditor } from '@/components/admin/ProductListSegmentEditor';
import { DownloadsSegmentEditor } from '@/components/admin/DownloadsSegmentEditor';
import DebugEditor from '@/components/admin/DebugEditor';
import { FullHeroEditor } from '@/components/admin/FullHeroEditor';
import IntroEditor from '@/components/admin/IntroEditor';
import { IndustriesSegmentEditor } from '@/components/admin/IndustriesSegmentEditor';
import SpecificationEditor from '@/components/admin/SpecificationEditor';
import ProductHeroGalleryEditor from '@/components/admin/ProductHeroGalleryEditor';
import { BannerSegmentEditor } from '@/components/admin/BannerSegmentEditor';
import { BannerPEditor } from '@/components/admin/BannerPEditor';

interface PageSegment {
  id: string;
  type: string;
  data?: any;
}

interface DynamicSegmentRendererProps {
  pageSegments: PageSegment[];
  segmentRegistry: Record<string, number>;
  resolvedPageSlug: string | null;
  selectedPage: string;
  editorLanguage: string;
  loadContent: () => void;
  handleDeleteSegment: (segmentId: string) => void;
  handleSaveSegments: () => void;
  setPageSegments: React.Dispatch<React.SetStateAction<PageSegment[]>>;
}

export const DynamicSegmentRenderer: React.FC<DynamicSegmentRendererProps> = ({
  pageSegments,
  segmentRegistry,
  resolvedPageSlug,
  selectedPage,
  editorLanguage,
  loadContent,
  handleDeleteSegment,
  handleSaveSegments,
  setPageSegments,
}) => {
  // Guard against undefined/null pageSegments
  const safePageSegments = Array.isArray(pageSegments) ? pageSegments : [];
  
  return (
    <>
      {safePageSegments.map((segment, index) => {
        // Guard against malformed segment
        if (!segment || !segment.type) {
          console.warn('[DynamicSegmentRenderer] Skipping invalid segment at index', index, segment);
          return null;
        }
        
        // Calculate display number based on same type before this index
        const sameTypeBefore = safePageSegments.slice(0, index).filter(s => s?.type === segment.type).length;
        const displayNumber = sameTypeBefore + 1;
        const segmentId = segmentRegistry?.[segment.id] || segment.id;
        const reverseRegistry = (window as any).__segmentKeyRegistry || {};
        const customKey = reverseRegistry[String(segmentId)];

        // Always generate formatted label based on segment type
        let label = '';
        const segType = segment.type || 'unknown';
        if (segType === 'hero') label = `Produkt Hero - F-${displayNumber}`;
        else if (segType === 'meta-navigation') label = `Meta Navigation - E-${displayNumber}`;
        else if (segType === 'product-hero-gallery') label = `Product Gallery - G-${displayNumber}`;
        else if (segType === 'tiles') label = `Tiles - H-${displayNumber}`;
        else if (segType === 'banner') label = `Banner - J-${displayNumber}`;
        else if (segType === 'banner-p') label = `Banner P - ${displayNumber}`;
        else if (segType === 'image-text') label = `Image & Text - I-${displayNumber}`;
        else if (segType === 'full-hero') label = `Full Hero - A-${displayNumber}`;
        else if (segType === 'intro') label = `Intro - B-${displayNumber}`;
        else if (segType === 'industries') label = `Industries - C-${displayNumber}`;
        else if (segType === 'news') label = `Latest News - D-${displayNumber}`;
        else if (segType === 'debug') label = `Debug ${displayNumber}`;
        else if (segType === 'news-list') label = `News List - P-${displayNumber}`;
        else if (segType === 'action-hero') label = `Action Hero - Q-${displayNumber}`;
        else if (segType === 'events') label = `Events List - R-${displayNumber}`;
        else if (segType === 'product-list') label = `Product List - S-${displayNumber}`;
        else if (segType === 'downloads') label = `Downloads - T-${displayNumber}`;
        else if (segType === 'mini-footer') label = `Mini Footer - U-${displayNumber}`;
        else if (segType === 'feature-overview') label = `Features - K-${displayNumber}`;
        else if (segType === 'table') label = `Table - L-${displayNumber}`;
        else if (segType === 'faq') label = `FAQ - O-${displayNumber}`;
        else if (segType === 'video') label = `Video - M-${displayNumber}`;
        else if (segType === 'specification') label = `Specification - N-${displayNumber}`;
        else label = `${segType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - ${displayNumber}`;

        // Build available segments for meta-navigation
        const buildAvailableSegments = () => {
          const availableSegments: { id: string; title: string }[] = [];

          // Tiles segment (static tab)
          if (segmentRegistry['tiles']) {
            availableSegments.push({
              id: segmentRegistry['tiles'].toString(),
              title: 'Tiles - H',
            });
          }

          // Banner segment (static tab)
          if (segmentRegistry['banner']) {
            availableSegments.push({
              id: segmentRegistry['banner'].toString(),
              title: 'Banner - J',
            });
          }

          // Solutions/Image & Text segment (static tab)
          if (segmentRegistry['solutions']) {
            availableSegments.push({
              id: segmentRegistry['solutions'].toString(),
              title: 'Image & Text - I',
            });
          }

          // Dynamic segments
          safePageSegments.forEach((seg) => {
            if (!seg || seg.type === 'meta-navigation') return;

            const numericId = segmentRegistry?.[seg.id];
            if (!numericId) return;

            const segmentIndex = safePageSegments.indexOf(seg);
            const sameTypeBefore = safePageSegments
              .slice(0, segmentIndex)
              .filter((s) => s?.type === seg.type).length;
            const displayNumber = sameTypeBefore + 1;
            const segLabel = buildSegmentLabel(seg.type as string, displayNumber);

            availableSegments.push({
              id: numericId.toString(),
              title: segLabel,
            });
          });

          // Footer segment (static tab)
          if (segmentRegistry['footer']) {
            availableSegments.push({
              id: segmentRegistry['footer'].toString(),
              title: 'Footer',
            });
          }

          availableSegments.sort((a, b) => Number(a.id) - Number(b.id));
          return availableSegments;
        };

        return (
          <TabsContent key={`segment-content-${segment.id}`} value={segment.id}>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      {label}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Edit this {
                        segment.type === 'action-hero' ? 'Action Hero' :
                        segment.type === 'news-list' ? 'News List' :
                        segment.type === 'full-hero' ? 'Full Hero' :
                        segment.type === 'meta-navigation' ? 'Meta Navigation' :
                        segment.type === 'product-hero-gallery' ? 'Product Hero Gallery' :
                        segment.type === 'feature-overview' ? 'Feature Overview' :
                        segment.type === 'image-text' ? 'Image Text' :
                        segment.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                      } Segment
                    </CardDescription>
                    <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                      ID: {segmentRegistry[segment.id] || segment.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SegmentHistoryButton
                      pageSlug={resolvedPageSlug || selectedPage}
                      sectionKey={`${segment.id}_title`}
                      language={editorLanguage}
                      onRestore={() => loadContent()}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Segment
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this segment. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSegment(segment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {segment.type === 'hero' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Product Hero"
                    segmentType="hero"
                  >
                    {(language) => (
                      <ProductHeroEditor
                        key={`hero-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={parseInt(segment.id)}
                        onSave={() => loadContent()}
                        language={language}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'meta-navigation' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Meta Navigation"
                    segmentType="meta-navigation"
                  >
                    {(language) => (
                      <MetaNavigationEditor
                        key={`meta-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={segment.id}
                        language={language}
                        availableSegments={buildAvailableSegments()}
                        onSave={() => loadContent()}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'tiles' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Tiles"
                    segmentType="tiles"
                  >
                    {(language) => (
                      <TilesSegmentEditor
                        key={`tiles-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={segment.id}
                        language={language}
                        onSave={() => loadContent()}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'image-text' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Image & Text"
                    segmentType="image-text"
                  >
                    {(language) => (
                      <ImageTextEditor
                        key={`image-text-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={segment.id}
                        language={language}
                        onSave={() => loadContent()}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'feature-overview' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Feature Overview"
                    segmentType="feature-overview"
                  >
                    {(language) => (
                      <FeatureOverviewEditor
                        key={`feature-overview-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={segment.id}
                        language={language}
                        onSave={() => loadContent()}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'table' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Table"
                    segmentType="table"
                  >
                    {(language) => (
                      <TableEditor
                        key={`table-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={segment.id}
                        language={language}
                        onSave={() => loadContent()}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'faq' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="FAQ"
                    segmentType="faq"
                  >
                    {(language) => (
                      <FAQEditor
                        key={`faq-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={segment.id}
                        language={language}
                        onSave={() => loadContent()}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'video' && (() => {
                  if (!segment.data) {
                    segment.data = getDefaultSegmentData('video');
                  }

                  return (
                    <SplitScreenSegmentEditor
                      segmentTitle="Video"
                      segmentType="video"
                    >
                      {(language) => (
                        <VideoSegmentEditor
                          key={`video-${segment.id}-${language}`}
                          onSave={() => loadContent()}
                          currentPageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          language={language}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  );
                })()}

                {segment.type === 'news' && (
                  <NewsSegmentEditor
                    pageSlug={resolvedPageSlug || selectedPage}
                    segmentId={segment.id}
                    onUpdate={() => handleSaveSegments()}
                    currentPageSlug={resolvedPageSlug || selectedPage}
                  />
                )}

                {segment.type === 'news-list' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="News List"
                    segmentType="news-list"
                  >
                    {(language) => (
                      <NewsListSegmentEditor
                        key={`news-list-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={segment.id}
                        data={segment.data}
                        onSave={() => loadContent()}
                        language={language}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'action-hero' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Action Hero"
                    segmentType="action-hero"
                  >
                    {(language) => (
                      <ActionHeroEditor
                        key={`action-hero-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={segment.id}
                        data={segment.data}
                        onSave={() => loadContent()}
                        language={language}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'events' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Events List"
                    segmentType="events"
                  >
                    {(language) => (
                      <EventsSegmentEditor
                        key={`events-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={segment.id}
                        data={segment.data}
                        onSave={() => loadContent()}
                        language={language}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'product-list' && (
                  <ProductListSegmentEditor
                    segmentId={parseInt(segment.id)}
                    pageSlug={resolvedPageSlug || selectedPage}
                    language={editorLanguage}
                    onSave={() => loadContent()}
                  />
                )}

                {segment.type === 'downloads' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Downloads"
                    segmentType="downloads"
                  >
                    {(language) => (
                      <DownloadsSegmentEditor
                        key={`downloads-${segment.id}-${language}`}
                        segmentId={segment.id}
                        pageSlug={resolvedPageSlug || selectedPage}
                        language={language}
                        onSave={() => loadContent()}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'mini-footer' && (
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-6 text-center">
                      <PanelBottom className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Mini Footer Active</h3>
                      <p className="text-gray-300 mb-4">
                        This page uses a minimal footer with only copyright and legal links.
                        The full footer with contact info and team quote is hidden.
                      </p>
                      <div className="bg-gray-600 rounded p-4 text-left text-sm text-gray-300">
                        <p><strong>Displays:</strong></p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>© 2025 Image Engineering GmbH & Co. KG</li>
                          <li>Terms, Imprint, Privacy, Compliance links</li>
                          <li>Carbon Neutral, ESG, Disposal info links</li>
                        </ul>
                      </div>
                      <p className="text-gray-400 text-sm mt-4">
                        To restore the full footer, delete this segment.
                      </p>
                    </div>
                  </div>
                )}

                {segment.type === 'debug' && (() => {
                  if (!segment.data) {
                    segment.data = getDefaultSegmentData('debug');
                  }

                  return (
                    <DebugEditor
                      data={segment.data}
                      onChange={(newData) => {
                        const updatedSegments = safePageSegments.map(s =>
                          s.id === segment.id ? { ...s, data: newData } : s
                        );
                        setPageSegments(updatedSegments);
                      }}
                      onSave={() => handleSaveSegments()}
                      pageSlug="styleguide/segments/hub-page"
                      segmentId={parseInt(segment.id)}
                    />
                  );
                })()}

                {segment.type === 'full-hero' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Full Hero"
                    segmentType="full-hero"
                  >
                    {(language) => (
                      <FullHeroEditor
                        key={`full-hero-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={parseInt(segment.id)}
                        onSave={() => loadContent()}
                        language={language}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'intro' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Intro Section"
                    segmentType="intro"
                  >
                    {(language) => (
                      <IntroEditor
                        key={`intro-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentKey={segment.id}
                        language={language}
                        onSave={() => loadContent()}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'industries' && (
                  <IndustriesSegmentEditor
                    data={segment.data || {}}
                    onChange={(newData) => {
                      const updatedSegments = safePageSegments.map(s =>
                        s.id === segment.id ? { ...s, data: newData } : s
                      );
                      setPageSegments(updatedSegments);
                    }}
                    onSave={() => handleSaveSegments()}
                    pageSlug={resolvedPageSlug || selectedPage}
                    segmentKey={segment.id}
                    language={editorLanguage}
                  />
                )}

                {segment.type === 'specification' && (
                  <SplitScreenSegmentEditor
                    segmentTitle="Specification"
                    segmentType="specification"
                  >
                    {(language) => (
                      <SpecificationEditor
                        key={`specification-${segment.id}-${language}`}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentId={segment.id}
                        language={language}
                        onSave={() => loadContent()}
                      />
                    )}
                  </SplitScreenSegmentEditor>
                )}

                {segment.type === 'product-hero-gallery' && (() => {
                  if (!segment.data) {
                    segment.data = getDefaultSegmentData('product-hero-gallery');
                  }

                  return (
                    <SplitScreenSegmentEditor
                      segmentTitle="Product Hero Gallery"
                      segmentType="product-hero-gallery"
                    >
                      {(language) => (
                        <ProductHeroGalleryEditor
                          key={`phg-${segment.id}-${language}`}
                          data={segment.data}
                          onChange={(newData) => {
                            const newSegments = [...safePageSegments];
                            if (newSegments[index]) newSegments[index].data = newData;
                            setPageSegments(newSegments);
                          }}
                          onSave={() => handleSaveSegments()}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={parseInt(segment.id)}
                          language={language}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  );
                })()}

                {segment.type === 'banner' && (() => {
                  if (!segment.data) {
                    segment.data = getDefaultSegmentData('banner');
                  }

                  return (
                    <BannerSegmentEditor
                      data={segment.data}
                      onChange={(newData) => {
                        const newSegments = [...safePageSegments];
                        if (newSegments[index]) newSegments[index].data = newData;
                        setPageSegments(newSegments);
                      }}
                      onSave={() => handleSaveSegments()}
                      pageSlug={resolvedPageSlug || selectedPage}
                      segmentKey={`segment_${segment.id}`}
                      language={editorLanguage}
                    />
                  );
                })()}

                {segment.type === 'banner-p' && (() => {
                  if (!segment.data) {
                    segment.data = getDefaultSegmentData('banner-p');
                  }

                  return (
                    <BannerPEditor
                      data={segment.data}
                      onChange={(newData) => {
                        const newSegments = [...safePageSegments];
                        if (newSegments[index]) newSegments[index].data = newData;
                        setPageSegments(newSegments);
                      }}
                      onSave={() => handleSaveSegments()}
                      pageSlug={resolvedPageSlug || selectedPage}
                      segmentKey={`segment_${segment.id}`}
                      language={editorLanguage}
                    />
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        );
      })}
    </>
  );
};
