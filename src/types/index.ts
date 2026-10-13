export type ModeType = 'strategy' | 'feed' | 'scorer' | 'content' | 'review' | 'growth' | 'color-lab' | 'risk-tools' | 'chat';

export type AestheticStyleType = 
  | 'sage-blush'         // 莫兰迪柔雾 (Sage & Blush 治愈温润)
  | 'old-money-earth'    // 老钱大地色 (Quiet Luxury 高级静奢)
  | 'espresso-coffee'    // 意式奶咖 (Espresso 松弛智性)
  | 'minimal-monochrome' // 极简黑白灰 (Clean Fit 极简克制)
  | 'zen-bamboo'         // 东方素竹茶青 (Neo-Chinese 东方清欢留白)
  | 'vintage-rose'       // 法式干枯玫瑰 (French Rose 浪漫复古)
  | 'cream-minimal'      // 羊脂奶油白 (Clean Glow 素雅留白);

export interface RealSearchLink {
  keyword: string;
  type: '热搜母词' | '蓝海口令' | '下拉长尾' | 'INS话题';
  url: string;
  note?: string;
}

export interface AestheticInspiration {
  id: string;
  platform: '小红书' | 'Instagram';
  mediaType: '图文笔记' | '沉浸短视频' | '美学快拍';
  title: string;
  author: string;
  searchQuery: string; // 平台真实高热搜索词 (用于小红书/INS对标真机检索)
  searchUrl: string;   // 平台真实直达搜索链接 (点击直达真机搜索结果)
  coverGradient: string;
  badge: string;
  tags: string[];
  stageFit: '起号破冰期 (极易模仿)' | '进阶爆发期 (高话题度)' | '全阶段通用 (审美沉淀)';
  resonanceScore: number; // 话题度热力指数 (80-99)
  difficultyLevel: '低门槛极易套用' | '中等需生活道具' | '高需剪辑感';
  coreAngle: string;
  aestheticCategory?: string; // e.g. '莫兰迪治愈' | '老钱静奢' | '极简Clean' | '新中式' | '法式复古' | '原生裸感'
  replicateGuidance: {
    whyViral: string;
    copyAngle: string;
    visualIdea: string;
    keyPoints: string;
  };
  metrics: {
    likes: string;
    collects: string;
  };
}

export interface AestheticCheckinRecord {
  id: string;
  date: string;
  topic: string;
  notes: string;
  category: '色彩与莫兰迪' | '骨相与发型' | '穿搭与垂坠' | '生活留白心流' | '网感与KOC表达';
  scores: {
    colorSensitivity: number; // 色彩敏感度 (0-100)
    postureAesthetics: number; // 骨相/体态认知 (0-100)
    whitespaceSense: number; // 留白与细节感 (0-100)
    styleIdentity: number; // 风格辨识度 (0-100)
    habitDiscipline: number; // 审美自律心流 (0-100)
    editorialConversion: number; // 网感转化力 (0-100)
  };
  moodEmoji: string;
}

export interface OpenSourceSkill {
  id: number;
  name: string;
  tag: string;
  description: string;
  coreRule: string;
  modeLink: ModeType;
  practicalTips: string[];
}

export type CoverLayoutType = 'magazine' | 'minimal-zen' | 'bold-contrast' | 'poster-center';

export interface CoverInspirationItem {
  id: string;
  title: string;
  category: '陶器生活' | '绿植晨光' | '松弛手账' | '棉麻质感' | '极简空间' | '晨光光影';
  vibe: string;
  recommendedLayout: CoverLayoutType;
  layoutReason: string;
  paletteTheme: string;
  imageUrl?: string;
  imageData?: string; // base64 data url from generation or preset
  gradientFallback: string;
  recommendedBadge: string;
  titleTone: string;
  visualKeywords: string[];
}

