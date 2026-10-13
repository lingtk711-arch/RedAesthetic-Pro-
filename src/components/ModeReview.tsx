import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Wand2,
} from 'lucide-react';
import { SENSITIVE_WORDS_DB } from '../data/presets';
import { SensitiveWordMatch } from '../types';

interface ModeReviewProps {
  initialTitle?: string;
  initialContent?: string;
}

export const ModeReview: React.FC<ModeReviewProps> = ({
  initialTitle,
  initialContent,
}) => {
  const [title, setTitle] = useState(
    initialTitle || '换头术！方圆脸三天彻底变小V脸，加我微信领最强独家秘籍！'
  );
  const [content, setContent] = useState(
    initialContent ||
      `姐妹们！今天分享这个顶级换头术！
真的保证见效！方圆脸肉肉脸三天变白而且速效瘦身，彻底治愈你的大饼脸焦虑！
这是全网第一强的独家秘籍，别人绝对不告诉你的！
想学的赶紧私我，加我微信拉你们进变美打卡群，手把手带你们暴瘦逆袭！`
  );
  const [stats, setStats] = useState('发布24小时，曝光120，点击率仅1.2%，几乎0赞0评论');
  const [problemType, setProblemType] = useState('疑似被限流/判定违规/封面与标题跳出率高');

  // Sync if initial props change
  React.useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
    if (initialContent) setContent(initialContent);
  }, [initialTitle, initialContent]);

  const [isLoading, setIsLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isOfflineEngine, setIsOfflineEngine] = useState<boolean>(false);

  // Real-time instant scanner
  const combinedText = `${title} ${content}`;
  const detectedRisks: SensitiveWordMatch[] = SENSITIVE_WORDS_DB.filter((item) =>
    combinedText.includes(item.word)
  );

  // One-click local sanitize replacement
  const handleAutoSanitize = () => {
    let sanitizedTitle = title;
    let sanitizedContent = content;

    detectedRisks.forEach((risk) => {
      sanitizedTitle = sanitizedTitle.replaceAll(risk.word, risk.replacement);
      sanitizedContent = sanitizedContent.replaceAll(risk.word, risk.replacement);
    });

    setTitle(sanitizedTitle);
    setContent(sanitizedContent);
  };

  const handleDeepReview = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setIsOfflineEngine(false);

    try {
      const res = await fetch('/api/gemini/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          stats,
          problemType,
        }),
      });

      const data = await res.json();
      if (!data.success && !data.text) {
        throw new Error(data.error || '诊断失败');
      }

      setReviewResult(data.text);
      if (data.isFallback) {
        setIsOfflineEngine(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || '诊断分析服务暂时繁忙，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reviewResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#FDF2F3] via-[#FDF8F7] to-[#EDF4F0] rounded-3xl border border-[#F3DADB] shadow-morandi flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#B24F5C] shadow-xs">
            <Search className="w-6 h-6 text-[#C27A83]" />
          </div>
          <div>
            <h2 className="font-serif-sc font-bold text-lg text-[#322325]">
              诊断模式 · 低流量排查与风控合规自检
            </h2>
            <p className="text-xs text-[#7A5B60] mt-0.5">
              广告法违规词速查、私域暗号拦截、跳出率诊断与 100% 合规脱敏改写
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-[#B04C5A] border border-[#F5D8DB]">
            🛡️ 广告法风控库
          </span>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-[#557864] border border-[#D5E7DC]">
            📈 流量卡点排查
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Area */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Real-time Risk Alert Banner */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              detectedRisks.length > 0
                ? 'bg-[#FEF5F6] border-[#F7C6CA]'
                : 'bg-[#F2F8F4] border-[#CCE0D3]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {detectedRisks.length > 0 ? (
                  <ShieldAlert className="w-5 h-5 text-[#B83E4C]" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-[#4E8062]" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    {detectedRisks.length > 0
                      ? `检测到 ${detectedRisks.length} 处高危敏感/违禁表达`
                      : '本地安全字典自检通过：未发现典型极限词'}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {detectedRisks.length > 0
                      ? '包含广告法极限词、私域导流或夸大承诺，极易导致限流或违规拦截。'
                      : '已符合社区基本词汇规范，建议进一步深度诊断流量卡点。'}
                  </p>
                </div>
              </div>

              {detectedRisks.length > 0 && (
                <button
                  onClick={handleAutoSanitize}
                  className="px-3 py-1.5 rounded-xl bg-[#C27A83] hover:bg-[#B06771] text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  一键平替
                </button>
              )}
            </div>

            {/* List of matched risks */}
            {detectedRisks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#F7D4D7] flex flex-wrap gap-1.5">
                {detectedRisks.map((risk, idx) => (
                  <span
                    key={idx}
                    title={`${risk.category} - 建议替换为: ${risk.replacement}`}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-white border border-[#EAAFB5] text-[#982B38] font-medium flex items-center gap-1"
                  >
                    <span>⚠️ {risk.word}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-gray-400" />
                    <span className="text-[#3F6851] font-semibold">{risk.replacement}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#324B3C] flex items-center justify-between">
                <span>1. 待诊断的笔记标题</span>
                <span className="text-[11px] font-normal text-gray-400">前 3 秒吸引力核心</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入想要检测的标题"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C27A83]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#324B3C] flex items-center justify-between">
                <span>2. 待诊断的正文内容</span>
                <span className="text-[11px] font-normal text-gray-400">
                  {content.length} 字符
                </span>
              </label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="粘贴待发布的正文，或已经发布后数据不佳的文案"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#C27A83]/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#324B3C]">
                  3. 现状数据反馈
                </label>
                <input
                  type="text"
                  value={stats}
                  onChange={(e) => setStats(e.target.value)}
                  placeholder="例如：曝光200，点击率1.5%，0评论"
                  className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#324B3C]">
                  4. 主要困惑与疑虑
                </label>
                <select
                  value={problemType}
                  onChange={(e) => setProblemType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs cursor-pointer"
                >
                  <option value="疑似被系统限流 / 违规拦截">疑似被系统限流 / 违规拦截</option>
                  <option value="小眼睛极低 (封面/标题跳出率高)">小眼睛极低 (封面/标题跳出率高)</option>
                  <option value="有阅读但几乎无人互动 (缺少共鸣与CTA)">有阅读但几乎无人互动 (缺少共鸣与CTA)</option>
                  <option value="收藏高但涨粉少 (人设未固化)">收藏高但涨粉少 (人设未固化)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleDeepReview}
              disabled={isLoading || !content.trim()}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#C27A83] via-[#BD6A75] to-[#6E947C] text-white font-semibold text-xs shadow-md hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>风控与主笔专家正在逐字排查中…</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>启动深度排查与一键合规改写</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Area */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="p-6 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi min-h-[550px] flex flex-col justify-between">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-[#FEF5F6] border border-[#F7C6CA] flex items-center justify-between gap-3 text-xs text-[#A63D49]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#C27A83]" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={handleDeepReview}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#F5D8DB] text-[#A63D49] hover:bg-[#FDF2F3] font-medium text-[11px] cursor-pointer"
                >
                  重试
                </button>
              </div>
            )}

            {reviewResult ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EDF4F0] pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#5B886E]" />
                    <span className="font-bold text-sm text-[#273B2F]">
                      深度排查报告与优化方案
                    </span>
                    {isOfflineEngine && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDF4F0] text-[#426150] border border-[#DFECE4]">
                        🛡️ 专家引擎守护
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#F2F7F4] text-[#426150] hover:bg-[#E3EFE8] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#5B886E]" /> : <Copy className="w-3.5 h-3.5" />}
                    一键复制优化版
                  </button>
                </div>

                <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap selection:bg-[#E8F1EC] font-normal">
                  {reviewResult}
                </div>
              </div>
            ) : (
              <div className="my-auto flex flex-col items-center justify-center text-center p-8 text-gray-400 gap-3">
                <div className="w-16 h-16 rounded-3xl bg-[#FAF4F5] border border-[#F3DBDF] flex items-center justify-center text-[#C27A83]">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#3E292C]">
                    等待启动诊断排查
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    左侧输入笔记标题与正文后，系统将同时执行本地广告法词库扫描与 AI 深度诊断，输出违禁词替换表、跳出率分析与高转化脱敏正文。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
