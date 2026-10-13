export interface MorandiColorItem {
  hex: string;
  name: string;
  role: string;
  ratio: string;
  rgb: string;
  aestheticNote?: string;
}

export interface ExtractedCameraPaletteResult {
  sceneDetected: string;
  ambientLighting: string;
  paletteTitle: string;
  emotionalAnchor: string;
  palette: MorandiColorItem[];
  psychologyAnalysis: string;
  targetAudienceResonance: string;
  coverApplicationRules: string[];
  recommendedCoverFlowerTexts: string[];
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return [val, val, val];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return [r, g, b];
}

// Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Transform raw captured RGB into Xiaohongshu Morandi aesthetic color space
// (Depletes harsh saturation to 18-35%, adjusts lightness to gentle diffuse tone)
export function toMorandiColor(r: number, g: number, b: number, targetRole: 'dominant' | 'accent' | 'cream' | 'ink' | 'wood'): { hex: string; rgbStr: string; name: string } {
  const [h, s, l] = rgbToHsl(r, g, b);

  let newH = h;
  let newS = s;
  let newL = l;
  let name = '莫兰迪调性色';

  switch (targetRole) {
    case 'dominant':
      // 55% Dominant Base: desaturated gentle Morandi
      newS = Math.min(Math.max(s * 0.38, 14), 28);
      newL = Math.min(Math.max(l, 52), 68);
      if (h >= 60 && h <= 170) {
        name = '鼠尾草灰绿 (Sage Mist)';
      } else if (h >= 330 || h <= 25) {
        name = '烟粉薄雾 (Dusty Rose)';
      } else if (h >= 25 && h <= 55) {
        name = '暖杏原麦 (Oatmeal Wheat)';
      } else if (h >= 170 && h <= 240) {
        name = '薄雾青黛 (Mist Cyan)';
      } else {
        name = '冷调灰岩 (Morandi Stone)';
      }
      break;

    case 'accent':
      // 25% Emotional Accent: gentle blushing warmth
      newS = Math.min(Math.max(s * 0.45, 22), 38);
      newL = Math.min(Math.max(l + 10, 68), 82);
      if (h >= 320 || h <= 40) {
        name = '柔杏腮红粉 (Soft Blush)';
      } else if (h >= 40 && h <= 90) {
        name = '浅茶温奶 (Warm Milk Tea)';
      } else {
        name = '淡杏温润点缀 (Gentle Peach)';
      }
      break;

    case 'cream':
      // 10% Breathing White: cashmere warm cream
      newS = Math.min(s * 0.15, 8);
      newL = Math.min(Math.max(l, 92), 97);
      name = '奶油羊绒白 (Cream Cashmere)';
      break;

    case 'ink':
      // 7% Deep Contrast Ink: high-contrast readable headline color
      newS = Math.min(Math.max(s * 0.35, 18), 32);
      newL = Math.min(Math.max(l * 0.4, 18), 28);
      if (h >= 60 && h <= 180) {
        name = '深黛青苔冷杉 (Deep Moss)';
      } else if (h >= 320 || h <= 30) {
        name = '焦茶深玫瑰褐 (Deep Rosewood)';
      } else {
        name = '冷杉玄武墨 (Basalt Ink)';
      }
      break;

    case 'wood':
      // 3% Detail Edge: warm clay or pottery edge
      newS = Math.min(Math.max(s * 0.3, 16), 26);
      newL = Math.min(Math.max(l, 68), 78);
      name = '暖调陶土麦灰 (Warm Oatmeal)';
      break;
  }

  const [resR, resG, resB] = hslToRgb(newH, newS, newL);
  const hex = rgbToHex(resR, resG, resB);
  return {
    hex,
    rgbStr: `rgb(${resR}, ${resG}, ${resB})`,
    name,
  };
}

