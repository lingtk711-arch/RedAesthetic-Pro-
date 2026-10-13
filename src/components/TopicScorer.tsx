import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  Copy,
  Lightbulb,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Flame,
  FileEdit,
  Sliders,
} from 'lucide-react';
import { DIVERSE_AESTHETIC_PALETTES } from '../data/presets';

interface TopicScorerProps {
  initialTopic?: string;
  initialAngle?: string;
  onAdoptTopic?: (topic: string, angle: string, keyword?: string) => void;
}

export const TopicScorer: React.FC<TopicScorerProps> = ({
  initialTopic = '',
  initialAngle = '',
  onAdoptTopic,
}) => {
  const [inputMode, setInputMode] = useState<'topic' | 'inspiration'>('topic');
  const [topic, setTopic] = useState(initialTopic || '普通女孩如何靠胶囊衣橱提升穿搭美商');
  const [rawInspiration, setRawInspiration] = useState(
    '我发现很多身边的女生买衣服总是被网红带货牵着走，买回一堆高饱和廉价衣服挂在衣柜里不知怎么搭。其实普通女孩根本不需要买很多衣服，只要理清70%基础大地色+30%亮点呼应的胶囊衣橱，不用大牌也能穿出老钱静奢的高级感。我想写一篇教普通女孩自我建立胶囊衣橱的变美笔记，不知道大家会不会买单？'
  );
  const [targetAudience, setTargetAudience] = useState('想摆脱土气感、预算有限的年轻女生与职场早八人');
  const [angle, setAngle] = useState(initialAngle || '低成本变美自查、避开消费主义、注重版型与面料垂坠');
  const [aestheticStyle, setAestheticStyle] = useState('老钱大地色 (Quiet Luxury)');

  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialAngle) setAngle(initialAngle);
  }, [initialTopic, initialAngle]);

  const presetExamples = [
    {
      type: 'topic',
      topic: '方圆脸发型怎么剪才能显脸小又松弛？',
      audience: '方圆脸、下颌角明显、五官量感小的淡颜女生',
      angle: '放弃死板厚刘海遮挡，利用耳际外翻弧度横向平衡脸型',
      style: 'Sage & Blush 治愈莫兰迪',
    },
    {
      type: 'topic',
      topic: '普通女孩如何靠胶囊衣橱穿出老钱静奢感？',
      audience: '追求质感、不想每天花时间搭配的职场早八人',
      angle: '70%基础大地色+30%亮点，强调垂坠与熨烫细节',
      style: 'Old Money 老钱大地色',
    },
    {
      type: 'inspiration',
      rawText: '我每次照镜子总觉得自己拍照没精神，后来发现根本不是五官长得不好看，而是长期看手机导致脖子前倾、耸肩，整个人显得很缩微。我尝试了每天靠墙站立5分钟和转肩沉肩，整个人立刻舒展很多。我想记录这个习惯，但不知道怎么起标题才能让人点进来。',
      audience: '长期伏案低头、拍照容易驼背的早八学生与白领',
      angle: '每天3个不花钱的体态舒展动作，比修容更能立拔气质',
      style: 'Zen Bamboo 东方素竹茶青',
    },
  ];

  const handleApplyPreset = (p: typeof presetExamples[0]) => {
    if (p.type === 'topic') {
      setInputMode('topic');
      setTopic(p.topic || '');
      setTargetAudience(p.audience);
      setAngle(p.angle);
      setAestheticStyle(p.style);
    } else {
      setInputMode('inspiration');
      setRawInspiration(p.rawText || '');
      setTargetAudience(p.audience);
      setAngle(p.angle);
      setAestheticStyle(p.style);
    }
  };

  const handleScoreAndDiagnose = async () => {
    const payload =
      inputMode === 'topic'
        ? { topic, targetAudience, angle, aestheticStyle }
        : { rawInspiration, targetAudience, angle, aestheticStyle };

    if (inputMode === 'topic' && !topic.trim()) return;
    if (inputMode === 'inspiration' && !rawInspiration.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/gemini/topic-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success && !data.text) {
        throw new Error(data.error || '检测打分失败');
      }

      setResultText(data.text);
    } catch (err: any) {
      setErrorMessage(err.message || '选题诊断服务暂时繁忙，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Extract parsed sections from markdown text
  const extractRealKeywords = () => {
    if (!resultText) return [];
    const lines = resultText.split('\n');
    const items: Array<{ name: string; url: string; tag: string }> = [];

    lines.forEach((line) => {
      if (line.includes('真实母词：') || line.includes('真实母词:') || line.includes('蓝海口令：') || line.includes('蓝海口令:')) {
        const cleanName = line.replace(/.*?【(.*?)】.*/, '$1').replace(/.*?[：:]\s*/, '').replace(/[【】]/g, '').trim();
        const kw = cleanName.split(' ')[0] || cleanName;
        items.push({
          name: cleanName,
          url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(cleanName)}`,
          tag: line.includes('母词') ? '高搜母词' : '蓝海口令',
        });
      }
    });

    // Fallback if formatting was slightly different
    if (items.length === 0 && (topic || rawInspiration)) {
      const base = (inputMode === 'topic' ? topic : rawInspiration.slice(0, 10)).slice(0, 8);
      items.push(
        {
          name: `${base} 变美思路`,
          url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${base} 变美思路`)}`,
          tag: '高搜母词',
        },
        {
          name: `${base} 普通女孩自查`,
          url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${base} 普通女孩自查`)}`,
          tag: '蓝海口令',
        }
      );
    }

    return items;
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#EBF3EF] via-[#FAF6F2] to-[#F5E6E5] rounded-3xl border border-[#DFECE4] shadow-morandi flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#557764] shadow-xs">
            <Award className="w-6 h-6 text-[#7DA28B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-sc font-bold text-lg text-[#263C2E]">
                美商选题打分 & 灵感全景检测室
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-[#4A725B] font-semibold border border-[#CCE2D4]">
                真实热搜母词 + 蓝海检索口令
              </span>
            </div>
            <p className="text-xs text-[#5D7769] mt-0.5">
              输入确立的选题或自由输入一段日常灵感碎片，AI 顾问深度检测【行不行？】并匹配小红书真实平台下拉热搜母词与真实链接！
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Section */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Preset Selector */}
          <div className="p-4 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#324B3C] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-[#C27A83]" />
              快速填入热门测试样例：
            </span>
            <div className="flex flex-col gap-1.5">
              {presetExamples.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="p-2.5 rounded-xl bg-[#FAFBF9] hover:bg-[#F2F7F4] border border-[#DEECE2] text-left transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EBF3EF] text-[#3D634E] font-medium shrink-0">
                      {p.type === 'topic' ? '确立选题' : '灵感碎片'}
                    </span>
                    <span className="text-xs text-gray-700 truncate font-medium">
                      {p.type === 'topic' ? p.topic : (p.rawText || '').slice(0, 22) + '...'}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#4A725B] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Main Input Form */}
          <div className="p-6 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4">
            {/* Input Mode Switcher */}
            <div className="flex items-center p-1 bg-[#F4F8F5] rounded-2xl border border-[#DEEBE2]">
              <button
                onClick={() => setInputMode('topic')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  inputMode === 'topic'
                    ? 'bg-white text-[#294535] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>输入确立的选题</span>
              </button>
              <button
                onClick={() => setInputMode('inspiration')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  inputMode === 'inspiration'
                    ? 'bg-white text-[#294535] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>自由输入灵感 / 想法检测</span>
              </button>
            </div>

            {/* Field 1: Topic or Raw Inspiration */}
            {inputMode === 'topic' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#324B3C] flex items-center gap-1">
                  <span>选题名称</span>
                  <span className="text-[#C27A83]">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="例如：方圆脸发型怎么剪才能显脸小又松弛？"
                  className="px-3.5 py-2.5 text-xs rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#324B3C] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span>输入你的一段灵感 / 日常观察碎碎念</span>
                    <span className="text-[#C27A83]">*</span>
                  </div>
                  <span className="text-[11px] text-gray-400">检测行不行</span>
                </label>
                <textarea
                  rows={4}
                  value={rawInspiration}
                  onChange={(e) => setRawInspiration(e.target.value)}
                  placeholder="把自己平时想到的变美感悟、看到的现象、或者随手记录的灵感粘贴进来，AI 顾问帮你深度诊断是否具备爆款潜力..."
                  className="p-3 text-xs rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40 leading-relaxed resize-none"
                />
              </div>
            )}

            {/* Field 2: Target Audience */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#324B3C]">目标受众群体</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="例如：20-30岁职场早八人、小个子女生、方圆脸淡颜"
                className="px-3.5 py-2 text-xs rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40"
              />
            </div>

            {/* Field 3: Core Angle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#324B3C]">核心切入角度</label>
              <input
                type="text"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                placeholder="例如：低成本自查、胶囊衣橱、不花大钱的微习惯"
                className="px-3.5 py-2 text-xs rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40"
              />
            </div>

            {/* Field 4: Aesthetic Style Preference */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#324B3C] flex items-center justify-between">
                <span>期望视觉美学风格（多元自选）</span>
                <span className="text-[10px] text-[#718A7B]">不局限于粉绿</span>
              </label>
              <select
                value={aestheticStyle}
                onChange={(e) => setAestheticStyle(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40 text-gray-700"
              >
                {DIVERSE_AESTHETIC_PALETTES.map((pal) => (
                  <option key={pal.id} value={pal.name}>
                    {pal.name} ({pal.tag})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleScoreAndDiagnose}
              disabled={isLoading || (inputMode === 'topic' ? !topic.trim() : !rawInspiration.trim())}
              className="mt-2 w-full py-3 rounded-2xl bg-gradient-to-r from-[#6E947C] via-[#7DA28B] to-[#C27A83] hover:opacity-95 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-morandi transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>正在深度检测行不行 & 提取真实热搜口令...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{inputMode === 'topic' ? '检测选题潜力 & 提取真实热搜口令' : '检测这段灵感行不行 & 提取平台对标词'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Section */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#FEF5F6] border border-[#F7C6CA] flex items-center justify-between gap-3 text-xs text-[#A63D49]">
              <span>{errorMessage}</span>
              <button
                onClick={handleScoreAndDiagnose}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#F5D8DB] text-[#A63D49] hover:bg-[#FDF2F3] font-medium text-[11px] cursor-pointer"
              >
                重试
              </button>
            </div>
          )}

          {/* Direct Real Links Quick Panel */}
          {resultText && (
            <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#FF2442]" />
                  <h3 className="font-serif-sc font-bold text-sm text-[#243B2E]">
                    小红书真实平台对标 · 直达检索通道
                  </h3>
                </div>
                <span className="text-[10px] text-gray-500">点击在新窗口打开实时万赞池</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {extractRealKeywords().map((kw, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-[#F6FAF7] border border-[#D5E8DC] flex items-center justify-between gap-2"
                  >
                    <div className="flex flex-col overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-[#3E6650] font-bold border border-[#D0E2D6]">
                          {kw.tag}
                        </span>
                        <span className="font-bold text-xs text-[#2A4B37] truncate">
                          "{kw.name}"
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopy(kw.name, `kw-${i}`)}
                        className="p-1 rounded-lg bg-white border border-[#BCD4C5] text-gray-600 hover:text-black cursor-pointer text-[10px]"
                        title="复制搜索词"
                      >
                        {copiedKey === `kw-${i}` ? <Check className="w-3 h-3 text-[#4A775C]" /> : <Copy className="w-3 h-3" />}
                      </button>

                      <a
                        href={kw.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded-lg bg-[#FF2442] hover:bg-[#E01834] text-white text-[10px] font-semibold flex items-center gap-0.5 transition-colors"
                        title="前往真实小红书搜索同款"
                      >
                        <span>去搜对标</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostic & Upgrades Output Report */}
          <div className="p-6 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4 min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAF2ED]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#C27A83]" />
                <h3 className="font-serif-sc font-bold text-sm text-[#273E31]">
                  深度检测报告 & 升级操盘指南
                </h3>
              </div>

              {resultText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(resultText, 'full-report')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#466955] bg-[#F2F7F4] hover:bg-[#E5EFE8] border border-[#D5E5DB] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'full-report' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#4A775C]" />
                        <span>已复制报告</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>复制报告</span>
                      </>
                    )}
                  </button>

                  {onAdoptTopic && (
                    <button
                      onClick={() => {
                        const adoptedTopic = inputMode === 'topic' ? topic : rawInspiration.slice(0, 18);
                        onAdoptTopic(adoptedTopic, angle);
                      }}
                      className="px-3 py-1 rounded-xl bg-[#6E947C] hover:bg-[#5C8169] text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>采纳此选题去操盘 →</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Body of Report */}
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
                <RefreshCw className="w-7 h-7 text-[#7DA28B] animate-spin" />
                <p className="text-xs text-[#5D7769]">
                  正在全方位扫描受众共鸣度、前3秒防跳出点、风控合规，并匹配小红书真实下拉母词...
                </p>
              </div>
            ) : resultText ? (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                <div className="prose prose-sm max-w-none text-xs text-[#2A3F33] leading-relaxed whitespace-pre-wrap font-sans">
                  {resultText}
                </div>

                {onAdoptTopic && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#F4F9F6] to-[#FAF4F4] border border-[#DCEBE1] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C27A83]" />
                      <span className="text-xs font-bold text-[#2A4836]">
                        觉得当前诊断和升级思路契合？一键直通操盘：
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const adoptedTopic = inputMode === 'topic' ? topic : rawInspiration.slice(0, 18);
                        onAdoptTopic(adoptedTopic, angle);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6E947C] to-[#C27A83] text-white text-xs font-semibold shadow-xs hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>一键导入操盘模式并生成真机文案</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-gray-400 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F4F8F5] flex items-center justify-center text-gray-400">
                  <Award className="w-6 h-6 text-[#98B2A3]" />
                </div>
                <p className="text-xs text-gray-500 max-w-sm">
                  请在左侧输入你想做的确立选题，或自由输入一段变美想法碎碎念。点击“检测”，AI 顾问将为你输出专业客观的【行不行判定】与真实小红书搜索直达对标！
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
