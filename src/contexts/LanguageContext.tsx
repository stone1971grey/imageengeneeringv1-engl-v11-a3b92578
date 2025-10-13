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
      yourSolution: 'Your Solution',
      industries: 'Industries',
      products: 'Products',
      solutions: 'Solutions',
      testServices: 'Test Services',
      about: 'About',
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
      accessories: 'Product Accessories'
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
      yourSolution: 'Ihre Lösung',
      industries: 'Branchen',
      products: 'Produkte',
      solutions: 'Lösungen',
      testServices: 'Testservices',
      about: 'Über uns',
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
      accessories: 'Produktzubehör'
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
      yourSolution: '您的解决方案',
      industries: '行业',
      products: '产品',
      solutions: '解决方案',
      testServices: '测试服务',
      about: '关于我们',
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
      accessories: '产品配件'
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
    }
  },
  ja: {
    nav: {
      yourSolution: 'あなたのソリューション',
      industries: '業界',
      products: '製品',
      solutions: 'ソリューション',
      testServices: 'テストサービス',
      about: '会社概要',
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
      accessories: '製品アクセサリー'
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
      yourSolution: '귀하의 솔루션',
      industries: '산업',
      products: '제품',
      solutions: '솔루션',
      testServices: '테스트 서비스',
      about: '회사 소개',
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
      accessories: '제품 액세서리'
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
