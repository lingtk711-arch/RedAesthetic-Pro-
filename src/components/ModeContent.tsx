import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Tag,
  Palette,
  BookOpen,
  HelpCircle,
  Smartphone,
  Layers,
  ArrowRight,
  Search,
  ExternalLink,
  Flame,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';
import { PostDraft } from '../types';
import { PRESET_TOPICS, TITLE_FORMULAS, DIVERSE_AESTHETIC_PALETTES } from '../data/presets';
import { RedPostMockup } from './RedPostMockup';
import { InspirationSparkModule, SparkIdea } from './InspirationSparkModule';
import { BlueOceanDensityAnalyzer } from './BlueOceanDensityAnalyzer';
import { CoverInspirationGallery } from './CoverInspirationGallery';

export interface XhsDropdownKeyword {
  keyword: string;
  tag: string;
  hotness: 'high' | 'rising' | 'steady';
  trafficNote?: string;
  searchUrl: string;
}

export interface XhsBlueOceanCommand {
  command: string;
  tag: string;
  reason: string;
  searchUrl: string;
}

export interface XhsSearchData {
  dropdownKeywords: XhsDropdownKeyword[];
  blueOceanCommands: XhsBlueOceanCommand[];
}

interface ModeContentProps {
  currentDraft: PostDraft;
  onUpdateDraft: (updated: Partial<PostDraft>) => void;
  onGoToReview?: () => void;
  onGoToColorLab?: () => void;
}