export interface ClonedStyleConfig {
  sourceImage?: string;
  sourceBloggerName?: string;
  goldenRatio: {
    layoutStructure: 'top-heavy' | 'golden-thirds' | 'center-focus' | 'minimal-split';
    structureName: string;
    focalPointY: number; // 核心视觉焦点垂直位置 (百分比 0-100)
    whitespaceRatio: number; // 呼吸留白占比 (百分比 0-100)
    compositionRule: string; // 构图法则阐释
  };
  typography: {
    letterSpacing: 'tighter' | 'normal' | 'wide' | 'widest';
    letterSpacingVal: string; // e.g. '0.18em'
    lineHeight: 'tight' | 'snug' | 'relaxed';
    subtitleGap: number; // 像素间距
    fontFamilyFeel: 'serif-sc' | 'sans-clean' | 'editorial-hand';
    fontFamilyName: string;
  };
  flowerTextWeight: {
    primaryTitleWeight: 'font-extrabold' | 'font-bold' | 'font-black' | 'font-medium';
    titleWeightName: string;
    subtitleWeight: 'font-normal' | 'font-medium' | 'font-semibold';
    badgeStyle: 'pill-outline' | 'solid-accent' | 'tag-minimal' | 'glass-frosted';
    badgeStyleName: string;
    decorElements: string[];
    contrastRatio: string;
  };
  paletteSuggestion?: {
    dominant: string;
    accent: string;
    background: string;
    textColor: string;
  };
  summary: string;
}

export interface PostDraft {
  id: string;
  topic: string;
  selectedTitle: string;
  titles: Array<{
    title: string;
    hookType: '情绪钩子' | '痛点反差' | '悬念好奇' | '闺蜜避坑' | '沉浸打卡';
    analysis: string;
  }>;
  body: string;
  pinnedComment: string; // Skill 7: 评论区置顶预埋沙发
  visualGuidance: {
    coverFlowerText: string;
    composition: string;
    colorPalette: string;
    lightingAndProps: string;
  };
  seoTags: string[];
  ctaQuestion: string;
  coverConfig: {
    theme: 'sage-blush' | 'blush-dominant' | 'sage-dominant' | 'cream-minimal' | 'tea-rose' | string;
    badge: string;
    mainTitle: string;
    subTitle: string;
    dateOrDay: string;
    layout?: CoverLayoutType;
    backgroundImage?: string;
    backgroundPrompt?: string;
    clonedStyle?: ClonedStyleConfig;
  };
}

export interface SensitiveWordMatch {
  word: string;
  category: '极限违禁词' | '虚假功效宣传' | '私域导流' | '医疗美容禁语' | '过度制造焦虑';
  replacement: string;
  reason: string;
}

export interface ReviewResult {
  riskWords: SensitiveWordMatch[];
  lowTrafficAnalysis: {
    coverAndBounce: string;
    titleAttractiveness: string;
    bodyFriction: string;
    ctaAndInteraction: string;
  };
  optimizedCopy: string;
  optimizedTitle: string;
  complianceTips: string;
  rawAnalysisText?: string;
}

export interface TopicScoreResult {
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C';
  dimensions: {
    empathy: number;
    differentiation: number;
    visualPotential: number;
    interactionPotential: number;
  };
  summary: string;
  upgrades: Array<{
    newTopic: string;
    angle: string;
    whyBetter: string;
  }>;
  rawText?: string;
}

export interface StrategyResult {
  personaPositioning: string;
  audienceMatrix: string;
  benchmarkSop: string;
  roadmap30Days: string;
  visualGuidelines: string;
  advisorAdvice: string;
  rawText?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type AestheticDimensionType =
  | 'color-psychology'     // 色彩心理学
  | 'composition'          // 构图学与留白
  | 'texture-material'     // 材质感知与光影
  | 'visual-storytelling'  // 视觉叙事与微动势
  | 'style-identity';      // 风格辨识与骨相

export interface AestheticMicroLesson {
  id: string;
  dimensionKey: AestheticDimensionType;
  dimensionLabel: string; // e.g. '色彩心理学' | '构图学' | '材质感知'
  dimensionIcon?: string;
  lessonTitle: string;
  badge: string;
  readTime: string; // e.g. "⏱️ 3分钟极速吸收"
  isMissingDimension?: boolean; // 是否属于本周打卡缺失维度
  coreConcept: string; // 核心美学原理解析 (30秒极速掌握)
  masterOrigin: string; // 大师或流派美学哲学溯源
  detailedExplanation: string; // 深入浅出的原理拆解
  colorPaletteAdvice?: {
    name: string;
    hexes: string[];
    description: string;
  };
  dailyActionablePractice: string; // 今日1分钟微实操动作
  redBookConversionTip: string; // 小红书爆款转化与避坑小贴士
  quote: string; // 治愈系美学心流金句
  isFavorited?: boolean;
  savedAt?: string;
}
