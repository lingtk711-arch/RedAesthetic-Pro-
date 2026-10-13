import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
  BookmarkCheck,
  MessageSquare,
  Eye,
  Check,
  Copy,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Wand2,
  Zap,
  Grid,
  Layers,
  Plus,
  Trash2,
  GripHorizontal,
  Move,
  RefreshCw,
  Palette,
  Maximize2,
  BookOpen,
} from 'lucide-react';

export interface SparkIdea {
  id: string;
  type: string;
  topic: string;
  goldenTitle: string;
  angle: string;
  audience: string;
  keyPoints: string;
  aestheticStyle: string;
  hookFormula: string;
  viralScore: number;
  viralTier: string;
  viralReasons: string[];
  metricsAnalysis: {
    empathyHook: number;
    saveRate: number;
    ctrClick: number;
    discussion: number;
  };
  coverAdvice: string;
}

export interface BrainstormResult {
  sparkFragment: string;
  brainstormSummary: string;
  ideas: SparkIdea[];
}

export interface VisualStyleOutline {
  themeName: string;
  aestheticEssence: string;
  colorRatio: string;
  recommendedHexes: string[];
  coverLayout: {
    composition: string;
    flowerText: string;
    whitespace: string;
  };
  carouselSop: Array<{
    page: number;
    title: string;
    description: string;
  }>;
  propsAndLighting: string;
  goldenTitle: string;
}

interface WhiteboardFragment {
  id: string;
  text: string;
  tag: string;
  colorBg: string;
  selected: boolean;
}

interface InspirationSparkModuleProps {
  onApplyTopic: (idea: SparkIdea) => void;
  currentTopic?: string;
}

const PRESET_SPARKS = [
  '戴黑框眼镜总被说呆板，怎么穿搭妆容逆袭高级知性感',
  '方圆脸到底怎么画出松弛感腮红，拒绝显脸大',
  '早八通勤如何用莫兰迪穿出老钱风与清冷感',
  '发缝宽显得人苍老疲惫，低成本视觉逆袭技巧',
  '淡妆没气色、浓妆又显脏显老，普通人怎么破局',
];

const INITIAL_WHITEBOARD_FRAGMENTS: WhiteboardFragment[] = [
  { id: 'wb-1', text: '黑框眼镜自带学究钝感', tag: '痛点', colorBg: '#FAF1F0', selected: true },
  { id: 'wb-2', text: '方圆脸下颌骨量感偏重', tag: '骨相', colorBg: '#F0F6F2', selected: true },
  { id: 'wb-3', text: '淡杏裸粉松弛感腮红', tag: '妆容', colorBg: '#FDF8F5', selected: true },
  { id: 'wb-4', text: '早八10分钟伪素颜通勤', tag: '场景', colorBg: '#F3F7F5', selected: false },
  { id: 'wb-5', text: '莫兰迪鼠尾草绿耳饰点睛', tag: '配饰', colorBg: '#F0F5F2', selected: true },
  { id: 'wb-6', text: '头顶蓬松拉长纵向比例', tag: '技巧', colorBg: '#F9F5F1', selected: false },
];

