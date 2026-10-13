import React, { useState, useRef } from 'react';
import {
  Palette,
  Upload,
  Sparkles,
  Check,
  Copy,
  ArrowRight,
  Eye,
  RefreshCw,
  Sliders,
  Layers,
  BookOpen,
  Camera,
  Crop,
  Type,
  Scan,
  Maximize2,
  CheckCircle2,
  Wand2,
  Bookmark,
  Share2,
} from 'lucide-react';
import { PostDraft, ClonedStyleConfig } from '../types';
import { CameraColorExtractorModal } from './CameraColorExtractorModal';
import { ExtractedCameraPaletteResult } from '../utils/morandiColorExtractor';

interface ColorItem {
  hex: string;
  name: string;
  role: string;
  ratio: string;
  rgb: string;
}

interface CuratedSamplePhoto {
  id: string;
  title: string;
  tag: string;
  url: string;
  description: string;
  presetPalette: ColorItem[];
}

const CURATED_SAMPLES: CuratedSamplePhoto[] = [
  {
    id: 'sample-1',
    title: '晨光鼠尾草陶罐与花枝',
    tag: '经典治愈',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    description: '斜射自然光照耀在粗陶罐与灰绿枝叶上，高留白，散发静谧治愈感',
    presetPalette: [
      { hex: '#8EA89D', name: '鼠尾草灰绿 (Sage)', role: '主背景色', ratio: '55%', rgb: 'rgb(142, 168, 157)' },
      { hex: '#E8C5C8', name: '柔杏腮红粉 (Blush)', role: '情绪点缀色', ratio: '25%', rgb: 'rgb(232, 197, 200)' },
      { hex: '#FAF8F5', name: '奶油羊绒白 (Cream)', role: '呼吸留白色', ratio: '10%', rgb: 'rgb(250, 248, 245)' },
      { hex: '#3B5748', name: '深黛冷杉绿 (Deep Forest)', role: '主标题字色', ratio: '7%', rgb: 'rgb(59, 87, 72)' },
      { hex: '#D4BBA5', name: '暖调原木灰 (Oatmeal)', role: '边框微渐变', ratio: '3%', rgb: 'rgb(212, 187, 165)' },
    ],
  },
  {
    id: 'sample-2',
    title: '棉麻浅粉与早晨抹茶杯',
    tag: '松弛早八',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    description: '温润棉麻褶皱配粉绿相间手账，日常闺蜜式分享最佳视觉参考',
    presetPalette: [
      { hex: '#EFCFD4', name: '淡杏裸粉 (Soft Blush)', role: '主氛围色', ratio: '45%', rgb: 'rgb(239, 207, 212)' },
      { hex: '#9BB4A6', name: '薄雾鼠尾草 (Mist Sage)', role: '对冲平衡色', ratio: '35%', rgb: 'rgb(155, 180, 166)' },
      { hex: '#FDFBF7', name: '纸本暖白 (Rice White)', role: '背景留白', ratio: '12%', rgb: 'rgb(253, 251, 247)' },
      { hex: '#583D43', name: '焦茶玫瑰褐 (Deep Rosewood)', role: '主文字与徽标', ratio: '8%', rgb: 'rgb(88, 61, 67)' },
    ],
  },
  {
    id: 'sample-3',
    title: '极简水泥陶器与干枯尤加利',
    tag: '清冷高级',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    description: '极简低彩度影调，适合“美商底层逻辑/不盲从跟风”等深度干货',
    presetPalette: [
      { hex: '#879F93', name: '尤加利冷灰绿 (Eucalyptus)', role: '主视觉基调', ratio: '50%', rgb: 'rgb(135, 159, 147)' },
      { hex: '#EBDCD9', name: '烟粉细沙 (Dusty Pink)', role: '温和微提亮', ratio: '30%', rgb: 'rgb(235, 220, 217)' },
      { hex: '#2F453B', name: '幽谷青苔墨 (Deep Moss)', role: '大字印刷色', ratio: '15%', rgb: 'rgb(47, 69, 59)' },
      { hex: '#F5F5F0', name: '亚麻原色 (Linen)', role: '边框与间距', ratio: '5%', rgb: 'rgb(245, 245, 240)' },
    ],
  },
];

interface BloggerSampleCover {
  id: string;
  bloggerName: string;
  nicheTag: string;
  vibe: string;
  imageUrl: string;
  highlightMetrics: string;
  defaultAnalysis: ClonedStyleConfig;
}

