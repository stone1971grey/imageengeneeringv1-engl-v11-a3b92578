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
    slug: 'texx',
    title: 'TEXX',
    sku: 'TEXX',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Individuelle Testchart-Erstellung – maßgeschneidert für Ihre spezifischen Testanforderungen.',
    description: 'TEXX bietet maßgeschneiderte Testchart-Lösungen für spezifische Testanforderungen. Entwickelt für individuelle Anwendungen und Testverfahren.',
    standards: ['Custom'],
    applications: ['Alle'],
    categories: ['Kundenspezifisch'],
    materials: ['Nach Anforderung'],
    sizes: ['Kundenspezifisch'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1950,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Alle Systeme'],
    badges: ['Kundenspezifisch'],
    seo: {
      title: 'TEXX - Individuelle Testchart-Erstellung',
      description: 'Maßgeschneiderte Testchart-Lösungen für spezifische Testanforderungen.'
    }
  },
  {
    id: '2',
    slug: 'te42-ll-t',
    title: 'TE42-LL-T',
    sku: 'TE42-LL-T',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Multipurpose Low-Light Testchart mit integrierten LED-Panels für präzise Timing-Messungen.',
    description: 'TE42-LL-T ist ein fortschrittliches Multipurpose Testchart mit integrierten LED-Panels, speziell entwickelt für Low-Light-Bedingungen und präzise Timing-Messungen.',
    standards: ['ISO', 'Low-Light'],
    applications: ['Low-Light', 'Timing'],
    categories: ['Low-Light', 'Multipurpose'],
    materials: ['LED-Panel'],
    sizes: ['Standard'],
    variants: [],
    price_mode: 'fixed',
    price_from: 2250,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Low-Light Test Systems'],
    badges: ['LED-Integration', 'Timing'],
    seo: {
      title: 'TE42-LL-T - Multipurpose Low-Light Testchart mit LED',
      description: 'Fortschrittliches Testchart mit integrierten LED-Panels für Low-Light und Timing-Messungen.'
    }
  },
  {
    id: '3',
    slug: 'te42-ll-uw',
    title: 'TE42-LL UW',
    sku: 'TE42-LL UW',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Multipurpose Testchart für Ultra-Weitwinkel-Kamerasysteme.',
    description: 'TE42-LL UW ist speziell für Ultra-Weitwinkel-Kamerasysteme entwickelt und bietet umfassende Testmöglichkeiten für Wide-Field-of-View Anwendungen.',
    standards: ['ISO', 'Ultra-Wide'],
    applications: ['Ultra-Weitwinkel', 'Automotive'],
    categories: ['Ultra-Wide', 'Multipurpose'],
    materials: ['Film', 'Glas'],
    sizes: ['Large Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1890,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Ultra-Wide Camera Systems'],
    badges: ['Ultra-Wide', 'Automotive'],
    seo: {
      title: 'TE42-LL UW - Ultra-Weitwinkel Testchart',
      description: 'Spezielles Testchart für Ultra-Weitwinkel-Kamerasysteme und Wide-FOV Anwendungen.'
    }
  },
  {
    id: '4',
    slug: 'te42-ll-2ar',
    title: 'TE42-LL 2AR',
    sku: 'TE42-LL 2AR',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Multipurpose Testchart mit zwei Seitenverhältnissen auf einer Chart.',
    description: 'TE42-LL 2AR kombiniert zwei verschiedene Seitenverhältnisse in einem einzigen Testchart für effiziente und vielseitige Testverfahren.',
    standards: ['ISO', 'Multi-Format'],
    applications: ['Multi-Format', 'Effizienz'],
    categories: ['Multi-Format', 'Multipurpose'],
    materials: ['Film', 'Papier'],
    sizes: ['A2', 'A1'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1990,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Multi-Format Systems'],
    badges: ['Multi-Format', 'Effizienz'],
    seo: {
      title: 'TE42-LL 2AR - Dual Aspect Ratio Testchart',
      description: 'Innovatives Testchart mit zwei Seitenverhältnissen für effiziente Tests.'
    }
  },
  {
    id: '5',
    slug: 'te42-ll',
    title: 'TE42-LL',
    sku: 'TE42-LL',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Multipurpose Testchart für Low-Light-Leistungsmessungen (ISO-konform).',
    description: 'TE42-LL ist das Standard Multipurpose Testchart für Low-Light-Leistungsmessungen nach ISO-Standards mit umfassenden Testpatterns.',
    standards: ['ISO', 'Low-Light'],
    applications: ['Low-Light', 'Standard Tests'],
    categories: ['Low-Light', 'ISO-Standard'],
    materials: ['Film', 'Papier'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1850,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Standard Test Systems'],
    badges: ['ISO-Standard', 'Low-Light'],
    seo: {
      title: 'TE42-LL - Standard Low-Light Testchart',
      description: 'ISO-konformes Multipurpose Testchart für Low-Light-Leistungsmessungen.'
    }
  },
  {
    id: '6',
    slug: 'te42',
    title: 'TE42',
    sku: 'TE42',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Multipurpose Testchart für Highspeed-Kamera-Tests.',
    description: 'TE42 ist speziell für Highspeed-Kamera-Tests entwickelt und bietet optimierte Patterns für hohe Bildfrequenzen und schnelle Bewegungen.',
    standards: ['ISO', 'Highspeed'],
    applications: ['Highspeed', 'Industrial'],
    categories: ['Highspeed', 'Industrial'],
    materials: ['Film', 'Metall'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1790,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Highspeed Camera Systems'],
    badges: ['Highspeed', 'Industrial'],
    seo: {
      title: 'TE42 - Highspeed Kamera Testchart',
      description: 'Spezielles Testchart für Highspeed-Kamera-Tests und schnelle Bilderfassung.'
    }
  },
  {
    id: '7',
    slug: 'te300',
    title: 'TE300',
    sku: 'TE300',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Fortschrittliche Hauttöne-Testchart für präzise Farbbewertung.',
    description: 'TE300 bietet eine umfassende Sammlung von Hauttönen für präzise Farbbewertung und Hautton-Reproduktion in verschiedenen Kamerasystemen.',
    standards: ['Color', 'Skin Tone'],
    applications: ['Portrait', 'Medical', 'Broadcast'],
    categories: ['Farbwiedergabe', 'Hauttöne'],
    materials: ['Film', 'Glas'],
    sizes: ['A3', 'A2'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1450,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Color Management Systems'],
    badges: ['Hauttöne', 'Color Accuracy'],
    seo: {
      title: 'TE300 - Hauttöne Testchart für Farbbewertung',
      description: 'Fortschrittliches Testchart für präzise Hautton-Reproduktion und Farbbewertung.'
    }
  },
  {
    id: '8',
    slug: 'te297',
    title: 'TE297',
    sku: 'TE297',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Graustufen-Testchart für Wide Dynamic Range Kamera-Tests.',
    description: 'TE297 ist ein präzises Graustufen-Testchart für Wide Dynamic Range (WDR) Kamera-Tests mit erweiterten Kontrastbereichen.',
    standards: ['WDR', 'Gray Scale'],
    applications: ['WDR', 'Security', 'Automotive'],
    categories: ['Graustufen', 'WDR'],
    materials: ['Film', 'Transmission'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1390,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['WDR Camera Systems'],
    badges: ['WDR', 'Graustufen'],
    seo: {
      title: 'TE297 - Wide Dynamic Range Graustufen Chart',
      description: 'Präzises Graustufen-Testchart für Wide Dynamic Range Kamera-Tests.'
    }
  },
  {
    id: '9',
    slug: 'te296',
    title: 'TE296',
    sku: 'TE296',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Slanted Edge Chart für den aktualisierten ISO 12233 (2023) Standard.',
    description: 'TE296 ist ein Slanted Edge Chart nach dem neuesten ISO 12233:2023 Standard für präzise Schärfe- und Auflösungsmessungen.',
    standards: ['ISO 12233:2023'],
    applications: ['Resolution', 'Sharpness'],
    categories: ['Auflösung/SFR', 'ISO-Standard'],
    materials: ['Film', 'Papier'],
    sizes: ['A3', 'A2'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1290,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['ISO 12233:2023 Systems'],
    badges: ['ISO 12233:2023', 'Slanted Edge'],
    seo: {
      title: 'TE296 - ISO 12233:2023 Slanted Edge Chart',
      description: 'Aktualisiertes Slanted Edge Chart für ISO 12233:2023 Schärfemessungen.'
    }
  },
  {
    id: '10',
    slug: 'te295',
    title: 'TE295',
    sku: 'TE295',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Webcam-Testchart nach VCX-Spezifikation.',
    description: 'TE295 ist ein speziell für Webcam-Tests entwickeltes Chart nach VCX-Spezifikation für standardisierte Webcam-Qualitätsbewertungen.',
    standards: ['VCX'],
    applications: ['Webcam', 'Video Conference'],
    categories: ['Webcam', 'VCX'],
    materials: ['Film', 'Papier'],
    sizes: ['A3', 'A4'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1250,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['VCX Test Systems'],
    badges: ['VCX', 'Webcam'],
    seo: {
      title: 'TE295 - VCX Webcam Testchart',
      description: 'Spezielles Testchart für Webcam-Tests nach VCX-Spezifikation.'
    }
  },
  {
    id: '11',
    slug: 'te294',
    title: 'TE294',
    sku: 'TE294',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Spezielle Testchart für das Vega-Beleuchtungsgerät.',
    description: 'TE294 ist speziell für das Vega-Beleuchtungsgerät entwickelt und bietet optimierte Patterns für LED-basierte Beleuchtungssysteme.',
    standards: ['Vega'],
    applications: ['LED Testing', 'Vega System'],
    categories: ['LED', 'Vega'],
    materials: ['Transmission', 'Film'],
    sizes: ['Vega Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1350,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Vega LED System'],
    badges: ['Vega', 'LED Testing'],
    seo: {
      title: 'TE294 - Vega LED System Testchart',
      description: 'Spezielles Testchart für Vega-Beleuchtungsgerät und LED-Systeme.'
    }
  },
  {
    id: '12',
    slug: 'te293',
    title: 'TE293',
    sku: 'TE293',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'ChartBOARD für iQ-Chartmount.',
    description: 'TE293 ist ein spezielles ChartBOARD System für die iQ-Chartmount Halterung, optimiert für einfache und präzise Chart-Positionierung.',
    standards: ['iQ System'],
    applications: ['Chart Mounting', 'Positioning'],
    categories: ['Mounting', 'iQ System'],
    materials: ['Board', 'Metall'],
    sizes: ['iQ Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 450,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['iQ-Chartmount System'],
    badges: ['iQ System', 'Mounting'],
    seo: {
      title: 'TE293 - iQ-Chartmount ChartBOARD',
      description: 'Spezielles ChartBOARD für iQ-Chartmount Halterungssystem.'
    }
  },
  {
    id: '13',
    slug: 'te292',
    title: 'TE292',
    sku: 'TE292',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Chart für spektrale Empfindlichkeitsmessungen mit iQ-LED.',
    description: 'TE292 ermöglicht präzise spektrale Empfindlichkeitsmessungen in Kombination mit dem iQ-LED System für umfassende Spektralanalysen.',
    standards: ['Spektral', 'iQ-LED'],
    applications: ['Spectral Analysis', 'LED Testing'],
    categories: ['Spektral', 'iQ-LED'],
    materials: ['Spektral Film'],
    sizes: ['Standard'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1590,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['iQ-LED System'],
    badges: ['Spektral', 'iQ-LED'],
    seo: {
      title: 'TE292 - iQ-LED Spektral Testchart',
      description: 'Spezielles Chart für spektrale Empfindlichkeitsmessungen mit iQ-LED.'
    }
  },
  {
    id: '14',
    slug: 'te291',
    title: 'TE291',
    sku: 'TE291',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Chart zur Homogenitätsmessung der LE7 Light Box.',
    description: 'TE291 ist speziell für Homogenitätsmessungen der LE7 Light Box entwickelt und ermöglicht präzise Beleuchtungsgleichmäßigkeitsprüfungen.',
    standards: ['LE7', 'Homogenität'],
    applications: ['Light Box Testing', 'Homogeneity'],
    categories: ['Homogenität', 'LE7'],
    materials: ['Transmission'],
    sizes: ['LE7 Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 980,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['LE7 Light Box'],
    badges: ['LE7', 'Homogenität'],
    seo: {
      title: 'TE291 - LE7 Light Box Homogenität Chart',
      description: 'Spezielles Chart für Homogenitätsmessungen der LE7 Light Box.'
    }
  },
  {
    id: '15',
    slug: 'te290',
    title: 'TE290',
    sku: 'TE290',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Auflösung-/Fokustestchart gemäß ISO 16505.',
    description: 'TE290 ist ein präzises Auflösung- und Fokustestchart nach ISO 16505 Standard für standardisierte Bildqualitätsmessungen.',
    standards: ['ISO 16505'],
    applications: ['Resolution', 'Focus Testing'],
    categories: ['Auflösung/SFR', 'ISO-Standard'],
    materials: ['Film', 'Papier'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1150,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['ISO 16505 Systems'],
    badges: ['ISO 16505', 'Focus'],
    seo: {
      title: 'TE290 - ISO 16505 Auflösung/Focus Chart',
      description: 'Präzises Testchart für Auflösung und Focus nach ISO 16505.'
    }
  },
  {
    id: '16',
    slug: 'te289',
    title: 'TE289',
    sku: 'TE289',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Farbwiedergabe-Testchart gemäß ISO 16505.',
    description: 'TE289 bietet standardisierte Farbwiedergabe-Tests nach ISO 16505 für konsistente und vergleichbare Farbanalysen.',
    standards: ['ISO 16505'],
    applications: ['Color Reproduction', 'Color Testing'],
    categories: ['Farbwiedergabe', 'ISO-Standard'],
    materials: ['Film', 'Glas'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1150,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['ISO 16505 Systems'],
    badges: ['ISO 16505', 'Farbwiedergabe'],
    seo: {
      title: 'TE289 - ISO 16505 Farbwiedergabe Chart',
      description: 'Standardisiertes Farbwiedergabe-Testchart nach ISO 16505.'
    }
  },
  {
    id: '17',
    slug: 'te288',
    title: 'TE288',
    sku: 'TE288',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Auflösungstestchart gemäß ISO 16505.',
    description: 'TE288 ist ein spezielles Auflösungstestchart nach ISO 16505 für standardisierte Auflösungsmessungen und Vergleichbarkeit.',
    standards: ['ISO 16505'],
    applications: ['Resolution Testing'],
    categories: ['Auflösung/SFR', 'ISO-Standard'],
    materials: ['Film', 'Papier'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1150,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['ISO 16505 Systems'],
    badges: ['ISO 16505', 'Auflösung'],
    seo: {
      title: 'TE288 - ISO 16505 Auflösung Chart',
      description: 'Spezielles Auflösungstestchart nach ISO 16505 Standard.'
    }
  },
  {
    id: '18',
    slug: 'te287',
    title: 'TE287',
    sku: 'TE287',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Chart zur Analyse geometrischer Verzerrungen nach ISO 16505.',
    description: 'TE287 ermöglicht die präzise Analyse geometrischer Verzerrungen und Distortionen nach ISO 16505 Standard.',
    standards: ['ISO 16505'],
    applications: ['Distortion Analysis', 'Geometry'],
    categories: ['Distortion', 'ISO-Standard'],
    materials: ['Film', 'Glas'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1190,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['ISO 16505 Systems'],
    badges: ['ISO 16505', 'Distortion'],
    seo: {
      title: 'TE287 - ISO 16505 Distortion Analysis Chart',
      description: 'Chart für geometrische Verzerrungsanalyse nach ISO 16505.'
    }
  },
  {
    id: '19',
    slug: 'te285',
    title: 'TE285',
    sku: 'TE285',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'IEC 62676-5 Testchart zur Bewertung von Infrarotkameras.',
    description: 'TE285 ist ein spezielles Testchart nach IEC 62676-5 Standard für die umfassende Bewertung von Infrarot- und Wärmebildkameras.',
    standards: ['IEC 62676-5'],
    applications: ['Infrared', 'Thermal Imaging'],
    categories: ['Infrarot', 'IEC-Standard'],
    materials: ['IR-Film', 'Thermal'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1450,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['IEC 62676-5 Systems'],
    badges: ['IEC 62676-5', 'Infrarot'],
    seo: {
      title: 'TE285 - IEC 62676-5 Infrarot Testchart',
      description: 'Spezielles Testchart für Infrarotkameras nach IEC 62676-5.'
    }
  },
  {
    id: '20',
    slug: 'te283c',
    title: 'TE283C',
    sku: 'TE283C',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Slanted Edge Chart für Fisheye-Kameras.',
    description: 'TE283C ist ein speziell für Fisheye-Kameras entwickeltes Slanted Edge Chart für präzise Schärfemessungen bei extremen Weitwinkeln.',
    standards: ['Fisheye', 'Slanted Edge'],
    applications: ['Fisheye', 'Wide Angle'],
    categories: ['Fisheye', 'Auflösung/SFR'],
    materials: ['Film', 'Curved'],
    sizes: ['Fisheye Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1250,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Fisheye Camera Systems'],
    badges: ['Fisheye', 'Slanted Edge'],
    seo: {
      title: 'TE283C - Fisheye Slanted Edge Chart',
      description: 'Spezielles Slanted Edge Chart für Fisheye-Kameras.'
    }
  },
  {
    id: '21',
    slug: 'te281',
    title: 'TE281',
    sku: 'TE281',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Flare-Target gemäß ISO 18844.',
    description: 'TE281 ist ein Flare-Target nach ISO 18844 Standard für die Messung von Streulicht und optischen Störungen in Kamerasystemen.',
    standards: ['ISO 18844'],
    applications: ['Flare Testing', 'Optical Quality'],
    categories: ['Flare', 'ISO-Standard'],
    materials: ['Film', 'High Contrast'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1090,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['ISO 18844 Systems'],
    badges: ['ISO 18844', 'Flare'],
    seo: {
      title: 'TE281 - ISO 18844 Flare Target',
      description: 'Flare-Target für Streulichtmessungen nach ISO 18844.'
    }
  },
  {
    id: '22',
    slug: 'te280',
    title: 'TE280',
    sku: 'TE280',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Texture Loss Testchart gemäß ISO 19567.',
    description: 'TE280 ist ein Texture Loss Testchart nach ISO 19567 für die Analyse von Texturverlust und Detailerhaltung in Bildern.',
    standards: ['ISO 19567'],
    applications: ['Texture Analysis', 'Detail Preservation'],
    categories: ['Textur', 'ISO-Standard'],
    materials: ['Film', 'Texture Pattern'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1250,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['ISO 19567 Systems'],
    badges: ['ISO 19567', 'Texture'],
    seo: {
      title: 'TE280 - ISO 19567 Texture Loss Chart',
      description: 'Texture Loss Testchart für Detailanalyse nach ISO 19567.'
    }
  },
  {
    id: '23',
    slug: 'te279',
    title: 'TE279',
    sku: 'TE279',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: '4K (UHD TV) Universal Testchart für allgemeine Prüfungen.',
    description: 'TE279 ist ein universelles 4K UHD TV Testchart für umfassende Qualitätsprüfungen von Ultra HD Displays und Systemen.',
    standards: ['4K UHD', 'TV Standard'],
    applications: ['4K Testing', 'UHD TV'],
    categories: ['4K', 'UHD', 'TV'],
    materials: ['High Resolution Film'],
    sizes: ['4K Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1050,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['4K UHD Systems'],
    badges: ['4K UHD', 'TV'],
    seo: {
      title: 'TE279 - 4K UHD TV Universal Testchart',
      description: 'Universelles Testchart für 4K UHD TV Qualitätsprüfungen.'
    }
  },
  {
    id: '24',
    slug: 'te278',
    title: 'TE278',
    sku: 'TE278',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: '8K (UHD TV2) Auflösungstestchart 200–4000 CPH.',
    description: 'TE278 ist ein hochauflösendes 8K UHD TV2 Testchart mit 200-4000 CPH für extreme Auflösungstests der nächsten Generation.',
    standards: ['8K UHD', 'TV2 Standard'],
    applications: ['8K Testing', 'Ultra Resolution'],
    categories: ['8K', 'UHD TV2', 'Ultra-Resolution'],
    materials: ['Ultra High Resolution Film'],
    sizes: ['8K Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1290,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['8K UHD Systems'],
    badges: ['8K UHD', 'Ultra-Resolution'],
    seo: {
      title: 'TE278 - 8K UHD TV2 Auflösung Chart',
      description: '8K Auflösungstestchart für Ultra HD TV2 mit 200-4000 CPH.'
    }
  },
  {
    id: '25',
    slug: 'te277',
    title: 'TE277',
    sku: 'TE277',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: '4K (UHD TV) Auflösungstestchart 100–2000 CPH.',
    description: 'TE277 ist ein 4K UHD TV Auflösungstestchart mit 100-2000 CPH für präzise UHD Auflösungsmessungen.',
    standards: ['4K UHD', 'TV Standard'],
    applications: ['4K Resolution', 'UHD Testing'],
    categories: ['4K', 'UHD', 'Auflösung/SFR'],
    materials: ['High Resolution Film'],
    sizes: ['4K Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1190,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['4K UHD Systems'],
    badges: ['4K UHD', 'Auflösung'],
    seo: {
      title: 'TE277 - 4K UHD Auflösung Chart 100-2000 CPH',
      description: '4K UHD TV Auflösungstestchart mit 100-2000 CPH Messbereich.'
    }
  },
  {
    id: '26',
    slug: 'te276',
    title: 'TE276',
    sku: 'TE276',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Dead Leaves Pattern Testchart.',
    description: 'TE276 bietet ein naturähnliches Dead Leaves Pattern für realistische Textur- und Rauschanalysen in verschiedenen Kamerasystemen.',
    standards: ['Dead Leaves', 'Texture'],
    applications: ['Texture Analysis', 'Noise Testing'],
    categories: ['Dead-Leaves', 'Textur'],
    materials: ['Film', 'Pattern Print'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 950,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Texture Analysis Systems'],
    badges: ['Dead Leaves', 'Texture'],
    seo: {
      title: 'TE276 - Dead Leaves Pattern Testchart',
      description: 'Naturähnliches Dead Leaves Pattern für Textur- und Rauschanalyse.'
    }
  },
  {
    id: '27',
    slug: 'te275',
    title: 'TE275',
    sku: 'TE275',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Slanted Edge ISO 12233:2017 Testchart.',
    description: 'TE275 ist ein präzises Slanted Edge Testchart nach ISO 12233:2017 Standard für standardisierte Schärfe- und SFR-Messungen.',
    standards: ['ISO 12233:2017'],
    applications: ['SFR Testing', 'Sharpness'],
    categories: ['Auflösung/SFR', 'ISO-Standard'],
    materials: ['Film', 'Papier'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1150,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['ISO 12233:2017 Systems'],
    badges: ['ISO 12233:2017', 'SFR'],
    seo: {
      title: 'TE275 - ISO 12233:2017 Slanted Edge Chart',
      description: 'Slanted Edge Testchart für SFR-Messungen nach ISO 12233:2017.'
    }
  },
  {
    id: '28',
    slug: 'te274',
    title: 'TE274',
    sku: 'TE274',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Macrochart für Nah- und Makrotests.',
    description: 'TE274 ist ein spezielles Macrochart für Nahbereichs- und Makrofotografie-Tests mit hoher Detailauflösung.',
    standards: ['Macro', 'Close-up'],
    applications: ['Macro Photography', 'Close-up Testing'],
    categories: ['Macro', 'Nahbereich'],
    materials: ['High Detail Film'],
    sizes: ['Macro Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1150,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Macro Systems'],
    badges: ['Macro', 'Close-up'],
    seo: {
      title: 'TE274 - Macro Testchart für Nahbereich',
      description: 'Spezielles Macrochart für Nah- und Makrofotografie-Tests.'
    }
  },
  {
    id: '29',
    slug: 'te273',
    title: 'TE273',
    sku: 'TE273',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Natürliche Hauttöne-Testcharts für realistische Farbwiedergabe.',
    description: 'TE273 bietet eine umfassende Sammlung natürlicher Hauttöne für realistische Farbwiedergabe-Tests und Hautton-Optimierung.',
    standards: ['Skin Tone', 'Natural Color'],
    applications: ['Portrait', 'Skin Tone', 'Medical'],
    categories: ['Hauttöne', 'Farbwiedergabe'],
    materials: ['Color Accurate Film'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1450,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Color Management Systems'],
    badges: ['Hauttöne', 'Natural Color'],
    seo: {
      title: 'TE273 - Natürliche Hauttöne Testchart',
      description: 'Testchart mit natürlichen Hauttönen für realistische Farbwiedergabe.'
    }
  },
  {
    id: '30',
    slug: 'te270x',
    title: 'TE270X',
    sku: 'TE270X',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'OECF Chart (Opto-Electronic Conversion Function).',
    description: 'TE270X ist ein OECF Chart für die Messung der Opto-Electronic Conversion Function und Tonwert-Charakteristik von Kamerasystemen.',
    standards: ['OECF'],
    applications: ['OECF Testing', 'Tone Curve'],
    categories: ['OECF', 'Tonwert'],
    materials: ['Film', 'Calibrated'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1250,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['OECF Systems'],
    badges: ['OECF', 'Tonwert'],
    seo: {
      title: 'TE270X - OECF Conversion Function Chart',
      description: 'OECF Chart für Opto-Electronic Conversion Function Messungen.'
    }
  },
  {
    id: '31',
    slug: 'te269',
    title: 'TE269',
    sku: 'TE269',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'OECF 36 Chart nach ISO 14524/15739 und IEC 62676-5.',
    description: 'TE269 ist ein OECF 36 Chart nach ISO 14524/15739 und IEC 62676-5 Standards für umfassende OECF-Messungen.',
    standards: ['ISO 14524', 'ISO 15739', 'IEC 62676-5'],
    applications: ['OECF Testing', 'Standard Compliance'],
    categories: ['OECF', 'ISO-Standard'],
    materials: ['Calibrated Film'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1290,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['ISO/IEC Systems'],
    badges: ['ISO 14524', 'IEC 62676-5'],
    seo: {
      title: 'TE269 - OECF 36 Chart ISO/IEC Standard',
      description: 'OECF 36 Chart nach ISO 14524/15739 und IEC 62676-5.'
    }
  },
  {
    id: '32',
    slug: 'te268',
    title: 'TE268',
    sku: 'TE268',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Linsen-Auflösungstestchart.',
    description: 'TE268 ist ein spezielles Linsen-Auflösungstestchart für die präzise Bewertung der optischen Leistung von Objektiven.',
    standards: ['Lens Testing'],
    applications: ['Lens Resolution', 'Optical Testing'],
    categories: ['Auflösung/SFR', 'Optik'],
    materials: ['Film', 'High Resolution'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1150,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Lens Test Systems'],
    badges: ['Lens Testing', 'Optik'],
    seo: {
      title: 'TE268 - Linsen-Auflösung Testchart',
      description: 'Spezielles Testchart für Linsen-Auflösungsmessungen.'
    }
  },
  {
    id: '33',
    slug: 'te266',
    title: 'TE266',
    sku: 'TE266',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Mikrofilm-Testziel gemäß DIN 19051.',
    description: 'TE266 ist ein Mikrofilm-Testziel nach DIN 19051 Standard für die Qualitätskontrolle von Mikrofilm-Systemen.',
    standards: ['DIN 19051'],
    applications: ['Microfilm', 'Archive'],
    categories: ['Mikrofilm', 'DIN-Standard'],
    materials: ['Microfilm'],
    sizes: ['Microfilm Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 890,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Microfilm Systems'],
    badges: ['DIN 19051', 'Mikrofilm'],
    seo: {
      title: 'TE266 - DIN 19051 Mikrofilm Testziel',
      description: 'Mikrofilm-Testziel für Qualitätskontrolle nach DIN 19051.'
    }
  },
  {
    id: '34',
    slug: 'te265',
    title: 'TE265',
    sku: 'TE265',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Dead Leaves Pattern Chart für Texturanalyse.',
    description: 'TE265 bietet ein optimiertes Dead Leaves Pattern speziell für detaillierte Texturanalyse und Bildqualitätsbewertung.',
    standards: ['Dead Leaves', 'Texture'],
    applications: ['Texture Analysis', 'Image Quality'],
    categories: ['Dead-Leaves', 'Textur'],
    materials: ['Pattern Film'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 950,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Texture Systems'],
    badges: ['Dead Leaves', 'Texture'],
    seo: {
      title: 'TE265 - Dead Leaves Texturanalyse Chart',
      description: 'Optimiertes Dead Leaves Pattern für Texturanalyse.'
    }
  },
  {
    id: '35',
    slug: 'te264',
    title: 'TE264',
    sku: 'TE264',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'OECF 20 Chart (ISO 14524/15739) mit 10.000:1 und 100.000:1 Kontrast.',
    description: 'TE264 ist ein OECF 20 Chart nach ISO 14524/15739 mit extremen Kontrastbereichen von 10.000:1 und 100.000:1.',
    standards: ['ISO 14524', 'ISO 15739'],
    applications: ['High Contrast OECF', 'Dynamic Range'],
    categories: ['OECF', 'High Contrast'],
    materials: ['High Contrast Film'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1290,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['High Contrast Systems'],
    badges: ['High Contrast', 'OECF'],
    seo: {
      title: 'TE264 - OECF 20 High Contrast Chart',
      description: 'OECF 20 Chart mit extremen Kontrastbereichen bis 100.000:1.'
    }
  },
  {
    id: '36',
    slug: 'te263',
    title: 'TE263',
    sku: 'TE263',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Scan Reference Chart.',
    description: 'TE263 ist ein Scan Reference Chart für die Kalibrierung und Qualitätskontrolle von Scanner-Systemen.',
    standards: ['Scan Reference'],
    applications: ['Scanner Calibration', 'Reference'],
    categories: ['Scanner', 'Referenz'],
    materials: ['Reference Film'],
    sizes: ['A3', 'A2'],
    variants: [],
    price_mode: 'fixed',
    price_from: 980,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Scanner Systems'],
    badges: ['Scanner', 'Reference'],
    seo: {
      title: 'TE263 - Scan Reference Chart',
      description: 'Reference Chart für Scanner-Kalibrierung und Qualitätskontrolle.'
    }
  },
  {
    id: '37',
    slug: 'te262',
    title: 'TE262',
    sku: 'TE262',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Universal Test Target (UTT).',
    description: 'TE262 ist ein Universal Test Target (UTT) für vielseitige Bildqualitätstests und allgemeine Kamera-Evaluierung.',
    standards: ['Universal'],
    applications: ['Universal Testing', 'General Purpose'],
    categories: ['Universal', 'Multipurpose'],
    materials: ['Film', 'Universal'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1250,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Universal Systems'],
    badges: ['Universal', 'UTT'],
    seo: {
      title: 'TE262 - Universal Test Target (UTT)',
      description: 'Vielseitiges Universal Test Target für allgemeine Bildqualitätstests.'
    }
  },
  {
    id: '38',
    slug: 'te261',
    title: 'TE261',
    sku: 'TE261',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Slanted Edges Chart für Auflösungstests.',
    description: 'TE261 bietet multiple Slanted Edges für umfassende Auflösungstests und SFR-Messungen in verschiedenen Orientierungen.',
    standards: ['Slanted Edge'],
    applications: ['Resolution Testing', 'SFR'],
    categories: ['Auflösung/SFR', 'Slanted Edge'],
    materials: ['Film', 'Multi-Edge'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1050,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['SFR Systems'],
    badges: ['Slanted Edge', 'Multi-Edge'],
    seo: {
      title: 'TE261 - Slanted Edges Auflösung Chart',
      description: 'Multiple Slanted Edges für umfassende Auflösungstests.'
    }
  },
  {
    id: '39',
    slug: 'te260',
    title: 'TE260',
    sku: 'TE260',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Dot Chart für Muster- und Verzerrungstests.',
    description: 'TE260 ist ein Dot Chart für Muster- und Verzerrungstests, ideal für geometrische Kalibrierung und Distortion-Analyse.',
    standards: ['Dot Pattern'],
    applications: ['Pattern Testing', 'Distortion'],
    categories: ['Distortion', 'Pattern'],
    materials: ['Film', 'Dot Pattern'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 980,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Pattern Systems'],
    badges: ['Dot Pattern', 'Distortion'],
    seo: {
      title: 'TE260 - Dot Chart für Muster und Verzerrung',
      description: 'Dot Chart für Muster- und Verzerrungstests mit geometrischer Kalibrierung.'
    }
  },
  {
    id: '40',
    slug: 'te259',
    title: 'TE259',
    sku: 'TE259',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'OECF/Noise Chart mit 20 Graufeldern, Kontrast 10.000:1.',
    description: 'TE259 kombiniert OECF und Noise-Messungen mit 20 Graufeldern und einem Kontrastbereich von 10.000:1.',
    standards: ['OECF', 'Noise'],
    applications: ['OECF Testing', 'Noise Analysis'],
    categories: ['OECF', 'Rauschen'],
    materials: ['High Contrast Film'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1250,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['OECF/Noise Systems'],
    badges: ['OECF', 'Noise'],
    seo: {
      title: 'TE259 - OECF/Noise Chart 20 Graufelder',
      description: 'Kombiniertes OECF/Noise Chart mit 20 Graufeldern und 10.000:1 Kontrast.'
    }
  },
  {
    id: '41',
    slug: 'te258',
    title: 'TE258',
    sku: 'TE258',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'IT8 Scanner-Charakterisierungschart.',
    description: 'TE258 ist ein IT8 Scanner-Charakterisierungschart für die präzise Kalibrierung und Charakterisierung von Scanner-Systemen.',
    standards: ['IT8'],
    applications: ['Scanner Characterization', 'Calibration'],
    categories: ['Scanner', 'IT8'],
    materials: ['IT8 Reference'],
    sizes: ['IT8 Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 980,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['IT8 Systems'],
    badges: ['IT8', 'Scanner'],
    seo: {
      title: 'TE258 - IT8 Scanner Charakterisierung Chart',
      description: 'IT8 Chart für Scanner-Charakterisierung und Kalibrierung.'
    }
  },
  {
    id: '42',
    slug: 'te256',
    title: 'TE256',
    sku: 'TE256',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Farb- und Kalibrierungschart, überarbeitete Version von TE232 (super black).',
    description: 'TE256 ist eine überarbeitete Version des TE232 mit super black Technologie für erweiterte Farb- und Kalibrierungsmessungen.',
    standards: ['Color Calibration', 'Super Black'],
    applications: ['Color Calibration', 'Black Level'],
    categories: ['Farbwiedergabe', 'Kalibrierung'],
    materials: ['Super Black Film'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1290,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Color Systems'],
    badges: ['Super Black', 'Color'],
    seo: {
      title: 'TE256 - Super Black Farb- und Kalibrierung Chart',
      description: 'Erweiterte Farb- und Kalibrierungschart mit super black Technologie.'
    }
  },
  {
    id: '43',
    slug: 'te255',
    title: 'TE255',
    sku: 'TE255',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Diffusorplatte zur Vignettierungsmessung.',
    description: 'TE255 ist eine spezielle Diffusorplatte für die präzise Messung von Vignettierung und Beleuchtungsgleichmäßigkeit.',
    standards: ['Vignetting'],
    applications: ['Vignetting Measurement', 'Illumination'],
    categories: ['Vignettierung', 'Diffusor'],
    materials: ['Diffusor'],
    sizes: ['Standard Diffusor'],
    variants: [],
    price_mode: 'fixed',
    price_from: 690,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Vignetting Systems'],
    badges: ['Vignettierung', 'Diffusor'],
    seo: {
      title: 'TE255 - Diffusorplatte Vignettierung',
      description: 'Spezielle Diffusorplatte für Vignettierungsmessungen.'
    }
  },
  {
    id: '44',
    slug: 'te253-9x',
    title: 'TE253 9x',
    sku: 'TE253 9x',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Modulierter sinusförmiger Siemensstern (9× Layout).',
    description: 'TE253 9x bietet einen modulierten sinusförmigen Siemensstern in 9-fach Layout für erweiterte Auflösungsanalysen.',
    standards: ['Siemens Star', 'Modulated'],
    applications: ['Resolution Testing', 'MTF'],
    categories: ['Siemens-Stern', 'Modulated'],
    materials: ['Film', 'Multi-Layout'],
    sizes: ['Multi Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1050,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['MTF Systems'],
    badges: ['Siemens Star', '9x Layout'],
    seo: {
      title: 'TE253 9x - Modulierter Siemensstern 9x Layout',
      description: 'Modulierter sinusförmiger Siemensstern in 9-fach Layout.'
    }
  },
  {
    id: '45',
    slug: 'te253',
    title: 'TE253',
    sku: 'TE253',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Modulierter sinusförmiger Siemensstern.',
    description: 'TE253 ist ein modulierter sinusförmiger Siemensstern für präzise MTF und Auflösungsmessungen.',
    standards: ['Siemens Star', 'Modulated'],
    applications: ['MTF Testing', 'Resolution'],
    categories: ['Siemens-Stern', 'MTF'],
    materials: ['Film', 'Precision'],
    sizes: ['Standard'],
    variants: [],
    price_mode: 'fixed',
    price_from: 980,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['MTF Systems'],
    badges: ['Siemens Star', 'MTF'],
    seo: {
      title: 'TE253 - Modulierter Siemensstern',
      description: 'Modulierter sinusförmiger Siemensstern für MTF-Messungen.'
    }
  },
  {
    id: '46',
    slug: 'te252',
    title: 'TE252',
    sku: 'TE252',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'CIPA Auflösungsziel.',
    description: 'TE252 ist ein CIPA Auflösungsziel für standardisierte Auflösungsmessungen nach CIPA-Richtlinien.',
    standards: ['CIPA'],
    applications: ['CIPA Testing', 'Resolution'],
    categories: ['CIPA', 'Auflösung/SFR'],
    materials: ['CIPA Standard Film'],
    sizes: ['CIPA Format'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1050,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['CIPA Systems'],
    badges: ['CIPA', 'Resolution'],
    seo: {
      title: 'TE252 - CIPA Auflösungsziel',
      description: 'CIPA Auflösungsziel für standardisierte Auflösungsmessungen.'
    }
  },
  {
    id: '47',
    slug: 'te251',
    title: 'TE251',
    sku: 'TE251',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'Verzerrungs- und chromatische Aberrationstestchart.',
    description: 'TE251 ermöglicht die präzise Messung von Verzerrungen und chromatischen Aberrationen in optischen Systemen.',
    standards: ['Distortion', 'Chromatic Aberration'],
    applications: ['Distortion Testing', 'Optical Quality'],
    categories: ['Distortion', 'Chromatische Aberration'],
    materials: ['Precision Film'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1090,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['Optical Test Systems'],
    badges: ['Distortion', 'Optical'],
    seo: {
      title: 'TE251 - Verzerrungs- und Aberration Chart',
      description: 'Testchart für Verzerrungen und chromatische Aberrationen.'
    }
  },
  {
    id: '48',
    slug: 'te250',
    title: 'TE250',
    sku: 'TE250',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'USAF Auflösungstestchart (35 mm).',
    description: 'TE250 ist ein USAF Auflösungstestchart in 35 mm Format für standardisierte Auflösungsmessungen nach USAF-Standard.',
    standards: ['USAF'],
    applications: ['USAF Testing', 'Resolution'],
    categories: ['USAF', 'Auflösung/SFR'],
    materials: ['35mm Film'],
    sizes: ['35mm'],
    variants: [],
    price_mode: 'fixed',
    price_from: 980,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['USAF Systems'],
    badges: ['USAF', '35mm'],
    seo: {
      title: 'TE250 - USAF Auflösung Chart 35mm',
      description: 'USAF Auflösungstestchart in 35 mm Format.'
    }
  },
  {
    id: '49',
    slug: 'te245',
    title: 'TE245',
    sku: 'TE245',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'IE Landolt Kreis-Auflösungschart.',
    description: 'TE245 ist ein IE Landolt Kreis-Auflösungschart für präzise Auflösungsmessungen mit Landolt-Ringen.',
    standards: ['IE Standard', 'Landolt'],
    applications: ['Resolution Testing', 'IE Standard'],
    categories: ['Landolt', 'Auflösung/SFR'],
    materials: ['Film', 'Precision'],
    sizes: ['Standard'],
    variants: [],
    price_mode: 'fixed',
    price_from: 890,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['IE Systems'],
    badges: ['IE Standard', 'Landolt'],
    seo: {
      title: 'TE245 - IE Landolt Kreis Auflösung Chart',
      description: 'IE Landolt Kreis-Auflösungschart für präzise Messungen.'
    }
  },
  {
    id: '50',
    slug: 'te241',
    title: 'TE241',
    sku: 'TE241',
    heroImage: '/images/chart-placeholder.jpg',
    gallery: ['/images/chart-placeholder.jpg'],
    excerpt: 'OECF/Noise Chart mit 20 Graufeldern.',
    description: 'TE241 ist ein OECF/Noise Chart mit 20 Graufeldern für umfassende OECF und Rauschanalysen.',
    standards: ['OECF', 'Noise'],
    applications: ['OECF Testing', 'Noise Analysis'],
    categories: ['OECF', 'Rauschen'],
    materials: ['Calibrated Film'],
    sizes: ['A2', 'A3'],
    variants: [],
    price_mode: 'fixed',
    price_from: 1050,
    currency: 'EUR',
    downloads: [
      { name: 'Datenblatt', url: '#', type: 'PDF' }
    ],
    compatibility: ['OECF Systems'],
    badges: ['OECF', 'Noise'],
    seo: {
      title: 'TE241 - OECF/Noise Chart 20 Graufelder',
      description: 'OECF/Noise Chart mit 20 Graufeldern für umfassende Analysen.'
    }
  }
];

export const categories = [
  'Kundenspezifisch',
  'Low-Light',
  'Multipurpose',
  'Ultra-Wide',
  'Multi-Format',
  'ISO-Standard',
  'Highspeed',
  'Industrial',
  'Farbwiedergabe',
  'Hauttöne',
  'Graustufen',
  'WDR',
  'Auflösung/SFR',
  'Webcam',
  'VCX',
  'LED',
  'Vega',
  'Mounting',
  'iQ System',
  'Spektral',
  'iQ-LED',
  'Homogenität',
  'LE7',
  'Infrarot',
  'IEC-Standard',
  'Fisheye',
  'Flare',
  'Textur',
  '4K',
  'UHD',
  'TV',
  '8K',
  'UHD TV2',
  'Ultra-Resolution',
  'Dead-Leaves',
  'OECF',
  'Tonwert',
  'High Contrast',
  'Scanner',
  'Referenz',
  'Universal',
  'Slanted Edge',
  'Distortion',
  'Pattern',
  'Rauschen',
  'IT8',
  'Kalibrierung',
  'Vignettierung',
  'Diffusor',
  'Siemens-Stern',
  'Modulated',
  'MTF',
  'CIPA',
  'Chromatische Aberration',
  'USAF',
  'Landolt',
  'Macro',
  'Nahbereich'
];

export const applications = [
  'Alle',
  'Low-Light',
  'Timing',
  'Ultra-Weitwinkel',
  'Automotive',
  'Multi-Format',
  'Effizienz',
  'Standard Tests',
  'Highspeed',
  'Industrial',
  'Portrait',
  'Medical',
  'Broadcast',
  'WDR',
  'Security',
  'Resolution',
  'Sharpness',
  'Webcam',
  'Video Conference',
  'LED Testing',
  'Vega System',
  'Chart Mounting',
  'Positioning',
  'Spectral Analysis',
  'Light Box Testing',
  'Homogeneity',
  'Focus Testing',
  'Color Reproduction',
  'Color Testing',
  'Distortion Analysis',
  'Geometry',
  'Infrared',
  'Thermal Imaging',
  'Fisheye',
  'Wide Angle',
  'Flare Testing',
  'Optical Quality',
  'Texture Analysis',
  'Detail Preservation',
  '4K Testing',
  'UHD TV',
  '8K Testing',
  'Ultra Resolution',
  'Noise Testing',
  'OECF Testing',
  'Tone Curve',
  'Standard Compliance',
  'Lens Resolution',
  'Optical Testing',
  'Microfilm',
  'Archive',
  'Image Quality',
  'High Contrast OECF',
  'Dynamic Range',
  'Scanner Calibration',
  'Reference',
  'Universal Testing',
  'General Purpose',
  'SFR',
  'Pattern Testing',
  'Noise Analysis',
  'Scanner Characterization',
  'Calibration',
  'Color Calibration',
  'Black Level',
  'Vignetting Measurement',
  'Illumination',
  'MTF Testing',
  'CIPA Testing',
  'IE Standard',
  'Macro Photography',
  'Close-up Testing',
  'Skin Tone',
  'Natural Color'
];

export const standards = [
  'Custom',
  'ISO',
  'Low-Light',
  'Ultra-Wide',
  'Multi-Format',
  'Highspeed',
  'Color',
  'Skin Tone',
  'WDR',
  'Gray Scale',
  'ISO 12233:2023',
  'VCX',
  'Vega',
  'iQ System',
  'Spektral',
  'iQ-LED',
  'LE7',
  'Homogenität',
  'ISO 16505',
  'IEC 62676-5',
  'Fisheye',
  'Slanted Edge',
  'ISO 18844',
  'ISO 19567',
  '4K UHD',
  'TV Standard',
  '8K UHD',
  'TV2 Standard',
  'Dead Leaves',
  'Texture',
  'OECF',
  'ISO 14524',
  'ISO 15739',
  'Lens Testing',
  'DIN 19051',
  'Scan Reference',
  'Universal',
  'Dot Pattern',
  'Noise',
  'IT8',
  'Color Calibration',
  'Super Black',
  'Vignetting',
  'Siemens Star',
  'Modulated',
  'CIPA',
  'Distortion',
  'Chromatic Aberration',
  'USAF',
  'IE Standard',
  'Landolt',
  'Macro',
  'Close-up',
  'Natural Color'
];

export const materials = [
  'Nach Anforderung',
  'LED-Panel',
  'Film',
  'Glas',
  'Papier',
  'Metall',
  'Transmission',
  'Board',
  'Spektral Film',
  'Calibrated Film',
  'High Resolution Film',
  'Ultra High Resolution Film',
  'High Detail Film',
  'Color Accurate Film',
  'High Contrast Film',
  'Pattern Film',
  'Reference Film',
  'Universal',
  'Multi-Edge',
  'Dot Pattern',
  'IT8 Reference',
  'Super Black Film',
  'Diffusor',
  'Multi-Layout',
  'Precision',
  'CIPA Standard Film',
  'Precision Film',
  '35mm Film',
  'Curved',
  'Thermal',
  'IR-Film',
  'Texture Pattern',
  'Biokompatibel',
  'Medizinisches Glas',
  'IR-kompatibel',
  'Reflexion',
  'Keramik',
  'High Contrast',
  'Microfilm',
  'Pattern Print'
];

export const formats = [
  'Kundenspezifisch',
  'Standard',
  'Large Format',
  'A2',
  'A1',
  'A3',
  'A4',
  'Vega Format',
  'iQ Format',
  'LE7 Format',
  '4K Format',
  '8K Format',
  'Fisheye Format',
  'Macro Format',
  'Multi Format',
  'IT8 Format',
  'Standard Diffusor',
  'CIPA Format',
  '35mm',
  'Microfilm Format'
];