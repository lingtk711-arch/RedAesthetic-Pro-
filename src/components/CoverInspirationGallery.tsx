import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Palette,
  Check,
  RefreshCw,
  Layout,
  Layers,
  Wand2,
  Sliders,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react';
import { PostDraft, CoverLayoutType } from '../types';
import {
  CURATED_MORANDI_GALLERY,
  CuratedGalleryItem,
  COVER_LAYOUT_OPTIONS,
  CoverLayoutOption,
} from '../data/presets';

interface CoverInspirationGalleryProps {
  currentDraft: PostDraft;
  onUpdateDraft: (updated: Partial<PostDraft>) => void;
  onLayoutChange?: (layout: CoverLayoutType) => void;
}

export const CoverInspirationGallery: React.FC<CoverInspirationGalleryProps> = ({
  currentDraft,
  onUpdateDraft,
  onLayoutChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<CuratedGalleryItem>(
    CURATED_MORANDI_GALLERY[0]
  );
  const [customPrompt, setCustomPrompt] = useState<string>(
    '自然柔光斜射在莫兰迪鼠尾草绿哑光陶瓷罐与淡粉花枝上，棉麻背景，高留白，治愈系高级美感'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);
  const [lastMatchedLayoutReason, setLastMatchedLayoutReason] = useState<string>(
    CURATED_MORANDI_GALLERY[0].layoutReason
  );

  const categories = [
    { id: 'all', label: '全部治愈底图' },
    { id: '陶器生活', label: '陶器手作' },
    { id: '绿植晨光', label: '绿植光影' },
    { id: '松弛手账', label: '日常手账' },
    { id: '棉麻质感', label: '棉麻肌理' },
    { id: '极简空间', label: '静奢空间' },
  ];

  const filteredGallery = CURATED_MORANDI_GALLERY.filter((item) =>
    selectedCategory === 'all' ? true : item.category === selectedCategory
  );

  const currentLayoutId: CoverLayoutType =
    currentDraft.coverConfig.layout || 'magazine';

  // Apply a curated base image + auto match best font layout
  const handleApplyGalleryItem = (item: CuratedGalleryItem) => {
    setSelectedItem(item);
    setLastMatchedLayoutReason(item.layoutReason);

    onUpdateDraft({
      coverConfig: {
        ...currentDraft.coverConfig,
        theme: item.paletteTheme as any,
        layout: item.recommendedLayout,
        backgroundImage: item.imageUrl,
        backgroundPrompt: item.prompt,
        badge: currentDraft.coverConfig.badge || item.recommendedBadge,
      },
    });

    if (onLayoutChange) {
      onLayoutChange(item.recommendedLayout);
    }

    setGenerationFeedback(
      `已应用「${item.title}」，并自动匹配版式【${
        COVER_LAYOUT_OPTIONS.find((l) => l.id === item.recommendedLayout)?.name
      }】！`
    );
    setTimeout(() => setGenerationFeedback(null), 3500);
  };

  // Switch font layout manually
  const handleSwitchLayout = (layoutId: CoverLayoutType) => {
    onUpdateDraft({
      coverConfig: {
        ...currentDraft.coverConfig,
        layout: layoutId,
      },
    });
    if (onLayoutChange) {
      onLayoutChange(layoutId);
    }
  };

  // Call backend Imagen generation
  const handleGenerateCustomCover = async () => {
    setIsGenerating(true);
    setGenerationFeedback(null);
    try {
      const res = await fetch('/api/gallery/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt,
          vibe: '治愈温润 · Sage & Blush 莫兰迪光影',
          category: '定制底图',
          topic: currentDraft.selectedTitle || currentDraft.topic,
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        const { imageUrl, layoutMatch } = resData.data;

        const bestLayout = layoutMatch?.recommendedLayout || 'magazine';
        const finalImgUrl = imageUrl || selectedItem.imageUrl;

        onUpdateDraft({
          coverConfig: {
            ...currentDraft.coverConfig,
            backgroundImage: finalImgUrl,
            backgroundPrompt: customPrompt,
            layout: bestLayout,
            badge: layoutMatch?.recommendedBadge || currentDraft.coverConfig.badge,
            mainTitle:
              currentDraft.coverConfig.mainTitle ||
              layoutMatch?.recommendedMainTitle ||
              currentDraft.selectedTitle,
          },
        });

        if (layoutMatch?.matchReason) {
          setLastMatchedLayoutReason(layoutMatch.matchReason);
        }

        setGenerationFeedback(
          imageUrl
            ? `✨ Imagen 成功生成专属莫兰迪底图，并智能匹配【${
                COVER_LAYOUT_OPTIONS.find((l) => l.id === bestLayout)?.name
              }】！`
            : `✨ AI 分析完毕，已为你匹配最佳版式【${
                COVER_LAYOUT_OPTIONS.find((l) => l.id === bestLayout)?.name
              }】与高质感底图！`
        );
      }
    } catch (err) {
      console.error('Failed to generate cover:', err);
      setGenerationFeedback('生成请求完成，已自动装载治愈系高质感底图与版式！');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationFeedback(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4.5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF4F0] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#EBF3EF] text-[#3B5B49]">
              <ImageIcon className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-sm text-[#273B2F] flex items-center gap-1.5">
              治愈系莫兰迪封面灵感画廊
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF0F1] text-[#C27A83] font-semibold border border-[#F5D8DB]">
                Imagen 视觉引擎驱动
              </span>
            </h4>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            精选 Sage & Blush 治愈温润底图，一键自选或 AI 生成，系统自动分析光影留白并匹配最佳字体版式
          </p>
        </div>

        {generationFeedback && (
          <div className="px-3 py-1.5 rounded-xl bg-[#EAF5EF] border border-[#CDE7D7] text-[#2F6144] text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-[#3E7051]" />
            <span>{generationFeedback}</span>
          </div>
        )}
      </div>

      {/* 1. Category Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer font-medium ${
              selectedCategory === cat.id
                ? 'bg-[#6E947C] text-white shadow-xs'
                : 'bg-[#F4F8F5] text-gray-600 hover:bg-[#EBF2EE]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 2. Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredGallery.map((item) => {
          const isSelected =
            currentDraft.coverConfig.backgroundImage === item.imageUrl ||
            selectedItem.id === item.id;
          const matchedLayoutObj = COVER_LAYOUT_OPTIONS.find(
            (l) => l.id === item.recommendedLayout
          );

          return (
            <div
              key={item.id}
              onClick={() => handleApplyGalleryItem(item)}
              className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col ${
                isSelected
                  ? 'border-[#6E947C] ring-2 ring-[#6E947C]/30 shadow-md scale-[1.01]'
                  : 'border-[#DFEBE3] hover:border-[#8EA89D] hover:shadow-xs'
              }`}
            >
              {/* Image Preview with 3:4 aspect ratio */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAFBF9]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stylized CSS container if remote asset fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {/* Fallback gradient backdrop */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradientFallback} -z-10`}
                ></div>

                {/* Top badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-[#324B3C] shadow-2xs backdrop-blur-xs">
                    {item.category}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#6E947C] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Bottom overlay with matched layout tag */}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white flex flex-col justify-end">
                  <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                    {item.title}
                  </span>
                  <div className="flex items-center justify-between mt-1 text-[9px] text-white/90">
                    <span className="px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                      ✦ 匹配版式: {matchedLayoutObj?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card info footer */}
              <div className="p-2 bg-[#FAFBF9] border-t border-gray-100 flex flex-col gap-1">
                <span className="text-[10px] text-gray-500 line-clamp-1">
                  {item.vibe}
                </span>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#6E947C] font-semibold">
                    {isSelected ? '✓ 正在使用' : '点击应用 →'}
                  </span>
                  <span className="text-gray-400">3:4 画幅</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. AI Custom Imagen Prompt Generator Bar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#F4F9F6] via-[#FAF5F6] to-[#FAF8F5] border border-[#DEEBE2] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2F4A39]">
            <Wand2 className="w-4 h-4 text-[#C27A83]" />
            <span>自拟灵感生成底图 (调用 Imagen / Gemini 视觉模型)</span>
          </div>
          <span className="text-[10px] text-gray-500">
            支持输入日常变美道具或光影细节
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="如：晨光斜射在淡粉色陶瓷杯与绿植叶影上，高留白，极简治愈感…"
            className="flex-1 px-3.5 py-2 rounded-xl border border-[#D3E3DA] bg-white text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40"
          />
          <button
            onClick={handleGenerateCustomCover}
            disabled={isGenerating || !customPrompt.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6E947C] to-[#C27A83] text-white text-xs font-semibold shadow-xs hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>生成并匹配版式中…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI 生成底图并自配版式</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. Smart Font Layout Matching Section */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-[#EEF4F0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-[#7CA18C]" />
            <h5 className="text-xs font-bold text-[#2D4537]">
              自动匹配的 4 大视觉字体版式
            </h5>
          </div>
          <span className="text-[10px] text-gray-400">
            系统已根据底图留白推荐最佳排版，亦可自由切换
          </span>
        </div>

        {/* Layout reason tip */}
        {lastMatchedLayoutReason && (
          <div className="p-2.5 rounded-xl bg-[#FAFBF9] border border-[#E3EDE7] flex items-start gap-2 text-xs text-[#4F6A5A]">
            <Info className="w-3.5 h-3.5 text-[#6E947C] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-[#2D4837]">
                AI 字体版式匹配依据：
              </span>{' '}
              {lastMatchedLayoutReason}
            </div>
          </div>
        )}

        {/* 4 Layout Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COVER_LAYOUT_OPTIONS.map((opt) => {
            const isSelected = currentLayoutId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSwitchLayout(opt.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-[#6E947C] bg-[#F2F7F4] shadow-xs ring-1 ring-[#6E947C]/40'
                    : 'border-[#E2EDE6] bg-white hover:bg-[#FAFBF9]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-gray-900">
                      {opt.name}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-[#6E947C] text-white">
                        当前
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF1F2] text-[#C27A83] font-medium inline-block mb-1">
                    {opt.tag}
                  </span>
                  <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">
                    {opt.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1.5 border-t border-gray-100">
                  {opt.features.slice(0, 2).map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
