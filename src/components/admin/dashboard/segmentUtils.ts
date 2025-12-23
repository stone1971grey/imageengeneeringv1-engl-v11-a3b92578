// Segment utility functions for AdminDashboard
// Extracted for better maintainability and reusability

/**
 * Returns the default data structure for a new segment of the given type.
 * Used when adding new segments to a page.
 */
export const getDefaultSegmentData = (templateType: string): Record<string, any> => {
  switch (templateType) {
    case 'hero':
      return {
        hero_title: 'New Hero Section',
        hero_subtitle: '',
        hero_description: '',
        hero_cta_text: 'Learn More',
        hero_image_url: '',
        hero_image_metadata: null,
        hero_image_position: 'right',
        hero_layout_ratio: '2-5',
        hero_top_spacing: 'medium',
        hero_cta_link: '#',
        hero_cta_style: 'standard'
      };
    case 'meta-navigation':
      return {
        links: [
          { label: 'Overview', anchor: 'overview' },
          { label: 'Key Benefits', anchor: 'benefits' },
          { label: 'Use Cases', anchor: 'use-cases' }
        ]
      };
    case 'product-hero-gallery':
      return {
        title: 'Product Name',
        subtitle: 'Product Variants',
        description: 'Product description',
        imagePosition: 'right',
        layoutRatio: '1-1',
        topSpacing: 'medium',
        cta1Text: 'Contact Sales',
        cta1Link: '#contact',
        cta1Style: 'standard',
        cta2Text: 'Learn More',
        cta2Link: '',
        cta2Style: 'outline-white',
        images: [{
          imageUrl: '',
          title: '',
          description: ''
        }]
      };
    case 'tiles':
      return {
        title: 'New Tiles Section',
        description: 'Section description text',
        columns: '3',
        items: [
          {
            title: 'New Application',
            description: 'Add description here...',
            ctaLink: '',
            ctaStyle: 'standard',
            ctaText: 'Learn More',
            imageUrl: '',
            icon: ''
          }
        ]
      };
    case 'banner':
      return {
        title: 'New Banner Section',
        subtext: '',
        images: [],
        buttonText: '',
        buttonLink: '',
        buttonStyle: 'standard'
      };
    case 'banner-p':
      return {
        title: 'New Banner-P Section',
        subtext: '',
        images: [],
        buttonText: '',
        buttonLink: '',
        buttonStyle: 'standard'
      };
    case 'image-text':
      return {
        title: 'New Image & Text Section',
        subtext: '',
        layout: '2-col',
        items: [
          {
            title: 'New Item',
            description: 'Add description here...',
            imageUrl: ''
          }
        ]
      };
    case 'feature-overview':
      return {
        title: 'Key Benefits',
        subtext: '',
        layout: '3',
        items: [
          {
            title: 'Feature Title',
            description: 'Feature description text goes here...'
          }
        ]
      };
    case 'table':
      return {
        title: 'Technical Specifications',
        subtext: 'Detailed technical specifications and performance data',
        headers: ['Criterion', 'Column 2', 'Column 3'],
        rows: [
          ['Row 1', 'Data 1', 'Data 2'],
          ['Row 2', 'Data 3', 'Data 4']
        ]
      };
    case 'faq':
      return {
        title: 'Frequently Asked Questions',
        subtext: '',
        items: [
          {
            question: 'What is your question?',
            answer: 'Your answer goes here...'
          }
        ]
      };
    case 'video':
      return {
        title: 'Product in Action',
        videoUrl: '',
        caption: ''
      };
    case 'full-hero':
      return {
        titleLine1: 'Precision Engineering for',
        titleLine2: 'Image Quality Testing',
        subtitle: 'Professional solutions for testing and calibrating camera systems with precision and accuracy.',
        button1Text: 'Find Your Solution',
        button1Link: '#applications-start',
        button1Color: 'yellow',
        button2Text: '',
        button2Link: '',
        button2Color: 'black',
        backgroundType: 'image',
        imageUrl: '',
        videoUrl: '',
        kenBurnsEffect: 'standard',
        overlayOpacity: 15
      };
    case 'specification':
      return {
        title: 'Detailed Specifications',
        rows: [
          {
            specification: 'Specification Name',
            value: 'Value'
          }
        ]
      };
    case 'intro':
      return {
        title: 'Your Partner for Objective Camera & Sensor Testing',
        description: 'Industry-leading solutions for comprehensive camera and sensor evaluation',
        headingLevel: 'h2'
      };
    case 'industries':
      return {
        title: 'Trusted Across All Industries',
        subtitle: 'Professional solutions for diverse applications',
        columns: 4,
        items: [
          {
            icon: 'Camera',
            title: 'Photography',
            description: 'Professional camera testing',
            link: ''
          }
        ]
      };
    case 'debug':
      return {
        title: 'Debug Segment',
        imageUrl: ''
      };
    case 'news-list':
      return {
        title: 'All News',
        description: 'Stay updated with the latest developments in image quality testing and measurement technology'
      };
    case 'action-hero':
      return {
        title: 'Page Title',
        description: 'Enter a brief description of the page content here.',
        backgroundImage: '',
        flipImage: false
      };
    case 'events':
      return {
        title: 'Upcoming Events & Training',
        description: 'Join our expert-led workshops, training sessions, and industry events',
        showFilters: true,
        showPastEvents: false,
        layout: 'grid',
        maxEvents: null,
        sortOrder: 'asc',
        categories: []
      };
    case 'product-list':
      return {
        title: 'Our Products',
        description: 'Browse our complete product catalog',
        category: undefined,
        showFilters: true,
        showSearch: true,
        maxProducts: undefined,
        layout: 'grid'
      };
    case 'downloads':
      return {
        title: 'Downloads',
        description: 'Access our documents, whitepapers and videos',
        selectedTypes: [],
        maxItems: 12,
        showCategories: true
      };
    case 'mini-footer':
      return {
        // Mini footer has no additional configuration
      };
    default:
      return {};
  }
};

