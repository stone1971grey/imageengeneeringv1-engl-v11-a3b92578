export const navigationDataZh = {
  // Industries - 行业
  industries: {
    "Automotive": {
      description: "车辆摄像系统、驾驶辅助和自动驾驶",
      subgroups: [
        { name: "高级驾驶辅助系统(ADAS)", link: "/automotive" },
        { name: "车内测试", link: "/your-solution/automotive/in-cabin-testing", active: true },
        { name: "IEEE-P2020测试", link: "#" },
        { name: "高动态范围(HDR)", link: "#" },
        { name: "近红外(NIR)", link: "#" },
        { name: "几何校准", link: "#" }
      ]
    },
    "Security & Surveillance": {
      description: "闭路电视系统、视频监控",
      subgroups: [
        { name: "IEC 62676-5测试", link: "#" },
        { name: "低照度(ISO 19093)", link: "#" },
        { name: "高动态范围(HDR)", link: "#" },
        { name: "ISP调优", link: "#" },
        { name: "光谱灵敏度", link: "#" }
      ]
    },
    "Mobile Phone": {
      description: "根据VCX标准进行图像质量测试",
      subgroups: [
        { name: "VCX手机摄像头", link: "#" },
        { name: "色彩校准", link: "#" },
        { name: "相机防抖", link: "#" },
        { name: "ISP调优", link: "#" },
        { name: "时序测量", link: "#" }
      ]
    },
    "Web Camera": {
      description: "用于视频会议和流媒体应用的网络摄像头",
      subgroups: [
        { name: "VCX网络摄像头", link: "#" },
        { name: "ISP调优", link: "#" },
        { name: "色彩校准", link: "#" },
        { name: "时序测量", link: "#" }
      ]
    },
    "Machine Vision": {
      description: "用于检测、机器人技术、质量控制的摄像系统",
      subgroups: [
        { name: "EMVA 1288 (ISO 24942)", link: "#" },
        { name: "生产线校准", link: "#" },
        { name: "镜头畸变", link: "#" },
        { name: "信噪比(SNR)", link: "#" }
      ]
    },
    "Medical & Endoscopy": {
      description: "医学成像和诊断系统中的图像质量",
      subgroups: [
        { name: "色彩校准", link: "#" },
        { name: "低照度测试", link: "#" },
        { name: "光学畸变", link: "#" },
        { name: "ISP调优", link: "#" },
        { name: "内窥镜照明", link: "#" }
      ]
    },
    "Scanners & Archiving": {
      description: "文档、书籍、照片数字化的质量保证",
      subgroups: [
        { name: "ISO 21550", link: "/your-solution/scanners-archiving/iso-21550" },
        { name: "通用测试目标", link: "/your-solution/scanners-archiving/universal-test-target", active: true },
        { name: "多光谱照明", link: "#" },
        { name: "扫描仪动态范围", link: "#" },
        { name: "光谱灵敏度", link: "#" }
      ]
    },
    "Photo & Video": {
      description: "专业和业余应用的数码相机",
      subgroups: [
        { name: "广播与高清电视", link: "#" },
        { name: "光谱灵敏度", link: "#" },
        { name: "ISP调优", link: "#" },
        { name: "iQ-LED照明", link: "#" }
      ]
    }
  },

  // Products - 产品
  products: {
    "Test Charts": {
      description: "用于全面图像质量分析的高精度测试图案和色卡，包括多用途、反射和透射选项",
      subgroups: [
        { name: "LE7 VIS-IR", link: "/products/test-charts/le7" },
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "多用途", link: "#" },
        { name: "图像质量因子", link: "#" },
        { name: "红外(VIS-IR)", link: "#" },
        { name: "反射式", link: "/charts" },
        { name: "透射式", link: "#" },
        { name: "查看所有图卡", link: "/charts" }
      ]
    },
    "Illumination Devices": {
      description: "专业LED照明系统和均匀光源，用于稳定的测试环境",
      subgroups: [
        { name: "iQ-LED", link: "/products/illumination-devices/iq-led" },
        { name: "IEEE-P2020", link: "/products/standards/ieee-p2020" },
        { name: "生产线校准", link: "#" },
        { name: "闪烁(PWM/MMP)", link: "#" },
        { name: "测试图卡照明", link: "#" },
        { name: "所有光源", link: "#" }
      ]
    },
    "Measurement Devices": {
      description: "精密色度计、光度计和光谱辐射计，用于精确的光学测量",
      subgroups: [
        { name: "几何校准", link: "#" },
        { name: "时序性能", link: "#" },
        { name: "温控", link: "#" },
        { name: "机器视觉", link: "#" },
        { name: "光谱灵敏度", link: "#" },
        { name: "所有测量设备", link: "#" }
      ]
    },
    "Software & APIs": {
      description: "用于图像分析、校准和自动化质量控制的高级软件解决方案",
      subgroups: [
        { name: "iQ-Analyzer-X", link: "#" },
        { name: "控制API", link: "#" },
        { name: "iQ-Luminance", link: "#" },
        { name: "所有软件与API", link: "#" }
      ]
    },
    "Product Accessories": {
      description: "专业配件，包括安装系统、线缆、连接器和保护箱",
      subgroups: [
        { name: "存储与运输", link: "#" },
        { name: "照度计", link: "#" },
        { name: "相机对准", link: "#" },
        { name: "测试图卡支架", link: "#" },
        { name: "VCX与网络摄像头", link: "#" },
        { name: "所有配件", link: "#" }
      ]
    }
  },

  // Solutions - 解决方案
  solutions: {
    "Camera Quality Validation": {
      description: "为需要精确照明系统和测试图卡的相机制造商提供。",
      subline: "适用于：消费级和专业相机"
    },
    "In-Cabin Performance Testing": {
      description: "为需要稳定照明条件的驾驶辅助系统开发者提供。",
      subline: "适用于：汽车实验室、IEEE P2020"
    },
    "Test Environments for Smartphones & Displays": {
      description: "为OEM和色彩再现及清晰度测试研究提供。",
      subline: "适用于：移动行业、VCX测试"
    },
    "Microscopy & Medical Imaging": {
      description: "为医疗技术和生命科学提供。",
      subline: "适用于：医疗设备、内窥镜"
    },
    "ISO and IEEE Compliant Test Setups": {
      description: "为需要符合标准环境的公司提供。",
      subline: "适用于：标准合规、实验室"
    }
  },

  // Solution Packages - 解决方案套餐
  solutionPackages: {
    "Camera Calibration Package": {
      description: "照明系统、图卡、软件 - 专为校准测试设计",
      subline: "完整校准解决方案"
    },
    "Laboratory Complete Solution": {
      description: "为研究机构提供硬件+分析",
      subline: "完整的研究实验室设置"
    },
    "Spectral Measurement & Analysis Set": {
      description: "光源+评估+导出功能",
      subline: "完整光谱分析套件"
    }
  },

  // Target Groups - 目标群体
  targetGroups: {
    "Manufacturers": {
      description: "需要图像质量解决方案进行产品开发的OEM和设备制造商",
      subline: "适用于：相机制造商、汽车OEM、消费电子"
    },
    "Suppliers": {
      description: "为客户验证组件和系统的一级和二级供应商",
      subline: "适用于：汽车供应商、传感器制造商、组件供应商"
    },
    "Research Institutions": {
      description: "用于科学研究和标准制定的大学和研究机构",
      subline: "适用于：大学、研究所、研发部门"
    }
  },

  // Test Services - 测试服务
  testServices: {
    "Overview": {
      description: "全面介绍我们的测试实验室能力和方法",
      services: [
        { name: "了解实验室", link: "/inside-lab" },
        { name: "测试咨询", link: "#" }
      ]
    },
    "Automotive": {
      description: "汽车摄像系统和ADAS应用的专业测试服务",
      services: [
        { name: "camPAS", link: "#" },
        { name: "车内测试", link: "/your-solution/automotive/in-cabin-testing", active: true },
        { name: "HDR测试", link: "#" },
        { name: "几何校准", link: "#" },
        { name: "基准评估", link: "#" }
      ]
    },
    "VCX": {
      description: "移动设备和网络摄像头应用的VCX测试协议",
      services: [
        { name: "VCX - 手机摄像头", link: "#" },
        { name: "VCX - 网络摄像头", link: "#" },
        { name: "色彩特性化", link: "#" },
        { name: "基准评估", link: "#" }
      ]
    },
    "Image Quality": {
      description: "全面的图像质量分析和测量服务",
      services: [
        { name: "分辨率与纹理损失", link: "#" },
        { name: "动态范围(OECF)", link: "#" },
        { name: "镜头畸变", link: "#" },
        { name: "图像阴影与眩光", link: "#" },
        { name: "色彩准确性", link: "#" }
      ]
    },
    "Standardized": {
      description: "根据国际标准和协议的测试服务",
      services: [
        { name: "IEEE-P2020 (ADAS)", link: "/products/standards/ieee-p2020" },
        { name: "VCX (移动/网络摄像头)", link: "#" },
        { name: "IEC 62676-5 (安防)", link: "#" },
        { name: "EMVA 1288 (机器视觉)", link: "#" },
        { name: "ISO 12233 (SFR)", link: "#" }
      ]
    },
    "Specialized/Custom": {
      description: "定制测试解决方案和专业测量服务",
      services: [
        { name: "基准评估", link: "#" },
        { name: "概念验证", link: "#" },
        { name: "亮度校准", link: "#" },
        { name: "样本间偏差", link: "#" },
        { name: "开发验证测试", link: "#" },
        { name: "温控", link: "#" },
        { name: "水下测试", link: "#" }
      ]
    }
  }
};
