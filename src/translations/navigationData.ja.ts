export const navigationDataJa = {
  // Industries
  industries: {
    "Automotive": {
      description: "車両カメラシステム、運転支援、自動運転",
      subgroups: [
        { name: "先進運転支援システム(ADAS)", link: "/automotive" },
        { name: "キャビン内テスト", link: "/your-solution/automotive/in-cabin-testing", active: true },
        { name: "IEEE-P2020テスト", link: "#" },
        { name: "ハイダイナミックレンジ(HDR)", link: "#" },
        { name: "近赤外線(NIR)", link: "#" },
        { name: "幾何学的キャリブレーション", link: "#" }
      ]
    },
    "Security & Surveillance": {
      description: "CCTVシステム、ビデオ監視",
      subgroups: [
        { name: "IEC 62676-5テスト", link: "#" },
        { name: "低照度(ISO 19093)", link: "#" },
        { name: "ハイダイナミックレンジ(HDR)", link: "#" },
        { name: "ISPチューニング", link: "#" },
        { name: "分光感度", link: "#" }
      ]
    },
    "Mobile Phone": {
      description: "VCX標準に基づく画質テスト",
      subgroups: [
        { name: "VCX PhoneCam", link: "#" },
        { name: "色較正", link: "#" },
        { name: "カメラ手ブレ補正", link: "#" },
        { name: "ISPチューニング", link: "#" },
        { name: "タイミング測定", link: "#" }
      ]
    },
    "Web Camera": {
      description: "ビデオ会議およびストリーミングアプリケーション用Webカメラ",
      subgroups: [
        { name: "VCX WebCam", link: "#" },
        { name: "ISPチューニング", link: "#" },
        { name: "色較正", link: "#" },
        { name: "タイミング測定", link: "#" }
      ]
    },
    "Machine Vision": {
      description: "検査、ロボティクス、品質管理用カメラシステム",
      subgroups: [
        { name: "EMVA 1288 (ISO 24942)", link: "#" },
        { name: "生産ラインキャリブレーション", link: "#" },
        { name: "レンズ歪み", link: "#" },
        { name: "信号対雑音比(SNR)", link: "#" }
      ]
    },
    "Medical & Endoscopy": {
      description: "医用画像および診断システムの画質",
      subgroups: [
        { name: "色較正", link: "#" },
        { name: "低照度テスト", link: "#" },
        { name: "光学歪み", link: "#" },
        { name: "ISPチューニング", link: "#" },
        { name: "内視鏡照明", link: "#" }
      ]
    },
    "Scanners & Archiving": {
      description: "文書、書籍、写真のデジタル化における品質保証",
      subgroups: [
        { name: "ISO 21550", link: "/your-solution/scanners-archiving/iso-21550" },
        { name: "ユニバーサルテストターゲット", link: "/your-solution/scanners-archiving/universal-test-target", active: true },
        { name: "マルチスペクトル照明", link: "/your-solution/scanners-archiving/multispectral-illumination", active: true },
        { name: "スキャナーダイナミックレンジ", link: "#" },
        { name: "分光感度", link: "#" }
      ]
    },
    "Photo & Video": {
      description: "プロおよびアマチュア向けデジタルカメラ",
      subgroups: [
        { name: "放送・HDTV", link: "#" },
        { name: "分光感度", link: "#" },
        { name: "ISPチューニング", link: "#" },
        { name: "iQ-LED照明", link: "#" }
      ]
    }
  },

  // Products
  products: {
    "Test Charts": {
      description: "多目的、反射、透過オプションを含む包括的な画質分析用の高精度テストパターンとカラーチャート",
      subgroups: [
        { name: "LE7 VIS-IR", link: "/products/test-charts/le7" },
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "多目的", link: "#" },
        { name: "画質係数", link: "#" },
        { name: "赤外線(VIS-IR)", link: "#" },
        { name: "反射", link: "/charts" },
        { name: "透過", link: "#" },
        { name: "全チャートを見る", link: "/charts" }
      ]
    },
    "Illumination Devices": {
      description: "安定したテスト環境のためのプロフェッショナルLED照明システムと均一光源",
      subgroups: [
        { name: "iQ-LED", link: "/products/illumination-devices/iq-led" },
        { name: "IEEE-P2020", link: "/products/standards/ieee-p2020" },
        { name: "生産ラインキャリブレーション", link: "#" },
        { name: "フリッカ(PWM/MMP)", link: "#" },
        { name: "テストチャート照明", link: "#" },
        { name: "全光源", link: "#" }
      ]
    },
    "Measurement Devices": {
      description: "正確な光学測定のための精密色彩計、測光計、分光放射計",
      subgroups: [
        { name: "幾何学的キャリブレーション", link: "#" },
        { name: "タイミング性能", link: "#" },
        { name: "気候制御", link: "#" },
        { name: "マシンビジョン", link: "#" },
        { name: "分光感度", link: "#" },
        { name: "全測定機器", link: "#" }
      ]
    },
    "Software & APIs": {
      description: "画像解析、キャリブレーション、自動品質管理用の高度なソフトウェアソリューション",
      subgroups: [
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "制御API", link: "#" },
        { name: "iQ-Luminance", link: "#" },
        { name: "全ソフトウェア・API", link: "#" }
      ]
    },
    "Product Accessories": {
      description: "マウントシステム、ケーブル、コネクタ、保護ケースを含むプロフェッショナルアクセサリー",
      subgroups: [
        { name: "保管・輸送", link: "#" },
        { name: "照度計", link: "#" },
        { name: "カメラアライメント", link: "#" },
        { name: "テストチャートマウント", link: "#" },
        { name: "VCX・Webcam", link: "#" },
        { name: "全アクセサリー", link: "#" }
      ]
    }
  },

  // Solutions
  solutions: {
    "Camera Quality Validation": {
      description: "精密な照明システムとテストチャートが必要なカメラメーカー向け",
      subline: "対象：コンシューマ・プロフェッショナルカメラ"
    },
    "In-Cabin Performance Testing": {
      description: "安定した照明条件が必要な運転支援システム開発者向け",
      subline: "対象：自動車ラボ、IEEE P2020"
    },
    "Test Environments for Smartphones & Displays": {
      description: "色再現性とシャープネステストのOEMと研究向け",
      subline: "対象：モバイル業界、VCXテスト"
    },
    "Microscopy & Medical Imaging": {
      description: "医療技術・ライフサイエンス向け",
      subline: "対象：医療機器、内視鏡"
    },
    "ISO and IEEE Compliant Test Setups": {
      description: "標準準拠環境が必要な企業向け",
      subline: "対象：標準準拠、ラボ"
    }
  },

  // Solution Packages
  solutionPackages: {
    "Camera Calibration Package": {
      description: "照明システム、チャート、ソフトウェア - キャリブレーションテスト専用",
      subline: "完全キャリブレーションソリューション"
    },
    "Laboratory Complete Solution": {
      description: "ハードウェア+解析付き研究機関向け",
      subline: "完全研究ラボセットアップ"
    },
    "Spectral Measurement & Analysis Set": {
      description: "光源+評価+エクスポート機能",
      subline: "完全分光分析キット"
    }
  },

  // Target Groups
  targetGroups: {
    "Manufacturers": {
      description: "製品開発に画質ソリューションが必要なOEMおよび機器メーカー",
      subline: "対象：カメラメーカー、自動車OEM、家電"
    },
    "Suppliers": {
      description: "顧客向けにコンポーネントとシステムを検証するTier-1およびTier-2サプライヤー",
      subline: "対象：自動車サプライヤー、センサーメーカー、部品サプライヤー"
    },
    "Research Institutions": {
      description: "画像処理アルゴリズムと標準に取り組む大学と研究機関",
      subline: "対象：大学、研究所、R&D部門"
    }
  },

  // Test Services
  testServices: {
    "Overview": {
      description: "テストラボの能力と方法論の包括的な紹介",
      services: [
        { name: "ラボについて", link: "/inside-lab" },
        { name: "テストコンサルティング", link: "#" }
      ]
    },
    "Automotive": {
      description: "自動車カメラシステムとADASアプリケーション用の専門テストサービス",
      services: [
        { name: "camPAS", link: "#" },
        { name: "キャビン内テスト", link: "/your-solution/automotive/in-cabin-testing", active: true },
        { name: "HDRテスト", link: "#" },
        { name: "幾何学的キャリブレーション", link: "#" },
        { name: "ベースライン評価", link: "#" }
      ]
    },
    "VCX": {
      description: "モバイルデバイスとWebcamアプリケーション用のVCXテストプロトコル",
      services: [
        { name: "VCX - PhoneCam", link: "#" },
        { name: "VCX - WebCam", link: "#" },
        { name: "色特性評価", link: "#" },
        { name: "ベースライン評価", link: "#" }
      ]
    },
    "Image Quality": {
      description: "包括的な画質分析と測定サービス",
      services: [
        { name: "解像度・テクスチャロス", link: "#" },
        { name: "ダイナミックレンジ(OECF)", link: "#" },
        { name: "レンズ歪み", link: "#" },
        { name: "画像シェーディング・フレア", link: "#" },
        { name: "色精度", link: "#" }
      ]
    },
    "Standardized": {
      description: "国際標準とプロトコルに基づくテストサービス",
      services: [
        { name: "IEEE-P2020 (ADAS)", link: "/products/standards/ieee-p2020" },
        { name: "VCX (モバイル/Webcam)", link: "#" },
        { name: "IEC 62676-5 (セキュリティ)", link: "#" },
        { name: "EMVA 1288 (マシンビジョン)", link: "#" },
        { name: "ISO 12233 (SFR)", link: "#" }
      ]
    },
    "Specialized/Custom": {
      description: "カスタムテストソリューションと専門測定サービス",
      services: [
        { name: "ベースライン評価", link: "#" },
        { name: "概念実証", link: "#" },
        { name: "輝度キャリブレーション", link: "#" },
        { name: "サンプル間偏差", link: "#" },
        { name: "開発検証テスト", link: "#" },
        { name: "温度制御", link: "#" },
        { name: "水中テスト", link: "#" }
      ]
    }
  }
};
