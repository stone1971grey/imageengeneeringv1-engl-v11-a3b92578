export const navigationDataEn = {
  // Industries
  industries: {
    "Automotive": {
      description: "Camera systems in vehicles, driver assistance and autonomous driving",
      subgroups: [
        { name: "Advanced Driver Assistance Systems (ADAS)", link: "/your-solution/automotive/adas" },
        { name: "In-Cabin Testing", link: "/your-solution/automotive/in-cabin-testing", active: true },
        { name: "IEEE-P2020 Testing", link: "/products/standards/ieee-p2020" },
        { name: "High Dynamic Range (HDR)", link: "/your-solution/automotive/hdr-automotive" },
        { name: "Near-Infrared (NIR)", link: "/your-solution/automotive/nir-automotive" },
        { name: "Geometric Calibration", link: "/your-solution/automotive/geometric-calibration-automotive" }
      ]
    },
    "Security & Surveillance": {
      description: "CCTV systems, video surveillance",
      subgroups: [
        { name: "IEC 62676-5 Testing", link: "#" },
        { name: "Low-light (ISO 19093)", link: "#" },
        { name: "High Dynamic Range (HDR)", link: "#" },
        { name: "ISP Tuning", link: "#" },
        { name: "Spectral Sensitivities", link: "#" }
      ]
    },
    "Mobile Phone": {
      description: "Image quality testing according to VCX standards",
      subgroups: [
        { name: "VCX PhoneCam", link: "#" },
        { name: "Color Calibration", link: "/your-solution/mobile-phone/color-calibration" },
        { name: "Camera Stabilization", link: "#" },
        { name: "ISP Tuning", link: "#" },
        { name: "Timing Measurements", link: "#" }
      ]
    },
    "Web Camera": {
      description: "Web cameras for video conferencing and streaming applications",
      subgroups: [
        { name: "VCX WebCam", link: "#" },
        { name: "ISP Tuning", link: "#" },
        { name: "Color Calibration", link: "#" },
        { name: "Timing Measurements", link: "#" }
      ]
    },
    "Machine Vision": {
      description: "Camera systems for inspection, robotics, quality control",
      subgroups: [
        { name: "EMVA 1288 (ISO 24942)", link: "#" },
        { name: "Production Line Calibration", link: "#" },
        { name: "Lens Distortion", link: "#" },
        { name: "Signal-to-Noise Ratio (SNR)", link: "#" }
      ]
    },
    "Medical & Endoscopy": {
      description: "Image quality in medical imaging and diagnostic systems",
      subgroups: [
        { name: "Color Calibration", link: "#" },
        { name: "Low-Light Testing", link: "#" },
        { name: "Optical Distortion", link: "#" },
        { name: "ISP Tuning", link: "#" },
        { name: "Endoscopic Illumination", link: "#" }
      ]
    },
    "Photo & Video": {
      description: "Digital cameras for professional and amateur applications",
      subgroups: [
        { name: "Broadcast & HDTV", link: "#" },
        { name: "Spectral Sensitivities", link: "#" },
        { name: "ISP Tuning", link: "#" },
        { name: "iQ-LED Illumination", link: "#" }
      ]
    }
  },

  // Products
  products: {
    "Test Charts": {
      description: "High-precision test patterns and color charts for comprehensive image quality analysis including multipurpose, reflective, and transparent options",
      subgroups: [
        { name: "LE7 VIS-IR", link: "/products/test-charts/le7" },
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "Multipurpose", link: "#" },
        { name: "Image Quality Factor", link: "#" },
        { name: "Infrared (VIS-IR)", link: "#" },
        { name: "Reflective", link: "/charts" },
        { name: "Transparent", link: "#" },
        { name: "See All Charts", link: "/charts" }
      ]
    },
    "Illumination Devices": {
      description: "Professional LED lighting systems and uniform light sources for stable testing environments",
      subgroups: [
        { name: "iQ-LED", link: "/products/illumination-devices/iq-led" },
        { name: "IEEE-P2020", link: "/products/standards/ieee-p2020" },
        { name: "Production Line Calibration", link: "#" },
        { name: "Flicker (PWM/MMP)", link: "#" },
        { name: "Test Chart Illumination", link: "#" },
        { name: "All Light Sources", link: "#" }
      ]
    },
    "Measurement Devices": {
      description: "Precision colorimeters, photometers and spectroradiometers for accurate optical measurements",
      subgroups: [
        { name: "Geometric Calibration", link: "#" },
        { name: "Timing Performance", link: "#" },
        { name: "Climate-Controlled", link: "#" },
        { name: "Machine Vision", link: "#" },
        { name: "Spectral Sensitivity", link: "#" },
        { name: "All Measurement Devices", link: "#" }
      ]
    },
    "Software & APIs": {
      description: "Advanced software solutions for image analysis, calibration and automated quality control",
      subgroups: [
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "Control APIs", link: "#" },
        { name: "iQ-Luminance", link: "#" },
        { name: "All Software & APIs", link: "#" }
      ]
    },
    "Product Accessories": {
      description: "Professional accessories including mounting systems, cables, connectors and protective cases",
      subgroups: [
        { name: "Storage & Transport", link: "#" },
        { name: "Luxmeters", link: "#" },
        { name: "Camera Alignment", link: "#" },
        { name: "Test Chart Mounts", link: "#" },
        { name: "VCX & Webcam", link: "#" },
        { name: "All Accessories", link: "#" }
      ]
    }
  },

  // Solutions
  solutions: {
    "Camera Quality Validation": {
      description: "For camera manufacturers who need precise lighting systems and test charts.",
      subline: "Suitable for: Consumer & Professional Cameras"
    },
    "In-Cabin Performance Testing": {
      description: "For developers of driver assistance systems who need stable lighting conditions.",
      subline: "Suitable for: Automotive Labs, IEEE P2020"
    },
    "Test Environments for Smartphones & Displays": {
      description: "For OEMs and research in color reproduction and sharpness testing.",
      subline: "Suitable for: Mobile Industry, VCX Testing"
    },
    "Microscopy & Medical Imaging": {
      description: "For medical technology & life sciences.",
      subline: "Suitable for: Medical Devices, Endoscopy"
    },
    "ISO and IEEE Compliant Test Setups": {
      description: "For companies that need standards-compliant environments.",
      subline: "Suitable for: Standards Compliance, Labs"
    }
  },

  // Solution Packages
  solutionPackages: {
    "Camera Calibration Package": {
      description: "Lighting system, charts, software – specially for calibrated tests",
      subline: "Complete calibration solution"
    },
    "Laboratory Complete Solution": {
      description: "For research institutions with hardware + analysis",
      subline: "Complete research lab setup"
    },
    "Spectral Measurement & Analysis Set": {
      description: "Light source + evaluation + export functions",
      subline: "Complete spectral analysis kit"
    }
  },

  // Target Groups
  targetGroups: {
    "Manufacturers": {
      description: "OEMs and device manufacturers who need image quality solutions for their product development",
      subline: "For: Camera manufacturers, Automotive OEMs, Consumer Electronics"
    },
    "Suppliers": {
      description: "Tier-1 and Tier-2 suppliers who validate components and systems for their customers",
      subline: "For: Automotive Suppliers, Sensor manufacturers, Component suppliers"
    },
    "Research Institutions": {
      description: "Universities and research institutes for scientific investigations and standards development",
      subline: "For: Universities, Institutes, R&D departments"
    }
  },

  // Test Services
  testServices: {
    "Overview": {
      description: "Comprehensive introduction to our testing laboratory capabilities and methodologies",
      services: [
        { name: "Learn about the Lab", link: "/inside-lab" },
        { name: "Testing Consultation", link: "#" }
      ]
    },
    "Automotive": {
      description: "Specialized testing services for automotive camera systems and ADAS applications",
      services: [
        { name: "camPAS", link: "#" },
        { name: "In-Cabin Testing", link: "/your-solution/automotive/in-cabin-testing", active: true },
        { name: "HDR Testing", link: "#" },
        { name: "Geometric Calibration", link: "#" },
        { name: "Baseline Evaluations", link: "#" }
      ]
    },
    "VCX": {
      description: "VCX testing protocols for mobile devices and webcam applications",
      services: [
        { name: "VCX - PhoneCam", link: "#" },
        { name: "VCX - WebCam", link: "#" },
        { name: "Color Characterizations", link: "#" },
        { name: "Baseline Evaluations", link: "#" }
      ]
    },
    "Image Quality": {
      description: "Comprehensive image quality analysis and measurement services",
      services: [
        { name: "Resolution & Texture Loss", link: "#" },
        { name: "Dynamic Range (OECF)", link: "#" },
        { name: "Lens Distortion", link: "#" },
        { name: "Image Shading & Flare", link: "#" },
        { name: "Color Accuracy", link: "#" }
      ]
    },
    "Standardized": {
      description: "Testing services according to international standards and protocols",
      services: [
        { name: "IEEE-P2020 (ADAS)", link: "/products/standards/ieee-p2020" },
        { name: "VCX (Mobile/Webcam)", link: "#" },
        { name: "IEC 62676-5 (Security)", link: "#" },
        { name: "EMVA 1288 (Machine Vision)", link: "#" },
        { name: "ISO 12233 (SFR)", link: "#" }
      ]
    },
    "Specialized/Custom": {
      description: "Custom testing solutions and specialized measurement services",
      services: [
        { name: "Baseline Evaluations", link: "#" },
        { name: "Proof of Concepts", link: "#" },
        { name: "Luminance Calibrations", link: "#" },
        { name: "Sample-to-Sample Deviations", link: "#" },
        { name: "Development Validation Tests", link: "#" },
        { name: "Temperature-Controlled", link: "#" },
        { name: "Underwater Tests", link: "#" }
      ]
    }
  }
};