export const ModeContent: React.FC<ModeContentProps> = ({
  currentDraft,
  onUpdateDraft,
  onGoToReview,
  onGoToColorLab,
}) => {
  const [topic, setTopic] = useState(currentDraft.topic || '方圆脸淡颜女孩逆袭清冷氛围感');
  const [angle, setAngle] = useState(
    currentDraft.coverConfig.subTitle || '拒绝浓颜硬搬，借由高颅顶与莫兰迪色系打造松弛耐看美'
  );
  const [audience, setAudience] = useState('追求自然变美、不爱浓妆的普通女孩与职场早八人');
  const [keyPoints, setKeyPoints] = useState(
    '1. 发根蓬松拉高纵向视觉；2. 弱化眼妆突出温润气色；3. 莫兰迪淡粉+淡绿搭配清透感；4. 舒展肩膀仪态'
  );
  const [tone, setTone] = useState('闺蜜打卡陪伴、接地气、干货拿来即用、无说教');
  const [aestheticStyle, setAestheticStyle] = useState('Sage & Blush 治愈莫兰迪');

  // Sync state if currentDraft was updated from outside (e.g. DailyAestheticFeed '一键模仿')
  useEffect(() => {
    if (currentDraft.topic && currentDraft.topic !== topic) {
      setTopic(currentDraft.topic);
    }
    if (currentDraft.coverConfig.subTitle && currentDraft.coverConfig.subTitle !== angle) {
      setAngle(currentDraft.coverConfig.subTitle);
    }
  }, [currentDraft.id, currentDraft.topic]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'titles' | 'visual' | 'gallery' | 'raw'>('preview');
  const [rawGeneratedText, setRawGeneratedText] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Real-time XHS Search state
  const [searchData, setSearchData] = useState<XhsSearchData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchedTopic, setLastSearchedTopic] = useState('');

  const fetchLiveKeywords = async (queryText: string) => {
    const trimmed = (queryText || '').trim();
    if (!trimmed) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/search/xhs-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setSearchData(resData.data);
        setLastSearchedTopic(trimmed);
      }
    } catch (err) {
      console.error('Failed to fetch real-time keywords:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced auto-fetch when topic changes
  useEffect(() => {
    const trimmed = topic.trim();
    if (!trimmed || trimmed === lastSearchedTopic) return;

    const timer = setTimeout(() => {
      fetchLiveKeywords(trimmed);
    }, 750);

    return () => clearTimeout(timer);
  }, [topic]);

  // Initial fetch on mount
  useEffect(() => {
    if (topic.trim() && !searchData) {
      fetchLiveKeywords(topic.trim());
    }
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_TOPICS.find((p) => p.id === presetId);
    if (!found) return;
    setTopic(found.title);
    setAngle(found.angle);
    setAudience(found.audience);
    setKeyPoints(found.keyPoints);

    onUpdateDraft({
      topic: found.title,
      selectedTitle: found.title,
      coverConfig: {
        ...currentDraft.coverConfig,
        mainTitle: found.coverMain,
        subTitle: found.coverSub,
        badge: found.badge,
      },
    });
  };

  const handleApplyFormula = (exampleText: string) => {
    setTopic(exampleText);
    onUpdateDraft({
      topic: exampleText,
      selectedTitle: exampleText,
      coverConfig: {
        ...currentDraft.coverConfig,
        mainTitle: exampleText.split('｜')[0] || exampleText.slice(0, 14),
      },
    });
  };

  const handleApplySparkIdea = (idea: SparkIdea) => {
    setTopic(idea.topic);
    setAngle(idea.angle);
    setAudience(idea.audience);
    setKeyPoints(idea.keyPoints);
    if (idea.aestheticStyle) {
      setAestheticStyle(idea.aestheticStyle);
    }

    onUpdateDraft({
      topic: idea.topic,
      selectedTitle: idea.goldenTitle || idea.topic,
      coverConfig: {
        ...currentDraft.coverConfig,
        mainTitle: idea.topic.split('｜')[0] || idea.topic.slice(0, 14),
        subTitle: idea.angle,
        badge: idea.type.includes('反差')
          ? '逆袭解法'
          : idea.type.includes('共鸣')
          ? '真闺蜜分享'
          : '避坑干货',
      },
    });

    // Automatically trigger real-time Xiaohongshu keyword search for this idea
    fetchLiveKeywords(idea.topic);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/gemini/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          angle,
          audience,
          keyPoints,
          tone,
          aestheticStyle,
        }),
      });

      const data = await res.json();
      if (!data.success && !data.text) {
        throw new Error(data.error || '生成失败');
      }

      const text: string = data.text || '';
      setRawGeneratedText(text);

      // Parse generated output intelligently into titles, body, visual, and tags
      let parsedTitles: Array<{ title: string; hookType: any; analysis: string }> = [];
      let parsedBody = '';
      let parsedTags: string[] = [];
      let parsedVisual = {
        coverFlowerText: topic,
        composition: '3:4 比例，中心偏上对称排版，高留白治愈系莫兰迪',
        colorPalette: 'Sage & Blush (淡粉 + 淡绿) 经典治愈配色',
        lightingAndProps: '自然漫射光，配莫兰迪陶罐、棉麻衬衫或手账本',
      };

      // Extract titles
      const titleMatches = text.match(/【1[\.、\s].*?】([\s\S]*?)(?=【2[\.、\s]|$)/i);
      if (titleMatches && titleMatches[1]) {
        const titleSection = titleMatches[1];
        const lines = titleSection.split('\n').filter((l) => l.trim().length > 0);
        lines.forEach((line) => {
          const clean = line.replace(/^\d+[\.、\s*]+/, '').trim();
          if (clean.length > 5 && !clean.startsWith('【')) {
            const hookType = clean.includes('痛点')
              ? '痛点反差'
              : clean.includes('避坑')
              ? '闺蜜避坑'
              : clean.includes('打卡')
              ? '沉浸打卡'
              : clean.includes('?') || clean.includes('？')
              ? '悬念好奇'
              : '情绪钩子';

            parsedTitles.push({
              title: clean.replace(/\(.*\)|（.*）/, '').trim(),
              hookType: hookType as any,
              analysis: clean.includes('（') ? clean.slice(clean.indexOf('（')) : '涵盖情绪钩子与痛点',
            });
          }
        });
      }

      // Fallback titles if parsing is sparse
      if (parsedTitles.length === 0) {
        parsedTitles = [
          {
            title: `普通女孩美商逆袭｜${topic.slice(0, 16)}！真闺蜜亲测这几点…`,
            hookType: '闺蜜避坑',
            analysis: '平易近人共情，降低读者防御心理',
          },
          {
            title: `从平平无奇到耐看高级感✨我的${topic.slice(0, 14)}实操SOP`,
            hookType: '沉浸打卡',
            analysis: '结果导向与痛点对比',
          },
          {
            title: `别再瞎折腾了！普通人拔高美商，先把这3个底层逻辑搞透…`,
            hookType: '情绪钩子',
            analysis: '唤醒好奇与自省',
          },
        ];
      }

      // Extract Body
      const bodyMatches = text.match(/【2[\.、\s].*?】([\s\S]*?)(?=【3[\.、\s]|$)/i);
      if (bodyMatches && bodyMatches[1]) {
        parsedBody = bodyMatches[1]
          .replace(/```markdown|```/g, '')
          .replace(/正文[:：]?/g, '')
          .trim();
      } else {
        // Fallback extract middle portion
        parsedBody = text.slice(0, 800);
      }

      // Extract SEO tags
      const tagMatches = text.match(/#[^\s#]+/g);
      if (tagMatches && tagMatches.length > 0) {
        parsedTags = Array.from(new Set(tagMatches)).slice(0, 12);
      } else {
        parsedTags = ['#美商逆袭', '#审美陪伴官', '#普通女孩变美', '#治愈系美学', '#莫兰迪配色', '#早八人日常'];
      }

      // Extract visual notes if any
      const visualMatches = text.match(/【3[\.、\s].*?】([\s\S]*?)(?=【4[\.、\s]|$)/i);
      if (visualMatches && visualMatches[1]) {
        parsedVisual.lightingAndProps = visualMatches[1].trim().slice(0, 200);
      }

      // Extract Skill 7: Pinned Comment & CTA
      let parsedPinned = '姐妹们，自查清单放这里啦！快报上你的脸型/肤质或者在评论区扣【1】，美商搭子逐个帮你看～👇';
      const pinnedMatches = text.match(/【5[\.、\s].*?】([\s\S]*?)$/i);
      if (pinnedMatches && pinnedMatches[1]) {
        parsedPinned = pinnedMatches[1].replace(/置顶沙发[：:]?/g, '').trim().slice(0, 220);
      }

      const chosenTitle = parsedTitles[0]?.title || topic;

      onUpdateDraft({
        topic,
        selectedTitle: chosenTitle,
        titles: parsedTitles,
        body: parsedBody,
        seoTags: parsedTags,
        pinnedComment: parsedPinned,
        visualGuidance: parsedVisual,
        coverConfig: {
          ...currentDraft.coverConfig,
          mainTitle: chosenTitle.replace(/#.*$/, '').slice(0, 15),
          subTitle: angle.slice(0, 24),
        },
      });

      setActiveTab('preview');
    } catch (err: any) {
      setErrorMessage(err.message || '生成服务暂时繁忙，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left panel: Creator controls */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        {/* Preset pill bar */}
        <div className="p-4 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#324B3C] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#7CA18C]" />
              精选美商爆款选题模板 (一键载入)
            </span>
            <span className="text-[11px] text-[#71877B]">赛道爆款SOP</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_TOPICS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className="p-2.5 rounded-xl border border-[#E3ECE6] bg-[#F9FBFA] hover:bg-[#F0F6F2] hover:border-[#BED6C7] text-left transition-all duration-200 cursor-pointer flex flex-col gap-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white text-[#527763] border border-[#DEE9E1]">
                    {preset.category}
                  </span>
                  <span className="text-[10px] text-gray-400 group-hover:text-[#527763] transition-colors">
                    载入 →
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-800 line-clamp-1 leading-snug">
                  {preset.title}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 灵感火花 · 碎片头脑风暴模块 */}
        <InspirationSparkModule
          onApplyTopic={handleApplySparkIdea}
          currentTopic={topic}
        />

        {/* Input Form */}
        <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#EDF4F0] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EBF3EF] flex items-center justify-center text-[#557764]">
                <PenTool className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#273B2F]">操盘模式 · 内容策划与文案生成</h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FCF1F2] text-[#A85863] border border-[#F5D8DB]">
              KOC语感 · 呼吸感排版
            </span>
          </div>

          {/* Topic Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#324B3C] flex items-center justify-between">
              <span>1. 选题主题 / 核心痛点</span>
              <span className="text-[11px] font-normal text-gray-400">直击普通女孩变美痛点</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：方圆脸淡颜女孩逆袭氛围感"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40 focus:border-[#8EA89D] transition-all"
            />
          </div>

          {/* Real-time XHS Search Panel (操盘模式 · 实时检索板块) */}
          <div className="p-4 bg-gradient-to-br from-[#F4F9F6] to-[#FAF7F5] rounded-2xl border border-[#DFECE4] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#E2EFE7] flex items-center justify-center text-[#466955]">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#2A4434]">
                      小红书实时检索 · 下拉热搜与蓝海指令
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white text-[#4A725B] font-semibold border border-[#D0E2D7]">
                      真实搜索链接
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => fetchLiveKeywords(topic)}
                disabled={isSearching}
                title="刷新抓取当前下拉热搜与蓝海指令"
                className="p-1.5 rounded-lg text-gray-500 hover:text-[#385B47] hover:bg-white border border-transparent hover:border-[#D6E6DC] transition-all cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin text-[#4A725B]' : ''}`} />
                <span className="hidden sm:inline">{isSearching ? '抓取中...' : '实时刷新'}</span>
              </button>
            </div>

            {isSearching && !searchData && (
              <div className="py-4 flex items-center justify-center gap-2 text-xs text-[#527763]">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>正在调用小红书检索接口抓取当前下拉热搜词...</span>
              </div>
            )}

            {searchData && (
              <div className="flex flex-col gap-3">
                {/* 1. 下拉热搜词 */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#4F6A5B]">
                    <span className="font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-[#D9534F]" />
                      小红书平台当前下拉热搜词（带真实搜索链接 ↗）：
                    </span>
                    <span className="text-[10px] text-gray-400">点击直达小红书真实对标</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {searchData.dropdownKeywords?.map((kw, idx) => (
                      <div
                        key={idx}
                        className="group/kw inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#DCE8E0] hover:border-[#8EA89D] hover:shadow-xs transition-all text-xs"
                      >
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                            kw.hotness === 'high'
                              ? 'bg-[#FCECEC] text-[#C0392B]'
                              : kw.hotness === 'rising'
                              ? 'bg-[#FEF5E7] text-[#D35400]'
                              : 'bg-[#EBF5FB] text-[#2980B9]'
                          }`}
                        >
                          {kw.tag}
                        </span>
                        <button
                          onClick={() => {
                            setTopic(kw.keyword);
                            onUpdateDraft({ topic: kw.keyword, selectedTitle: kw.keyword });
                          }}
                          title="一键套用为当前选题"
                          className="font-medium text-gray-700 hover:text-[#3B614C] transition-colors cursor-pointer"
                        >
                          {kw.keyword}
                        </button>
                        <a
                          href={kw.searchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`在小红书查看【${kw.keyword}】真实笔记搜索结果`}
                          className="p-0.5 text-gray-400 hover:text-[#FF2442] hover:bg-red-50 rounded transition-colors ml-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => handleCopy(kw.keyword, `kw-${idx}`)}
                          title="复制关键词"
                          className="p-0.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
                        >
                          {copiedKey === `kw-${idx}` ? (
                            <Check className="w-3 h-3 text-[#4A725B]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. 高频蓝海检索指令 */}
                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-[#E5EFE8]">
                  <div className="flex items-center justify-between text-[11px] text-[#4F6A5B]">
                    <span className="font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-[#2980B9]" />
                      高频蓝海检索指令（避开大博主内卷，极易拿长尾搜索流量）：
                    </span>
                    <span className="text-[10px] text-gray-400">支持一键套用为切入点</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchData.blueOceanCommands?.map((cmd, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white border border-[#DFEBE3] hover:border-[#8EA89D] transition-all flex flex-col justify-between gap-1.5 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EBF3EF] text-[#3D634E] font-semibold">
                              {cmd.tag}
                            </span>
                            <a
                              href={cmd.searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[10px] text-[#FF2442] hover:underline"
                            >
                              真实链接 ↗
                            </a>
                          </div>
                          <div className="font-semibold text-xs text-gray-800 line-clamp-1">
                            {cmd.command}
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {cmd.reason}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setAngle(cmd.command);
                              onUpdateDraft({
                                coverConfig: {
                                  ...currentDraft.coverConfig,
                                  subTitle: cmd.command,
                                },
                              });
                            }}
                            className="text-[10px] font-semibold text-[#4A725B] hover:text-[#2A4434] transition-colors cursor-pointer"
                          >
                            套用为切入角度 →
                          </button>
                          <button
                            onClick={() => handleCopy(cmd.command, `cmd-${idx}`)}
                            className="text-[10px] text-gray-400 hover:text-gray-700 flex items-center gap-0.5 cursor-pointer"
                          >
                            {copiedKey === `cmd-${idx}` ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-[#4A725B]" />
                                <span className="text-[#4A725B]">已复制</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>复制</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. 蓝海词密度分析与搜索可见性智能平替 */}
                <BlueOceanDensityAnalyzer
                  currentDraft={currentDraft}
                  searchData={searchData}
                  onUpdateDraft={onUpdateDraft}
                  onUpdateBody={(newBody) => {
                    onUpdateDraft({ body: newBody });
                  }}
                  onUpdateTitle={(newTitle) => {
                    onUpdateDraft({ selectedTitle: newTitle });
                  }}
                  onUpdateAngle={(newAngle) => {
                    setAngle(newAngle);
                    onUpdateDraft({
                      coverConfig: {
                        ...currentDraft.coverConfig,
                        subTitle: newAngle,
                      },
                    });
                  }}
                />
              </div>
            )}
          </div>

          {/* Quick Title Formula Drawer */}
          <div className="p-3 bg-[#F8FAF9] rounded-2xl border border-[#E5EFE8] flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-[#486353] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C27A83]" />
              快速嵌入：5大爆款标题公式
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TITLE_FORMULAS.map((formula, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyFormula(formula.example)}
                  title={formula.formula}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white border border-[#D9E6DE] text-[#426150] hover:bg-[#EFF6F1] hover:border-[#8EA89D] transition-colors cursor-pointer"
                >
                  【{formula.name}】
                </button>
              ))}
            </div>
          </div>

          {/* Angle Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#324B3C]">
              2. 核心切入角度 / 差异化观点
            </label>
            <textarea
              rows={2}
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              placeholder="例如：不盲目追求浓颜五官，借由高颅顶与莫兰迪淡粉淡绿穿搭展现清冷耐看美"
              className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40 focus:border-[#8EA89D] transition-all"
            />
          </div>

          {/* Key points Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#324B3C]">
              3. 核心干货点 / 变美实操建议
            </label>
            <textarea
              rows={3}
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="输入你的实测经验、变美打卡动作或避坑心得"
              className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40 focus:border-[#8EA89D] transition-all"
            />
          </div>

          {/* Tone Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#324B3C]">
              4. 人设语气调性
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                '闺蜜打卡陪伴 · 接地气真诚',
                '理性审美拆解 · 逻辑清晰干货',
                '治愈反容貌焦虑 · 温柔赋能',
                '早八打工人自省 · 极简高效',
              ].map((tOption) => (
                <button
                  key={tOption}
                  onClick={() => setTone(tOption)}
                  className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                    tone === tOption
                      ? 'bg-[#EBF3EF] border-[#8EA89D] text-[#2F4F3D] font-semibold'
                      : 'bg-[#FAFBF9] border-[#DFEBE3] text-gray-600 hover:bg-[#F3F8F5]'
                  }`}
                >
                  {tOption}
                </button>
              ))}
            </div>
          </div>

          {/* Aesthetic Style Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#324B3C] flex items-center justify-between">
              <span>5. 视觉美学调性（多元自选）</span>
              <span className="text-[10px] text-gray-400">非单一粉绿 · 涵盖老钱/极简/新中式</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
              {DIVERSE_AESTHETIC_PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => {
                    setAestheticStyle(pal.name);
                    onUpdateDraft({
                      coverConfig: {
                        ...currentDraft.coverConfig,
                        theme: pal.id as any,
                      },
                    });
                  }}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    currentDraft.coverConfig.theme === pal.id || aestheticStyle === pal.name
                      ? 'bg-[#EBF3EF] border-[#8EA89D] text-[#284836] font-semibold shadow-2xs'
                      : 'bg-[#FAFBF9] border-[#DFEBE3] text-gray-600 hover:bg-[#F3F8F5]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: pal.previewHexes[0] }}
                    ></div>
                    <span className="text-[11px] truncate">{pal.name.split(' ')[0]}</span>
                  </div>
                  <span className="text-[9px] text-gray-400 font-normal">{pal.tag}</span>
                </button>
              ))}
            </div>

            {onGoToColorLab && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onGoToColorLab}
                  className="text-[11px] font-semibold text-[#4A725B] hover:text-[#2A4434] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>提供生活照提取【Sage & Blush 治愈莫兰迪色谱与色彩心理学】→</span>
                </button>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#6E947C] via-[#7DA28B] to-[#C27A83] text-white font-semibold text-sm shadow-md hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>美商主笔正在运用 7 大 Skill 撰写中…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>生成小红书爆款文案与视觉指导</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right panel: Live Preview & Inspection Tabs */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        {/* Workflow hint: jump to Review Mode */}
        {onGoToReview && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#FDF2F3] via-[#FAF6F4] to-[#EEF5F1] border border-[#F1DADB] shadow-2xs">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#C27A83]" />
              <span className="text-xs font-semibold text-[#3D282C]">
                文案已就绪？下一步进入【诊断模式】风控自检
              </span>
            </div>
            <button
              onClick={onGoToReview}
              className="px-3 py-1.5 rounded-xl bg-[#C27A83] hover:bg-[#B06771] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <span>前往诊断模式</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#EEF4F0] rounded-2xl border border-[#DBE7DF] overflow-x-auto">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-[#294435] shadow-xs'
                : 'text-[#617B6D] hover:text-[#294435]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#7CA18C]" />
            真机预览
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-white text-[#294435] shadow-xs'
                : 'text-[#617B6D] hover:text-[#294435]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#C27A83]" />
            封面灵感画廊 ✨
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'titles'
                ? 'bg-white text-[#294435] shadow-xs'
                : 'text-[#617B6D] hover:text-[#294435]'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-[#C27A83]" />
            爆款标题 ({currentDraft.titles?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-white text-[#294435] shadow-xs'
                : 'text-[#617B6D] hover:text-[#294435]'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#7CA18C]" />
            花字微调
          </button>
          {rawGeneratedText && (
            <button
              onClick={() => setActiveTab('raw')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-white text-[#294435] shadow-xs'
                : 'text-[#617B6D] hover:text-[#294435]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              拆解报告
            </button>
          )}
        </div>

        {/* Tab 1: Live Phone Mockup */}
        {activeTab === 'preview' && (
          <RedPostMockup
            draft={currentDraft}
            onUpdateDraft={onUpdateDraft}
          />
        )}

        {/* Tab: Cover Inspiration Gallery */}
        {activeTab === 'gallery' && (
          <div className="flex flex-col gap-4">
            <CoverInspirationGallery
              currentDraft={currentDraft}
              onUpdateDraft={onUpdateDraft}
              onLayoutChange={(layout) => {
                onUpdateDraft({
                  coverConfig: {
                    ...currentDraft.coverConfig,
                    layout,
                  },
                });
              }}
            />
            {/* Live mockup below gallery for instant visual gratification */}
            <div className="p-4 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#EDF4F0] pb-2">
                <span className="text-xs font-bold text-[#2D4837] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#7CA18C]" />
                  实时渲染预览：所选底图与自配版式
                </span>
                <button
                  onClick={() => setActiveTab('preview')}
                  className="text-xs text-[#527763] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  前往真机全貌视图 →
                </button>
              </div>
              <RedPostMockup
                draft={currentDraft}
                onUpdateDraft={onUpdateDraft}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Title Alternatives */}
        {activeTab === 'titles' && (
          <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#EDF4F0] pb-3">
              <div>
                <h4 className="font-bold text-sm text-[#273B2F] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C27A83]" />
                  爆款标题生成方案库 (涵盖不同心理钩子)
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  点击“设为当前发布”可直接同步到小红书模拟卡片中
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {(currentDraft.titles || []).map((tItem, idx) => {
                const isSelected = currentDraft.selectedTitle === tItem.title;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'border-[#8EA89D] bg-[#F2F7F4] shadow-xs'
                        : 'border-[#E2EDE5] bg-[#FAFBF9] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#D7E4DC] text-[#476654]">
                        方案 {idx + 1} · {tItem.hookType}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(tItem.title, `t-${idx}`)}
                          className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `t-${idx}` ? <Check className="w-3.5 h-3.5 text-[#5B886E]" /> : <Copy className="w-3.5 h-3.5" />}
                          复制
                        </button>
                        <button
                          onClick={() => {
                            onUpdateDraft({
                              selectedTitle: tItem.title,
                              coverConfig: {
                                ...currentDraft.coverConfig,
                                mainTitle: tItem.title.replace(/#.*$/, '').slice(0, 15),
                              },
                            });
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#6E947C] text-white'
                              : 'bg-white border border-[#CCDCD1] text-[#3D5C4A] hover:bg-[#EEF5F1]'
                          }`}
                        >
                          {isSelected ? '当前使用中' : '设为当前标题'}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                      {tItem.title}
                    </p>
                    {tItem.analysis && (
                      <p className="text-xs text-gray-500 bg-white/70 p-2 rounded-xl border border-gray-100">
                        💡 逻辑拆解：{tItem.analysis}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Visual & Flower text config */}
        {activeTab === 'visual' && (
          <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4">
            <div className="border-b border-[#EDF4F0] pb-3">
              <h4 className="font-bold text-sm text-[#273B2F] flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-[#7CA18C]" />
                Sage & Blush 治愈系封面视觉微调
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                实时自定义封面大字、副标、徽章与莫兰迪治愈配色
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">封面大字 (主花字)</label>
                <input
                  type="text"
                  value={currentDraft.coverConfig.mainTitle}
                  onChange={(e) =>
                    onUpdateDraft({
                      coverConfig: {
                        ...currentDraft.coverConfig,
                        mainTitle: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 rounded-xl border border-[#D5E4DB] text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">副标题 / 补充小标</label>
                <input
                  type="text"
                  value={currentDraft.coverConfig.subTitle}
                  onChange={(e) =>
                    onUpdateDraft({
                      coverConfig: {
                        ...currentDraft.coverConfig,
                        subTitle: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 rounded-xl border border-[#D5E4DB] text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">顶部胶囊徽标</label>
                <input
                  type="text"
                  value={currentDraft.coverConfig.badge}
                  onChange={(e) =>
                    onUpdateDraft({
                      coverConfig: {
                        ...currentDraft.coverConfig,
                        badge: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 rounded-xl border border-[#D5E4DB] text-xs"
                />
              </div>

              {/* Visual guidance info */}
              <div className="p-3 bg-[#F8FAF9] rounded-2xl border border-[#DEEBE2] flex flex-col gap-2 text-xs">
                <span className="font-bold text-[#3B5B49]">✦ 视觉美学指导建议：</span>
                <p className="text-gray-600 leading-relaxed">
                  {currentDraft.visualGuidance?.lightingAndProps ||
                    '推荐使用 3:4 比例画幅，中心偏上对齐，高留白呼吸感；配莫兰迪陶罐、棉麻衬衫或手账本，拍摄采用自然柔和漫射光。'}
                </p>
              </div>

              {/* Quick Jump to Cover Inspiration Gallery */}
              <div className="p-3 bg-gradient-to-r from-[#F4F9F6] to-[#FAF3F5] rounded-2xl border border-[#DFEBE3] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C27A83]" />
                  <span className="text-xs font-semibold text-[#2F4739]">
                    想更换真实莫兰迪底图与排版版式？
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('gallery')}
                  className="px-3 py-1.5 rounded-xl bg-[#6E947C] hover:bg-[#5C8169] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <span>打开封面灵感画廊</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setActiveTab('preview')}
                className="py-2.5 rounded-xl bg-[#6E947C] text-white text-xs font-semibold hover:bg-[#5C8169] transition-colors cursor-pointer"
              >
                保存并在真机中查看效果 →
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Raw Structured Report */}
        {activeTab === 'raw' && (
          <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#EDF4F0] pb-2">
              <span className="text-xs font-bold text-gray-800">Gemini 主笔完整生成报告</span>
              <button
                onClick={() => handleCopy(rawGeneratedText, 'raw-full')}
                className="text-xs text-[#527763] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'raw-full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                复制报告全文
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto text-xs text-gray-700 leading-relaxed whitespace-pre-wrap p-3 bg-[#FAFBF9] rounded-2xl border border-gray-100 font-mono">
              {rawGeneratedText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