/**
 * Helper function to extract language-independent fields from segment data.
 * When creating a new segment, we copy structural/visual fields to all languages
 * but leave text fields empty for translation.
 */
export const getLanguageIndependentFields = (templateType: string, data: Record<string, any>): Record<string, any> => {
  switch (templateType) {
    case 'hero':
      return {
        hero_image_url: data.hero_image_url || '',
        hero_image_metadata: data.hero_image_metadata || null,
        hero_cta_link: data.hero_cta_link || '#',
        hero_cta_style: data.hero_cta_style || 'standard',
        hero_image_position: data.hero_image_position || 'right',
        hero_layout_ratio: data.hero_layout_ratio || '2-5',
        hero_top_spacing: data.hero_top_spacing || 'medium',
        // Text fields empty
        hero_title: '',
        hero_subtitle: '',
        hero_description: '',
        hero_cta_text: ''
      };
    
    case 'product-hero-gallery':
      return {
        imagePosition: data.imagePosition || 'right',
        layoutRatio: data.layoutRatio || '1-1',
        topSpacing: data.topSpacing || 'medium',
        cta1Link: data.cta1Link || '#contact',
        cta1Style: data.cta1Style || 'standard',
        cta2Link: data.cta2Link || '',
        cta2Style: data.cta2Style || 'outline-white',
        images: data.images || [],
        // Text fields empty
        title: '',
        subtitle: '',
        description: '',
        cta1Text: '',
        cta2Text: ''
      };
    
    case 'tiles':
      return {
        columns: data.columns || '3',
        items: (data.items || []).map((item: any) => ({
          imageUrl: item.imageUrl || '',
          icon: item.icon || '',
          ctaLink: item.ctaLink || '',
          ctaStyle: item.ctaStyle || 'standard',
          // Text fields empty
          title: '',
          description: '',
          ctaText: ''
        })),
        // Text fields empty
        title: '',
        description: ''
      };
    
    case 'banner':
      return {
        images: data.images || [],
        buttonLink: data.buttonLink || '',
        buttonStyle: data.buttonStyle || 'standard',
        // Text fields empty
        title: '',
        subtext: '',
        buttonText: ''
      };
    
    case 'banner-p':
      return {
        images: data.images || [],
        buttonLink: data.buttonLink || '',
        buttonStyle: data.buttonStyle || 'standard',
        // Text fields empty
        title: '',
        subtext: '',
        buttonText: ''
      };
    
    case 'image-text':
      return {
        layout: data.layout || '2-col',
        items: (data.items || []).map((item: any) => ({
          imageUrl: item.imageUrl || '',
          // Text fields empty
          title: '',
          description: ''
        })),
        // Text fields empty
        title: '',
        subtext: ''
      };
    
    case 'feature-overview':
      return {
        layout: data.layout || '3',
        items: (data.items || []).map((item: any) => ({
          icon: item.icon || '',
          // Text fields empty
          title: '',
          description: ''
        })),
        // Text fields empty
        title: '',
        subtext: ''
      };
    
    case 'meta-navigation':
      return {
        links: (data.links || []).map((link: any) => ({
          anchor: link.anchor || '',
          // Text fields empty
          label: ''
        }))
      };
    
    case 'full-hero':
      return {
        backgroundImage: data.backgroundImage || '',
        ctaLink: data.ctaLink || '#',
        ctaStyle: data.ctaStyle || 'standard',
        // Text fields empty
        title: '',
        subtitle: '',
        description: '',
        ctaText: ''
      };
    
    case 'video':
      return {
        videoUrl: data.videoUrl || '',
        thumbnailUrl: data.thumbnailUrl || '',
        // Text fields empty
        title: '',
        description: ''
      };
    
    case 'table':
    case 'faq':
    case 'specification':
    case 'intro':
    case 'industries':
    case 'news':
    case 'debug':
    case 'action-hero':
      // These segment types are mostly text-based, so return empty structure
      return {};
    
    default:
      return {};
  }
};
