export interface Chart {
  id: string;
  slug: string;
  title: string;
  sku: string;
  heroImage: string;
  gallery: string[];
  excerpt: string;
  description: string;
  standards: string[];
  applications: string[];
  categories: string[];
  materials: string[];
  sizes: string[];
  variants: Array<{
    name: string;
    options: string[];
    prices?: number[];
  }>;
  price_mode: 'fixed' | 'from' | 'rfq';
  price_from?: number;
  currency: string;
  downloads: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  compatibility: string[];
  badges: string[];
  seo: {
    title: string;
    description: string;
  };
}

export const charts: Chart[] = [
  {
    id: '1',
    slug: 'iso-12233-sfr-chart',
    title: 'ISO 12233 SFR Testchart',
    sku: 'IE-SFR-001',
    heroImage: '/images/chart-case.png',
    gallery: ['/images/chart-case.png', '/images/custom-chart.png'],
    excerpt: 'Standard-Testchart für Schärfemessungen nach ISO 12233',
    description: 'Das ISO 12233 SFR Testchart ist der Goldstandard für die Messung der Bildschärfe digitaler Kameras. Es enthält präzise Kanten und Patterns für die Spatial Frequency Response (SFR) Analyse.',
    standards: ['ISO 12233', 'CPIQ'],
    applications: ['Smartphone', 'DSLR', 'Machine Vision'],
    categories: ['Auflösung/SFR', 'ISO/IEEE'],
    materials: ['Papier', 'Film'],
    sizes: ['A4', 'A3', 'A2'],
    variants: [
      {
        name: 'Größe',
        options: ['A4', 'A3', 'A2'],
        prices: [290, 490, 890]
      },
      {
        name: 'Material',
        options: ['Papier', 'Film'],
        prices: [0, 200]
      }
    ],
    price_mode: 'from',
    price_from: 290,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' },
      { name: 'Technische Zeichnung', url: '#', type: 'DWG' }
    ],
    compatibility: ['iQ-Analyzer', 'Imatest', 'DxO Analyzer'],
    badges: ['ISO Standard', 'Bestseller'],
    seo: {
      title: 'ISO 12233 SFR Testchart - Präzise Schärfemessungen',
      description: 'Standard-Testchart für die Messung der Bildschärfe nach ISO 12233. Verfügbar in verschiedenen Größen und Materialien.'
    }
  },
  {
    id: '2',
    slug: 'ieee-p2020-color-chart',
    title: 'IEEE P2020 Color Accuracy Chart',
    sku: 'IE-COL-002',
    heroImage: '/images/custom-chart.png',
    gallery: ['/images/custom-chart.png', '/images/chart-case.png'],
    excerpt: 'Hochpräzises Farbwiedergabe-Testchart nach IEEE P2020',
    description: 'Das IEEE P2020 Color Accuracy Chart ermöglicht präzise Farbwiedergabe-Messungen für mobile Geräte und Kameras nach den neuesten IEEE Standards.',
    standards: ['IEEE P2020', 'VCX'],
    applications: ['Smartphone', 'Mobile', 'Broadcast'],
    categories: ['Farbwiedergabe', 'IEEE'],
    materials: ['Glas', 'Film'],
    sizes: ['24"×36"', 'A3', 'A2'],
    variants: [
      {
        name: 'Größe',
        options: ['A3', 'A2', '24"×36"'],
        prices: [690, 1200, 2400]
      },
      {
        name: 'Material',
        options: ['Film', 'Glas'],
        prices: [0, 800]
      }
    ],
    price_mode: 'from',
    price_from: 690,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' },
      { name: 'Kalibrierdaten', url: '#', type: 'JSON' }
    ],
    compatibility: ['iQ-Analyzer', 'IEEE Test Suite'],
    badges: ['IEEE Standard', 'VCX kompatibel'],
    seo: {
      title: 'IEEE P2020 Color Accuracy Chart - Mobile Farbwiedergabe',
      description: 'Präzises Testchart für Farbwiedergabe-Messungen nach IEEE P2020 Standard für mobile Geräte.'
    }
  },
  {
    id: '3',
    slug: 'siemens-star-chart',
    title: 'Siemens Star Precision Chart',
    sku: 'IE-SIE-003',
    heroImage: '/images/chart-case.png',
    gallery: ['/images/chart-case.png'],
    excerpt: 'Hochpräziser Siemens-Stern für Auflösungsmessungen',
    description: 'Der Siemens Star ist ein klassisches Testpattern für die Bestimmung der optischen Auflösung und Bildqualität. Verfügbar in verschiedenen Präzisionsstufen.',
    standards: ['DIN', 'ISO'],
    applications: ['Machine Vision', 'Automotive', 'Forschung'],
    categories: ['Auflösung/SFR', 'Siemens-Stern'],
    materials: ['Metall', 'Glas', 'Film'],
    sizes: ['50mm', '100mm', '200mm'],
    variants: [
      {
        name: 'Durchmesser',
        options: ['50mm', '100mm', '200mm'],
        prices: [1200, 2400, 3800]
      },
      {
        name: 'Material',
        options: ['Film', 'Glas', 'Metall'],
        prices: [0, 600, 1200]
      }
    ],
    price_mode: 'from',
    price_from: 1200,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' },
      { name: 'Präzisionsdaten', url: '#', type: 'XLS' }
    ],
    compatibility: ['Machine Vision Software', 'Optische Prüfsysteme'],
    badges: ['Hochpräzision', 'DIN Standard'],
    seo: {
      title: 'Siemens Star Precision Chart - Optische Auflösungsmessung',
      description: 'Hochpräziser Siemens-Stern für die Bestimmung der optischen Auflösung in verschiedenen Größen und Materialien.'
    }
  },
  {
    id: '4',
    slug: 'dead-leaves-noise-chart',
    title: 'Dead Leaves Noise Analysis Chart',
    sku: 'IE-DL-004',
    heroImage: '/images/custom-chart.png',
    gallery: ['/images/custom-chart.png'],
    excerpt: 'Spezielles Testchart für Rauschanalyse und Texturauflösung',
    description: 'Das Dead Leaves Chart simuliert natürliche Texturen und ermöglicht die Analyse von Rauschverhalten und Detailauflösung in realistischen Szenarien.',
    standards: ['CPIQ', 'VCX'],
    applications: ['Smartphone', 'DSLR', 'Automotive'],
    categories: ['Graustufen', 'Dead-Leaves', 'Spezial-Targets'],
    materials: ['Papier', 'Film'],
    sizes: ['A4', 'A3', 'A2'],
    variants: [
      {
        name: 'Größe',
        options: ['A4', 'A3', 'A2'],
        prices: [690, 1200, 1800]
      }
    ],
    price_mode: 'from',
    price_from: 690,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' },
      { name: 'Referenzdaten', url: '#', type: 'MAT' }
    ],
    compatibility: ['iQ-Analyzer', 'CPIQ Software'],
    badges: ['Spezial-Target', 'CPIQ kompatibel'],
    seo: {
      title: 'Dead Leaves Noise Analysis Chart - Textur und Rauschanalyse',
      description: 'Spezielles Testchart für die Analyse von Rauschverhalten und Texturauflösung in natürlichen Szenarien.'
    }
  },
  {
    id: '5',
    slug: 'automotive-hdr-chart',
    title: 'Automotive HDR Test Chart',
    sku: 'IE-HDR-005',
    heroImage: '/images/chart-case.png',
    gallery: ['/images/chart-case.png'],
    excerpt: 'HDR-Testchart für ADAS und Automotive-Anwendungen',
    description: 'Speziell entwickeltes HDR-Testchart für die Validierung von Fahrerassistenzsystemen und Automotive-Kameras unter verschiedenen Lichtverhältnissen.',
    standards: ['Automotive', 'ADAS'],
    applications: ['Automotive', 'ADAS', 'Nachtsicht'],
    categories: ['HDR', 'Automotive', 'Spezial-Targets'],
    materials: ['Transmission', 'Reflexion'],
    sizes: ['A2', '24"×36"', 'Kundenspezifisch'],
    variants: [
      {
        name: 'Typ',
        options: ['Reflexion', 'Transmission'],
        prices: [2400, 3200]
      }
    ],
    price_mode: 'from',
    price_from: 2400,
    currency: 'EUR',
    downloads: [
      { name: 'Automotive Specs', url: '#', type: 'PDF' },
      { name: 'HDR Kalibrierung', url: '#', type: 'JSON' }
    ],
    compatibility: ['ADAS Test Suite', 'Automotive Prüfsysteme'],
    badges: ['Automotive', 'HDR', 'ADAS kompatibel'],
    seo: {
      title: 'Automotive HDR Test Chart - ADAS und Fahrerassistenz',
      description: 'HDR-Testchart für die Validierung von Automotive-Kameras und ADAS-Systemen.'
    }
  },
  {
    id: '6',
    slug: 'distortion-grid-chart',
    title: 'Distortion Grid Test Chart',
    sku: 'IE-DIS-006',
    heroImage: '/images/custom-chart.png',
    gallery: ['/images/custom-chart.png'],
    excerpt: 'Präzisions-Gitter für Verzeichnungsmessungen',
    description: 'Hochpräzises Gitter-Testchart für die Messung von optischen Verzeichnungen und geometrischen Verzerrungen in Kamerasystemen.',
    standards: ['ISO', 'Photogrammetrie'],
    applications: ['Machine Vision', 'Photogrammetrie', 'Kalibrierung'],
    categories: ['Distortion', 'Geometrie'],
    materials: ['Glas', 'Metall', 'Film'],
    sizes: ['A3', 'A2', 'A1'],
    variants: [
      {
        name: 'Präzision',
        options: ['Standard', 'Hochpräzision'],
        prices: [890, 1800]
      }
    ],
    price_mode: 'from',
    price_from: 890,
    currency: 'EUR',
    downloads: [
      { name: 'Geometrie-Specs', url: '#', type: 'PDF' },
      { name: 'Kalibrierdaten', url: '#', type: 'CSV' }
    ],
    compatibility: ['OpenCV', 'Machine Vision Libraries'],
    badges: ['Hochpräzision', 'Photogrammetrie'],
    seo: {
      title: 'Distortion Grid Test Chart - Optische Verzeichnungsmessung',
      description: 'Präzisions-Gitter für die Messung von optischen Verzeichnungen und Kamerakalibrierung.'
    }
  },
  {
    id: '7',
    slug: 'medical-endoscopy-chart',
    title: 'Medical Endoscopy Test Chart',
    sku: 'IE-MED-007',
    heroImage: '/images/chart-case.png',
    gallery: ['/images/chart-case.png'],
    excerpt: 'Spezielles Testchart für medizinische Endoskopie-Systeme',
    description: 'Zertifiziertes Testchart für die Qualitätssicherung in der medizinischen Bildgebung, speziell entwickelt für Endoskopie-Anwendungen.',
    standards: ['Medical', 'FDA'],
    applications: ['Medizin', 'Endoskopie', 'Diagnose'],
    categories: ['Medizin', 'Spezial-Targets'],
    materials: ['Medizinisches Glas', 'Biokompatibel'],
    sizes: ['50mm', '100mm'],
    variants: [],
    price_mode: 'rfq',
    currency: 'EUR',
    downloads: [
      { name: 'Medical Certification', url: '#', type: 'PDF' },
      { name: 'FDA Approval', url: '#', type: 'PDF' }
    ],
    compatibility: ['Medical Imaging Systems'],
    badges: ['Medical Grade', 'FDA Approved'],
    seo: {
      title: 'Medical Endoscopy Test Chart - Medizinische Bildgebung',
      description: 'Zertifiziertes Testchart für medizinische Endoskopie-Systeme und Qualitätssicherung.'
    }
  },
  {
    id: '8',
    slug: 'broadcast-color-bar-chart',
    title: 'Broadcast Color Bar Chart',
    sku: 'IE-BC-008',
    heroImage: '/images/custom-chart.png',
    gallery: ['/images/custom-chart.png'],
    excerpt: 'Standard Farbbalken für Broadcast und TV-Produktion',
    description: 'Professionelle Farbbalken für die Kalibrierung von Broadcast-Equipment und TV-Produktionssystemen nach internationalen Standards.',
    standards: ['SMPTE', 'EBU', 'ITU-R'],
    applications: ['Broadcast', 'TV-Produktion', 'Color Grading'],
    categories: ['Farbwiedergabe', 'Broadcast'],
    materials: ['Film', 'Glas'],
    sizes: ['A3', 'A2', '24"×36"'],
    variants: [
      {
        name: 'Standard',
        options: ['SMPTE', 'EBU', 'ITU-R'],
        prices: [490, 490, 490]
      }
    ],
    price_mode: 'from',
    price_from: 490,
    currency: 'EUR',
    downloads: [
      { name: 'Broadcast Specs', url: '#', type: 'PDF' },
      { name: 'Color Values', url: '#', type: 'XLS' }
    ],
    compatibility: ['Broadcast Monitors', 'Color Grading Software'],
    badges: ['SMPTE Standard', 'Broadcast'],
    seo: {
      title: 'Broadcast Color Bar Chart - TV und Video-Produktion',
      description: 'Professionelle Farbbalken für Broadcast-Equipment und TV-Produktionssysteme.'
    }
  },
  {
    id: '9',
    slug: 'security-low-light-chart',
    title: 'Security Low Light Test Chart',
    sku: 'IE-SEC-009',
    heroImage: '/images/chart-case.png',
    gallery: ['/images/chart-case.png'],
    excerpt: 'Testchart für Schwachlicht-Performance von Überwachungskameras',
    description: 'Speziell entwickeltes Testchart für die Bewertung der Schwachlicht-Performance von Sicherheits- und Überwachungskameras.',
    standards: ['Security', 'CCTV'],
    applications: ['Sicherheit', 'Überwachung', 'CCTV'],
    categories: ['Schwachlicht', 'Sicherheit', 'Spezial-Targets'],
    materials: ['Reflexion', 'IR-kompatibel'],
    sizes: ['A3', 'A2'],
    variants: [
      {
        name: 'Spektrum',
        options: ['Sichtbar', 'IR-erweitert'],
        prices: [890, 1400]
      }
    ],
    price_mode: 'from',
    price_from: 890,
    currency: 'EUR',
    downloads: [
      { name: 'Security Specs', url: '#', type: 'PDF' },
      { name: 'Low Light Data', url: '#', type: 'JSON' }
    ],
    compatibility: ['Security Camera Systems', 'CCTV Software'],
    badges: ['Security', 'Low Light', 'IR kompatibel'],
    seo: {
      title: 'Security Low Light Test Chart - Überwachungskameras',
      description: 'Testchart für die Bewertung der Schwachlicht-Performance von Sicherheitskameras.'
    }
  },
  {
    id: '10',
    slug: 'machine-vision-precision-chart',
    title: 'Machine Vision Precision Chart',
    sku: 'IE-MV-010',
    heroImage: '/images/custom-chart.png',
    gallery: ['/images/custom-chart.png'],
    excerpt: 'Hochpräzises Testchart für Machine Vision Anwendungen',
    description: 'Speziell für Machine Vision entwickeltes Testchart mit höchster Präzision für Qualitätskontrolle und Inspektionssysteme.',
    standards: ['EMVA', 'GigE Vision'],
    applications: ['Machine Vision', 'Qualitätskontrolle', 'Robotik'],
    categories: ['Machine Vision', 'Hochpräzision'],
    materials: ['Metall', 'Keramik'],
    sizes: ['100mm', '200mm', '500mm'],
    variants: [
      {
        name: 'Toleranz',
        options: ['±5µm', '±2µm', '±1µm'],
        prices: [1800, 3200, 5800]
      }
    ],
    price_mode: 'from',
    price_from: 1800,
    currency: 'EUR',
    downloads: [
      { name: 'Precision Data', url: '#', type: 'PDF' },
      { name: 'Measurement Protocol', url: '#', type: 'XLS' }
    ],
    compatibility: ['Machine Vision Software', 'Inspection Systems'],
    badges: ['Hochpräzision', 'EMVA Standard'],
    seo: {
      title: 'Machine Vision Precision Chart - Qualitätskontrolle',
      description: 'Hochpräzises Testchart für Machine Vision Anwendungen und Qualitätskontrolle.'
    }
  },
  {
    id: '11',
    slug: 'smartphone-camera-chart',
    title: 'Smartphone Camera Test Chart',
    sku: 'IE-SM-011',
    heroImage: '/images/chart-case.png',
    gallery: ['/images/chart-case.png'],
    excerpt: 'Kompaktes Testchart für Smartphone-Kamera Validierung',
    description: 'Speziell für die Smartphone-Industrie entwickeltes kompaktes Testchart für die Validierung von Kamera-Performance nach VCX und IEEE Standards.',
    standards: ['VCX', 'IEEE P2020', 'CPIQ'],
    applications: ['Smartphone', 'Mobile', 'Tablet'],
    categories: ['Mobile', 'Kompakt'],
    materials: ['Film', 'Papier'],
    sizes: ['A4', 'A3'],
    variants: [
      {
        name: 'Test Suite',
        options: ['Basic', 'Professional', 'Complete'],
        prices: [390, 690, 1200]
      }
    ],
    price_mode: 'from',
    price_from: 390,
    currency: 'EUR',
    downloads: [
      { name: 'VCX Specs', url: '#', type: 'PDF' },
      { name: 'Test Protocol', url: '#', type: 'JSON' }
    ],
    compatibility: ['VCX Test Suite', 'Mobile Test Labs'],
    badges: ['VCX kompatibel', 'Mobile', 'Kompakt'],
    seo: {
      title: 'Smartphone Camera Test Chart - Mobile Kamera-Validierung',
      description: 'Kompaktes Testchart für die Validierung von Smartphone-Kameras nach VCX und IEEE Standards.'
    }
  },
  {
    id: '12',
    slug: 'custom-target-service',
    title: 'Custom Target Design Service',
    sku: 'IE-CUS-012',
    heroImage: '/images/custom-chart.png',
    gallery: ['/images/custom-chart.png'],
    excerpt: 'Maßgeschneiderte Testcharts für spezielle Anforderungen',
    description: 'Unser Custom Target Design Service erstellt maßgeschneiderte Testcharts für Ihre spezifischen Anforderungen und Anwendungen.',
    standards: ['Kundenspezifisch'],
    applications: ['Alle Branchen', 'Spezialanwendungen'],
    categories: ['Kundenspezifisch', 'Design Service'],
    materials: ['Nach Anforderung'],
    sizes: ['Kundenspezifisch'],
    variants: [],
    price_mode: 'rfq',
    currency: 'EUR',
    downloads: [
      { name: 'Design Guidelines', url: '#', type: 'PDF' },
      { name: 'Request Form', url: '#', type: 'PDF' }
    ],
    compatibility: ['Alle Systeme'],
    badges: ['Kundenspezifisch', 'Design Service'],
    seo: {
      title: 'Custom Target Design Service - Maßgeschneiderte Testcharts',
      description: 'Professioneller Design Service für maßgeschneiderte Testcharts nach Ihren spezifischen Anforderungen.'
    }
  }
];

