import React, { useRef, useState } from 'react';
import {
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  Copy,
  Check,
  Download,
  Palette,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { PostDraft } from '../types';
import { SAGE_BLUSH_PALETTES, SENSITIVE_WORDS_DB } from '../data/presets';

interface RedPostMockupProps {
  draft: PostDraft;
  onUpdateDraft?: (updated: Partial<PostDraft>) => void;
}

export const RedPostMockup: React.FC<RedPostMockupProps> = ({ draft, onUpdateDraft }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(draft.coverConfig.theme || 'sage-blush');
  const coverRef = useRef<HTMLDivElement>(null);

  const activePalette = SAGE_BLUSH_PALETTES.find((p) => p.id === selectedPaletteId) || SAGE_BLUSH_PALETTES[0];
  const clonedStyle = draft.coverConfig.clonedStyle;

  const titleFontClass =
    clonedStyle?.typography.fontFamilyFeel === 'sans-clean'
      ? 'font-sans'
      : clonedStyle?.typography.fontFamilyFeel === 'editorial-hand'
      ? 'font-editorial'
      : 'font-serif-sc';

  const titleWeightClass = clonedStyle?.flowerTextWeight.primaryTitleWeight || 'font-bold';
  const titleLetterSpacing = clonedStyle?.typography.letterSpacingVal;
  const subtitleGap = clonedStyle?.typography.subtitleGap ? `${clonedStyle.typography.subtitleGap}px` : '12px';

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyFull = () => {
    const fullText = `${draft.selectedTitle || draft.topic}

${draft.body}

${draft.seoTags.join(' ')}`;
    handleCopy(fullText, 'full');
  };

  const copyFullPackage = () => {
    const fullText = `【小红书标题】
${draft.selectedTitle || draft.topic}

【笔记正文】
${draft.body}

【SEO标签】
${draft.seoTags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ')}

【作者置顶沙发预埋 (评论区互动转化)】
${draft.pinnedComment || '姐妹们，打卡清单整理好啦！评论区留个【1】或报身高脸型，美商搭子帮你看～👇'}`;
    handleCopy(fullText, 'package');
  };

  const copyTitle = () => {
    handleCopy(draft.selectedTitle || draft.topic, 'title');
  };

  const copyBodyWithTags = () => {
    const text = `${draft.body}

${draft.seoTags.join(' ')}`;
    handleCopy(text, 'body');
  };

  // Instant sensitive word scan on body & title
  const combinedText = `${draft.selectedTitle} ${draft.body}`;
  const foundRisks = SENSITIVE_WORDS_DB.filter((item) => combinedText.includes(item.word));

  const wordCount = draft.body ? draft.body.replace(/\s+/g, '').length : 0;
  const isWordCountGood = wordCount >= 350 && wordCount <= 850;

  // Export cover as PNG via Canvas
  const handleExportCover = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1200; // 3:4 aspect ratio
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient based on active palette
    const grad = ctx.createLinearGradient(0, 0, 900, 1200);
    if (activePalette.previewHexes && activePalette.previewHexes.length >= 2) {
      grad.addColorStop(0, activePalette.previewHexes[3] || activePalette.previewHexes[0]);
      grad.addColorStop(0.5, activePalette.previewHexes[1]);
      grad.addColorStop(1, activePalette.previewHexes[0]);
    } else {
      grad.addColorStop(0, '#EBF2EE');
      grad.addColorStop(0.5, '#FDF8F7');
      grad.addColorStop(1, '#F5E4E3');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 1200);

    // Decorative border
    ctx.strokeStyle = '#D9E4DD';
    ctx.lineWidth = 12;
    ctx.strokeRect(36, 36, 900 - 72, 1200 - 72);

    // Inner subtle hairline
    ctx.strokeStyle = '#EBDAD8';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, 900 - 96, 1200 - 96);

    // Top Brand Badge
    ctx.fillStyle = '#6E947C';
    ctx.beginPath();
    ctx.roundRect(450 - 150, 120, 300, 50, [25]);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(draft.coverConfig.badge || '美商逆袭 · 打卡日常', 450, 152);

    // Main Title (Large, Serif SC feel)
    ctx.fillStyle = '#2A3C32';
    ctx.font = 'bold 56px "Noto Serif SC", serif, sans-serif';
    const mainTitle = draft.coverConfig.mainTitle || draft.selectedTitle || draft.topic;

    // Wrap main title into lines of ~12 chars
    const lines = [];
    for (let i = 0; i < mainTitle.length; i += 11) {
      lines.push(mainTitle.slice(i, i + 11));
    }
    const startY = 460 - (lines.length * 36);
    lines.forEach((line, idx) => {
      ctx.fillText(line, 450, startY + (idx * 78));
    });

    // Decorative blush leaf divider
    ctx.fillStyle = '#C27A83';
    ctx.font = '28px sans-serif';
    ctx.fillText('✦  ✦  ✦', 450, startY + (lines.length * 78) + 30);

    // Subtitle
    ctx.fillStyle = '#667B70';
    ctx.font = '32px sans-serif';
    ctx.fillText(draft.coverConfig.subTitle || 'Sage & Blush 治愈系审美 · 普通女孩自查清单', 450, startY + (lines.length * 78) + 95);

    // Bottom Footer
    ctx.fillStyle = '#8FA89B';
    ctx.font = '24px "Cinzel", serif, sans-serif';
    ctx.fillText('ESTHETICS COMPANION · SAGE & BLUSH', 450, 1110);

    // Download PNG
    const link = document.createElement('a');
    link.download = `小红书美商封面-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top quick action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#F6FAF7] border border-[#DEEBE2]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#3D5A4A] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#7EA38E]" />
            小红书真机模拟预览
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              isWordCountGood
                ? 'bg-[#EBF5EE] text-[#3E7051] border border-[#D2E7DA]'
                : 'bg-[#FFF3E0] text-[#B26A00] border border-[#FFE0B2]'
            }`}
          >
            正文 {wordCount} 字 {isWordCountGood ? '(符合400-800字规范)' : '(建议400-800字)'}
          </span>
          {foundRisks.length > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#FDE8E8] text-[#9B2C2C] border border-[#F8B4B4] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              疑似敏感词 {foundRisks.length} 处
            </span>
          )}
        </div>

        {/* Copy actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={copyTitle}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-[#D6E3DA] text-[#426150] hover:bg-[#F2F7F4] flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedType === 'title' ? <Check className="w-3.5 h-3.5 text-[#5B886E]" /> : <Copy className="w-3.5 h-3.5" />}
            标题
          </button>
          <button
            onClick={copyBodyWithTags}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-[#D6E3DA] text-[#426150] hover:bg-[#F2F7F4] flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedType === 'body' ? <Check className="w-3.5 h-3.5 text-[#5B886E]" /> : <Copy className="w-3.5 h-3.5" />}
            正文+标签
          </button>
          <button
            onClick={copyFullPackage}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#6E947C] to-[#C27A83] text-white hover:opacity-95 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="一键复制【标题+正文+标签+置顶沙发】发帖全套"
          >
            {copiedType === 'package' ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>复制发帖全套包</span>
          </button>
        </div>
      </div>

      {/* Phone container */}
      <div className="mx-auto w-full max-w-[400px] bg-white rounded-[40px] shadow-morandi-lg border-[6px] border-[#2A332E] overflow-hidden flex flex-col relative text-[#222]">
        {/* Device Status Bar */}
        <div className="pt-2 px-6 pb-1 flex justify-between items-center text-[12px] font-semibold text-[#1C1F1D] bg-white">
          <span>9:41</span>
          <div className="w-20 h-4 bg-black rounded-full mx-auto -mt-1"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2 rounded-[2px] border border-black p-[1px]">
              <div className="w-full h-full bg-black rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {/* XiaoHongShu App Header */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9EB9AA] to-[#E9C3C6] p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#FAFBF9] flex items-center justify-center text-xs font-bold text-[#516E5D]">
                🌱
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xs text-gray-800">美商陪伴官</span>
                <span className="text-[10px] bg-[#F7EEEE] text-[#C27A83] px-1 rounded">搭子</span>
              </div>
              <span className="text-[10px] text-gray-400">刚刚 · 审美打卡中</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF2442] text-white cursor-pointer hover:bg-[#E01E38] transition-colors">
              + 关注
            </button>
            <button className="text-gray-500 hover:text-gray-800 p-1">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Post Content */}
        <div className="max-h-[560px] overflow-y-auto divide-y divide-gray-100">
          {/* Visual Cover (3:4 ratio) */}
          <div className="relative group">
            <div
              ref={coverRef}
              className={`w-full aspect-[3/4] ${activePalette.bg} relative flex flex-col justify-between p-6 transition-all duration-300 border-b border-[#E2ECE5] overflow-hidden`}
            >
              {/* Subtle aesthetic backdrop accents */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#95B1A2]/15 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D18E95]/15 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16"></div>

              {/* Base background image if selected from gallery */}
              {draft.coverConfig.backgroundImage && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={draft.coverConfig.backgroundImage}
                    alt="Cover Background"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-opacity duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle translucent Morandi gradient wash over photo for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/40 to-white/60 backdrop-blur-[0.5px]"></div>
                </div>
              )}

              {/* Layout 1: Magazine (经典破框杂志风) */}
              {(!draft.coverConfig.layout || draft.coverConfig.layout === 'magazine') && (
                <>
                  {/* Decorative inner frame */}
                  <div className="absolute inset-3 border border-white/70 rounded-2xl pointer-events-none z-10"></div>

                  {/* Top tag badge */}
                  <div className="flex justify-between items-center z-10">
                    {clonedStyle?.flowerTextWeight.badgeStyle === 'glass-frosted' ? (
                      <span className="bg-white/60 backdrop-blur-md border border-white/80 text-[#24392D] text-[11px] font-semibold tracking-wider px-3 py-1 rounded-full shadow-xs">
                        {draft.coverConfig.badge || '美商逆袭 · 日常打卡'}
                      </span>
                    ) : clonedStyle?.flowerTextWeight.badgeStyle === 'pill-outline' ? (
                      <span className="border border-[#4A725B] text-[#345742] bg-white/40 text-[11px] font-semibold tracking-wider px-3 py-0.5 rounded-full">
                        {draft.coverConfig.badge || '美商逆袭 · 日常打卡'}
                      </span>
                    ) : (
                      <span
                        style={{ backgroundColor: activePalette.accentBg }}
                        className="text-white text-[11px] font-semibold tracking-wider px-3 py-1 rounded-full shadow-sm"
                      >
                        {draft.coverConfig.badge || '美商逆袭 · 日常打卡'}
                      </span>
                    )}
                    <span className="text-[10px] font-medium tracking-widest text-[#71877B] uppercase font-editorial">
                      {clonedStyle ? 'CLONED AESTHETIC' : 'Sage & Blush'}
                    </span>
                  </div>

                  {/* Center Main Flower Text */}
                  <div
                    className="my-auto text-center z-10 px-2 py-4"
                    style={{
                      transform: clonedStyle?.goldenRatio.focalPointY
                        ? `translateY(${((clonedStyle.goldenRatio.focalPointY - 50) * 0.4).toFixed(0)}px)`
                        : undefined,
                    }}
                  >
                    <p className="text-[11px] tracking-[0.25em] font-medium text-[#7C9387] mb-2 font-editorial">
                      {clonedStyle ? '✦ STYLE CLONED · GOLDEN RATIO ✦' : '✦ AESTHETIC BLUEPRINT ✦'}
                    </p>
                    <h2
                      className={`${titleFontClass} ${titleWeightClass} text-2xl text-[#26372E] leading-snug drop-shadow-xs`}
                      style={{ letterSpacing: titleLetterSpacing }}
                    >
                      {draft.coverConfig.mainTitle || draft.selectedTitle || draft.topic || '普通女孩美商逆袭'}
                    </h2>
                    <div className="w-12 h-[2px] bg-[#C27A83]/50 mx-auto my-3 rounded-full"></div>
                    <p
                      className="text-xs font-medium text-[#577063] leading-relaxed max-w-[260px] mx-auto"
                      style={{ marginTop: subtitleGap }}
                    >
                      {draft.coverConfig.subTitle || '告别同质化焦虑 · 找对你的松弛感本命风格'}
                    </p>
                  </div>

                  {/* Bottom footer note */}
                  <div className="flex justify-between items-end text-[10px] text-[#71877B] z-10 pt-2 border-t border-white/50">
                    <span className="font-editorial tracking-wider">MORANDI SAGE PALETTE</span>
                    <span className="text-[10px] font-semibold text-[#8C5D65]"># 闺蜜陪伴式自查</span>
                  </div>
                </>
              )}

              {/* Layout 2: Minimal Zen (呼吸留白极简风) */}
              {draft.coverConfig.layout === 'minimal-zen' && (
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] tracking-widest font-mono text-[#4C6656] bg-white/70 px-2 py-0.5 rounded backdrop-blur-xs">
                      VOL. 01 / MORANDI
                    </span>
                    <span className="text-[10px] text-[#7B9285] font-light tracking-widest">
                      CALM & HEALING
                    </span>
                  </div>

                  {/* Left-aligned negative space layout */}
                  <div className="my-auto text-left pl-1 pr-4">
                    <div className="inline-block mb-3 px-2.5 py-0.5 rounded-full bg-[#EBF3EF] border border-[#CDE0D5] text-[#365744] text-[10px] font-semibold">
                      {draft.coverConfig.badge || '松弛美学 · 清单'}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1F3327] leading-snug">
                      {draft.coverConfig.mainTitle || draft.selectedTitle || draft.topic || '普通女孩美商逆袭'}
                    </h2>
                    <div className="w-8 h-[2px] bg-[#6E947C] my-3"></div>
                    <p className="text-xs text-[#526D5E] font-normal leading-relaxed">
                      {draft.coverConfig.subTitle || '告别同质化焦虑 · 找对你的松弛感本命风格'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#DFEBE3]/80 flex justify-between items-center text-[10px] text-[#6E8879]">
                    <span>LESS IS MORE</span>
                    <span className="text-[#A26D74] font-medium">@美商陪伴搭子</span>
                  </div>
                </div>
              )}

              {/* Layout 3: Bold Contrast (双层对比重字风) */}
              {draft.coverConfig.layout === 'bold-contrast' && (
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-center items-center pt-1">
                    <span className="px-3.5 py-1 rounded-full bg-[#C27A83] text-white text-[11px] font-bold shadow-xs tracking-wider">
                      🔥 {draft.coverConfig.badge || '爆款变美自查'}
                    </span>
                  </div>

                  {/* High CTR contrasting text block */}
                  <div className="my-auto text-center px-1">
                    <div className="inline-block px-3 py-1 bg-[#2D4838] text-white font-extrabold text-sm rounded-lg mb-2 shadow-xs">
                      {(draft.coverConfig.mainTitle || draft.selectedTitle || draft.topic || '普通女孩').slice(0, 6)}
                    </div>
                    <h2 className="text-[26px] font-black text-[#1C2C23] leading-tight tracking-tight drop-shadow-xs">
                      {(draft.coverConfig.mainTitle || draft.selectedTitle || draft.topic || '美商逆袭思路').slice(6) || '逆袭全攻略'}
                    </h2>
                    <div className="mt-3.5 px-3 py-1.5 rounded-xl bg-white/80 border border-[#D5E4DB] backdrop-blur-xs inline-block">
                      <p className="text-xs font-bold text-[#8C4E57]">
                        ⚡ {draft.coverConfig.subTitle || '告别无用无效折腾 · 看准这4点就够了'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold text-[#4B6858] pb-1 border-t border-black/10">
                    <span>收藏率 98% 推荐</span>
                    <span className="text-[#C27A83]">点击进入正文 ↗</span>
                  </div>
                </div>
              )}

              {/* Layout 4: Poster Center (居中沉浸画报风) */}
              {draft.coverConfig.layout === 'poster-center' && (
                <div className="relative z-10 h-full flex flex-col justify-between items-center text-center">
                  <span className="text-[10px] tracking-[0.3em] text-[#556F60] uppercase font-editorial pt-2">
                    — AESTHETIC ARCHIVE —
                  </span>

                  {/* Centered square art frame */}
                  <div className="p-4 rounded-2xl bg-white/75 border border-[#CCDCD2] shadow-sm backdrop-blur-sm max-w-[280px] w-full my-auto flex flex-col items-center">
                    <span className="text-[10px] font-semibold text-[#C27A83] tracking-widest uppercase mb-1">
                      {draft.coverConfig.badge || 'AESTHETIC ESSAY'}
                    </span>
                    <h2 className="font-serif-sc font-bold text-xl text-[#24352B] leading-snug tracking-normal my-1">
                      {draft.coverConfig.mainTitle || draft.selectedTitle || draft.topic || '普通女孩美商逆袭'}
                    </h2>
                    <div className="w-6 h-[1.5px] bg-[#6E947C] my-2"></div>
                    <p className="text-[11px] font-serif-sc text-[#5B7365] leading-relaxed">
                      {draft.coverConfig.subTitle || '用温柔的自律，对抗时间的磨损'}
                    </p>
                  </div>

                  <div className="text-[10px] text-[#7A9384] font-editorial tracking-widest pb-1">
                    ISSUE NO. 07 · MORANDI SERIES
                  </div>
                </div>
              )}
            </div>

            {/* Quick floating cover tools */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleExportCover}
                title="导出封面图片 (900x1200)"
                className="px-2.5 py-1 rounded-full bg-black/70 hover:bg-black text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-sm cursor-pointer shadow"
              >
                <Download className="w-3 h-3" />
                导出封面
              </button>
            </div>
          </div>

          {/* Palette switcher pills */}
          <div className="px-4 py-2.5 bg-[#F9FBFA] flex items-center justify-between gap-2 text-xs">
            <span className="text-gray-500 flex items-center gap-1 text-[11px]">
              <Palette className="w-3.5 h-3.5 text-[#7A9E8A]" />
              封面莫兰迪调色：
            </span>
            <div className="flex items-center gap-1.5">
              {SAGE_BLUSH_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  onClick={() => {
                    setSelectedPaletteId(palette.id);
                    onUpdateDraft?.({
                      coverConfig: {
                        ...draft.coverConfig,
                        theme: palette.id as any,
                      },
                    });
                  }}
                  title={palette.name}
                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer flex items-center justify-center p-[2px] ${
                    selectedPaletteId === palette.id ? 'border-gray-800 scale-110 shadow-xs' : 'border-gray-200'
                  }`}
                >
                  <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: palette.previewHexes[0] }}
                  ></div>
                </button>
              ))}
            </div>
          </div>

          {/* Post Content Area */}
          <div className="p-4 bg-white flex flex-col gap-3">
            {/* Title */}
            <h3 className="font-bold text-base text-gray-900 leading-snug">
              {draft.selectedTitle || draft.topic || '这里是爆款标题'}
            </h3>

            {/* Body */}
            <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap font-normal selection:bg-[#E8F1EC]">
              {draft.body || '正文内容将在此处展示，包含 Emoji 分段排版与闺蜜式陪伴语调…'}
            </div>

            {/* SEO Tag Cloud */}
            {draft.seoTags && draft.seoTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                {draft.seoTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs text-[#3B6652] hover:text-[#254234] font-medium cursor-pointer"
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}

            {/* Skill 7: 评论区置顶沙发预埋互动区 */}
            <div className="mt-2 p-3 bg-[#FAF8F5] rounded-2xl border border-[#EDE3D6] flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8F593E] flex items-center gap-1">
                  📌 作者置顶沙发预埋 (Skill 7: 互动转化 SOP)
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      draft.pinnedComment ||
                        '姐妹们，打卡清单整理好啦！评论区留个【1】或报身高脸型，美商搭子帮你看～👇',
                      'pinned'
                    )
                  }
                  className="text-[10px] text-[#8F593E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'pinned' ? <Check className="w-3 h-3 text-[#5B886E]" /> : <Copy className="w-3 h-3" />}
                  复制置顶沙发
                </button>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed bg-white/90 p-2 rounded-xl border border-[#E9DFD2]">
                {draft.pinnedComment ||
                  '姐妹们，打卡清单整理在置顶啦！评论区留个【1】或报你的脸型/肤质，美商搭子帮你看～👇'}
              </p>
            </div>

            {/* Post metadata */}
            <div className="text-[11px] text-gray-400 pt-1 flex justify-between">
              <span>今天 18:30 · 杭州</span>
              <span>未经授权禁止转载</span>
            </div>
          </div>
        </div>

        {/* XiaoHongShu Interactive Footer */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between text-gray-600">
          <div className="flex-1 mr-3">
            <div className="bg-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-400 flex items-center">
              说点什么，和打卡搭子交流…
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1 cursor-pointer hover:text-[#FF2442] transition-colors">
              <Heart className="w-4 h-4 text-[#FF2442]" fill="#FF2442" />
              <span>1.8k</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-amber-500 transition-colors">
              <Bookmark className="w-4 h-4 text-amber-500" fill="#F59E0B" />
              <span>3.2k</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4 text-gray-600" />
              <span>428</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
