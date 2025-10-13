import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'de' | 'zh' | 'ja' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations: Record<Language, any> = {
  en: {
    nav: {
      // Title translations for hover sections
      automotiveTitle: 'Automotive',
      securityTitle: 'Security & Surveillance',
      mobilePhoneTitle: 'Mobile Phone',
      webCameraTitle: 'Web Camera',
      machineVisionTitle: 'Machine Vision',
      medicalTitle: 'Medical & Endoscopy',
      scannersTitle: 'Scanners & Archiving',
      photoVideoTitle: 'Photo & Video',
      testChartsTitle: 'Test Charts',
      illuminationTitle: 'Illumination Devices',
      measurementTitle: 'Measurement Devices',
      softwareTitle: 'Software & APIs',
      accessoriesTitle: 'Product Accessories',
      overviewTitle: 'Overview',
      vcxTitle: 'VCX',
      imageQualityTitle: 'Image Quality',
      standardizedTitle: 'Standardized',
      specializedTitle: 'Specialized/Custom',
      businessPartnerships: 'Business & Partnerships',
      nynomicGroup: 'Nynomic Group',
      visitUs: 'Visit Us',
      careers: 'Careers',
      resellersSubsidiaries: 'Resellers & Subsidiaries',
      strategicPartnerships: 'Strategic Partnerships',
      groupMemberships: 'Group Memberships',
      iso9001: 'ISO 9001',
      searchPlaceholder: 'Search...',
      
      yourSolution: 'Your Solution',
      industries: 'Industries',
      products: 'Products',
      productGroups: 'Product Groups',
      solutions: 'Solutions',
      testServices: 'Test Services',
      testLab: 'Test Lab',
      trainingEvents: 'Training & Events',
      imageQuality: 'Image Quality',
      company: 'Company',
      about: 'About',
      aboutIE: 'About IE',
      contact: 'Contact',
      automotive: 'Automotive',
      security: 'Security & Surveillance',
      mobilePhone: 'Mobile Phone',
      webCamera: 'Web Camera',
      machineVision: 'Machine Vision',
      medical: 'Medical & Endoscopy',
      scanners: 'Scanners & Archiving',
      photoVideo: 'Photo & Video',
      testCharts: 'Test Charts',
      illumination: 'Illumination Devices',
      measurement: 'Measurement Devices',
      software: 'Software & APIs',
      accessories: 'Product Accessories',
      active: 'ACTIVE',
      subgroups: 'Subgroups',
      hoverProductGroup: 'Hover over a product group to see subgroups',
      adas: 'Advanced Driver Assistance Systems (ADAS)',
      inCabin: 'In-Cabin Testing',
      ieeeP2020: 'IEEE-P2020 Testing',
      hdr: 'High Dynamic Range (HDR)',
      nir: 'Near-Infrared (NIR)',
      geometric: 'Geometric Calibration',
      resources: 'Resources',
      publications: 'Publications',
      webinars: 'Webinars',
      onSiteTraining: 'On-Site Training',
      visitLab: 'Visit our Test Lab',
      visitTestingLab: 'Visit Our Testing Lab',
      eventSchedule: 'Event Schedule',
      viewTraining: 'View Training & Events',
      exploreResources: 'Explore Image Quality Resources',
      news: 'News',
      aboutUs: 'About us',
      team: 'Team',
      overview: 'Overview',
      vcx: 'VCX',
      standardized: 'Standardized',
      specializedCustom: 'Specialized/Custom',
      services: 'Services',
      hoverService: 'Hover over a service category to see available tests',
      imageQualityFactors: 'Image Quality Factors',
      blog: 'Blog',
      internationalStandards: 'International Standards',
      ieTechnology: 'IE Technology',
      conferencePapers: 'Conference Papers',
      whitePapers: 'White Papers & Theses',
      videoArchive: 'Video Archive',
      applications: 'Applications',
      hoverIndustry: 'Hover over an industry to see applications',
      findSolution: 'Find Your Perfect Solution',
      
      // Industry descriptions
      automotiveDesc: 'Camera systems in vehicles, driver assistance and autonomous driving',
      securityDesc: 'CCTV systems, video surveillance',
      mobilePhoneDesc: 'Image quality testing according to VCX standards',
      webCameraDesc: 'Web cameras for video conferencing and streaming applications',
      machineVisionDesc: 'Camera systems for inspection, robotics, quality control',
      medicalDesc: 'Image quality in medical imaging and diagnostic systems',
      scannersDesc: 'Quality assurance in digitization of documents, books, photos',
      photoVideoDesc: 'Digital cameras for professional and amateur applications',
      
      // Product descriptions
      testChartsDesc: 'High-precision test patterns and color charts for comprehensive image quality analysis including multipurpose, reflective, and transparent options',
      illuminationDesc: 'Professional LED lighting systems and uniform light sources for stable testing environments',
      measurementDesc: 'Precision colorimeters, photometers and spectroradiometers for accurate optical measurements',
      softwareDesc: 'Advanced software solutions for image analysis, calibration and automated quality control',
      accessoriesDesc: 'Professional accessories including mounting systems, cables, connectors and protective cases',
      
      // Test Services descriptions
      overviewDesc: 'Comprehensive introduction to our testing laboratory capabilities and methodologies',
      automotiveServicesDesc: 'Specialized testing services for automotive camera systems and ADAS applications',
      vcxDesc: 'VCX testing protocols for mobile devices and webcam applications',
      imageQualityDesc: 'Comprehensive image quality analysis and measurement services',
      standardizedDesc: 'Testing services according to international standards and protocols',
      specializedDesc: 'Custom testing solutions and specialized measurement services',
      
      // Subgroup items - Products
      iqAnalyzerX: 'iQ-Analyzer-X',
      multipurpose: 'Multipurpose',
      imageQualityFactor: 'Image Quality Factor',
      infrared: 'Infrared (VIS-IR)',
      reflective: 'Reflective',
      transparent: 'Transparent',
      seeAllCharts: 'See All Charts',
      iqLed: 'iQ-LED',
      ieeeP2020Testing: 'IEEE-P2020',
      productionLineCalibration: 'Production Line Calibration',
      flicker: 'Flicker (PWM/MMP)',
      testChartIllumination: 'Test Chart Illumination',
      allLightSources: 'All Light Sources',
      geometricCalibration: 'Geometric Calibration',
      timingPerformance: 'Timing Performance',
      climateControlled: 'Climate-Controlled',
      machineVisionTesting: 'Machine Vision',
      spectralSensitivity: 'Spectral Sensitivity',
      allMeasurementDevices: 'All Measurement Devices',
      controlApis: 'Control APIs',
      iqLuminance: 'iQ-Luminance',
      allSoftwareApis: 'All Software & APIs',
      storageTransport: 'Storage & Transport',
      luxmeters: 'Luxmeters',
      cameraAlignment: 'Camera Alignment',
      testChartMounts: 'Test Chart Mounts',
      vcxWebcam: 'VCX & Webcam',
      allAccessories: 'All Accessories',
      
      // Subgroup items - Industries
      iec62676: 'IEC 62676-5 Testing',
      lowLight: 'Low-light (ISO 19093)',
      hdrFull: 'High Dynamic Range (HDR)',
      ispTuning: 'ISP Tuning',
      spectralSensitivities: 'Spectral Sensitivities',
      vcxPhoneCam: 'VCX PhoneCam',
      colorCalibration: 'Color Calibration',
      cameraStabilization: 'Camera Stabilization',
      timingMeasurements: 'Timing Measurements',
      vcxWebCam: 'VCX WebCam',
      emva1288: 'EMVA 1288 (ISO 24942)',
      lensDistortion: 'Lens Distortion',
      signalToNoise: 'Signal-to-Noise Ratio (SNR)',
      lowLightTesting: 'Low-Light Testing',
      opticalDistortion: 'Optical Distortion',
      endoscopicIllumination: 'Endoscopic Illumination',
      iso21550: 'ISO 21550',
      universalTestTarget: 'Universal Test Target',
      multispectralIllumination: 'Multispectral Illumination',
      scannerDynamicRange: 'Scanner Dynamic Range',
      broadcastHdtv: 'Broadcast & HDTV',
      iqLedIllumination: 'iQ-LED Illumination',
      
      // Test Services subgroups
      learnAboutLab: 'Learn about the Lab',
      testingConsultation: 'Testing Consultation',
      camPas: 'camPAS',
      inCabinTesting: 'In-Cabin Testing',
      hdrTesting: 'HDR Testing',
      baselineEvaluations: 'Baseline Evaluations',
      colorCharacterizations: 'Color Characterizations',
      resolutionTextureLoss: 'Resolution & Texture Loss',
      dynamicRange: 'Dynamic Range (OECF)',
      imageShading: 'Image Shading & Flare',
      colorAccuracy: 'Color Accuracy',
      ieeeP2020Adas: 'IEEE-P2020 (ADAS)',
      vcxMobileWebcam: 'VCX (Mobile/Webcam)',
      iec62676Security: 'IEC 62676-5 (Security)',
      emva1288MachineVision: 'EMVA 1288 (Machine Vision)',
      iso12233: 'ISO 12233 (SFR)',
      proofOfConcepts: 'Proof of Concepts',
      luminanceCalibrations: 'Luminance Calibrations',
      sampleToSampleDeviations: 'Sample-to-Sample Deviations',
      developmentValidation: 'Development Validation Tests',
      temperatureControlled: 'Temperature-Controlled',
      underwaterTests: 'Underwater Tests'
    },
    hero: {
      title: 'Test Charts',
      subtitle: 'Made by Image Engineering',
      description: 'We develop and manufacture high-precision test charts for professional image quality testing. Order directly from our shop now.',
      discoverCharts: 'Discover Charts',
      trustedIndustries: 'Trusted Across All Industries',
      variants: 'Test Chart Variants',
      tolerance: 'Measurement Tolerance',
      experience: 'Years of Experience'
    },
    industries: {
      title: 'Trusted Across All Industries',
      subtitle: 'Our advanced image processing solutions drive innovation across various sectors worldwide.',
      photography: {
        name: 'Photography',
        description: 'Digital cameras for professional and amateur applications'
      },
      mobile: {
        name: 'Mobile Phones',
        description: 'Image quality testing according to VCX standards'
      },
      automotive: {
        name: 'Automotive & ADAS',
        description: 'Camera systems in vehicles, driver assistance and autonomous driving'
      },
      broadcast: {
        name: 'Broadcast & HDTV',
        description: 'Video transmission, TV cameras, color-accurate reproduction'
      },
      security: {
        name: 'Security / Surveillance',
        description: 'CCTV systems, video surveillance'
      },
      machineVision: {
        name: 'Machine Vision',
        description: 'Camera systems for inspection, robotics, quality control'
      },
      medical: {
        name: 'Medical / Endoscopy',
        description: 'Image quality in medical imaging and diagnostic systems'
      },
      scanning: {
        name: 'Scanning & Archiving',
        description: 'Quality assurance in digitization of documents, books, photos'
      }
    },
    standards: {
      title: 'Shaping Global Standards',
      subtitle: 'Our engineers actively participate in the development of the most crucial international standards for image quality testing.',
      seeAll: 'See all Standards',
      hide: 'Hide Standards',
      supported: 'Supported Standards',
      supportedDesc: 'Our testing procedures are based on internationally recognized standards',
      activeMember: 'Active Member',
      compliant: 'Compliant'
    },
    footer: {
      vision: 'Ready to Transform Your Vision?',
      visionDesc: 'Let us discuss how our image processing solutions can revolutionize your business. Contact our experts today.',
      questions: 'Have Questions?',
      speakWithUs: 'Speak with Us.',
      expertDesc: 'Our experts are happy to advise you personally on your application or support you in planning your test solution.',
      phoneDE: 'Phone (DE): +49 2273 99 99 1-0',
      phoneUSA: 'Phone (USA): +1 408 386 1496',
      phoneChina: 'Phone (China): +86 158 8961 9096',
      officeHours: 'Office Hours: Mon–Fri, 9–5 PM (CET)',
      contact: 'Get in contact with us',
      copyright: '© Image Engineering GmbH & Co. KG – Member of the Nynomic Group',
      terms: 'Terms & Conditions',
      imprint: 'Imprint',
      privacy: 'Privacy Policy',
      compliance: 'Material Compliance Directive',
      carbon: 'Carbon Neutrality',
      esg: 'ESG - Sustainability',
      disposal: 'Disposal & Recycling'
    }
  },
  de: {
    nav: {
      // Title translations for hover sections
      automotiveTitle: 'Automotive',
      securityTitle: 'Sicherheit & Überwachung',
      mobilePhoneTitle: 'Mobiltelefon',
      webCameraTitle: 'Webkamera',
      machineVisionTitle: 'Machine Vision',
      medicalTitle: 'Medizin & Endoskopie',
      scannersTitle: 'Scanner & Archivierung',
      photoVideoTitle: 'Foto & Video',
      testChartsTitle: 'Testcharts',
      illuminationTitle: 'Beleuchtungsgeräte',
      measurementTitle: 'Messgeräte',
      softwareTitle: 'Software & APIs',
      accessoriesTitle: 'Produktzubehör',
      overviewTitle: 'Übersicht',
      vcxTitle: 'VCX',
      imageQualityTitle: 'Bildqualität',
      standardizedTitle: 'Standardisiert',
      specializedTitle: 'Spezialisiert/Individuell',
      businessPartnerships: 'Geschäft & Partnerschaften',
      nynomicGroup: 'Nynomic Gruppe',
      visitUs: 'Besuchen Sie uns',
      careers: 'Karriere',
      resellersSubsidiaries: 'Wiederverkäufer & Niederlassungen',
      strategicPartnerships: 'Strategische Partnerschaften',
      groupMemberships: 'Gruppenmitgliedschaften',
      iso9001: 'ISO 9001',
      searchPlaceholder: 'Suchen...',
      
      yourSolution: 'Ihre Lösung',
      industries: 'Branchen',
      products: 'Produkte',
      productGroups: 'Produktgruppen',
      solutions: 'Lösungen',
      testServices: 'Testservices',
      testLab: 'Testlabor',
      trainingEvents: 'Schulung & Events',
      imageQuality: 'Bildqualität',
      company: 'Unternehmen',
      about: 'Über uns',
      aboutIE: 'Über IE',
      contact: 'Kontakt',
      automotive: 'Automotive',
      security: 'Sicherheit & Überwachung',
      mobilePhone: 'Mobiltelefon',
      webCamera: 'Webkamera',
      machineVision: 'Machine Vision',
      medical: 'Medizin & Endoskopie',
      scanners: 'Scanner & Archivierung',
      photoVideo: 'Foto & Video',
      testCharts: 'Testcharts',
      illumination: 'Beleuchtungsgeräte',
      measurement: 'Messgeräte',
      software: 'Software & APIs',
      accessories: 'Produktzubehör',
      active: 'AKTIV',
      subgroups: 'Untergruppen',
      hoverProductGroup: 'Fahren Sie mit der Maus über eine Produktgruppe, um Untergruppen zu sehen',
      adas: 'Fahrerassistenzsysteme (ADAS)',
      inCabin: 'Innenraumtests',
      ieeeP2020: 'IEEE-P2020 Tests',
      hdr: 'High Dynamic Range (HDR)',
      nir: 'Nahinfrarot (NIR)',
      geometric: 'Geometrische Kalibrierung',
      resources: 'Ressourcen',
      publications: 'Publikationen',
      webinars: 'Webinare',
      onSiteTraining: 'Schulungen vor Ort',
      visitLab: 'Besuchen Sie unser Testlabor',
      visitTestingLab: 'Besuchen Sie unser Testlabor',
      eventSchedule: 'Veranstaltungskalender',
      viewTraining: 'Schulungen & Events ansehen',
      exploreResources: 'Bildqualitätsressourcen erkunden',
      news: 'Neuigkeiten',
      aboutUs: 'Über uns',
      team: 'Team',
      overview: 'Übersicht',
      vcx: 'VCX',
      standardized: 'Standardisiert',
      specializedCustom: 'Spezialisiert/Angepasst',
      services: 'Services',
      hoverService: 'Fahren Sie über eine Servicekategorie, um verfügbare Tests zu sehen',
      imageQualityFactors: 'Bildqualitätsfaktoren',
      blog: 'Blog',
      internationalStandards: 'Internationale Standards',
      ieTechnology: 'IE-Technologie',
      conferencePapers: 'Konferenzbeiträge',
      whitePapers: 'White Papers & Dissertationen',
      videoArchive: 'Videoarchiv',
      applications: 'Anwendungen',
      hoverIndustry: 'Bewegen Sie die Maus über eine Branche, um Anwendungen zu sehen',
      findSolution: 'Finden Sie Ihre perfekte Lösung',
      
      // Industry descriptions
      automotiveDesc: 'Kamerasysteme in Fahrzeugen, Fahrerassistenz und autonomes Fahren',
      securityDesc: 'CCTV-Systeme, Videoüberwachung',
      mobilePhoneDesc: 'Bildqualitätstests nach VCX-Standards',
      webCameraDesc: 'Webkameras für Videokonferenzen und Streaming-Anwendungen',
      machineVisionDesc: 'Kamerasysteme für Inspektion, Robotik, Qualitätskontrolle',
      medicalDesc: 'Bildqualität in medizinischer Bildgebung und Diagnosesystemen',
      scannersDesc: 'Qualitätssicherung bei der Digitalisierung von Dokumenten, Büchern, Fotos',
      photoVideoDesc: 'Digitalkameras für professionelle und Amateur-Anwendungen',
      
      // Product descriptions
      testChartsDesc: 'Hochpräzise Testmuster und Farbtafeln für umfassende Bildqualitätsanalyse einschließlich Mehrzweck-, Reflexions- und Transparentoptionen',
      illuminationDesc: 'Professionelle LED-Beleuchtungssysteme und gleichmäßige Lichtquellen für stabile Testumgebungen',
      measurementDesc: 'Präzisions-Kolorimeter, Photometer und Spektroradiometer für genaue optische Messungen',
      softwareDesc: 'Fortschrittliche Softwarelösungen für Bildanalyse, Kalibrierung und automatisierte Qualitätskontrolle',
      accessoriesDesc: 'Professionelles Zubehör einschließlich Montagesystemen, Kabeln, Steckverbindern und Schutzhüllen',
      
      // Test Services descriptions
      overviewDesc: 'Umfassende Einführung in unsere Testlaborfähigkeiten und Methoden',
      automotiveServicesDesc: 'Spezialisierte Testdienstleistungen für Automotive-Kamerasysteme und ADAS-Anwendungen',
      vcxDesc: 'VCX-Testprotokolle für mobile Geräte und Webcam-Anwendungen',
      imageQualityDesc: 'Umfassende Bildqualitätsanalyse und Messdienstleistungen',
      standardizedDesc: 'Testdienstleistungen nach internationalen Standards und Protokollen',
      specializedDesc: 'Maßgeschneiderte Testlösungen und spezialisierte Messdienstleistungen',
      
      // Subgroup items - Products
      iqAnalyzerX: 'iQ-Analyzer-X',
      multipurpose: 'Mehrzweck',
      imageQualityFactor: 'Bildqualitätsfaktor',
      infrared: 'Infrarot (VIS-IR)',
      reflective: 'Reflektierend',
      transparent: 'Transparent',
      seeAllCharts: 'Alle Charts anzeigen',
      iqLed: 'iQ-LED',
      ieeeP2020Testing: 'IEEE-P2020',
      productionLineCalibration: 'Produktionslinienkalibrierung',
      flicker: 'Flicker (PWM/MMP)',
      testChartIllumination: 'Testchart-Beleuchtung',
      allLightSources: 'Alle Lichtquellen',
      geometricCalibration: 'Geometrische Kalibrierung',
      timingPerformance: 'Timing-Leistung',
      climateControlled: 'Klimatisiert',
      machineVisionTesting: 'Machine Vision',
      spectralSensitivity: 'Spektrale Empfindlichkeit',
      allMeasurementDevices: 'Alle Messgeräte',
      controlApis: 'Steuerungs-APIs',
      iqLuminance: 'iQ-Luminance',
      allSoftwareApis: 'Alle Software & APIs',
      storageTransport: 'Lagerung & Transport',
      luxmeters: 'Luxmeter',
      cameraAlignment: 'Kamera-Ausrichtung',
      testChartMounts: 'Testchart-Halterungen',
      vcxWebcam: 'VCX & Webcam',
      allAccessories: 'Alles Zubehör',
      
      // Subgroup items - Industries
      iec62676: 'IEC 62676-5 Tests',
      lowLight: 'Schwachlicht (ISO 19093)',
      hdrFull: 'High Dynamic Range (HDR)',
      ispTuning: 'ISP-Tuning',
      spectralSensitivities: 'Spektrale Empfindlichkeiten',
      vcxPhoneCam: 'VCX PhoneCam',
      colorCalibration: 'Farbkalibrierung',
      cameraStabilization: 'Kamerastabilisierung',
      timingMeasurements: 'Timing-Messungen',
      vcxWebCam: 'VCX WebCam',
      emva1288: 'EMVA 1288 (ISO 24942)',
      lensDistortion: 'Objektivverzerrung',
      signalToNoise: 'Signal-Rausch-Verhältnis (SNR)',
      lowLightTesting: 'Schwachlicht-Tests',
      opticalDistortion: 'Optische Verzerrung',
      endoscopicIllumination: 'Endoskopische Beleuchtung',
      iso21550: 'ISO 21550',
      universalTestTarget: 'Universaltestziel',
      multispectralIllumination: 'Multispektrale Beleuchtung',
      scannerDynamicRange: 'Scanner-Dynamikbereich',
      broadcastHdtv: 'Broadcast & HDTV',
      iqLedIllumination: 'iQ-LED Beleuchtung',
      
      // Test Services subgroups
      learnAboutLab: 'Über das Labor erfahren',
      testingConsultation: 'Test-Beratung',
      camPas: 'camPAS',
      inCabinTesting: 'Innenraumtests',
      hdrTesting: 'HDR-Tests',
      baselineEvaluations: 'Baseline-Evaluierungen',
      colorCharacterizations: 'Farbcharakterisierungen',
      resolutionTextureLoss: 'Auflösung & Texturverlust',
      dynamicRange: 'Dynamikbereich (OECF)',
      imageShading: 'Bildschattierung & Streulicht',
      colorAccuracy: 'Farbgenauigkeit',
      ieeeP2020Adas: 'IEEE-P2020 (ADAS)',
      vcxMobileWebcam: 'VCX (Mobil/Webcam)',
      iec62676Security: 'IEC 62676-5 (Sicherheit)',
      emva1288MachineVision: 'EMVA 1288 (Machine Vision)',
      iso12233: 'ISO 12233 (SFR)',
      proofOfConcepts: 'Machbarkeitsnachweise',
      luminanceCalibrations: 'Luminanzkalibrierungen',
      sampleToSampleDeviations: 'Proben-zu-Proben-Abweichungen',
      developmentValidation: 'Entwicklungsvalidierungstests',
      temperatureControlled: 'Temperaturgesteuert',
      underwaterTests: 'Unterwassertests'
    },
    hero: {
      title: 'Testcharts',
      subtitle: 'Made by Image Engineering',
      description: 'Wir entwickeln und fertigen hochpräzise Testcharts für professionelle Bildqualitätsprüfung. Jetzt direkt aus unserem Shop bestellen.',
      discoverCharts: 'Charts entdecken',
      trustedIndustries: 'Vertraut in allen Branchen',
      variants: 'Testchart-Varianten',
      tolerance: 'Messtoleranz',
      experience: 'Jahre Erfahrung'
    },
    industries: {
      title: 'Vertraut in allen Branchen',
      subtitle: 'Unsere fortschrittlichen Bildverarbeitungslösungen treiben Innovation in verschiedenen Sektoren weltweit voran.',
      photography: {
        name: 'Fotografie',
        description: 'Digitalkameras für professionelle und Amateur-Anwendungen'
      },
      mobile: {
        name: 'Mobiltelefone',
        description: 'Bildqualitätstests nach VCX-Standards'
      },
      automotive: {
        name: 'Automotive & ADAS',
        description: 'Kamerasysteme in Fahrzeugen, Fahrerassistenz und autonomes Fahren'
      },
      broadcast: {
        name: 'Broadcast & HDTV',
        description: 'Videoübertragung, TV-Kameras, farbgetreue Wiedergabe'
      },
      security: {
        name: 'Sicherheit / Überwachung',
        description: 'CCTV-Systeme, Videoüberwachung'
      },
      machineVision: {
        name: 'Machine Vision',
        description: 'Kamerasysteme für Inspektion, Robotik, Qualitätskontrolle'
      },
      medical: {
        name: 'Medizin / Endoskopie',
        description: 'Bildqualität in medizinischen Bildgebungs- und Diagnosesystemen'
      },
      scanning: {
        name: 'Scannen & Archivierung',
        description: 'Qualitätssicherung bei der Digitalisierung von Dokumenten, Büchern, Fotos'
      }
    },
    standards: {
      title: 'Globale Standards mitgestalten',
      subtitle: 'Unsere Ingenieure beteiligen sich aktiv an der Entwicklung der wichtigsten internationalen Standards für Bildqualitätsprüfung.',
      seeAll: 'Alle Standards anzeigen',
      hide: 'Standards ausblenden',
      supported: 'Unterstützte Standards',
      supportedDesc: 'Unsere Testverfahren basieren auf international anerkannten Standards',
      activeMember: 'Aktives Mitglied',
      compliant: 'Konform'
    },
    footer: {
      vision: 'Bereit, Ihre Vision zu verwandeln?',
      visionDesc: 'Lassen Sie uns besprechen, wie unsere Bildverarbeitungslösungen Ihr Geschäft revolutionieren können. Kontaktieren Sie noch heute unsere Experten.',
      questions: 'Haben Sie Fragen?',
      speakWithUs: 'Sprechen Sie mit uns.',
      expertDesc: 'Unsere Experten beraten Sie gerne persönlich zu Ihrer Anwendung oder unterstützen Sie bei der Planung Ihrer Testlösung.',
      phoneDE: 'Telefon (DE): +49 2273 99 99 1-0',
      phoneUSA: 'Telefon (USA): +1 408 386 1496',
      phoneChina: 'Telefon (China): +86 158 8961 9096',
      officeHours: 'Bürozeiten: Mo–Fr, 9–17 Uhr (MEZ)',
      contact: 'Kontaktieren Sie uns',
      copyright: '© Image Engineering GmbH & Co. KG – Mitglied der Nynomic-Gruppe',
      terms: 'AGB',
      imprint: 'Impressum',
      privacy: 'Datenschutz',
      compliance: 'Material-Compliance-Richtlinie',
      carbon: 'Klimaneutralität',
      esg: 'ESG - Nachhaltigkeit',
      disposal: 'Entsorgung & Recycling'
    }
  },
  zh: {
    nav: {
      // Title translations for hover sections
      automotiveTitle: '汽车',
      securityTitle: '安防与监控',
      mobilePhoneTitle: '手机',
      webCameraTitle: '网络摄像头',
      machineVisionTitle: '机器视觉',
      medicalTitle: '医疗与内窥镜',
      scannersTitle: '扫描与归档',
      photoVideoTitle: '照片与视频',
      testChartsTitle: '测试图表',
      illuminationTitle: '照明设备',
      measurementTitle: '测量设备',
      softwareTitle: '软件与API',
      accessoriesTitle: '产品配件',
      overviewTitle: '概述',
      vcxTitle: 'VCX',
      imageQualityTitle: '图像质量',
      standardizedTitle: '标准化',
      specializedTitle: '专业/定制',
      businessPartnerships: '业务与合作伙伴',
      nynomicGroup: 'Nynomic集团',
      visitUs: '访问我们',
      careers: '职业',
      resellersSubsidiaries: '经销商与子公司',
      strategicPartnerships: '战略合作伙伴',
      groupMemberships: '集团会员',
      iso9001: 'ISO 9001',
      searchPlaceholder: '搜索...',
      
      yourSolution: '您的解决方案',
      industries: '行业',
      products: '产品',
      productGroups: '产品组',
      solutions: '解决方案',
      testServices: '测试服务',
      testLab: '测试实验室',
      trainingEvents: '培训与活动',
      imageQuality: '图像质量',
      company: '公司',
      about: '关于我们',
      aboutIE: '关于IE',
      contact: '联系我们',
      automotive: '汽车',
      security: '安防与监控',
      mobilePhone: '手机',
      webCamera: '网络摄像头',
      machineVision: '机器视觉',
      medical: '医疗与内窥镜',
      scanners: '扫描与归档',
      photoVideo: '照片与视频',
      testCharts: '测试图表',
      illumination: '照明设备',
      measurement: '测量设备',
      software: '软件与API',
      accessories: '产品配件',
      active: '活跃',
      subgroups: '子组',
      hoverProductGroup: '将鼠标悬停在产品组上以查看子组',
      adas: '高级驾驶辅助系统（ADAS）',
      inCabin: '车内测试',
      ieeeP2020: 'IEEE-P2020测试',
      hdr: '高动态范围（HDR）',
      nir: '近红外（NIR）',
      geometric: '几何校准',
      resources: '资源',
      publications: '出版物',
      webinars: '网络研讨会',
      onSiteTraining: '现场培训',
      visitLab: '参观我们的测试实验室',
      visitTestingLab: '参观我们的测试实验室',
      eventSchedule: '活动日程',
      viewTraining: '查看培训与活动',
      exploreResources: '探索图像质量资源',
      news: '新闻',
      aboutUs: '关于我们',
      team: '团队',
      overview: '概述',
      vcx: 'VCX',
      standardized: '标准化',
      specializedCustom: '专业化/定制',
      services: '服务',
      hoverService: '将鼠标悬停在服务类别上以查看可用测试',
      imageQualityFactors: '图像质量因素',
      blog: '博客',
      internationalStandards: '国际标准',
      ieTechnology: 'IE技术',
      conferencePapers: '会议论文',
      whitePapers: '白皮书与论文',
      videoArchive: '视频档案',
      applications: '应用',
      hoverIndustry: '将鼠标悬停在行业上以查看应用',
      findSolution: '找到您的完美解决方案',
      
      // Industry descriptions
      automotiveDesc: '车辆中的相机系统、驾驶辅助和自动驾驶',
      securityDesc: '闭路电视系统、视频监控',
      mobilePhoneDesc: '根据VCX标准进行图像质量测试',
      webCameraDesc: '用于视频会议和流媒体应用的网络摄像头',
      machineVisionDesc: '用于检查、机器人和质量控制的相机系统',
      medicalDesc: '医学成像和诊断系统中的图像质量',
      scannersDesc: '文档、书籍、照片数字化的质量保证',
      photoVideoDesc: '专业和业余应用的数码相机',
      
      // Product descriptions
      testChartsDesc: '高精度测试图案和色卡，用于综合图像质量分析，包括多用途、反射和透明选项',
      illuminationDesc: '专业LED照明系统和均匀光源，用于稳定的测试环境',
      measurementDesc: '精密色度计、光度计和光谱辐射计，用于准确的光学测量',
      softwareDesc: '用于图像分析、校准和自动化质量控制的高级软件解决方案',
      accessoriesDesc: '专业配件，包括安装系统、电缆、连接器和保护壳',
      
      // Test Services descriptions
      overviewDesc: '全面介绍我们的测试实验室能力和方法',
      automotiveServicesDesc: '汽车相机系统和ADAS应用的专业测试服务',
      vcxDesc: '移动设备和网络摄像头应用的VCX测试协议',
      imageQualityDesc: '综合图像质量分析和测量服务',
      standardizedDesc: '根据国际标准和协议的测试服务',
      specializedDesc: '定制测试解决方案和专业测量服务',
      
      // Subgroup items - Products
      iqAnalyzerX: 'iQ-Analyzer-X',
      multipurpose: '多用途',
      imageQualityFactor: '图像质量因子',
      infrared: '红外 (VIS-IR)',
      reflective: '反射',
      transparent: '透明',
      seeAllCharts: '查看所有图表',
      iqLed: 'iQ-LED',
      ieeeP2020Testing: 'IEEE-P2020',
      productionLineCalibration: '生产线校准',
      flicker: '闪烁 (PWM/MMP)',
      testChartIllumination: '测试图表照明',
      allLightSources: '所有光源',
      geometricCalibration: '几何校准',
      timingPerformance: '时序性能',
      climateControlled: '气候控制',
      machineVisionTesting: '机器视觉',
      spectralSensitivity: '光谱灵敏度',
      allMeasurementDevices: '所有测量设备',
      controlApis: '控制APIs',
      iqLuminance: 'iQ-Luminance',
      allSoftwareApis: '所有软件与APIs',
      storageTransport: '存储与运输',
      luxmeters: '照度计',
      cameraAlignment: '相机对准',
      testChartMounts: '测试图表支架',
      vcxWebcam: 'VCX与网络摄像头',
      allAccessories: '所有配件',
      
      // Subgroup items - Industries
      iec62676: 'IEC 62676-5测试',
      lowLight: '低光 (ISO 19093)',
      hdrFull: '高动态范围 (HDR)',
      ispTuning: 'ISP调优',
      spectralSensitivities: '光谱灵敏度',
      vcxPhoneCam: 'VCX PhoneCam',
      colorCalibration: '颜色校准',
      cameraStabilization: '相机稳定',
      timingMeasurements: '时序测量',
      vcxWebCam: 'VCX WebCam',
      emva1288: 'EMVA 1288 (ISO 24942)',
      lensDistortion: '镜头畸变',
      signalToNoise: '信噪比 (SNR)',
      lowLightTesting: '低光测试',
      opticalDistortion: '光学畸变',
      endoscopicIllumination: '内窥镜照明',
      iso21550: 'ISO 21550',
      universalTestTarget: '通用测试目标',
      multispectralIllumination: '多光谱照明',
      scannerDynamicRange: '扫描仪动态范围',
      broadcastHdtv: '广播与高清电视',
      iqLedIllumination: 'iQ-LED照明',
      
      // Test Services subgroups
      learnAboutLab: '了解实验室',
      testingConsultation: '测试咨询',
      camPas: 'camPAS',
      inCabinTesting: '车内测试',
      hdrTesting: 'HDR测试',
      baselineEvaluations: '基线评估',
      colorCharacterizations: '颜色特性',
      resolutionTextureLoss: '分辨率与纹理损失',
      dynamicRange: '动态范围 (OECF)',
      imageShading: '图像阴影与眩光',
      colorAccuracy: '颜色精度',
      ieeeP2020Adas: 'IEEE-P2020 (ADAS)',
      vcxMobileWebcam: 'VCX (移动/网络摄像头)',
      iec62676Security: 'IEC 62676-5 (安防)',
      emva1288MachineVision: 'EMVA 1288 (机器视觉)',
      iso12233: 'ISO 12233 (SFR)',
      proofOfConcepts: '概念验证',
      luminanceCalibrations: '亮度校准',
      sampleToSampleDeviations: '样品间偏差',
      developmentValidation: '开发验证测试',
      temperatureControlled: '温度控制',
      underwaterTests: '水下测试'
    },
    hero: {
      title: '测试图表',
      subtitle: '由Image Engineering制造',
      description: '我们开发和制造用于专业图像质量测试的高精度测试图表。现在可直接从我们的商店订购。',
      discoverCharts: '探索图表',
      trustedIndustries: '受信赖于所有行业',
      variants: '测试图表变体',
      tolerance: '测量公差',
      experience: '年经验'
    },
    industries: {
      title: '受信赖于所有行业',
      subtitle: '我们先进的图像处理解决方案推动全球各个领域的创新。',
      photography: {
        name: '摄影',
        description: '专业和业余应用的数码相机'
      },
      mobile: {
        name: '手机',
        description: '根据VCX标准进行图像质量测试'
      },
      automotive: {
        name: '汽车与ADAS',
        description: '车辆中的相机系统、驾驶辅助和自动驾驶'
      },
      broadcast: {
        name: '广播与高清电视',
        description: '视频传输、电视摄像机、色彩准确再现'
      },
      security: {
        name: '安防/监控',
        description: 'CCTV系统、视频监控'
      },
      machineVision: {
        name: '机器视觉',
        description: '用于检测、机器人、质量控制的相机系统'
      },
      medical: {
        name: '医疗/内窥镜',
        description: '医学成像和诊断系统中的图像质量'
      },
      scanning: {
        name: '扫描与归档',
        description: '文档、书籍、照片数字化的质量保证'
      }
    },
    standards: {
      title: '塑造全球标准',
      subtitle: '我们的工程师积极参与开发图像质量测试最关键的国际标准。',
      seeAll: '查看所有标准',
      hide: '隐藏标准',
      supported: '支持的标准',
      supportedDesc: '我们的测试程序基于国际公认的标准',
      activeMember: '活跃成员',
      compliant: '符合'
    },
    footer: {
      vision: '准备好改变您的愿景了吗？',
      visionDesc: '让我们讨论我们的图像处理解决方案如何革新您的业务。立即联系我们的专家。',
      questions: '有问题吗？',
      speakWithUs: '与我们交谈。',
      expertDesc: '我们的专家很乐意就您的应用为您提供个性化建议，或支持您规划测试解决方案。',
      phoneDE: '电话（德国）：+49 2273 99 99 1-0',
      phoneUSA: '电话（美国）：+1 408 386 1496',
      phoneChina: '电话（中国）：+86 158 8961 9096',
      officeHours: '办公时间：周一至周五，9-5点（欧洲中部时间）',
      contact: '与我们联系',
      copyright: '© Image Engineering GmbH & Co. KG – Nynomic集团成员',
      terms: '条款与条件',
      imprint: '版权声明',
      privacy: '隐私政策',
      compliance: '材料合规指令',
      carbon: '碳中和',
      esg: 'ESG - 可持续发展',
      disposal: '处置与回收'
    },
    automotive: {
      hero: {
        title: '汽车',
        subtitle: '图像质量',
        description: '为强大的车辆安全、性能和自主性而设计的精密工程相机系统测试解决方案。',
        button: '探索汽车解决方案',
        stat1: '精度',
        stat2: '响应',
        stat3: 'ADAS项目',
        liveProcessing: '实时处理',
        adasComponent: 'ADAS组件'
      },
      applications: {
        title: '主要应用',
        subtitle: '汽车相机系统涵盖广泛的应用，有助于车辆安全、舒适和性能。',
        inCabin: {
          title: '车内性能测试',
          description: '驾驶员和乘员监控系统(DMS/OMS)使用各种近红外(NIR)传感器结合主动照明(如LED)来增强驾驶员和乘客的安全和舒适。'
        },
        adas: {
          title: 'ADAS性能测试',
          description: '高级驾驶辅助系统(ADAS)包括支持自动驾驶车辆移动并提供驾驶员警告通知的各种相机和传感器系统。'
        },
        geometric: {
          title: '几何相机校准',
          description: 'ADAS应用的基本测量，需要检测并准确映射移动场景中的3D物体，并基于这些计算进行调整。'
        },
        climate: {
          title: '气候控制测试',
          description: '将各种天气场景纳入汽车相机测试对于了解这些系统是否仍能在最恶劣的天气条件下满足性能阈值至关重要。'
        },
        learnMore: '了解更多'
      },
      standards: {
        title: '汽车国际标准',
        subtitle: '汽车图像质量性能测试和评估的关键行业标准概览。',
        ieee: {
          title: 'IEEE-P2020',
          description: '首个国际公认的标准，检查影响高级驾驶辅助系统(ADAS)图像质量的因素，并概述各种测试方法和工具。'
        },
        emva: {
          title: 'EMVA 1288/ISO 24942',
          description: 'EMVA 1288/ISO 24942（相同的标准指标）概述了机器视觉相机的阈值规格和测量方法，其中许多常用于汽车车辆。'
        },
        iso: {
          title: 'ISO 19093',
          description: 'ISO 19093概述了评估相机系统在各种低光条件下性能的测量方法和指标阈值。'
        },
        learnMore: '了解更多'
      },
      solutions: {
        title: '汽车相机测试解决方案',
        subtitle: '我们为所有最关键的汽车相机应用和性能指标提供广泛的测试解决方案。',
        inCabin: {
          title: '车内测试',
          description1: '车内系统主要负责观察驾驶员和乘客的舒适和安全。这些系统通常使用NIR（近红外）传感器结合主动照明（例如LED或VCSEL）来确保在极低光条件下的准确性。',
          description2: '我们提供具有红外功能的广泛测试解决方案，包括使用iQ-LED技术的LE7 VIS-IR均匀光箱，允许您在380-1050nm之间生成自定义光谱。LE7可与透明测试图表（如camSPECS plate IR）一起使用，该图表针对NIR范围内的色彩校准和光谱灵敏度测量进行了优化。'
        },
        adas: {
          title: 'ADAS性能测试',
          description1: '高级驾驶辅助系统(ADAS)是指协助驾驶员进行各种移动调整和安全警告的相机和传感器系统。这些系统需要广泛的测试方法和指标来评估，以确保高性能和安全。我们的测试解决方案密切遵循IEEE-P2020标准中为ADAS图像质量性能建立的测试方法指南。',
          description2: 'P2020标准中概述的一些关键性能指标(KPI)包括对比度指标——对比度传输精度(CTA)和对比度信噪比(CSNR)——动态范围和闪烁响应。这些KPI需要能够模拟ADAS系统经历的高强度的强大光源。我们提供多种光源，包括Vega和Arcturus，可以生成具有极高稳定性和一致性的动态测试场景。'
        },
        geometric: {
          title: '几何校准',
          description1: '几何校准是指相机检测并准确映射移动场景中3D物体的能力。在汽车应用中，基于测量的相机或立体相机对的几何特性计算到物体的距离。汽车相机系统的正确几何校准对于确保高性能和安全至关重要。',
          description2: '传统的几何校准方法通常需要大量的实验室空间，结合众多的失真测试目标和中继透镜。虽然这些方法是有效的，但对于大多数没有空间的测试实验室来说并不实用。为了应对这一挑战，我们提供GEOCAL解决方案。GEOCAL是一种紧凑的设备，使用光束扩展激光和衍射光学元件(DOE)生成来自无穷远的光点网格。这些功能消除了对多个测试目标和中继透镜的需求，使其适合任何规模的实验室使用。'
        },
        climate: {
          title: '气候控制测试',
          description1: 'ADAS应用的基本要求之一是它们在任何天气场景中正常运行的能力。如果这些系统由于浓雾或倾盆大雨等条件而无法达到其最低性能阈值要求，安全性可能会受到损害。因此，在变化的天气环境中测试ADAS应用至关重要。',
          description2: '为了进行天气测试，许多公司在各种天气条件下驾驶测试车辆并记录相机性能。然而，虽然在现实世界意义上是准确的，但由于天气和测试地点的不可预测性，这些测试通常缺乏可重复性和极端条件（例如极冷或极热）。为了应对这些挑战，我们提供iQ-Climate Chamber解决方案，使您能够在测试实验室的舒适环境中测试极端天气条件下的相机系统。'
        }
      },
      products: {
        title: '关键产品',
        subtitle: '汽车图像质量性能测试的行业领先工具',
        arcturus: {
          title: 'Arcturus',
          description: '具有无与伦比的稳定性和一致性的高强度光源。'
        },
        le7: {
          title: 'LE7 VIS-IR',
          description: '用于测试近红外(NIR)范围内相机的均匀光源。'
        },
        geocal: {
          title: 'GEOCAL',
          description: '使用紧凑设备进行几何校准，该设备生成来自无穷远的光点网格。'
        },
        climate: {
          title: 'iQ-Climate Chamber',
          description: '在相机测试实验室的舒适环境中进行温度控制的相机测试。'
        },
        te292: {
          title: 'TE292 VIS-IR',
          description: '用于VIS-IR范围内光谱灵敏度测量和色彩校准的测试图表。'
        },
        iqAnalyzer: {
          title: 'iQ-Analyzer-X',
          description: '用于评估各种图像质量因素性能的高级软件。'
        },
        active: '活跃',
        clickable: '可点击',
        learnMore: '了解更多'
      },
      testLab: {
        title: '汽车相机测试服务',
        description1: '欢迎来到我们的iQ-Lab，世界上最大的独立相机测试实验室之一。我们为汽车行业提供广泛的测试，包括camPAS（汽车系统相机性能）测试。',
        description2: 'camPAS测试是为需要来自中立第三方的独立和客观测试结果以支持其开发决策的客户开发的。与我们的大多数测试服务一样，camPAS可以定制以满足您的特定KPI要求。请随时联系我们的iQ-Lab团队讨论您的要求和我们所有的测试服务。'
      }
    }
  },
  ja: {
    nav: {
      // Title translations for hover sections
      automotiveTitle: '自動車',
      securityTitle: 'セキュリティ＆監視',
      mobilePhoneTitle: 'スマートフォン',
      webCameraTitle: 'ウェブカメラ',
      machineVisionTitle: 'マシンビジョン',
      medicalTitle: '医療＆内視鏡',
      scannersTitle: 'スキャナー＆アーカイブ',
      photoVideoTitle: '写真＆ビデオ',
      testChartsTitle: 'テストチャート',
      illuminationTitle: '照明機器',
      measurementTitle: '測定機器',
      softwareTitle: 'ソフトウェア＆API',
      accessoriesTitle: '製品アクセサリー',
      overviewTitle: '概要',
      vcxTitle: 'VCX',
      imageQualityTitle: '画質',
      standardizedTitle: '標準化',
      specializedTitle: '専門/カスタム',
      businessPartnerships: 'ビジネス＆パートナーシップ',
      nynomicGroup: 'Nynomicグループ',
      visitUs: '訪問',
      careers: '採用情報',
      resellersSubsidiaries: '販売代理店＆子会社',
      strategicPartnerships: '戦略的パートナーシップ',
      groupMemberships: 'グループメンバーシップ',
      iso9001: 'ISO 9001',
      searchPlaceholder: '検索...',
      
      yourSolution: 'あなたのソリューション',
      industries: '業界',
      products: '製品',
      productGroups: '製品グループ',
      solutions: 'ソリューション',
      testServices: 'テストサービス',
      testLab: 'テストラボ',
      trainingEvents: 'トレーニングとイベント',
      imageQuality: '画質',
      company: '会社',
      about: '会社概要',
      aboutIE: 'IEについて',
      contact: 'お問い合わせ',
      automotive: '自動車',
      security: 'セキュリティと監視',
      mobilePhone: '携帯電話',
      webCamera: 'ウェブカメラ',
      machineVision: 'マシンビジョン',
      medical: '医療と内視鏡',
      scanners: 'スキャナーとアーカイブ',
      photoVideo: '写真とビデオ',
      testCharts: 'テストチャート',
      illumination: '照明機器',
      measurement: '測定機器',
      software: 'ソフトウェアとAPI',
      accessories: '製品アクセサリー',
      active: 'アクティブ',
      subgroups: 'サブグループ',
      hoverProductGroup: '製品グループにマウスを合わせるとサブグループが表示されます',
      adas: '先進運転支援システム（ADAS）',
      inCabin: '車内テスト',
      ieeeP2020: 'IEEE-P2020テスト',
      hdr: 'ハイダイナミックレンジ（HDR）',
      nir: '近赤外（NIR）',
      geometric: '幾何学的キャリブレーション',
      resources: 'リソース',
      publications: '出版物',
      webinars: 'ウェビナー',
      onSiteTraining: '現地トレーニング',
      visitLab: 'テストラボを訪問',
      visitTestingLab: 'テストラボを訪問',
      eventSchedule: 'イベントスケジュール',
      viewTraining: 'トレーニングとイベントを見る',
      exploreResources: '画質リソースを探索',
      news: 'ニュース',
      aboutUs: '会社概要',
      team: 'チーム',
      overview: '概要',
      vcx: 'VCX',
      standardized: '標準化',
      specializedCustom: '専門/カスタム',
      services: 'サービス',
      hoverService: 'サービスカテゴリにマウスを合わせて利用可能なテストを表示',
      imageQualityFactors: '画質要因',
      blog: 'ブログ',
      internationalStandards: '国際標準',
      ieTechnology: 'IE技術',
      conferencePapers: '会議論文',
      whitePapers: 'ホワイトペーパーと論文',
      videoArchive: 'ビデオアーカイブ',
      applications: 'アプリケーション',
      hoverIndustry: '業界にカーソルを合わせると、アプリケーションが表示されます',
      findSolution: '最適なソリューションを見つける',
      
      // Industry descriptions
      automotiveDesc: '車両のカメラシステム、運転支援、自動運転',
      securityDesc: 'CCTVシステム、ビデオ監視',
      mobilePhoneDesc: 'VCX規格に準拠した画質テスト',
      webCameraDesc: 'ビデオ会議とストリーミングアプリケーション用のウェブカメラ',
      machineVisionDesc: '検査、ロボット、品質管理のためのカメラシステム',
      medicalDesc: '医療画像と診断システムにおける画質',
      scannersDesc: '文書、書籍、写真のデジタル化における品質保証',
      photoVideoDesc: 'プロフェッショナルおよびアマチュア用途のデジタルカメラ',
      
      // Product descriptions
      testChartsDesc: '多目的、反射、透明オプションを含む包括的な画質分析のための高精度テストパターンとカラーチャート',
      illuminationDesc: '安定したテスト環境のためのプロフェッショナルLED照明システムと均一光源',
      measurementDesc: '正確な光学測定のための精密色度計、測光計、分光放射計',
      softwareDesc: '画像分析、校正、自動品質管理のための高度なソフトウェアソリューション',
      accessoriesDesc: 'マウントシステム、ケーブル、コネクタ、保護ケースを含むプロフェッショナルアクセサリー',
      
      // Test Services descriptions
      overviewDesc: '当社のテストラボの能力と方法論の包括的な紹介',
      automotiveServicesDesc: '自動車カメラシステムとADASアプリケーションの専門テストサービス',
      vcxDesc: 'モバイルデバイスとウェブカメラアプリケーションのVCXテストプロトコル',
      imageQualityDesc: '包括的な画質分析と測定サービス',
      standardizedDesc: '国際規格とプロトコルに準拠したテストサービス',
      specializedDesc: 'カスタムテストソリューションと専門測定サービス',
      
      // Subgroup items - Products
      iqAnalyzerX: 'iQ-Analyzer-X',
      multipurpose: '多目的',
      imageQualityFactor: '画質ファクター',
      infrared: '赤外線 (VIS-IR)',
      reflective: '反射型',
      transparent: '透明',
      seeAllCharts: 'すべてのチャートを見る',
      iqLed: 'iQ-LED',
      ieeeP2020Testing: 'IEEE-P2020',
      productionLineCalibration: '生産ライン校正',
      flicker: 'フリッカー (PWM/MMP)',
      testChartIllumination: 'テストチャート照明',
      allLightSources: 'すべての光源',
      geometricCalibration: '幾何学的校正',
      timingPerformance: 'タイミング性能',
      climateControlled: '気候制御',
      machineVisionTesting: 'マシンビジョン',
      spectralSensitivity: '分光感度',
      allMeasurementDevices: 'すべての測定機器',
      controlApis: 'コントロールAPIs',
      iqLuminance: 'iQ-Luminance',
      allSoftwareApis: 'すべてのソフトウェアとAPIs',
      storageTransport: '保管と輸送',
      luxmeters: '照度計',
      cameraAlignment: 'カメラアライメント',
      testChartMounts: 'テストチャートマウント',
      vcxWebcam: 'VCXとウェブカメラ',
      allAccessories: 'すべてのアクセサリー',
      
      // Subgroup items - Industries
      iec62676: 'IEC 62676-5テスト',
      lowLight: '低照度 (ISO 19093)',
      hdrFull: 'ハイダイナミックレンジ (HDR)',
      ispTuning: 'ISPチューニング',
      spectralSensitivities: '分光感度',
      vcxPhoneCam: 'VCX PhoneCam',
      colorCalibration: 'カラー校正',
      cameraStabilization: 'カメラ手ぶれ補正',
      timingMeasurements: 'タイミング測定',
      vcxWebCam: 'VCX WebCam',
      emva1288: 'EMVA 1288 (ISO 24942)',
      lensDistortion: 'レンズ歪み',
      signalToNoise: '信号対雑音比 (SNR)',
      lowLightTesting: '低照度テスト',
      opticalDistortion: '光学歪み',
      endoscopicIllumination: '内視鏡照明',
      iso21550: 'ISO 21550',
      universalTestTarget: 'ユニバーサルテストターゲット',
      multispectralIllumination: 'マルチスペクトル照明',
      scannerDynamicRange: 'スキャナーダイナミックレンジ',
      broadcastHdtv: '放送とHDTV',
      iqLedIllumination: 'iQ-LED照明',
      
      // Test Services subgroups
      learnAboutLab: 'ラボについて学ぶ',
      testingConsultation: 'テストコンサルテーション',
      camPas: 'camPAS',
      inCabinTesting: '車内テスト',
      hdrTesting: 'HDRテスト',
      baselineEvaluations: 'ベースライン評価',
      colorCharacterizations: 'カラー特性評価',
      resolutionTextureLoss: '解像度とテクスチャ損失',
      dynamicRange: 'ダイナミックレンジ (OECF)',
      imageShading: '画像シェーディングとフレア',
      colorAccuracy: 'カラー精度',
      ieeeP2020Adas: 'IEEE-P2020 (ADAS)',
      vcxMobileWebcam: 'VCX (モバイル/ウェブカメラ)',
      iec62676Security: 'IEC 62676-5 (セキュリティ)',
      emva1288MachineVision: 'EMVA 1288 (マシンビジョン)',
      iso12233: 'ISO 12233 (SFR)',
      proofOfConcepts: '概念実証',
      luminanceCalibrations: '輝度校正',
      sampleToSampleDeviations: 'サンプル間偏差',
      developmentValidation: '開発検証テスト',
      temperatureControlled: '温度制御',
      underwaterTests: '水中テスト'
    },
    hero: {
      title: 'テストチャート',
      subtitle: 'Image Engineering製',
      description: 'プロフェッショナルな画像品質テストのための高精度テストチャートを開発・製造しています。今すぐ当社のショップから直接ご注文ください。',
      discoverCharts: 'チャートを見る',
      trustedIndustries: 'すべての業界で信頼されています',
      variants: 'テストチャートバリエーション',
      tolerance: '測定公差',
      experience: '年の経験'
    },
    industries: {
      title: 'すべての業界で信頼されています',
      subtitle: '当社の高度な画像処理ソリューションは、世界中のさまざまな分野でイノベーションを推進しています。',
      photography: {
        name: '写真',
        description: 'プロフェッショナルおよびアマチュア用途のデジタルカメラ'
      },
      mobile: {
        name: '携帯電話',
        description: 'VCX標準による画質テスト'
      },
      automotive: {
        name: '自動車とADAS',
        description: '車両のカメラシステム、運転支援、自動運転'
      },
      broadcast: {
        name: '放送とHDTV',
        description: 'ビデオ伝送、テレビカメラ、色再現'
      },
      security: {
        name: 'セキュリティ/監視',
        description: 'CCTVシステム、ビデオ監視'
      },
      machineVision: {
        name: 'マシンビジョン',
        description: '検査、ロボット、品質管理用のカメラシステム'
      },
      medical: {
        name: '医療/内視鏡',
        description: '医療画像および診断システムの画質'
      },
      scanning: {
        name: 'スキャンとアーカイブ',
        description: '文書、書籍、写真のデジタル化における品質保証'
      }
    },
    standards: {
      title: 'グローバル標準の形成',
      subtitle: '当社のエンジニアは、画質テストに関する最も重要な国際標準の開発に積極的に参加しています。',
      seeAll: 'すべての標準を見る',
      hide: '標準を非表示',
      supported: 'サポートされている標準',
      supportedDesc: '当社のテスト手順は国際的に認められた標準に基づいています',
      activeMember: 'アクティブメンバー',
      compliant: '準拠'
    },
    footer: {
      vision: 'ビジョンを変革する準備はできていますか？',
      visionDesc: '当社の画像処理ソリューションがビジネスをどのように革新できるか話し合いましょう。今すぐ専門家にお問い合わせください。',
      questions: 'ご質問がありますか？',
      speakWithUs: 'お話ししましょう。',
      expertDesc: '当社の専門家が、お客様のアプリケーションについて個別にアドバイスしたり、テストソリューションの計画をサポートします。',
      phoneDE: '電話（ドイツ）：+49 2273 99 99 1-0',
      phoneUSA: '電話（米国）：+1 408 386 1496',
      phoneChina: '電話（中国）：+86 158 8961 9096',
      officeHours: '営業時間：月～金、9～17時（中央ヨーロッパ時間）',
      contact: 'お問い合わせ',
      copyright: '© Image Engineering GmbH & Co. KG – Nynomicグループのメンバー',
      terms: '利用規約',
      imprint: 'インプリント',
      privacy: 'プライバシーポリシー',
      compliance: '材料コンプライアンス指令',
      carbon: 'カーボンニュートラル',
      esg: 'ESG - 持続可能性',
      disposal: '廃棄とリサイクル'
    }
  },
  ko: {
    nav: {
      // Title translations for hover sections
      automotiveTitle: '자동차',
      securityTitle: '보안 및 감시',
      mobilePhoneTitle: '모바일 폰',
      webCameraTitle: '웹 카메라',
      machineVisionTitle: '머신 비전',
      medicalTitle: '의료 및 내시경',
      scannersTitle: '스캐너 및 아카이빙',
      photoVideoTitle: '사진 및 비디오',
      testChartsTitle: '테스트 차트',
      illuminationTitle: '조명 장치',
      measurementTitle: '측정 장치',
      softwareTitle: '소프트웨어 및 API',
      accessoriesTitle: '제품 액세서리',
      overviewTitle: '개요',
      vcxTitle: 'VCX',
      imageQualityTitle: '이미지 품질',
      standardizedTitle: '표준화',
      specializedTitle: '전문/맞춤',
      businessPartnerships: '비즈니스 및 파트너십',
      nynomicGroup: 'Nynomic 그룹',
      visitUs: '방문하기',
      careers: '채용',
      resellersSubsidiaries: '리셀러 및 자회사',
      strategicPartnerships: '전략적 파트너십',
      groupMemberships: '그룹 회원',
      iso9001: 'ISO 9001',
      searchPlaceholder: '검색...',
      
      yourSolution: '귀하의 솔루션',
      industries: '산업',
      products: '제품',
      productGroups: '제품 그룹',
      solutions: '솔루션',
      testServices: '테스트 서비스',
      testLab: '테스트 연구소',
      trainingEvents: '교육 및 이벤트',
      imageQuality: '이미지 품질',
      company: '회사',
      about: '회사 소개',
      aboutIE: 'IE 소개',
      contact: '연락처',
      automotive: '자동차',
      security: '보안 및 감시',
      mobilePhone: '휴대폰',
      webCamera: '웹 카메라',
      machineVision: '머신 비전',
      medical: '의료 및 내시경',
      scanners: '스캐너 및 아카이빙',
      photoVideo: '사진 및 비디오',
      testCharts: '테스트 차트',
      illumination: '조명 장치',
      measurement: '측정 장치',
      software: '소프트웨어 및 API',
      accessories: '제품 액세서리',
      active: '활성',
      subgroups: '하위 그룹',
      hoverProductGroup: '제품 그룹 위에 마우스를 올려 하위 그룹을 확인하세요',
      adas: '첨단 운전자 보조 시스템 (ADAS)',
      inCabin: '차내 테스트',
      ieeeP2020: 'IEEE-P2020 테스트',
      hdr: '고동적 범위 (HDR)',
      nir: '근적외선 (NIR)',
      geometric: '기하학적 보정',
      resources: '리소스',
      publications: '출판물',
      webinars: '웨비나',
      onSiteTraining: '현장 교육',
      visitLab: '테스트 연구소 방문',
      visitTestingLab: '테스트 연구소 방문',
      eventSchedule: '이벤트 일정',
      viewTraining: '교육 및 이벤트 보기',
      exploreResources: '이미지 품질 리소스 탐색',
      news: '뉴스',
      aboutUs: '회사 소개',
      team: '팀',
      overview: '개요',
      vcx: 'VCX',
      standardized: '표준화',
      specializedCustom: '전문/맞춤',
      services: '서비스',
      hoverService: '사용 가능한 테스트를 보려면 서비스 카테고리 위로 마우스를 가져가세요',
      imageQualityFactors: '이미지 품질 요소',
      blog: '블로그',
      internationalStandards: '국제 표준',
      ieTechnology: 'IE 기술',
      conferencePapers: '회의 논문',
      whitePapers: '백서 및 논문',
      videoArchive: '비디오 아카이브',
      applications: '애플리케이션',
      hoverIndustry: '산업 위에 마우스를 올려 애플리케이션을 확인하세요',
      findSolution: '완벽한 솔루션 찾기',
      
      // Industry descriptions
      automotiveDesc: '차량의 카메라 시스템, 운전자 보조 및 자율 주행',
      securityDesc: 'CCTV 시스템, 비디오 감시',
      mobilePhoneDesc: 'VCX 표준에 따른 이미지 품질 테스트',
      webCameraDesc: '화상 회의 및 스트리밍 애플리케이션용 웹 카메라',
      machineVisionDesc: '검사, 로봇 공학, 품질 관리를 위한 카메라 시스템',
      medicalDesc: '의료 영상 및 진단 시스템의 이미지 품질',
      scannersDesc: '문서, 도서, 사진 디지털화의 품질 보증',
      photoVideoDesc: '전문가 및 아마추어 애플리케이션용 디지털 카메라',
      
      // Product descriptions
      testChartsDesc: '다목적, 반사 및 투명 옵션을 포함한 포괄적인 이미지 품질 분석을 위한 고정밀 테스트 패턴 및 컬러 차트',
      illuminationDesc: '안정적인 테스트 환경을 위한 전문 LED 조명 시스템 및 균일한 광원',
      measurementDesc: '정확한 광학 측정을 위한 정밀 색도계, 광도계 및 분광 방사계',
      softwareDesc: '이미지 분석, 보정 및 자동화된 품질 관리를 위한 고급 소프트웨어 솔루션',
      accessoriesDesc: '마운팅 시스템, 케이블, 커넥터 및 보호 케이스를 포함한 전문 액세서리',
      
      // Test Services descriptions
      overviewDesc: '당사의 테스트 실험실 역량 및 방법론에 대한 포괄적인 소개',
      automotiveServicesDesc: '자동차 카메라 시스템 및 ADAS 애플리케이션을 위한 전문 테스트 서비스',
      vcxDesc: '모바일 장치 및 웹캠 애플리케이션을 위한 VCX 테스트 프로토콜',
      imageQualityDesc: '포괄적인 이미지 품질 분석 및 측정 서비스',
      standardizedDesc: '국제 표준 및 프로토콜에 따른 테스트 서비스',
      specializedDesc: '맞춤형 테스트 솔루션 및 전문 측정 서비스',
      
      // Subgroup items - Products
      iqAnalyzerX: 'iQ-Analyzer-X',
      multipurpose: '다목적',
      imageQualityFactor: '이미지 품질 요소',
      infrared: '적외선 (VIS-IR)',
      reflective: '반사',
      transparent: '투명',
      seeAllCharts: '모든 차트 보기',
      iqLed: 'iQ-LED',
      ieeeP2020Testing: 'IEEE-P2020',
      productionLineCalibration: '생산 라인 보정',
      flicker: '플리커 (PWM/MMP)',
      testChartIllumination: '테스트 차트 조명',
      allLightSources: '모든 광원',
      geometricCalibration: '기하학적 보정',
      timingPerformance: '타이밍 성능',
      climateControlled: '기후 제어',
      machineVisionTesting: '머신 비전',
      spectralSensitivity: '분광 감도',
      allMeasurementDevices: '모든 측정 장치',
      controlApis: '제어 APIs',
      iqLuminance: 'iQ-Luminance',
      allSoftwareApis: '모든 소프트웨어 및 APIs',
      storageTransport: '보관 및 운송',
      luxmeters: '조도계',
      cameraAlignment: '카메라 정렬',
      testChartMounts: '테스트 차트 마운트',
      vcxWebcam: 'VCX 및 웹캠',
      allAccessories: '모든 액세서리',
      
      // Subgroup items - Industries
      iec62676: 'IEC 62676-5 테스트',
      lowLight: '저조도 (ISO 19093)',
      hdrFull: '고동적 범위 (HDR)',
      ispTuning: 'ISP 튜닝',
      spectralSensitivities: '분광 감도',
      vcxPhoneCam: 'VCX PhoneCam',
      colorCalibration: '색상 보정',
      cameraStabilization: '카메라 안정화',
      timingMeasurements: '타이밍 측정',
      vcxWebCam: 'VCX WebCam',
      emva1288: 'EMVA 1288 (ISO 24942)',
      lensDistortion: '렌즈 왜곡',
      signalToNoise: '신호 대 잡음비 (SNR)',
      lowLightTesting: '저조도 테스트',
      opticalDistortion: '광학 왜곡',
      endoscopicIllumination: '내시경 조명',
      iso21550: 'ISO 21550',
      universalTestTarget: '범용 테스트 타겟',
      multispectralIllumination: '다중 스펙트럼 조명',
      scannerDynamicRange: '스캐너 다이나믹 레인지',
      broadcastHdtv: '방송 및 HDTV',
      iqLedIllumination: 'iQ-LED 조명',
      
      // Test Services subgroups
      learnAboutLab: '랩에 대해 알아보기',
      testingConsultation: '테스트 상담',
      camPas: 'camPAS',
      inCabinTesting: '차내 테스트',
      hdrTesting: 'HDR 테스트',
      baselineEvaluations: '베이스라인 평가',
      colorCharacterizations: '색상 특성화',
      resolutionTextureLoss: '해상도 및 텍스처 손실',
      dynamicRange: '다이나믹 레인지 (OECF)',
      imageShading: '이미지 쉐이딩 및 플레어',
      colorAccuracy: '색상 정확도',
      ieeeP2020Adas: 'IEEE-P2020 (ADAS)',
      vcxMobileWebcam: 'VCX (모바일/웹캠)',
      iec62676Security: 'IEC 62676-5 (보안)',
      emva1288MachineVision: 'EMVA 1288 (머신 비전)',
      iso12233: 'ISO 12233 (SFR)',
      proofOfConcepts: '개념 증명',
      luminanceCalibrations: '휘도 보정',
      sampleToSampleDeviations: '샘플 간 편차',
      developmentValidation: '개발 검증 테스트',
      temperatureControlled: '온도 제어',
      underwaterTests: '수중 테스트'
    },
    hero: {
      title: '테스트 차트',
      subtitle: 'Image Engineering 제작',
      description: '전문적인 이미지 품질 테스트를 위한 고정밀 테스트 차트를 개발하고 제조합니다. 지금 당사 매장에서 직접 주문하세요.',
      discoverCharts: '차트 살펴보기',
      trustedIndustries: '모든 산업에서 신뢰받는',
      variants: '테스트 차트 변형',
      tolerance: '측정 공차',
      experience: '년 경험'
    },
    industries: {
      title: '모든 산업에서 신뢰받는',
      subtitle: '당사의 첨단 이미지 처리 솔루션은 전 세계 다양한 분야에서 혁신을 주도합니다.',
      photography: {
        name: '사진',
        description: '전문가 및 아마추어 응용 프로그램용 디지털 카메라'
      },
      mobile: {
        name: '휴대폰',
        description: 'VCX 표준에 따른 이미지 품질 테스트'
      },
      automotive: {
        name: '자동차 및 ADAS',
        description: '차량 카메라 시스템, 운전 보조 및 자율 주행'
      },
      broadcast: {
        name: '방송 및 HDTV',
        description: '비디오 전송, TV 카메라, 색상 정확도 재현'
      },
      security: {
        name: '보안 / 감시',
        description: 'CCTV 시스템, 비디오 감시'
      },
      machineVision: {
        name: '머신 비전',
        description: '검사, 로봇 공학, 품질 관리용 카메라 시스템'
      },
      medical: {
        name: '의료 / 내시경',
        description: '의료 영상 및 진단 시스템의 이미지 품질'
      },
      scanning: {
        name: '스캔 및 아카이빙',
        description: '문서, 책, 사진의 디지털화에서 품질 보증'
      }
    },
    standards: {
      title: '글로벌 표준 형성',
      subtitle: '당사의 엔지니어들은 이미지 품질 테스트를 위한 가장 중요한 국제 표준 개발에 적극적으로 참여하고 있습니다.',
      seeAll: '모든 표준 보기',
      hide: '표준 숨기기',
      supported: '지원되는 표준',
      supportedDesc: '당사의 테스트 절차는 국제적으로 인정된 표준을 기반으로 합니다',
      activeMember: '활동 회원',
      compliant: '준수'
    },
    footer: {
      vision: '비전을 변화시킬 준비가 되셨나요?',
      visionDesc: '당사의 이미지 처리 솔루션이 귀하의 비즈니스를 어떻게 혁신할 수 있는지 논의해 보겠습니다. 오늘 전문가에게 문의하세요.',
      questions: '질문이 있으신가요?',
      speakWithUs: '문의하세요.',
      expertDesc: '당사의 전문가들이 귀하의 애플리케이션에 대해 개인적으로 조언하거나 테스트 솔루션 계획을 지원합니다.',
      phoneDE: '전화 (독일): +49 2273 99 99 1-0',
      phoneUSA: '전화 (미국): +1 408 386 1496',
      phoneChina: '전화 (중국): +86 158 8961 9096',
      officeHours: '영업 시간: 월-금, 9-5시 (중부 유럽 시간)',
      contact: '문의하기',
      copyright: '© Image Engineering GmbH & Co. KG – Nynomic 그룹 회원',
      terms: '이용 약관',
      imprint: '임프린트',
      privacy: '개인 정보 보호 정책',
      compliance: '재료 준수 지침',
      carbon: '탄소 중립',
      esg: 'ESG - 지속 가능성',
      disposal: '폐기 및 재활용'
    }
  }
};