export const categories = [
  'ISO/IEEE',
  'Auflösung/SFR',
  'Farbwiedergabe', 
  'Graustufen',
  'Siemens-Stern',
  'Distortion',
  'Dead-Leaves',
  'HDR',
  'Schwachlicht',
  'Automotive',
  'Medical',
  'Broadcast',
  'Security',
  'Machine Vision',
  'Mobile',
  'Spezial-Targets',
  'Kundenspezifisch'
];

export const applications = [
  'Automotive/ADAS',
  'Smartphone', 
  'Broadcast',
  'Medical',
  'Machine Vision',
  'Forschung',
  'Sicherheit',
  'DSLR',
  'Mobile',
  'Tablet',
  'TV-Produktion',
  'Endoskopie',
  'Überwachung',
  'Qualitätskontrolle',
  'Robotik'
];

export const standards = [
  'ISO 12233',
  'IEEE P2020', 
  'VCX',
  'iQ-Analyzer-Kompatibilität',
  'SMPTE',
  'EBU',
  'CPIQ',
  'EMVA',
  'FDA',
  'Medical',
  'Automotive',
  'ADAS'
];

export const materials = [
  'Reflexions-Chart',
  'Transmissions-Chart', 
  'Glas',
  'Film',
  'Papier',
  'Kunststoff',
  'Metall',
  'Keramik'
];

export const formats = [
  'A4',
  'A3', 
  'A2',
  'A1',
  '24"×36"',
  'Kundenspezifisch'
];

export const availability = [
  'Auf Lager',
  'Made-to-Order'
];