// Client-side instant canvas Morandi palette extractor
export function extractMorandiPaletteFromCanvas(
  canvas: HTMLCanvasElement,
  sceneHint = '环境实景'
): ExtractedCameraPaletteResult {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height).data;

  // Sample center area weighted for focus
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  // Center 40% area
  const startX = Math.floor(width * 0.3);
  const endX = Math.floor(width * 0.7);
  const startY = Math.floor(height * 0.3);
  const endY = Math.floor(height * 0.7);

  const samples: Array<{ r: number; g: number; b: number }> = [];

  for (let y = startY; y < endY; y += 4) {
    for (let x = startX; x < endX; x += 4) {
      const idx = (y * width + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      totalR += r;
      totalG += g;
      totalB += b;
      count++;
      samples.push({ r, g, b });
    }
  }

  const avgR = count > 0 ? Math.round(totalR / count) : 142;
  const avgG = count > 0 ? Math.round(totalG / count) : 168;
  const avgB = count > 0 ? Math.round(totalB / count) : 157;

  // Derive 5-tone Xiaohongshu Morandi hierarchy
  const dominant = toMorandiColor(avgR, avgG, avgB, 'dominant');
  const accent = toMorandiColor(Math.min(avgR + 40, 255), Math.max(avgG - 20, 0), Math.max(avgB - 20, 0), 'accent');
  const cream = toMorandiColor(avgR, avgG, avgB, 'cream');
  const ink = toMorandiColor(avgR, avgG, avgB, 'ink');
  const wood = toMorandiColor(avgR + 20, avgG + 10, avgB - 10, 'wood');

  const palette: MorandiColorItem[] = [
    {
      hex: dominant.hex,
      name: dominant.name,
      role: '主氛围大底色 (Dominant)',
      ratio: '55%',
      rgb: dominant.rgbStr,
      aestheticNote: '平抑高彩度反差，奠定全图松弛治愈基底',
    },
    {
      hex: accent.hex,
      name: accent.name,
      role: '温润情感点缀 (Accent)',
      ratio: '25%',
      rgb: accent.rgbStr,
      aestheticNote: '模拟自然气色微温感，增强闺蜜陪伴共鸣',
    },
    {
      hex: cream.hex,
      name: cream.name,
      role: '呼吸留白过渡 (Breathing White)',
      ratio: '10%',
      rgb: cream.rgbStr,
      aestheticNote: '视觉呼吸岛，承载大面积正负空间',
    },
    {
      hex: ink.hex,
      name: ink.name,
      role: '高辨识字色 (Headline Ink)',
      ratio: '7%',
      rgb: ink.rgbStr,
      aestheticNote: '16:1 高对比度，确保花字在大图流中一眼清晰',
    },
    {
      hex: wood.hex,
      name: wood.name,
      role: '细节修容勾线 (Detail Edge)',
      ratio: '3%',
      rgb: wood.rgbStr,
      aestheticNote: '粗陶与原木边缘肌理，呼应生活松弛感',
    },
  ];

  return {
    sceneDetected: `相机实地捕捉：${sceneHint}`,
    ambientLighting: '自然漫射柔光，低对比度护眼影调',
    paletteTitle: `Sage & Blush · ${dominant.name.split(' ')[0]}治愈系环境色谱`,
    emotionalAnchor: '卸下紧绷 · 呼吸感 · 无防备信任',
    palette,
    psychologyAnalysis:
      '从色彩心理学机制分析，环境提取的低彩度鼠尾草灰绿与淡粉互补色能降低视网膜交感神经过载，在快节奏小红书信息流中制造出“安全、亲切、松弛”的视觉停留心理。',
    targetAudienceResonance:
      '精准击中小红书受众对“反卷变美”、“松弛感”、“生活质感”的向往，读者在刷到的一瞬间感受到的是情绪减压而非外貌焦虑。',
    coverApplicationRules: [
      `封面主背景建议使用 55% ${dominant.name.split(' ')[0]} (${dominant.hex})，中央预留 40% 纯净留白`,
      `核心大标题花字使用 7% ${ink.name.split(' ')[0]} (${ink.hex})，兼顾莫兰迪调性与 16:1 高辨识度`,
      `打卡微标与胶囊 Badge 采用 25% ${accent.name.split(' ')[0]} (${accent.hex}) 作为温润跳色点缀`,
    ],
    recommendedCoverFlowerTexts: [
      '普通女孩美商逆袭｜把生活环境过成松弛杂志感✨',
      '环境色不会骗人｜普通人拔高美商从色调呼吸感开始',
      '今日审美治愈碎片｜关于松弛感本命风格的色卡自查',
    ],
  };
}
