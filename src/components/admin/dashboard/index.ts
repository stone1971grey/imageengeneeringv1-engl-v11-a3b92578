// Admin Dashboard Components
export { WelcomeTab } from './WelcomeTab';
export { SortableTab } from './SortableTab';
export { AdminDashboardErrorBoundary } from './AdminErrorBoundary';
export { AdminHeader } from './AdminHeader';
export { useAdminDashboardState } from '@/hooks/useAdminDashboardState';
export type { AdminDashboardState, UploadingStates, DialogStates } from '@/hooks/useAdminDashboardState';
export { TemplateSelectionDialog } from './TemplateSelectionDialog';
export { DesignElementDialog } from './DesignElementDialog';
export { NavigationCtaDialog } from './NavigationCtaDialog';
export { FlyoutContentDialog } from './FlyoutContentDialog';
export { DynamicSegmentRenderer } from './DynamicSegmentRenderer';

// Types (explicit exports to avoid conflicts)
export { 
  type TileItem, 
  type BannerImage, 
  type SolutionItem, 
  type ContentItem,
  type PageInfo,
  type PageSegment,
  type SegmentType,
  type SupportedLanguage,
  type LanguageOption,
  type UploadContext,
  type SaveContext,
  type SegmentContext,
  type SegmentOperationContext,
  type SegmentRegistry,
  type ReverseRegistry,
  type SegmentRegistryResult,
  type SEOData,
  type HeroState,
  type BannerState,
  type SolutionsState,
  type FooterState
} from './types';

// Constants (explicit exports to avoid conflicts with config.ts)
export { 
  LANGUAGES,
  buildSegmentLabel,
  getSegmentTypeName
} from './AdminConstants';

// Utilities (explicit exports to avoid conflicts)
export { getDefaultSegmentData, getLanguageIndependentFields } from './segmentUtils';
export { createNewCMSPage, createNewCMSPageWithSlug } from './cmsPageUtils';
export { 
  isAllowedPageLevel, 
  resolvePageSlug,
  loadPageInfo,
  saveFlyoutInfo,
  clearFlyoutInfo,
  saveDesignElement,
  removeDesignElement,
  saveCtaConfig,
  loadFlyoutTranslations,
  handleFlyoutImageSelection
} from './pageRegistryUtils';
export { 
  loadSegmentRegistryData, 
  calculateGlobalMaxSegmentId,
  setGlobalReverseRegistry,
  getGlobalReverseRegistry
} from './segmentRegistryUtils';
export {
  validateImageFile,
  uploadImageToStorage,
  handleHeroImageUpload,
  handleTileImageUpload,
  handleSolutionImageUploadUtil,
  handleImageTextHeroUpload,
  handleImageTextItemUpload,
  handleFooterTeamImageUploadUtil,
  handleBannerImageUploadUtil
} from './imageUploadUtils';
export {
  addSegment,
  deleteSegment,
  saveSegments,
  autoSaveSegmentDebounced,
  checkSegmentConflicts,
  validateAndCorrectSegmentTypes
} from './segmentManagementUtils';
export {
  saveHeroSection,
  saveApplicationsSection,
  saveFooterSection,
  saveSEOSettings,
  saveBannerSection,
  saveSolutionsSection,
  autoSaveTileImageUploadUtil
} from './saveContentUtils';
export { 
  parseContentItems, 
  filterTabOrder, 
  rebuildTabOrderFromSegments,
  saveUpdatedSegments,
  saveCleanedTabOrder
} from './contentLoadingUtils';
export { 
  addNewSegment,
  deleteSegment as deleteSegmentFull,
  saveAllSegments
} from './segmentOperationsUtils';
