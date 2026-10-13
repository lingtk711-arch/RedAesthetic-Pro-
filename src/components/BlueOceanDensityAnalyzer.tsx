import React, { useMemo, useState } from 'react';
import {
  Search,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  Tag,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { PostDraft } from '../types';

interface KeywordItem {
  keyword: string;
  tag: string;
  searchUrl: string;
}

interface BlueOceanCommand {
  command: string;
  tag: string;
  reason: string;
  searchUrl: string;
}

interface SearchData {
  dropdownKeywords?: KeywordItem[];
  hotDropdowns?: KeywordItem[];
  blueOceanCommands?: BlueOceanCommand[];
}

interface BlueOceanDensityAnalyzerProps {
  currentDraft: PostDraft;
  searchData: SearchData | null;
  onUpdateDraft: (updated: Partial<PostDraft>) => void;
  onUpdateBody?: (newBody: string) => void;
  onUpdateTitle?: (newTitle: string) => void;
  onUpdateAngle?: (newAngle: string) => void;
}

// Common generic/high-competition words in beauty & lifestyle track and their blue-ocean upgrades
const GENERIC_REPLACEMENTS_MAP: Array<{
  genericWord: string;
  category: string;
  recommendedBlueOcean: string;
  benefit: string;
  searchBoost: string;
}> = [
  {
    genericWord: '变美',
    category: '概念大词',
    recommendedBlueOcean: '骨相舒展耐看度',
    benefit: '避开5000万篇笔记红海，精准命中高阶美商心智',
    searchBoost: '搜索竞争度降低 65%，藏赞比高达 1.8:1',
  },
  {
    genericWord: '好看',
    category: '低意图形容词',
    recommendedBlueOcean: '清冷松弛氛围感',
    benefit: '从小学生式空洞赞美升级为小红书硬通货氛围标签',
    searchBoost: '长尾搜索曝光 +180%',
  },
  {
    genericWord: '显白',
    category: '同质化功效词',
    recommendedBlueOcean: '橄榄皮/黄黑皮去黄提亮',
    benefit: '具体人群画像自带强买单和收藏动机',
    searchBoost: '搜一搜精准意图转化 +210%',
  },
  {
    genericWord: '修饰脸型',
    category: '泛化技巧词',
    recommendedBlueOcean: '方圆脸发根蓬松拉长颅顶',
    benefit: '具体动作+具体脸型，符合小红书痛点直接检索习惯',
    searchBoost: '下拉联想词前3推荐位',
  },
  {
    genericWord: '穿搭',
    category: '大类目词',
    recommendedBlueOcean: '莫兰迪胶囊衣橱一衣多穿',
    benefit: '极简实用主义高收藏属性，大幅拔高完播率',
    searchBoost: '收藏率提升 40%',
  },
  {
    genericWord: '发型',
    category: '泛词',
    recommendedBlueOcean: '低颅顶显脸小半扎发',
    benefit: '明确痛点解决型搜索指令',
    searchBoost: '避开理发店推销，纯KOC真实感',
  },
  {
    genericWord: '早八',
    category: '场景词',
    recommendedBlueOcean: '早八10分钟松弛伪素颜',
    benefit: '数字化时间承诺 + 场景痛点，CTR翻倍',
    searchBoost: '通勤高峰时段搜索权重高',
  },
];

export const BlueOceanDensityAnalyzer: React.FC<BlueOceanDensityAnalyzerProps> = ({
  currentDraft,
  searchData,
  onUpdateDraft,
  onUpdateBody,
  onUpdateTitle,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Aggregated full text currently composed by creator
  const fullTextContext = useMemo(() => {
    return [
      currentDraft.topic || '',
      currentDraft.selectedTitle || '',
      currentDraft.body || '',
      ...(currentDraft.seoTags || []),
    ].join(' ');
  }, [currentDraft]);

  // Extract all available blue-ocean terms from searchData or presets
  const blueOceanPool = useMemo(() => {
    const pool: Array<{ keyword: string; tag: string; isHighValue: boolean }> = [];

    const dropdownList = searchData?.dropdownKeywords || searchData?.hotDropdowns;
    if (dropdownList) {
      dropdownList.forEach((item) => {
        pool.push({
          keyword: item.keyword,
          tag: item.tag || '下拉热搜',
          isHighValue: true,
        });
      });
    }

    if (searchData?.blueOceanCommands) {
      searchData.blueOceanCommands.forEach((cmd) => {
        // extract core keywords from command
        const cleanCmd = cmd.command.split(' ')[0] || cmd.command;
        pool.push({
          keyword: cleanCmd,
          tag: cmd.tag || '蓝海口令',
          isHighValue: true,
        });
      });
    }

    // Deduplicate
    const uniqueMap = new Map<string, { keyword: string; tag: string; isHighValue: boolean }>();
    pool.forEach((item) => {
      if (item.keyword && item.keyword.trim().length > 1) {
        uniqueMap.set(item.keyword.trim(), item);
      }
    });

    return Array.from(uniqueMap.values());
  }, [searchData]);

  // Compute matches
  const analysis = useMemo(() => {
    if (blueOceanPool.length === 0) {
      return {
        matched: [] as Array<{ keyword: string; tag: string; count: number; inTitle: boolean; inBody: boolean }>,
        missing: [] as Array<{ keyword: string; tag: string }>,
        densityScore: 0,
        statusLevel: 'low',
        statusLabel: '等待检索词装载',
        statusDesc: '输入选题后系统将自动抓取蓝海词',
      };
    }

    const matched: Array<{ keyword: string; tag: string; count: number; inTitle: boolean; inBody: boolean }> = [];
    const missing: Array<{ keyword: string; tag: string }> = [];

    blueOceanPool.forEach((item) => {
      const regex = new RegExp(item.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = fullTextContext.match(regex);
      const titleMatches = (currentDraft.selectedTitle || '').match(regex);
      const bodyMatches = (currentDraft.body || '').match(regex);

      if (matches && matches.length > 0) {
        matched.push({
          keyword: item.keyword,
          tag: item.tag,
          count: matches.length,
          inTitle: !!titleMatches,
          inBody: !!bodyMatches,
        });
      } else {
        missing.push({
          keyword: item.keyword,
          tag: item.tag,
        });
      }
    });

    // Score: based on ratio of matched high-intent keywords + presence in title
    const matchRatio = matched.length / Math.max(blueOceanPool.length, 1);
    const hasInTitle = matched.some((m) => m.inTitle);
    let densityScore = Math.round(matchRatio * 70 + (hasInTitle ? 30 : 0));
    densityScore = Math.min(Math.max(densityScore, 0), 100);

    let statusLevel: 'low' | 'optimal' | 'dense' = 'optimal';
    let statusLabel = '黄金分布区间';
    let statusDesc = '蓝海词已自然融入标题与正文，搜索权重与可读性达到最佳平衡。';

    if (densityScore < 30) {
      statusLevel = 'low';
      statusLabel = '蓝海覆盖偏低';
      statusDesc = '缺少关键长尾检索抓手，建议将未覆盖的高潜词植入标题或正文。';
    } else if (densityScore > 75) {
      statusLevel = 'dense';
      statusLabel = '密度过高 · 警惕堆砌';
      statusDesc = '关键词密度偏高，请确保文意自然通顺，避免被平台判定为SEO生硬堆词。';
    }

    return {
      matched,
      missing,
      densityScore,
      statusLevel,
      statusLabel,
      statusDesc,
    };
  }, [blueOceanPool, fullTextContext, currentDraft.selectedTitle, currentDraft.body]);

  // Find generic words present in current draft that have recommended blue-ocean replacements
  const availableReplacements = useMemo(() => {
    return GENERIC_REPLACEMENTS_MAP.filter((item) => {
      const reg = new RegExp(item.genericWord, 'gi');
      return (
        (currentDraft.selectedTitle && reg.test(currentDraft.selectedTitle)) ||
        (currentDraft.body && reg.test(currentDraft.body))
      );
    });
  }, [currentDraft.selectedTitle, currentDraft.body]);

  // Handle replace in body
  const handleReplaceInBody = (genericWord: string, replacement: string) => {
    const currentBody = currentDraft.body || '';
    if (!currentBody.includes(genericWord)) {
      showToast(`正文中未检测到【${genericWord}】`);
      return;
    }
    const newBody = currentBody.split(genericWord).join(replacement);
    if (onUpdateBody) {
      onUpdateBody(newBody);
    } else {
      onUpdateDraft({ body: newBody });
    }
    showToast(`已将正文中的【${genericWord}】平替为【${replacement}】✨`);
  };

  // Handle replace in title
  const handleReplaceInTitle = (genericWord: string, replacement: string) => {
    const currentTitle = currentDraft.selectedTitle || '';
    if (!currentTitle.includes(genericWord)) {
      showToast(`标题中未包含【${genericWord}】`);
      return;
    }
    const newTitle = currentTitle.split(genericWord).join(replacement);
    if (onUpdateTitle) {
      onUpdateTitle(newTitle);
    } else {
      onUpdateDraft({ selectedTitle: newTitle });
    }
    showToast(`已将标题中的【${genericWord}】升级为【${replacement}】✨`);
  };

  // Add missing keyword to SEO tags
  const handleAddKeywordToTags = (kw: string) => {
    const currentTags = currentDraft.seoTags || [];
    const formatted = `#${kw.replace(/^[#＃]/, '')}`;
    if (currentTags.includes(formatted)) {
      showToast(`标签【${formatted}】已存在`);
      return;
    }
    const updated = [...currentTags, formatted];
    onUpdateDraft({ seoTags: updated });
    showToast(`已将【${formatted}】添加至笔记标签！`);
  };

  // Insert missing keyword into body text
  const handleInsertKeywordIntoBody = (kw: string) => {
    const currentBody = currentDraft.body || '';
    const insertion = `\n\n💡 划重点：关于【${kw}】的避坑思路，姐妹们一定要牢记！`;
    const newBody = currentBody + insertion;
    if (onUpdateBody) {
      onUpdateBody(newBody);
    } else {
      onUpdateDraft({ body: newBody });
    }
    showToast(`已将【${kw}】自然插入文末划重点段落！`);
  };

  return (
    <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-[#F5F8F6] via-[#FAFBF9] to-[#F1F6F3] border border-[#CBDED3] shadow-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#4A725B] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2A4434]">
                SEO 蓝海词密度与截流分析
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  analysis.statusLevel === 'optimal'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : analysis.statusLevel === 'low'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {analysis.statusLabel} ({analysis.densityScore}分)
              </span>
            </div>
            <p className="text-[10px] text-[#5A7566] mt-0.5">
              实时比对小红书当前下拉热词与蓝海检索口令，测算文案搜索可见度
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-white/80 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {actionNotice && (
        <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-[#E8F3ED] text-[#2A4434] text-xs font-medium border border-[#CBDED3] flex items-center gap-1.5 animate-fade-in">
          <Check className="w-3.5 h-3.5 text-[#4A725B]" />
          <span>{actionNotice}</span>
        </div>
      )}

      {isExpanded && (
        <div className="mt-3.5 flex flex-col gap-3">
          {/* Progress bar and metrics */}
          <div className="p-3 bg-white rounded-xl border border-[#DFEBE3] shadow-xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-[#4A725B]" />
                蓝海词捕获率与覆盖密度
              </span>
              <span className="font-bold text-[#2A4434] text-sm">
                {analysis.matched.length} <span className="text-xs text-gray-400 font-normal">/ {blueOceanPool.length} 个高潜词已埋入</span>
              </span>
            </div>

            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  analysis.statusLevel === 'optimal'
                    ? 'bg-gradient-to-r from-[#8EA89D] to-[#4A725B]'
                    : analysis.statusLevel === 'low'
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500'
                    : 'bg-gradient-to-r from-rose-400 to-rose-600'
                }`}
                style={{ width: `${Math.max(analysis.densityScore, 6)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
              <span>0% 搜索盲区</span>
              <span className="text-[#4A725B] font-medium">30% - 60% 黄金自然留存带</span>
              <span>100% 堆砌预警</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-2 leading-relaxed bg-[#F8FAF9] p-2 rounded-lg border border-dashed border-[#DFEBE3]">
              {analysis.statusDesc}
            </p>
          </div>

          {/* 1. Matched Keywords & Missing Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Matched */}
            <div className="p-3 bg-white rounded-xl border border-[#DFEBE3] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  已自然埋入的蓝海词 ({analysis.matched.length})
                </span>
                <span className="text-[10px] text-gray-400">已生效搜一搜权重</span>
              </div>

              {analysis.matched.length === 0 ? (
                <div className="text-center py-3 text-xs text-gray-400 bg-gray-50 rounded-lg">
                  当前文案中暂未包含本次检索的高潜蓝海词
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matched.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      {item.keyword}
                      {item.inTitle && (
                        <span className="text-[9px] px-1 rounded bg-emerald-200 text-emerald-900 font-bold">
                          标题
                        </span>
                      )}
                      {item.inBody && !item.inTitle && (
                        <span className="text-[9px] px-1 rounded bg-gray-200 text-gray-700">
                          正文
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing */}
            <div className="p-3 bg-white rounded-xl border border-[#DFEBE3] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-800 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  待补充的高潜蓝海词 ({analysis.missing.length})
                </span>
                <span className="text-[10px] text-gray-400">点击一键植入</span>
              </div>

              {analysis.missing.length === 0 ? (
                <div className="text-center py-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg font-medium">
                  🎉 绝佳！当前已覆盖全部检索到的高潜蓝海词
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {analysis.missing.slice(0, 8).map((item, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200"
                    >
                      <span>{item.keyword}</span>
                      <button
                        onClick={() => handleAddKeywordToTags(item.keyword)}
                        title="添加到文末标签"
                        className="p-0.5 hover:bg-amber-200 rounded text-amber-800 transition-colors"
                      >
                        <Tag className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => handleInsertKeywordIntoBody(item.keyword)}
                        title="插入正文划重点"
                        className="p-0.5 hover:bg-amber-200 rounded text-amber-800 transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Generic to Blue Ocean Replacement Suggestions */}
          <div className="p-3 bg-white rounded-xl border border-[#DFEBE3] flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2A4434] flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#C27A83]" />
                泛词 · 内卷大词平替升级建议（避开大博主内卷，截流长尾搜索）
              </span>
              <span className="text-[10px] text-gray-400">支持一键平替写入文案</span>
            </div>

            {availableReplacements.length === 0 ? (
              <div className="p-3 rounded-lg bg-[#FAFBF9] border border-dashed border-[#DFEBE3] text-xs text-gray-500 flex items-center justify-between">
                <span>
                  当前文案用词质感良好，未发现过于泛滥的“好看/变美/显白”等低意图大词。
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  ✓ 语感达标
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {availableReplacements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#F8FAF9] border border-[#DFEBE3] hover:border-[#8EA89D] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] line-through text-gray-400 font-medium">
                          【{item.genericWord}】
                        </span>
                        <span className="text-gray-300">→</span>
                        <span className="text-xs font-bold text-[#2A4434] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.recommendedBlueOcean}
                        </span>
                        <span className="text-[10px] text-[#4A725B] font-semibold bg-white px-1.5 py-0.2 rounded border border-[#CBDED3]">
                          {item.searchBoost}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500">{item.benefit}</span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => handleReplaceInBody(item.genericWord, item.recommendedBlueOcean)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[#CBDED3] hover:bg-[#EBF3EF] text-[#2A4434] font-semibold transition-colors cursor-pointer"
                      >
                        替换正文
                      </button>
                      <button
                        onClick={() => handleReplaceInTitle(item.genericWord, item.recommendedBlueOcean)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-[#4A725B] text-white hover:bg-[#3B5D49] font-semibold transition-colors cursor-pointer"
                      >
                        替换标题
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