export const InspirationSparkModule: React.FC<InspirationSparkModuleProps> = ({
  onApplyTopic,
  currentTopic,
}) => {
  const [activeTab, setActiveTab] = useState<'brainstorm' | 'whiteboard'>('brainstorm');
  const [fragmentInput, setFragmentInput] = useState('');
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [brainstormResult, setBrainstormResult] = useState<BrainstormResult | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [appliedIdeaId, setAppliedIdeaId] = useState<string | null>(null);
  const [copiedTitleId, setCopiedTitleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Whiteboard specific state
  const [whiteboardFragments, setWhiteboardFragments] = useState<WhiteboardFragment[]>(INITIAL_WHITEBOARD_FRAGMENTS);
  const [newFragmentText, setNewFragmentText] = useState('');
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [visualOutline, setVisualOutline] = useState<VisualStyleOutline | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [outlineApplied, setOutlineApplied] = useState(false);

  // Drag and drop ordering for whiteboard cards
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleBrainstorm = async (textToUse?: string) => {
    const text = (textToUse !== undefined ? textToUse : fragmentInput).trim();
    if (!text) return;

    setIsBrainstorming(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/brainstorm-sparks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fragment: text }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setBrainstormResult(resData.data);
        setIsOpen(true);
      } else {
        throw new Error(resData.error || '头脑风暴生成失败');
      }
    } catch (err: any) {
      console.error('Brainstorm error:', err);
      setErrorMessage(err.message || '生成失败，请稍后重试');
    } finally {
      setIsBrainstorming(false);
    }
  };

  const handleSelectChip = (chip: string) => {
    setFragmentInput(chip);
    handleBrainstorm(chip);
  };

  const handleCopyTitle = (title: string, id: string) => {
    navigator.clipboard.writeText(title);
    setCopiedTitleId(id);
    setTimeout(() => setCopiedTitleId(null), 2000);
  };

  const handleApply = (idea: SparkIdea) => {
    setAppliedIdeaId(idea.id);
    onApplyTopic(idea);
    setTimeout(() => setAppliedIdeaId(null), 2500);
  };

  // --- Whiteboard Handlers ---
  const handleToggleFragmentSelect = (id: string) => {
    setWhiteboardFragments((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f))
    );
  };

  const handleAddWhiteboardFragment = () => {
    const text = newFragmentText.trim();
    if (!text) return;

    const newFrag: WhiteboardFragment = {
      id: `wb-${Date.now()}`,
      text,
      tag: '灵感',
      colorBg: '#FAF1F0',
      selected: true,
    };

    setWhiteboardFragments((prev) => [newFrag, ...prev]);
    setNewFragmentText('');
  };

  const handleDeleteWhiteboardFragment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWhiteboardFragments((prev) => prev.filter((f) => f.id !== id));
  };

  // Drag-and-drop reorder
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;

    const updated = [...whiteboardFragments];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(idx, 0, draggedItem);
    setDraggedIndex(idx);
    setWhiteboardFragments(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Generate visual style outline with Gemini
  const handleGenerateWhiteboardOutline = async () => {
    const activeFragments = whiteboardFragments.filter((f) => f.selected);
    if (activeFragments.length === 0) {
      setErrorMessage('请至少在白板中勾选 1 个灵感碎片进行组合！');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setIsGeneratingOutline(true);
    setOutlineApplied(false);

    try {
      const res = await fetch('/api/gemini/whiteboard-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragments: activeFragments.map((f) => f.text),
          activeClusterName: activeFragments.map((f) => f.text).slice(0, 3).join(' × '),
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        setVisualOutline(resData.data);
      } else {
        throw new Error(resData.error || '大纲生成失败');
      }
    } catch (err: any) {
      console.warn('Whiteboard outline generation failed:', err);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  // Apply outline to draft
  const handleApplyWhiteboardOutline = () => {
    if (!visualOutline) return;

    const activeFragments = whiteboardFragments.filter((f) => f.selected);
    const convertedIdea: SparkIdea = {
      id: `outline-${Date.now()}`,
      type: '白板视觉大纲整合型',
      topic: visualOutline.goldenTitle || visualOutline.themeName,
      goldenTitle: visualOutline.goldenTitle,
      angle: visualOutline.aestheticEssence,
      audience: '追求松弛高级感、注重生活美学细节的小红书受众',
      keyPoints: visualOutline.carouselSop.map((s) => `${s.title}: ${s.description}`).join('；'),
      aestheticStyle: visualOutline.themeName,
      hookFormula: '灵感白板 · 视觉美学整合',
      viralScore: 96,
      viralTier: 'S级视觉质感爆款',
      viralReasons: [
        '多碎片内在逻辑闭环，避免单一元素的扁平化',
        '莫兰迪色系搭配自然光影，高留存高收藏',
        '多图轮播构图SOP完整，完播率拉满',
      ],
      metricsAnalysis: {
        empathyHook: 94,
        saveRate: 98,
        ctrClick: 95,
        discussion: 90,
      },
      coverAdvice: visualOutline.coverLayout.composition + ' | 花字：' + visualOutline.coverLayout.flowerText,
    };

    onApplyTopic(convertedIdea);
    setOutlineApplied(true);
    setTimeout(() => setOutlineApplied(false), 3000);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="rounded-3xl border border-[#DFEBE3] bg-gradient-to-br from-[#FAFCFA] via-[#FFFFFF] to-[#F7FAF8] shadow-xs overflow-hidden transition-all duration-300">
      {/* Header bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#EDF4F0] bg-white/70 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E6F3EC] to-[#FCEFEF] flex items-center justify-center text-[#4B735C] shadow-xs">
            <Zap className="w-4 h-4 text-[#D97706]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#243A2C]">
                灵感火花 · 碎片智联引擎
              </h3>
              <div className="flex items-center rounded-lg bg-gray-100 p-0.5 border border-gray-200">
                <button
                  onClick={() => setActiveTab('brainstorm')}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                    activeTab === 'brainstorm'
                      ? 'bg-white text-[#2A4434] shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  头脑风暴
                </button>
                <button
                  onClick={() => setActiveTab('whiteboard')}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'whiteboard'
                      ? 'bg-[#4A725B] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Grid className="w-2.5 h-2.5" />
                  <span>灵感白板 (拖拽排列)</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeTab === 'brainstorm'
                ? '输入零散想法碎片，AI 自动扩展 3 大差异化爆款选题并全方位评估潜力'
                : '在白板中拖拽组合碎片，AI 实时生成具备整体性的莫兰迪视觉风格大纲'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-xl hover:bg-[#F2F7F4] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          title={isOpen ? '收起模块' : '展开模块'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* TAB 1: BRAINSTORM MODE */}
          {activeTab === 'brainstorm' && (
            <>
              {/* Fragment input area */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <textarea
                    value={fragmentInput}
                    onChange={(e) => setFragmentInput(e.target.value)}
                    placeholder="💡 输入你随时冒出的想法碎片，例如：'今天发现好多人戴黑框眼镜很呆'、'夏天穿吊带但脖子短怎么破'、'圆脸到底怎么画出松弛感腮红'..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 pr-28 rounded-2xl border border-[#D7E6DC] bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40 focus:border-[#8EA89D] transition-all resize-none shadow-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleBrainstorm();
                      }
                    }}
                  />
                  <div className="absolute right-2.5 bottom-2.5">
                    <button
                      onClick={() => handleBrainstorm()}
                      disabled={isBrainstorming || !fragmentInput.trim()}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isBrainstorming || !fragmentInput.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : 'bg-gradient-to-r from-[#4A725B] to-[#3D604C] hover:from-[#3D604C] hover:to-[#335240] text-white hover:shadow-md'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isBrainstorming ? 'animate-spin' : ''}`} />
                      <span>{isBrainstorming ? '头脑风暴中...' : '扩充3大选题'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Inspiration Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-[#D97706]" />
                    快速试用灵感碎片：
                  </span>
                  {PRESET_SPARKS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectChip(chip)}
                      disabled={isBrainstorming}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[#E1ECE5] text-gray-600 hover:text-[#3B614C] hover:border-[#BED6C7] hover:bg-[#F2F7F4] transition-all cursor-pointer truncate max-w-[200px] sm:max-w-none"
                      title={chip}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Brainstorm Result Cards */}
              {brainstormResult && (
                <div className="flex flex-col gap-3.5 pt-2 border-t border-[#EDF4F0]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[#375644] font-semibold">
                      <Wand2 className="w-3.5 h-3.5 text-[#C27A83]" />
                      <span>
                        围绕【{brainstormResult.sparkFragment}】生成的 3 套差异化选题方案：
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      已评估爆款潜质 · 支持一键套用
                    </span>
                  </div>

                  {/* 3 Option Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {brainstormResult.ideas?.map((idea, idx) => {
                      const isApplied = appliedIdeaId === idea.id;
                      const isTitleCopied = copiedTitleId === idea.id;

                      return (
                        <div
                          key={idea.id || idx}
                          className="p-3.5 rounded-2xl bg-white border border-[#DFEBE3] hover:border-[#8EA89D] flex flex-col justify-between gap-3 shadow-xs hover:shadow-morandi transition-all relative group"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#EBF3EF] text-[#2F523D] border border-[#CBDED3]">
                                方案 {idx + 1} · {idea.type}
                              </span>
                              <span className="text-[10px] font-bold text-[#FF2442] flex items-center gap-0.5">
                                <Flame className="w-3 h-3" />
                                {idea.viralTier} ({idea.viralScore}分)
                              </span>
                            </div>

                            <div className="font-bold text-xs text-gray-900 leading-snug line-clamp-2">
                              {idea.topic}
                            </div>

                            <div className="p-2 rounded-xl bg-[#FAFBF9] border border-dashed border-[#DFEBE3] flex items-center justify-between gap-1">
                              <span className="text-[11px] font-medium text-[#4A725B] line-clamp-1">
                                {idea.goldenTitle}
                              </span>
                              <button
                                onClick={() => handleCopyTitle(idea.goldenTitle, idea.id)}
                                title="复制爆款标题"
                                className="p-1 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                              >
                                {isTitleCopied ? (
                                  <Check className="w-3 h-3 text-[#4A725B]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            <div className="text-[11px] text-gray-500 flex flex-col gap-1 pt-1 border-t border-gray-100">
                              <div className="line-clamp-2">
                                <span className="font-semibold text-gray-700">核心切入：</span>
                                {idea.angle}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleApply(idea)}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isApplied
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-gradient-to-r from-[#FAF0EF] to-[#EDF5F0] hover:from-[#F5E5E3] hover:to-[#DEECE2] text-[#345241] border border-[#DEE9E1] hover:shadow-xs'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>已套用到操盘模式！</span>
                              </>
                            ) : (
                              <>
                                <span>套用此选题至操盘表单</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: WHITEBOARD MODE (拖拽排列与组合) */}
          {activeTab === 'whiteboard' && (
            <div className="flex flex-col gap-4">
              {/* Whiteboard Controls & Fragment Adder */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-white border border-[#DFEBE3]">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={newFragmentText}
                    onChange={(e) => setNewFragmentText(e.target.value)}
                    placeholder="在白板随手钉入新碎片标签（如：'淡黄皮肤去黄'、'垂坠阔腿裤'）..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#DFEBE3] text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8EA89D]"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddWhiteboardFragment()}
                  />
                  <button
                    onClick={handleAddWhiteboardFragment}
                    className="px-3 py-1.5 rounded-xl bg-[#F0F5F2] hover:bg-[#E3EDE7] text-[#2A4434] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加卡片</span>
                  </button>
                </div>

                <button
                  onClick={handleGenerateWhiteboardOutline}
                  disabled={isGeneratingOutline}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A725B] to-[#365744] hover:from-[#365744] hover:to-[#2A4535] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingOutline ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingOutline ? 'AI正在编织整体视觉大纲...' : '生成整体性视觉大纲'}</span>
                </button>
              </div>

              {/* Interactive Whiteboard Canvas Area */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F8F6] via-[#FAFBF9] to-[#F2EFEF] border-2 border-dashed border-[#CBDED3] min-h-[140px]">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2.5">
                  <span className="flex items-center gap-1 font-semibold text-[#2A4434]">
                    <Move className="w-3.5 h-3.5 text-[#4A725B]" />
                    灵感白板工作区（按住拖拽排序 · 点击切换是否纳入组合大纲）
                  </span>
                  <span className="text-[10px] text-gray-400">
                    已勾选 {whiteboardFragments.filter((f) => f.selected).length} / {whiteboardFragments.length} 个碎片组合
                  </span>
                </div>

                {/* Draggable Card Grid */}
                <div className="flex flex-wrap gap-2.5">
                  {whiteboardFragments.map((frag, idx) => (
                    <div
                      key={frag.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleToggleFragmentSelect(frag.id)}
                      className={`px-3 py-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-center gap-2 select-none shadow-xs ${
                        frag.selected
                          ? 'bg-white border-[#4A725B] ring-2 ring-[#4A725B]/20 text-[#2A4434]'
                          : 'bg-white/60 border-gray-200 opacity-60 text-gray-500 hover:opacity-100'
                      }`}
                    >
                      <GripHorizontal className="w-3.5 h-3.5 text-gray-300" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-medium">
                          {frag.tag}
                        </span>
                        <span className="text-xs font-semibold">{frag.text}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteWhiteboardFragment(frag.id, e)}
                        title="从白板移除"
                        className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Cohesive Visual Outline Display */}
              {visualOutline && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DFEBE3] shadow-morandi flex flex-col gap-4 animate-fade-in">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EDF4F0]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#2F523D] font-bold border border-[#CBDED3]">
                          整体性视觉大纲
                        </span>
                        <h4 className="text-sm font-bold text-[#2A4434]">
                          {visualOutline.themeName}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {visualOutline.aestheticEssence}
                      </p>
                    </div>

                    <button
                      onClick={handleApplyWhiteboardOutline}
                      className="px-3.5 py-2 rounded-xl bg-[#4A725B] hover:bg-[#385845] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      {outlineApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>已同步至操盘模式！</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>一键同步至操盘模式</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Visual Style Components */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 1. Color Palette Ratio */}
                    <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#DFEBE3] flex flex-col gap-2">
                      <span className="text-xs font-bold text-[#2A4434] flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-[#8EA89D]" />
                        莫兰迪色彩比例
                      </span>
                      <p className="text-[11px] text-gray-600 font-medium">
                        {visualOutline.colorRatio}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {visualOutline.recommendedHexes?.map((hex, i) => (
                          <button
                            key={i}
                            onClick={() => handleCopyHex(hex)}
                            title={`复制色码 ${hex}`}
                            className="w-6 h-6 rounded-lg border border-black/10 shadow-2xs transition-transform hover:scale-110 cursor-pointer"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                        {copiedHex && (
                          <span className="text-[9px] text-emerald-600 ml-1">已复制</span>
                        )}
                      </div>
                    </div>

                    {/* 2. Cover Layout SOP */}
                    <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#DFEBE3] flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-[#2A4434] flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#C27A83]" />
                        封面花字与构图
                      </span>
                      <div className="text-[11px] text-gray-600 leading-tight">
                        <strong className="text-gray-800">花字推荐：</strong>
                        {visualOutline.coverLayout?.flowerText}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {visualOutline.coverLayout?.composition}
                      </div>
                    </div>

                    {/* 3. Props & Atmosphere */}
                    <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#DFEBE3] flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-[#2A4434] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                        光影与道具清单
                      </span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {visualOutline.propsAndLighting}
                      </p>
                    </div>
                  </div>

                  {/* 3-Page Carousel SOP */}
                  <div className="p-3 rounded-xl bg-[#FAFBF9] border border-[#E5EFE8] flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#4A725B]" />
                      多图轮播视觉排版 SOP：
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {visualOutline.carouselSop?.map((page, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-2 rounded-lg bg-white border border-[#DFEBE3] flex flex-col gap-1"
                        >
                          <span className="text-[10px] font-bold text-[#2A4434]">
                            {page.title}
                          </span>
                          <span className="text-[10px] text-gray-500 leading-relaxed">
                            {page.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