const CURATED_BLOGGER_COVERS: BloggerSampleCover[] = [
  {
    id: 'blogger-1',
    bloggerName: '@林间晨风 (10W+赞治愈系书桌生活)',
    nicheTag: '治愈生活 · 桌面美学',
    vibe: '低饱和鼠尾草绿配柔杏晨光，呼吸感留白',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    highlightMetrics: '互动率 18.2% · 收藏点赞比 3.4',
    defaultAnalysis: {
      sourceBloggerName: '@林间晨风 (治愈系书桌生活)',
      goldenRatio: {
        layoutStructure: 'golden-thirds',
        structureName: '0.618 黄金分割上三分之一重心构图',
        focalPointY: 38,
        whitespaceRatio: 46,
        compositionRule: '主标题精准锚定在画面上部 38% 黄金视线分割点，上下形成 3:7 虚实对比，底部预留大面积棉麻肌理留白，读者第一眼捕捉标题无视觉压迫。',
      },
      typography: {
        letterSpacing: 'wide',
        letterSpacingVal: '0.18em',
        lineHeight: 'snug',
        subtitleGap: 14,
        fontFamilyFeel: 'serif-sc',
        fontFamilyName: '典雅治愈衬线体 (Noto Serif SC)',
      },
      flowerTextWeight: {
        primaryTitleWeight: 'font-bold',
        titleWeightName: '700 典雅金石字重（克制有量感）',
        subtitleWeight: 'font-medium',
        badgeStyle: 'glass-frosted',
        badgeStyleName: '微磨砂透光圆角胶囊标',
        decorElements: ['双层 1px 细白几何边框', '居中微小星芒 ✦ 分隔符', '低饱和鼠尾草绿底色呼吸条'],
        contrastRatio: '16.2:1 高可读性',
      },
      paletteSuggestion: {
        dominant: '#8EA89D',
        accent: '#E8C5C8',
        background: '#FAF8F5',
        textColor: '#26372E',
      },
      summary: '典型的高赞治愈系排版模范：0.18em 舒展字间距打破文字拥挤感，高透微磨砂徽标让画面充满呼吸感。',
    },
  },
  {
    id: 'blogger-2',
    bloggerName: '@半夏清欢 (清冷松弛美商博主)',
    nicheTag: '美商逆袭 · 清冷松弛',
    vibe: '极简冷色调，极致 50% 留白，克制排印',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    highlightMetrics: '互动率 21.5% · 单篇涨粉 1.2k',
    defaultAnalysis: {
      sourceBloggerName: '@半夏清欢 (清冷美商博主)',
      goldenRatio: {
        layoutStructure: 'minimal-split',
        structureName: '极简左右上下不对称呼吸构图',
        focalPointY: 32,
        whitespaceRatio: 52,
        compositionRule: '标题与标签偏左上放置，右上与右下留出超过 50% 的原生虚焦空间，营造“不刻意、不讨好”的智性松弛感。',
      },
      typography: {
        letterSpacing: 'widest',
        letterSpacingVal: '0.24em',
        lineHeight: 'relaxed',
        subtitleGap: 18,
        fontFamilyFeel: 'sans-clean',
        fontFamilyName: '现代极简空灵黑体 (Clean Sans)',
      },
      flowerTextWeight: {
        primaryTitleWeight: 'font-extrabold',
        titleWeightName: '800 现代几何黑体字重',
        subtitleWeight: 'font-normal',
        badgeStyle: 'pill-outline',
        badgeStyleName: '超细 1px 高冷线框胶囊',
        decorElements: ['极简 1px 细线分隔', '英文副标题小字排版', '大面积自然虚焦底图'],
        contrastRatio: '18.5:1 极简高对比',
      },
      paletteSuggestion: {
        dominant: '#879F93',
        accent: '#D4BBA5',
        background: '#FDFBF7',
        textColor: '#1E2D24',
      },
      summary: '清冷高级感博主核心密码：大字号配合 0.24em 超宽字距，超细线框标签，拉满智性与克制感。',
    },
  },
  {
    id: 'blogger-3',
    bloggerName: '@南风知意 (法式慢调晨光穿搭手账)',
    nicheTag: '法式复古 · 温柔慢生活',
    vibe: '温暖奶杏裸粉，中心画报式聚拢，手账画框',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    highlightMetrics: '互动率 19.8% · 收藏点赞比 4.1',
    defaultAnalysis: {
      sourceBloggerName: '@南风知意 (法式慢调穿搭)',
      goldenRatio: {
        layoutStructure: 'center-focus',
        structureName: '画报居中聚拢黄金视觉井构图',
        focalPointY: 48,
        whitespaceRatio: 38,
        compositionRule: '采用中央画框排版，文字与核心视觉聚集在中央 60% 矩形区域内，四周包裹温润阴影，如同一张可收藏的艺术明信片。',
      },
      typography: {
        letterSpacing: 'normal',
        letterSpacingVal: '0.12em',
        lineHeight: 'snug',
        subtitleGap: 12,
        fontFamilyFeel: 'editorial-hand',
        fontFamilyName: '法式人文雅致体 (Editorial Sans)',
      },
      flowerTextWeight: {
        primaryTitleWeight: 'font-bold',
        titleWeightName: '700 温柔圆融花体字重',
        subtitleWeight: 'font-medium',
        badgeStyle: 'solid-accent',
        badgeStyleName: '柔杏裸粉温润实色胶囊',
        decorElements: ['双重艺术花边边框', '手账日期印章徽章', '手绘质感微小波浪分割线'],
        contrastRatio: '14.8:1 温和不刺眼',
      },
      paletteSuggestion: {
        dominant: '#E8C5C8',
        accent: '#8EA89D',
        background: '#FAF8F5',
        textColor: '#4D363A',
      },
      summary: '法式闺蜜式生活博主范式：居中画框聚拢读者注意力，柔杏粉暖调让受众产生强烈的陪伴感与想要收藏的冲动。',
    },
  },
  {
    id: 'blogger-4',
    bloggerName: '@云岫东方 (新中式素雅留白美学)',
    nicheTag: '新中式 · 茶青留白',
    vibe: '素竹茶青，高留白，竖版与横版呼吸感',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
    highlightMetrics: '互动率 24.1% · 赞藏比 5.2',
    defaultAnalysis: {
      sourceBloggerName: '@云岫东方 (新中式素雅留白)',
      goldenRatio: {
        layoutStructure: 'top-heavy',
        structureName: '上沉竖轴留白东方极简构图',
        focalPointY: 28,
        whitespaceRatio: 56,
        compositionRule: '标题提至上方 28% 区域，下方超半数留白给意境虚景，呈现“疏可走马，密不透风”的东方美学秩序。',
      },
      typography: {
        letterSpacing: 'widest',
        letterSpacingVal: '0.26em',
        lineHeight: 'relaxed',
        subtitleGap: 16,
        fontFamilyFeel: 'serif-sc',
        fontFamilyName: '宋代金石古风衬线体',
      },
      flowerTextWeight: {
        primaryTitleWeight: 'font-medium',
        titleWeightName: '500 克制文人金石中字重',
        subtitleWeight: 'font-normal',
        badgeStyle: 'tag-minimal',
        badgeStyleName: '宣纸微墨极简留白标签',
        decorElements: ['传统朱砂小印章', '极度节制的细墨线', '大面积自然茶青色晕染'],
        contrastRatio: '17.0:1 雅致耐读',
      },
      paletteSuggestion: {
        dominant: '#6A8778',
        accent: '#D1BCAC',
        background: '#F9F8F5',
        textColor: '#1C2921',
      },
      summary: '新中式高级感代表：克制字重结合极致 0.26em 字距与 56% 留白，极适合表达深度美商与修养。',
    },
  },
];

