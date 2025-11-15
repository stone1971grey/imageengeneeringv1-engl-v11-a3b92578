export const navigationDataDe = {
  // Industries
  industries: {
    "Automotive": {
      description: "Kamerasysteme in Fahrzeugen, Fahrerassistenz und autonomes Fahren",
      subgroups: [
        { name: "Fahrerassistenzsysteme (ADAS)", link: "/automotive" },
        { name: "Innenraumtests", link: "/your-solution/automotive/in-cabin-testing", active: true },
        { name: "IEEE-P2020-Tests", link: "#" },
        { name: "High Dynamic Range (HDR)", link: "#" },
        { name: "Nahinfrarot (NIR)", link: "#" },
        { name: "Geometrische Kalibrierung", link: "#" }
      ]
    },
    "Security & Surveillance": {
      description: "CCTV-Systeme, Videoüberwachung",
      subgroups: [
        { name: "IEC 62676-5-Tests", link: "#" },
        { name: "Schwachlicht (ISO 19093)", link: "#" },
        { name: "High Dynamic Range (HDR)", link: "#" },
        { name: "ISP-Tuning", link: "#" },
        { name: "Spektrale Empfindlichkeiten", link: "#" }
      ]
    },
    "Mobile Phone": {
      description: "Bildqualitätsprüfung nach VCX-Standards",
      subgroups: [
        { name: "VCX PhoneCam", link: "#" },
        { name: "Farbkalibrierung", link: "#" },
        { name: "Kamerastabilisierung", link: "#" },
        { name: "ISP-Tuning", link: "#" },
        { name: "Timing-Messungen", link: "#" }
      ]
    },
    "Web Camera": {
      description: "Webkameras für Videokonferenzen und Streaming-Anwendungen",
      subgroups: [
        { name: "VCX WebCam", link: "#" },
        { name: "ISP-Tuning", link: "#" },
        { name: "Farbkalibrierung", link: "#" },
        { name: "Timing-Messungen", link: "#" }
      ]
    },
    "Machine Vision": {
      description: "Kamerasysteme für Inspektion, Robotik, Qualitätskontrolle",
      subgroups: [
        { name: "EMVA 1288 (ISO 24942)", link: "#" },
        { name: "Produktionslinienkalibrierung", link: "#" },
        { name: "Linsenverzerrung", link: "#" },
        { name: "Signal-Rausch-Verhältnis (SNR)", link: "#" }
      ]
    },
    "Medical & Endoscopy": {
      description: "Bildqualität in medizinischer Bildgebung und Diagnosesystemen",
      subgroups: [
        { name: "Farbkalibrierung", link: "#" },
        { name: "Schwachlichttests", link: "#" },
        { name: "Optische Verzerrung", link: "#" },
        { name: "ISP-Tuning", link: "#" },
        { name: "Endoskopische Beleuchtung", link: "#" }
      ]
    },
    "Scanners & Archiving": {
      description: "Qualitätssicherung bei der Digitalisierung von Dokumenten, Büchern, Fotos",
      subgroups: [
        { name: "ISO 21550", link: "/your-solution/scanners-archiving/iso-21550" },
        { name: "Universelles Testziel", link: "/your-solution/scanners-archiving/universal-test-target", active: true },
        { name: "Multispektrale Beleuchtung", link: "#" },
        { name: "Scanner-Dynamikbereich", link: "#" },
        { name: "Spektrale Empfindlichkeiten", link: "#" }
      ]
    },
    "Photo & Video": {
      description: "Digitalkameras für professionelle und Amateur-Anwendungen",
      subgroups: [
        { name: "Rundfunk & HDTV", link: "#" },
        { name: "Spektrale Empfindlichkeiten", link: "#" },
        { name: "ISP-Tuning", link: "#" },
        { name: "iQ-LED-Beleuchtung", link: "#" }
      ]
    }
  },

  // Products
  products: {
    "Test Charts": {
      description: "Hochpräzise Testmuster und Farbtafeln für umfassende Bildqualitätsanalyse, einschließlich Mehrzweck-, reflektierenden und transparenten Optionen",
      subgroups: [
        { name: "LE7 VIS-IR", link: "/products/test-charts/le7" },
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "Mehrzweck", link: "#" },
        { name: "Bildqualitätsfaktor", link: "#" },
        { name: "Infrarot (VIS-IR)", link: "#" },
        { name: "Reflektierend", link: "/charts" },
        { name: "Transparent", link: "#" },
        { name: "Alle Charts anzeigen", link: "/charts" }
      ]
    },
    "Illumination Devices": {
      description: "Professionelle LED-Beleuchtungssysteme und gleichmäßige Lichtquellen für stabile Testumgebungen",
      subgroups: [
        { name: "iQ-LED", link: "/products/illumination-devices/iq-led" },
        { name: "IEEE-P2020", link: "/products/standards/ieee-p2020" },
        { name: "Produktionslinienkalibrierung", link: "#" },
        { name: "Flicker (PWM/MMP)", link: "#" },
        { name: "Testchart-Beleuchtung", link: "#" },
        { name: "Alle Lichtquellen", link: "#" }
      ]
    },
    "Measurement Devices": {
      description: "Präzisions-Kolorimeter, Photometer und Spektroradiometer für genaue optische Messungen",
      subgroups: [
        { name: "Geometrische Kalibrierung", link: "#" },
        { name: "Timing-Leistung", link: "#" },
        { name: "Klimakontrolliert", link: "#" },
        { name: "Maschinelles Sehen", link: "#" },
        { name: "Spektrale Empfindlichkeit", link: "#" },
        { name: "Alle Messgeräte", link: "#" }
      ]
    },
    "Software & APIs": {
      description: "Fortschrittliche Softwarelösungen für Bildanalyse, Kalibrierung und automatisierte Qualitätskontrolle",
      subgroups: [
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "Steuerungs-APIs", link: "#" },
        { name: "iQ-Luminance", link: "#" },
        { name: "Alle Software & APIs", link: "#" }
      ]
    },
    "Product Accessories": {
      description: "Professionelles Zubehör einschließlich Montagesysteme, Kabel, Steckverbinder und Schutzhüllen",
      subgroups: [
        { name: "Lagerung & Transport", link: "#" },
        { name: "Luxmeter", link: "#" },
        { name: "Kameraausrichtung", link: "#" },
        { name: "Testchart-Halterungen", link: "#" },
        { name: "VCX & Webcam", link: "#" },
        { name: "Alles Zubehör", link: "#" }
      ]
    }
  },

  // Solutions
  solutions: {
    "Camera Quality Validation": {
      description: "Für Kamerahersteller, die präzise Beleuchtungssysteme und Testcharts benötigen.",
      subline: "Geeignet für: Consumer- & Professionelle Kameras"
    },
    "In-Cabin Performance Testing": {
      description: "Für Entwickler von Fahrerassistenzsystemen, die stabile Lichtbedingungen benötigen.",
      subline: "Geeignet für: Automotive-Labore, IEEE P2020"
    },
    "Test Environments for Smartphones & Displays": {
      description: "Für OEMs und Forschung in Farbreproduktion und Schärfetests.",
      subline: "Geeignet für: Mobilindustrie, VCX-Tests"
    },
    "Microscopy & Medical Imaging": {
      description: "Für Medizintechnik & Biowissenschaften.",
      subline: "Geeignet für: Medizingeräte, Endoskopie"
    },
    "ISO and IEEE Compliant Test Setups": {
      description: "Für Unternehmen, die standardkonforme Umgebungen benötigen.",
      subline: "Geeignet für: Standardkonformität, Labore"
    }
  },

  // Solution Packages
  solutionPackages: {
    "Camera Calibration Package": {
      description: "Beleuchtungssystem, Charts, Software – speziell für kalibrierte Tests",
      subline: "Komplette Kalibrierungslösung"
    },
    "Laboratory Complete Solution": {
      description: "Für Forschungseinrichtungen mit Hardware + Analyse",
      subline: "Komplettes Forschungslabor-Setup"
    },
    "Spectral Measurement & Analysis Set": {
      description: "Lichtquelle + Auswertung + Exportfunktionen",
      subline: "Komplettes Spektralanalyse-Kit"
    }
  },

  // Target Groups
  targetGroups: {
    "Manufacturers": {
      description: "OEMs und Gerätehersteller, die Bildqualitätslösungen für ihre Produktentwicklung benötigen",
      subline: "Für: Kamerahersteller, Automotive-OEMs, Unterhaltungselektronik"
    },
    "Suppliers": {
      description: "Tier-1- und Tier-2-Zulieferer, die Komponenten und Systeme für ihre Kunden validieren",
      subline: "Für: Automotive-Zulieferer, Sensorhersteller, Komponentenzulieferer"
    },
    "Research Institutions": {
      description: "Universitäten und Forschungslabore, die an Bildverarbeitungsalgorithmen und Standards arbeiten",
      subline: "Für: Universitäten, Forschungslabore, Standardisierungsgremien"
    }
  },

  // Test Services
  testServices: {
    "Overview": {
      description: "Umfassende Einführung in unsere Testlabor-Fähigkeiten und Methoden",
      services: [
        { name: "Über das Labor", link: "/inside-lab" },
        { name: "Testberatung", link: "#" }
      ]
    },
    "Automotive": {
      description: "Spezialisierte Testdienstleistungen für Automotive-Kamerasysteme und ADAS-Anwendungen",
      services: [
        { name: "camPAS", link: "#" },
        { name: "Innenraumtests", link: "/your-solution/automotive/in-cabin-testing", active: true },
        { name: "HDR-Tests", link: "#" },
        { name: "Geometrische Kalibrierung", link: "#" },
        { name: "Basis-Evaluierungen", link: "#" }
      ]
    },
    "VCX": {
      description: "VCX-Testprotokolle für mobile Geräte und Webcam-Anwendungen",
      services: [
        { name: "VCX - PhoneCam", link: "#" },
        { name: "VCX - WebCam", link: "#" },
        { name: "Farbcharakterisierungen", link: "#" },
        { name: "Basis-Evaluierungen", link: "#" }
      ]
    },
    "Image Quality": {
      description: "Umfassende Bildqualitätsanalyse und Messdienstleistungen",
      services: [
        { name: "Auflösung & Texturverlust", link: "#" },
        { name: "Dynamikbereich (OECF)", link: "#" },
        { name: "Linsenverzerrung", link: "#" },
        { name: "Bildschattierung & Streulicht", link: "#" },
        { name: "Farbgenauigkeit", link: "#" }
      ]
    },
    "Standardized": {
      description: "Testdienstleistungen nach internationalen Standards und Protokollen",
      services: [
        { name: "IEEE-P2020 (ADAS)", link: "/products/standards/ieee-p2020" },
        { name: "VCX (Mobile/Webcam)", link: "#" },
        { name: "IEC 62676-5 (Sicherheit)", link: "#" },
        { name: "EMVA 1288 (Maschinelles Sehen)", link: "#" },
        { name: "ISO 12233 (SFR)", link: "#" }
      ]
    },
    "Specialized/Custom": {
      description: "Maßgeschneiderte Testlösungen und spezialisierte Messdienstleistungen",
      services: [
        { name: "Basis-Evaluierungen", link: "#" },
        { name: "Machbarkeitsnachweise", link: "#" },
        { name: "Luminanzkalibrierungen", link: "#" },
        { name: "Probe-zu-Probe-Abweichungen", link: "#" },
        { name: "Entwicklungsvalidierungstests", link: "#" },
        { name: "Temperaturkontrolliert", link: "#" },
        { name: "Unterwassertests", link: "#" }
      ]
    }
  }
};
