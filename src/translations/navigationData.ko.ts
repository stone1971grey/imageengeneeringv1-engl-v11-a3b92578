export const navigationDataKo = {
  // Industries
  industries: {
    "Automotive": {
      description: "차량 카메라 시스템, 운전 보조 및 자율 주행",
      subgroups: [
        { name: "첨단 운전자 보조 시스템(ADAS)", link: "/automotive" },
        { name: "차량 내부 테스트", link: "/your-solution/automotive/in-cabin-testing", active: true },
        { name: "IEEE-P2020 테스트", link: "#" },
        { name: "하이 다이내믹 레인지(HDR)", link: "#" },
        { name: "근적외선(NIR)", link: "#" },
        { name: "기하학적 캘리브레이션", link: "#" }
      ]
    },
    "Security & Surveillance": {
      description: "CCTV 시스템, 비디오 감시",
      subgroups: [
        { name: "IEC 62676-5 테스트", link: "#" },
        { name: "저조도(ISO 19093)", link: "#" },
        { name: "하이 다이내믹 레인지(HDR)", link: "#" },
        { name: "ISP 튜닝", link: "#" },
        { name: "분광 감도", link: "#" }
      ]
    },
    "Mobile Phone": {
      description: "VCX 표준에 따른 이미지 품질 테스트",
      subgroups: [
        { name: "VCX PhoneCam", link: "#" },
        { name: "색상 보정", link: "#" },
        { name: "카메라 안정화", link: "#" },
        { name: "ISP 튜닝", link: "#" },
        { name: "타이밍 측정", link: "#" }
      ]
    },
    "Web Camera": {
      description: "화상 회의 및 스트리밍 애플리케이션용 웹 카메라",
      subgroups: [
        { name: "VCX WebCam", link: "#" },
        { name: "ISP 튜닝", link: "#" },
        { name: "색상 보정", link: "#" },
        { name: "타이밍 측정", link: "#" }
      ]
    },
    "Machine Vision": {
      description: "검사, 로봇 공학, 품질 관리용 카메라 시스템",
      subgroups: [
        { name: "EMVA 1288 (ISO 24942)", link: "#" },
        { name: "생산 라인 캘리브레이션", link: "#" },
        { name: "렌즈 왜곡", link: "#" },
        { name: "신호 대 잡음비(SNR)", link: "#" }
      ]
    },
    "Medical & Endoscopy": {
      description: "의료 영상 및 진단 시스템의 이미지 품질",
      subgroups: [
        { name: "색상 보정", link: "#" },
        { name: "저조도 테스트", link: "#" },
        { name: "광학 왜곡", link: "#" },
        { name: "ISP 튜닝", link: "#" },
        { name: "내시경 조명", link: "#" }
      ]
    },
    "Scanners & Archiving": {
      description: "문서, 책, 사진 디지털화의 품질 보증",
      subgroups: [
        { name: "ISO 21550", link: "/your-solution/scanners-archiving/iso-21550" },
        { name: "범용 테스트 타겟", link: "#" },
        { name: "다중 스펙트럼 조명", link: "#" },
        { name: "스캐너 다이내믹 레인지", link: "#" },
        { name: "분광 감도", link: "#" }
      ]
    },
    "Photo & Video": {
      description: "전문가 및 아마추어용 디지털 카메라",
      subgroups: [
        { name: "방송 및 HDTV", link: "#" },
        { name: "분광 감도", link: "#" },
        { name: "ISP 튜닝", link: "#" },
        { name: "iQ-LED 조명", link: "#" }
      ]
    }
  },

  // Products
  products: {
    "Test Charts": {
      description: "다목적, 반사, 투과 옵션을 포함한 포괄적인 이미지 품질 분석용 고정밀 테스트 패턴 및 컬러 차트",
      subgroups: [
        { name: "LE7 VIS-IR", link: "/products/test-charts/le7" },
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "다목적", link: "#" },
        { name: "이미지 품질 계수", link: "#" },
        { name: "적외선(VIS-IR)", link: "#" },
        { name: "반사", link: "/charts" },
        { name: "투과", link: "#" },
        { name: "모든 차트 보기", link: "/charts" }
      ]
    },
    "Illumination Devices": {
      description: "안정적인 테스트 환경을 위한 전문 LED 조명 시스템 및 균일 광원",
      subgroups: [
        { name: "iQ-LED", link: "/products/illumination-devices/iq-led" },
        { name: "IEEE-P2020", link: "/products/standards/ieee-p2020" },
        { name: "생산 라인 캘리브레이션", link: "#" },
        { name: "플리커(PWM/MMP)", link: "#" },
        { name: "테스트 차트 조명", link: "#" },
        { name: "모든 광원", link: "#" }
      ]
    },
    "Measurement Devices": {
      description: "정확한 광학 측정을 위한 정밀 색도계, 광도계 및 분광 방사계",
      subgroups: [
        { name: "기하학적 캘리브레이션", link: "#" },
        { name: "타이밍 성능", link: "#" },
        { name: "기후 제어", link: "#" },
        { name: "머신 비전", link: "#" },
        { name: "분광 감도", link: "#" },
        { name: "모든 측정 장치", link: "#" }
      ]
    },
    "Software & APIs": {
      description: "이미지 분석, 캘리브레이션 및 자동화된 품질 관리를 위한 고급 소프트웨어 솔루션",
      subgroups: [
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "제어 API", link: "#" },
        { name: "iQ-Luminance", link: "#" },
        { name: "모든 소프트웨어 및 API", link: "#" }
      ]
    },
    "Product Accessories": {
      description: "마운팅 시스템, 케이블, 커넥터 및 보호 케이스를 포함한 전문 액세서리",
      subgroups: [
        { name: "보관 및 운송", link: "#" },
        { name: "조도계", link: "#" },
        { name: "카메라 정렬", link: "#" },
        { name: "테스트 차트 마운트", link: "#" },
        { name: "VCX 및 웹캠", link: "#" },
        { name: "모든 액세서리", link: "#" }
      ]
    }
  },

  // Solutions
  solutions: {
    "Camera Quality Validation": {
      description: "정밀한 조명 시스템과 테스트 차트가 필요한 카메라 제조업체용",
      subline: "적합 대상: 컨슈머 및 전문가용 카메라"
    },
    "In-Cabin Performance Testing": {
      description: "안정적인 조명 조건이 필요한 운전자 보조 시스템 개발자용",
      subline: "적합 대상: 자동차 연구소, IEEE P2020"
    },
    "Test Environments for Smartphones & Displays": {
      description: "색 재현 및 선명도 테스트 OEM 및 연구용",
      subline: "적합 대상: 모바일 산업, VCX 테스트"
    },
    "Microscopy & Medical Imaging": {
      description: "의료 기술 및 생명 과학용",
      subline: "적합 대상: 의료 기기, 내시경"
    },
    "ISO and IEEE Compliant Test Setups": {
      description: "표준 준수 환경이 필요한 기업용",
      subline: "적합 대상: 표준 준수, 연구소"
    }
  },

  // Solution Packages
  solutionPackages: {
    "Camera Calibration Package": {
      description: "조명 시스템, 차트, 소프트웨어 - 교정 테스트 전용",
      subline: "완전 캘리브레이션 솔루션"
    },
    "Laboratory Complete Solution": {
      description: "하드웨어 + 분석이 포함된 연구 기관용",
      subline: "완전 연구소 설정"
    },
    "Spectral Measurement & Analysis Set": {
      description: "광원 + 평가 + 내보내기 기능",
      subline: "완전 스펙트럼 분석 키트"
    }
  },

  // Target Groups
  targetGroups: {
    "Manufacturers": {
      description: "제품 개발에 이미지 품질 솔루션이 필요한 OEM 및 장치 제조업체",
      subline: "대상: 카메라 제조업체, 자동차 OEM, 가전 제품"
    },
    "Suppliers": {
      description: "고객을 위해 구성 요소 및 시스템을 검증하는 Tier-1 및 Tier-2 공급업체",
      subline: "대상: 자동차 공급업체, 센서 제조업체, 부품 공급업체"
    },
    "Research Institutions": {
      description: "이미지 처리 알고리즘 및 표준 작업을 수행하는 대학 및 연구소",
      subline: "대상: 대학, 연구소, R&D 부서"
    }
  },

  // Test Services
  testServices: {
    "Overview": {
      description: "테스트 연구소 기능 및 방법론에 대한 포괄적인 소개",
      services: [
        { name: "연구소 소개", link: "/inside-lab" },
        { name: "테스트 컨설팅", link: "#" }
      ]
    },
    "Automotive": {
      description: "자동차 카메라 시스템 및 ADAS 애플리케이션용 전문 테스트 서비스",
      services: [
        { name: "camPAS", link: "#" },
        { name: "차량 내부 테스트", link: "/your-solution/automotive/in-cabin-testing", active: true },
        { name: "HDR 테스트", link: "#" },
        { name: "기하학적 캘리브레이션", link: "#" },
        { name: "기준선 평가", link: "#" }
      ]
    },
    "VCX": {
      description: "모바일 장치 및 웹캠 애플리케이션용 VCX 테스트 프로토콜",
      services: [
        { name: "VCX - PhoneCam", link: "#" },
        { name: "VCX - WebCam", link: "#" },
        { name: "색상 특성화", link: "#" },
        { name: "기준선 평가", link: "#" }
      ]
    },
    "Image Quality": {
      description: "포괄적인 이미지 품질 분석 및 측정 서비스",
      services: [
        { name: "해상도 및 텍스처 손실", link: "#" },
        { name: "다이내믹 레인지(OECF)", link: "#" },
        { name: "렌즈 왜곡", link: "#" },
        { name: "이미지 음영 및 플레어", link: "#" },
        { name: "색 정확도", link: "#" }
      ]
    },
    "Standardized": {
      description: "국제 표준 및 프로토콜에 따른 테스트 서비스",
      services: [
        { name: "IEEE-P2020 (ADAS)", link: "/products/standards/ieee-p2020" },
        { name: "VCX (모바일/웹캠)", link: "#" },
        { name: "IEC 62676-5 (보안)", link: "#" },
        { name: "EMVA 1288 (머신 비전)", link: "#" },
        { name: "ISO 12233 (SFR)", link: "#" }
      ]
    },
    "Specialized/Custom": {
      description: "맞춤형 테스트 솔루션 및 전문 측정 서비스",
      services: [
        { name: "기준선 평가", link: "#" },
        { name: "개념 증명", link: "#" },
        { name: "휘도 캘리브레이션", link: "#" },
        { name: "샘플 간 편차", link: "#" },
        { name: "개발 검증 테스트", link: "#" },
        { name: "온도 제어", link: "#" },
        { name: "수중 테스트", link: "#" }
      ]
    }
  }
};