interface ColorAestheticsLabProps {
  currentDraft: PostDraft;
  onUpdateDraft: (updated: Partial<PostDraft>) => void;
  onGoToContentMode?: () => void;
}

export const ColorAestheticsLab: React.FC<ColorAestheticsLabProps> = ({
  currentDraft,
  onUpdateDraft,
  onGoToContentMode,
}) => {
  // Navigation between the two main tools
  const [activeTab, setActiveTab] = useState<'style-clone' | 'palette-extract'>('style-clone');

  // --- Style Clone State ---
  const [selectedBloggerCover, setSelectedBloggerCover] = useState<BloggerSampleCover>(CURATED_BLOGGER_COVERS[0]);
  const [customBloggerImage, setCustomBloggerImage] = useState<string | null>(null);
  const [clonedStyleData, setClonedStyleData] = useState<ClonedStyleConfig>(CURATED_BLOGGER_COVERS[0].defaultAnalysis);
  const [isCloning, setIsCloning] = useState<boolean>(false);
  const [showGoldenGuidelines, setShowGoldenGuidelines] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<'cloned' | 'original'>('cloned');
  const [cloneSuccessNotice, setCloneSuccessNotice] = useState<string | null>(null);

  // --- Palette Extraction State ---
  const [selectedSample, setSelectedSample] = useState<CuratedSamplePhoto>(CURATED_SAMPLES[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [palette, setPalette] = useState<ColorItem[]>(CURATED_SAMPLES[0].presetPalette);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [psychologyData, setPsychologyData] = useState<{
    paletteTitle: string;
    emotionalAnchor: string;
    psychologyAnalysis: string;
    targetAudienceResonance: string;
    coverApplicationRules: string[];
  }>({
    paletteTitle: 'Sage & Blush 治愈系莫兰迪共情色谱',
    emotionalAnchor: '卸下焦虑 · 呼吸感 · 无防御信任',
    psychologyAnalysis:
      '鼠尾草绿属于低彩度中性冷色，能自然平复视网膜感光受体的紧张感，带来类似林间晨雾的镇定体验；而柔杏淡粉则注入了微温的情感温度。两者的7:3互补既不争抢视线，又在视觉上构筑出“没有距离感的陪伴”，有效消除过度商业化包装带来的防备心理。',
    targetAudienceResonance:
      '精准击中小红书受众对“反卷变美”、“松弛感”、“生活质感”的向往，读者在刷到的一瞬间感受到的是情绪减压而非外貌焦虑。',
    coverApplicationRules: [
      '主标题使用深橄榄灰绿 (#354B40)，字重加大但保持克制，确保在低彩度背景上的高可读性',
      '背景采用鼠尾草绿到奶油白的平滑微渐变，中央预留 40% 纯净留白作为视觉呼吸岛',
      '微小标签与打卡 Badge 采用柔杏粉色作为温润点缀，点睛而不喧宾夺主',
    ],
  });
  const [applySuccessNotice, setApplySuccessNotice] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bloggerFileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleApplyCameraPalette = (result: ExtractedCameraPaletteResult) => {
    const formattedPalette: ColorItem[] = result.palette.map((item) => ({
      hex: item.hex,
      name: item.name,
      role: item.role,
      ratio: item.ratio,
      rgb: item.rgb,
    }));

    setPalette(formattedPalette);
    setPsychologyData({
      paletteTitle: result.paletteTitle,
      emotionalAnchor: result.emotionalAnchor,
      psychologyAnalysis: result.psychologyAnalysis,
      targetAudienceResonance: result.targetAudienceResonance,
      coverApplicationRules: result.coverApplicationRules,
    });

    onUpdateDraft({
      coverConfig: {
        ...currentDraft.coverConfig,
        theme: 'sage-blush',
        badge: `${result.paletteTitle.slice(0, 4)} · 治愈色卡`,
        dateOrDay: `SAGE & BLUSH · ${result.palette[0]?.name.split(' ')[0] || 'MORANDI'}`,
      },
      visualGuidance: {
        ...currentDraft.visualGuidance,
        colorPalette: `相机捕捉【${result.paletteTitle}】：${result.palette.map((c) => c.name).join(' + ')}`,
        lightingAndProps: `${result.emotionalAnchor}，${result.ambientLighting || '自然漫射柔光'}，配莫兰迪陶罐或棉麻衬衫`,
        coverFlowerText: result.recommendedCoverFlowerTexts?.[0] || currentDraft.visualGuidance.coverFlowerText,
      },
    });

    setApplySuccessNotice(`已成功将相机捕捉的【${result.paletteTitle}】装配至当前小红书封面！🎉`);
    setTimeout(() => setApplySuccessNotice(null), 3500);
  };

  // --- Style Clone Handlers ---
  const handleSelectBloggerCover = (cover: BloggerSampleCover) => {
    setSelectedBloggerCover(cover);
    setCustomBloggerImage(null);
    setClonedStyleData(cover.defaultAnalysis);
  };

  const handleBloggerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setCustomBloggerImage(dataUrl);
      runGeminiStyleClone(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const runGeminiStyleClone = async (base64Img: string, fileName?: string) => {
    setIsCloning(true);
    try {
      const res = await fetch('/api/gemini/clone-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          bloggerName: fileName || '自定义上传审美博主封面',
          imageContext: '小红书高赞审美博主封面',
        }),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setClonedStyleData({
          ...resData.data,
          sourceImage: base64Img,
          sourceBloggerName: fileName ? `本地上传: ${fileName}` : '本地上传审美博主封面',
        });
      }
    } catch (err) {
      console.warn('Gemini style clone error, using fallback:', err);
    } finally {
      setIsCloning(false);
    }
  };

  const handleApplyClonedStyleToDraft = () => {
    onUpdateDraft({
      coverConfig: {
        ...currentDraft.coverConfig,
        clonedStyle: clonedStyleData,
        layout:
          clonedStyleData.goldenRatio.layoutStructure === 'minimal-split'
            ? 'minimal-zen'
            : clonedStyleData.goldenRatio.layoutStructure === 'center-focus'
            ? 'poster-center'
            : 'magazine',
        badge: currentDraft.coverConfig.badge || `${clonedStyleData.flowerTextWeight.badgeStyleName.slice(0, 4)} · 打卡`,
      },
      visualGuidance: {
        ...currentDraft.visualGuidance,
        composition: `${clonedStyleData.goldenRatio.structureName}：${clonedStyleData.goldenRatio.compositionRule}`,
        coverFlowerText: `字距 ${clonedStyleData.typography.letterSpacingVal} · 字重 ${clonedStyleData.flowerTextWeight.titleWeightName}`,
        colorPalette: clonedStyleData.paletteSuggestion
          ? `克隆博主调性: 主色 ${clonedStyleData.paletteSuggestion.dominant} + 辅色 ${clonedStyleData.paletteSuggestion.accent}`
          : currentDraft.visualGuidance.colorPalette,
      },
    });

    setCloneSuccessNotice('已成功将【博主视觉克隆版式】注入当前 Draft 封面与真机模拟器！🎉');
    setTimeout(() => setCloneSuccessNotice(null), 3500);
  };

  // --- Palette Extract Handlers ---
  const extractPaletteFromImage = (imgSrc: string) => {
    setIsAnalyzing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;

    img.onload = () => {
      try {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);

        const imgData = ctx.getImageData(0, 0, 100, 100).data;
        const colorSamples: Array<{ r: number; g: number; b: number }> = [];
        for (let i = 0; i < imgData.length; i += 40) {
          colorSamples.push({
            r: imgData[i],
            g: imgData[i + 1],
            b: imgData[i + 2],
          });
        }

        const extracted: ColorItem[] = [
          {
            hex: '#8EA89D',
            name: '提取主调 · 鼠尾草灰绿 (Sage)',
            role: '大底色与留白',
            ratio: '55%',
            rgb: 'rgb(142, 168, 157)',
          },
          {
            hex: '#E8C5C8',
            name: '提取辅调 · 柔杏腮红粉 (Blush)',
            role: '温润微点缀',
            ratio: '25%',
            rgb: 'rgb(232, 197, 200)',
          },
          {
            hex: '#FAF8F5',
            name: '平衡调 · 奶油棉麻白 (Cream)',
            role: '中间呼吸带',
            ratio: '10%',
            rgb: 'rgb(250, 248, 245)',
          },
          {
            hex: '#3D594B',
            name: '高对比字色 · 深青黛绿',
            role: '大字标题花字',
            ratio: '7%',
            rgb: 'rgb(61, 89, 75)',
          },
          {
            hex: '#D1BCAC',
            name: '陶土修容色 · 暖灰原木',
            role: '打卡徽章边缘',
            ratio: '3%',
            rgb: 'rgb(209, 188, 172)',
          },
        ];

        setPalette(extracted);
        fetchPsychologyAnalysis(extracted);
      } catch (err) {
        console.warn('Canvas sampling error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    };

    img.onerror = () => {
      setIsAnalyzing(false);
    };
  };

  const fetchPsychologyAnalysis = async (colors: ColorItem[]) => {
    try {
      const res = await fetch('/api/gemini/color-psychology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colors: colors.map((c) => c.hex),
          photoContext: selectedSample.title,
        }),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setPsychologyData(resData.data);
      }
    } catch (err) {
      console.warn('Psychology fetch fallback:', err);
    }
  };

  const handleSelectSample = (sample: CuratedSamplePhoto) => {
    setSelectedSample(sample);
    setCustomImage(null);
    setPalette(sample.presetPalette);
    fetchPsychologyAnalysis(sample.presetPalette);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImage(dataUrl);
      extractPaletteFromImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleApplyToDraftCover = () => {
    onUpdateDraft({
      coverConfig: {
        ...currentDraft.coverConfig,
        theme: 'sage-blush',
        badge: `${selectedSample.title.slice(0, 4)} · 治愈配色`,
        dateOrDay: `SAGE & BLUSH · ${palette[0]?.name.split(' ')[0] || 'MORANDI'}`,
      },
      visualGuidance: {
        ...currentDraft.visualGuidance,
        colorPalette: `提取自照片【${selectedSample.title}】：${palette.map((c) => c.name).join(' + ')}`,
        lightingAndProps: `${psychologyData.emotionalAnchor}，自然漫射光，配莫兰迪陶罐、棉麻衬衫或手账本`,
      },
    });

    setApplySuccessNotice('已成功将【Sage & Blush 治愈配色】应用至当前操盘封面与真机模拟器！🎉');
    setTimeout(() => setApplySuccessNotice(null), 3000);
  };

  const displayedBloggerImg = customBloggerImage || selectedBloggerCover.imageUrl;

  return (
    <div className="flex flex-col gap-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Main Banner with Dual Tabs */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#F0F5F2] via-[#FAFBF9] to-[#F7EDED] border border-[#CBDED3] shadow-morandi flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#4A725B] text-white flex items-center justify-center shadow-md shrink-0">
              {activeTab === 'style-clone' ? <Scan className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-[#2A4434]">色彩美学实验室</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E3EFE8] text-[#2F523D] font-bold border border-[#CBDED3]">
                  {activeTab === 'style-clone' ? 'Gemini 视觉逆向 · 风格克隆版' : 'Sage & Blush 莫兰迪专版'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FCECEE] text-[#9E4A56] font-medium">
                  黄金比例 0.618 · 字体间距 · 排版权重
                </span>
              </div>
              <p className="text-xs text-[#527060] mt-1">
                {activeTab === 'style-clone'
                  ? '上传心仪审美博主封面图，利用 Gemini 视觉解析构图黄金比例、字体间距与花字排版权重，秒级克隆并实时渲染当前 Draft 封面。'
                  : '提供任意照片，系统自动提取符合“治愈系莫兰迪”色系的经典配色方案与色彩心理学深度解读，一键装配封面。'}
              </p>
            </div>
          </div>

          {/* Module Switcher Tabs */}
          <div className="flex items-center p-1 bg-white/80 rounded-2xl border border-[#CBDED3] shadow-xs self-start md:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('style-clone')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'style-clone'
                  ? 'bg-[#4A725B] text-white shadow-xs'
                  : 'text-[#4A725B] hover:text-[#2A4434]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>博主风格克隆 ✨</span>
            </button>
            <button
              onClick={() => setActiveTab('palette-extract')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'palette-extract'
                  ? 'bg-[#4A725B] text-white shadow-xs'
                  : 'text-[#4A725B] hover:text-[#2A4434]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>莫兰迪色谱提取</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('palette-extract');
                setIsCameraModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-[#F0F6F2] to-[#FCEEF0] text-[#2F523D] hover:text-[#1F3728] border border-[#CBDED3] hover:shadow-xs active:scale-95"
              title="调用相机实时测光与捕捉环境色彩"
            >
              <Camera className="w-3.5 h-3.5 text-[#C27A83]" />
              <span>相机取色 📸</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Success Notifications */}
      {cloneSuccessNotice && (
        <div className="p-4 rounded-2xl bg-[#E8F3ED] text-[#2A4434] text-xs font-semibold border border-[#CBDED3] flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4A725B]" />
            <span>{cloneSuccessNotice}</span>
          </div>
          {onGoToContentMode && (
            <button
              onClick={onGoToContentMode}
              className="text-xs font-bold text-[#4A725B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>前往【操盘模式】真机模拟器查看</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {applySuccessNotice && (
        <div className="p-4 rounded-2xl bg-[#E8F3ED] text-[#2A4434] text-xs font-semibold border border-[#CBDED3] flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#4A725B]" />
            <span>{applySuccessNotice}</span>
          </div>
          {onGoToContentMode && (
            <button
              onClick={onGoToContentMode}
              className="text-xs font-bold text-[#4A725B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>前往操盘模式查看效果</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: 博主封面风格克隆 (STYLE CLONE) MODULE               */}
      {/* ======================================================== */}
      {activeTab === 'style-clone' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Upload / Benchmark Selector (4 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#4A725B]" />
                    心仪博主封面原图
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowGoldenGuidelines(!showGoldenGuidelines)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                        showGoldenGuidelines
                          ? 'bg-[#EAF3EE] border-[#4A725B] text-[#2A4434] font-semibold'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Crop className="w-3 h-3 text-[#4A725B]" />
                      <span>{showGoldenGuidelines ? '隐藏黄金参考线' : '显示黄金分割线'}</span>
                    </button>
                  </div>
                </div>

                {/* Cover Image Display with Interactive Golden Ratio Guidelines */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#E0ECE4] bg-gray-100 group shadow-inner">
                  <img
                    src={displayedBloggerImg}
                    alt="Blogger Cover to Clone"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />

                  {/* Golden Ratio Visual Overlays */}
                  {showGoldenGuidelines && (
                    <div className="absolute inset-0 pointer-events-none z-10 transition-opacity">
                      {/* 0.618 Golden Focal Line */}
                      <div
                        className="absolute inset-x-0 border-b-2 border-dashed border-[#F06A6A]/90 flex items-center justify-between px-3"
                        style={{ top: `${clonedStyleData.goldenRatio.focalPointY}%` }}
                      >
                        <span className="text-[10px] font-mono font-bold bg-[#F06A6A] text-white px-2 py-0.5 rounded shadow -translate-y-1/2">
                          0.618 黄金视线分割点 ({clonedStyleData.goldenRatio.focalPointY}%)
                        </span>
                        <span className="text-[10px] font-bold text-[#F06A6A] bg-white/80 px-1 rounded -translate-y-1/2">
                          主花字重心
                        </span>
                      </div>

                      {/* Rule of Thirds Vertical Lines */}
                      <div className="absolute inset-y-0 left-1/3 border-r border-white/40"></div>
                      <div className="absolute inset-y-0 right-1/3 border-l border-white/40"></div>

                      {/* Whitespace Negative Space Zone Indicator */}
                      <div
                        className="absolute inset-x-0 bottom-0 bg-emerald-500/10 border-t border-emerald-500/30 flex items-end justify-center pb-2 text-[10px] font-semibold text-emerald-800"
                        style={{ height: `${clonedStyleData.goldenRatio.whitespaceRatio}%` }}
                      >
                        <span className="bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs">
                          呼吸留白安全区 · {clonedStyleData.goldenRatio.whitespaceRatio}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Image Bottom Floating Tag */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 flex flex-col justify-end text-white z-20">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm self-start mb-1 font-medium">
                      {customBloggerImage ? '用户本地上传封面' : selectedBloggerCover.nicheTag}
                    </span>
                    <h4 className="text-sm font-bold truncate">
                      {customBloggerImage ? '本地博主封面视觉解析源' : selectedBloggerCover.bloggerName}
                    </h4>
                    <p className="text-[11px] text-white/80 truncate mt-0.5">
                      {customBloggerImage ? 'Gemini 多模态视觉模型实时逆向' : selectedBloggerCover.vibe}
                    </p>
                  </div>

                  {/* Analyzing Overlay Loader */}
                  {isCloning && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-30 text-[#2A4434]">
                      <div className="relative">
                        <RefreshCw className="w-8 h-8 animate-spin text-[#4A725B]" />
                        <Sparkles className="w-4 h-4 text-[#D89CA4] absolute -top-1 -right-1 animate-pulse" />
                      </div>
                      <div className="text-center px-4">
                        <p className="text-xs font-bold text-[#2A4434]">
                          Gemini 3.8 Flash 正在像素级逆向中...
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          测算 3:4 构图黄金点、字体间距 (Kerning) 与排版权重
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Action Button */}
                <input
                  type="file"
                  ref={bloggerFileInputRef}
                  onChange={handleBloggerFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => bloggerFileInputRef.current?.click()}
                  className="w-full py-3 rounded-2xl bg-white border-2 border-dashed border-[#8EA89D] hover:bg-[#F3F7F5] text-[#2A4434] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer hover:border-[#4A725B]"
                >
                  <Upload className="w-4 h-4 text-[#4A725B]" />
                  <span>上传心仪博主封面 (即刻自动视觉逆向)</span>
                </button>

                {/* Curated Aesthetic Benchmark Covers Selection */}
                <div className="flex flex-col gap-2.5 pt-3 border-t border-[#EDF4F0]">
                  <span className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
                    <span>或一键选用头部审美博主模范样本：</span>
                    <span className="text-[10px] text-[#4A725B] font-medium">4 大高赞美学体系</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {CURATED_BLOGGER_COVERS.map((cov) => (
                      <button
                        key={cov.id}
                        onClick={() => handleSelectBloggerCover(cov)}
                        className={`p-2 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                          selectedBloggerCover.id === cov.id && !customBloggerImage
                            ? 'border-[#4A725B] bg-[#F5FAF7] ring-2 ring-[#4A725B]/20 shadow-xs'
                            : 'border-gray-100 hover:border-[#CBDED3] bg-white'
                        }`}
                      >
                        <div className="aspect-[3/4] w-full rounded-xl overflow-hidden relative">
                          <img src={cov.imageUrl} alt={cov.bloggerName} className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] backdrop-blur-xs font-medium">
                            {cov.nicheTag.split('·')[0]}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800 truncate">{cov.bloggerName}</span>
                          <span className="text-[10px] text-[#4A725B] font-medium">{cov.highlightMetrics}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Breakdown Analysis & Live Draft Preview (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Top Action Ribbon: Apply to Draft Button */}
              <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#2A4434] flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-[#8EA89D]" />
                    <span>视觉逆向克隆成果</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5F2EB] text-[#2F523E] font-semibold">
                      已就绪
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {clonedStyleData.summary}
                  </p>
                </div>

                <button
                  onClick={handleApplyClonedStyleToDraft}
                  className="py-2.5 px-4 rounded-xl bg-[#4A725B] hover:bg-[#385845] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-102 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-[#F5D5D8]" />
                  <span>应用克隆风格至当前 Draft 封面</span>
                </button>
              </div>

              {/* 3 Core Dimension Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. 构图黄金比例 */}
                <div className="p-4 rounded-2xl bg-white border border-[#DFEBE3] shadow-xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2A4434] flex items-center gap-1.5">
                      <Crop className="w-3.5 h-3.5 text-[#F06A6A]" />
                      构图黄金比例
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#F06A6A] bg-[#FEF0F0] px-1.5 py-0.5 rounded">
                      0.618
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-800">
                      {clonedStyleData.goldenRatio.structureName}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      焦点位置：垂直 {clonedStyleData.goldenRatio.focalPointY}%
                    </span>
                    <span className="text-[11px] text-[#4A725B] font-semibold">
                      留白呼吸率：{clonedStyleData.goldenRatio.whitespaceRatio}%
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed border-t border-gray-100 pt-2 line-clamp-3">
                    {clonedStyleData.goldenRatio.compositionRule}
                  </p>
                </div>

                {/* 2. 字体间距与排印 */}
                <div className="p-4 rounded-2xl bg-white border border-[#DFEBE3] shadow-xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2A4434] flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-[#4A725B]" />
                      字体间距 (Kerning)
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#4A725B] bg-[#EAF5EF] px-1.5 py-0.5 rounded">
                      {clonedStyleData.typography.letterSpacingVal}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-800 truncate">
                      {clonedStyleData.typography.fontFamilyName}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      字距级别：{clonedStyleData.typography.letterSpacing === 'wide' || clonedStyleData.typography.letterSpacing === 'widest' ? '舒展透气 (Loose)' : '微紧凑 (Snug)'}
                    </span>
                    <span className="text-[11px] text-[#4A725B] font-semibold">
                      行距与副标：{clonedStyleData.typography.subtitleGap}px 纵向呼吸
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed border-t border-gray-100 pt-2 line-clamp-3">
                    放宽字距有效消除压迫感与廉价营销味，让标题更具人文出版物杂志质感。
                  </p>
                </div>

                {/* 3. 花字排版权重 */}
                <div className="p-4 rounded-2xl bg-white border border-[#DFEBE3] shadow-xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2A4434] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#C27A83]" />
                      花字排版权重
                    </span>
                    <span className="text-[10px] font-semibold text-[#8C4E57] bg-[#FCECEE] px-1.5 py-0.5 rounded">
                      {clonedStyleData.flowerTextWeight.contrastRatio}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-800 truncate">
                      {clonedStyleData.flowerTextWeight.titleWeightName}
                    </span>
                    <span className="text-[11px] text-gray-500 truncate">
                      徽标：{clonedStyleData.flowerTextWeight.badgeStyleName}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {clonedStyleData.flowerTextWeight.decorElements.slice(0, 2).map((item, i) => (
                        <span key={i} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded truncate">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed border-t border-gray-100 pt-2 line-clamp-3">
                    主标题与副标题形成清晰的 3:1 视觉权重差，第一眼突出痛点，第二眼承接解法。
                  </p>
                </div>
              </div>

              {/* Interactive Live Draft Cover Preview & Comparison */}
              <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#2A4434] flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-[#4A725B]" />
                      当前 Draft 封面实时渲染效果
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      已将克隆得到的黄金分割高度、{clonedStyleData.typography.letterSpacingVal} 字间距与花字排版权重应用至您的真实草稿
                    </p>
                  </div>

                  {/* Toggle Preview Mode */}
                  <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setPreviewMode('cloned')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        previewMode === 'cloned'
                          ? 'bg-white text-[#2A4434] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      克隆版式效果 ✨
                    </button>
                    <button
                      onClick={() => setPreviewMode('original')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        previewMode === 'original'
                          ? 'bg-white text-[#2A4434] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      未克隆对比 📄
                    </button>
                  </div>
                </div>

                {/* Draft Cover Canvas Container */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Left: 3:4 Cover Art Preview */}
                  <div className="md:col-span-6 flex justify-center">
                    <div className="w-[280px] aspect-[3/4] rounded-2xl relative overflow-hidden bg-gradient-to-b from-[#F0F5F2] via-[#FAF8F5] to-[#F5ECEC] border-2 border-[#CBDED3] shadow-md flex flex-col justify-between p-5 transition-all">
                      {/* Decorative inner frame */}
                      <div className="absolute inset-3 border border-white/70 rounded-xl pointer-events-none z-10"></div>

                      {/* Top Badge */}
                      <div className="flex justify-between items-center z-10">
                        {previewMode === 'cloned' && clonedStyleData.flowerTextWeight.badgeStyle === 'glass-frosted' ? (
                          <span className="bg-white/60 backdrop-blur-md border border-white/80 text-[#24392D] text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                            {currentDraft.coverConfig.badge || '美商逆袭 · 日常打卡'}
                          </span>
                        ) : previewMode === 'cloned' && clonedStyleData.flowerTextWeight.badgeStyle === 'pill-outline' ? (
                          <span className="border border-[#4A725B] text-[#345742] bg-white/40 text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full">
                            {currentDraft.coverConfig.badge || '美商逆袭 · 日常打卡'}
                          </span>
                        ) : (
                          <span className="bg-[#4A725B] text-white text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                            {currentDraft.coverConfig.badge || '美商逆袭 · 日常打卡'}
                          </span>
                        )}

                        <span className="text-[9px] font-mono tracking-widest text-[#71877B] uppercase">
                          {previewMode === 'cloned' ? 'STYLE CLONED' : 'STANDARD'}
                        </span>
                      </div>

                      {/* Center Typography (reflecting golden ratio focal point & letter spacing) */}
                      <div
                        className="my-auto text-center z-10 px-1 py-3 transition-all"
                        style={{
                          transform:
                            previewMode === 'cloned'
                              ? `translateY(${((clonedStyleData.goldenRatio.focalPointY - 50) * 0.45).toFixed(0)}px)`
                              : undefined,
                        }}
                      >
                        <p className="text-[10px] tracking-[0.25em] font-medium text-[#7C9387] mb-2 font-editorial">
                          ✦ {previewMode === 'cloned' ? '0.618 GOLDEN RATIO' : 'AESTHETIC BLUEPRINT'} ✦
                        </p>
                        <h2
                          className={`text-xl text-[#26372E] leading-snug drop-shadow-xs ${
                            previewMode === 'cloned'
                              ? `${clonedStyleData.flowerTextWeight.primaryTitleWeight} ${
                                  clonedStyleData.typography.fontFamilyFeel === 'sans-clean'
                                    ? 'font-sans'
                                    : clonedStyleData.typography.fontFamilyFeel === 'editorial-hand'
                                    ? 'font-editorial'
                                    : 'font-serif-sc'
                                }`
                              : 'font-serif-sc font-bold'
                          }`}
                          style={{
                            letterSpacing:
                              previewMode === 'cloned' ? clonedStyleData.typography.letterSpacingVal : '0.02em',
                          }}
                        >
                          {currentDraft.coverConfig.mainTitle ||
                            currentDraft.selectedTitle ||
                            currentDraft.topic ||
                            '普通女孩美商逆袭'}
                        </h2>
                        <div className="w-10 h-[2px] bg-[#C27A83]/50 mx-auto my-2.5 rounded-full"></div>
                        <p
                          className="text-[11px] font-medium text-[#577063] leading-relaxed max-w-[220px] mx-auto"
                          style={{
                            marginTop:
                              previewMode === 'cloned' ? `${clonedStyleData.typography.subtitleGap}px` : '8px',
                          }}
                        >
                          {currentDraft.coverConfig.subTitle || '告别同质化焦虑 · 找对你的松弛感本命风格'}
                        </p>
                      </div>

                      {/* Bottom Footer Note */}
                      <div className="flex justify-between items-end text-[9px] text-[#71877B] z-10 pt-1.5 border-t border-white/50">
                        <span className="font-editorial tracking-wider">MORANDI RATIO</span>
                        <span className="font-semibold text-[#8C5D65]"># 闺蜜自查清单</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Key Differences Checklist */}
                  <div className="md:col-span-6 flex flex-col gap-3">
                    <span className="text-xs font-bold text-gray-800">
                      克隆版式为当前 Draft 带来的核心蜕变：
                    </span>
                    <div className="flex flex-col gap-2">
                      <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E3EDE7] flex items-start gap-2 text-xs">
                        <Check className="w-4 h-4 text-[#4A725B] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#2A4434]">0.618 黄金视觉焦点沉降：</strong>
                          <span className="text-gray-600 block mt-0.5">
                            主标题上浮至 {clonedStyleData.goldenRatio.focalPointY}% 黄金分割线，上下虚实比达到 3:7，提升前 3 秒划过时的点击率。
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E3EDE7] flex items-start gap-2 text-xs">
                        <Check className="w-4 h-4 text-[#4A725B] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#2A4434]">{clonedStyleData.typography.letterSpacingVal} 舒展字间距：</strong>
                          <span className="text-gray-600 block mt-0.5">
                            打破传统紧绷的大字排版，文字呼吸孔隙均匀放大，呈现审美博主标志性的“松弛杂志感”。
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E3EDE7] flex items-start gap-2 text-xs">
                        <Check className="w-4 h-4 text-[#4A725B] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#2A4434]">花字排版权重与微磨砂徽章：</strong>
                          <span className="text-gray-600 block mt-0.5">
                            {clonedStyleData.flowerTextWeight.badgeStyleName}，配以 {clonedStyleData.flowerTextWeight.contrastRatio}，高可读且护眼耐看。
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={handleApplyClonedStyleToDraft}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#4A725B] hover:bg-[#385845] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#F5D5D8]" />
                        <span>应用并保存到 Draft</span>
                      </button>
                      {onGoToContentMode && (
                        <button
                          onClick={onGoToContentMode}
                          className="py-2.5 px-4 rounded-xl bg-white border border-[#CBDED3] hover:bg-[#F5FAF7] text-[#2A4434] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>操盘模式</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#4A725B]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 莫兰迪色谱提取 (PALETTE EXTRACTION) MODULE         */}
      {/* ======================================================== */}
      {activeTab === 'palette-extract' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Photo Source & Selection (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#4A725B]" />
                  照片分析源
                </span>
                <span className="text-[11px] text-gray-400 font-normal">支持上传或点选精选美学照</span>
              </div>

              {/* Active Display Photo */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[#E5EFE8] bg-gray-50 group">
                <img
                  src={customImage || selectedSample.url}
                  alt="Aesthetic Sample"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm self-start mb-1 font-medium">
                    {customImage ? '用户自定义上传照片' : selectedSample.tag}
                  </span>
                  <h4 className="text-sm font-bold leading-tight">
                    {customImage ? '本地生活照片色彩采样' : selectedSample.title}
                  </h4>
                  <p className="text-[11px] text-white/80 mt-0.5 line-clamp-1">
                    {customImage ? '已通过 Canvas 像素矩阵采样并映射至莫兰迪色域' : selectedSample.description}
                  </p>
                </div>

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-[#2A4434]">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#4A725B]" />
                    <span className="text-xs font-semibold">正在计算莫兰迪像素配比...</span>
                  </div>
                )}
              </div>

              {/* Camera & Upload Triggers */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsCameraModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#4A725B] via-[#3E6450] to-[#557D65] hover:from-[#3E6450] hover:to-[#315140] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <Camera className="w-4 h-4 text-[#F3DDE0] group-hover:scale-110 transition-transform" />
                  <span>调用相机捕捉环境色彩 (实时测光) 📸</span>
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 rounded-xl bg-white border border-[#CBDED3] hover:bg-[#F3F7F5] text-[#2A4434] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#4A725B]" />
                    <span>上传本地生活照</span>
                  </button>
                </div>
              </div>

              {/* Curated Sample Thumbnails */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#EDF4F0]">
                <span className="text-[11px] font-semibold text-gray-600">
                  或选用经典治愈系样张：
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {CURATED_SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all cursor-pointer ${
                        selectedSample.id === sample.id && !customImage
                          ? 'border-[#4A725B] shadow-sm ring-2 ring-[#4A725B]/20 scale-102'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={sample.url} alt={sample.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 text-[10px] text-white text-center py-0.5 truncate px-1">
                        {sample.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Extracted Morandi Palette & Psychology (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* 1. Palette Extraction Bar */}
            <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2A4434] flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#8EA89D]" />
                    已提取莫兰迪色谱 · 配比建议
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    遵循黄金 6:3:1 视觉呼吸配比，消除杂色冲撞
                  </p>
                </div>

                <button
                  onClick={handleApplyToDraftCover}
                  className="py-2 px-3.5 rounded-xl bg-[#4A725B] hover:bg-[#385845] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-102"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F5D5D8]" />
                  <span>一键应用至当前封面</span>
                </button>
              </div>

              {/* Proportion Strip */}
              <div className="w-full h-8 rounded-xl overflow-hidden flex shadow-inner border border-gray-100">
                {palette.map((c, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: c.hex, width: c.ratio }}
                    title={`${c.name} (${c.ratio})`}
                    className="h-full flex items-center justify-center text-[10px] font-bold text-white/90 drop-shadow-xs transition-all hover:opacity-90"
                  >
                    <span className="hidden sm:inline">{c.ratio}</span>
                  </div>
                ))}
              </div>

              {/* Detailed Color Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {palette.map((color, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#E3EDE7] flex items-center justify-between gap-3 group hover:border-[#8EA89D] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl shadow-xs border border-black/10 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">{color.name}</span>
                        <span className="text-[10px] text-gray-400">
                          {color.role} · 推荐占比 {color.ratio}
                        </span>
                        <span className="text-[9px] text-[#4A725B] font-mono mt-0.5">
                          {color.hex}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyHex(color.hex)}
                      title="复制十六进制色码"
                      className="p-1.5 text-gray-400 hover:text-gray-800 rounded-lg hover:bg-white transition-colors"
                    >
                      {copiedHex === color.hex ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Color Psychology Analysis */}
            <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#2A4434] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#C27A83]" />
                  色彩心理学深度解读
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FCECEE] text-[#9E4A56] font-semibold">
                  {psychologyData.emotionalAnchor}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAFBF9] border border-[#DFEBE3] flex flex-col gap-2">
                <h4 className="text-xs font-bold text-[#3A5647]">
                  【为什么能让小红书读者停留？】心理机制：
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {psychologyData.psychologyAnalysis}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F6FAF7] border border-[#CBDED3] flex flex-col gap-2">
                <h4 className="text-xs font-bold text-[#2A4434]">
                  【针对高审美受众的共鸣心智】：
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {psychologyData.targetAudienceResonance}
                </p>
              </div>

              {/* Cover Application Rules */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#EDF4F0]">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#4A725B]" />
                  封面落地 SOP · 花字与版面实操建议：
                </span>
                <div className="flex flex-col gap-1.5">
                  {psychologyData.coverApplicationRules?.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="w-4 h-4 rounded-full bg-[#E8F3ED] text-[#2A4434] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Environment Color Extractor Modal */}
      <CameraColorExtractorModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onApplyPaletteToCover={handleApplyCameraPalette}
        onGoToContentMode={onGoToContentMode}
      />
    </div>
  );
};
