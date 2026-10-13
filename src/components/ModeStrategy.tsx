import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Target,
  Calendar,
  Layers,
  HeartHandshake,
  BookmarkCheck,
} from 'lucide-react';

export const ModeStrategy: React.FC = () => {
  const [targetAudience, setTargetAudience] = useState('追求自然变美的普通女孩 / 职场早八人');
  const [niche, setNiche] = useState('淡颜方圆脸皮相打理与莫兰迪气质提升');
  const [currentStage, setCurrentStage] = useState('0粉起号 / 破冰阶段');
  const [painPoint, setPainPoint] = useState('变美内容同质化严重，容易流于空洞鸡汤，不知道如何建立有辨识度的陪伴感人设');
  const [strength, setStrength] = useState('执行力强、真诚接地气、善于把繁杂变美技巧归纳成保姆级日常清单');

  const [isLoading, setIsLoading] = useState(false);
  const [strategyResult, setStrategyResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Strategy Presets
  const presets = [
    {
      label: '方圆脸淡颜美商',
      audience: '方圆脸、淡颜五官、不适合浓妆的年轻女性',
      niche: '骨相修饰与清冷氛围感打造',
      pain: '容易显脸大、显没精神，浓妆反而显脏',
      strength: '真实素人视角，不鼓吹整容，专注日常低成本发型与修饰',
    },
    {
      label: '黄黑皮透亮素颜',
      audience: '熬夜气色差、黄黑皮、护肤容易踩雷的上班族',
      niche: '28天温润养皮与极简内调自律打卡',
      pain: '跟风刷酸猛药烂脸，暗沉反复',
      strength: '温和植萃护肤逻辑，自律作息打卡搭子陪伴',
    },
    {
      label: '小个子莫兰迪穿搭',
      audience: '155-160cm 梨形身材普通女生',
      niche: 'Sage & Blush 治愈系胶囊衣橱与比例重塑',
      pain: '买衣服容易被模特图骗，穿不出高级感',
      strength: '精通色彩呼应与高腰垂坠剪裁，拒绝刻意恨天高',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setTargetAudience(p.audience);
    setNiche(p.niche);
    setPainPoint(p.pain);
    setStrength(p.strength);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/gemini/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAudience,
          niche,
          currentStage,
          painPoint,
          strength,
        }),
      });

      const data = await res.json();
      if (!data.success && !data.text) {
        throw new Error(data.error || '诊断失败');
      }

      setStrategyResult(data.text);
    } catch (err: any) {
      setErrorMessage(err.message || '策略生成服务暂时繁忙，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(strategyResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#EBF3EE] via-[#FAF3F2] to-[#F5E6E5] rounded-3xl border border-[#DFECE4] shadow-morandi flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#527763] shadow-xs">
            <Compass className="w-6 h-6 text-[#7DA28B]" />
          </div>
          <div>
            <h2 className="font-serif-sc font-bold text-lg text-[#263C2E]">
              顾问模式 · 账号定位与起号全案 SOP
            </h2>
            <p className="text-xs text-[#5D7769] mt-0.5">
              运用“人群 × 场景 × 核心价值”矩阵，制定差异化人设与 30 天起号打法
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-[#7DA28B] border border-[#D3E4DB]">
            🌱 拒绝同质化
          </span>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-[#C27A83] border border-[#F3D7DA]">
            ✨ 全手动合规起号
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Quick preset selector */}
          <div className="p-4 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#324B3C] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C27A83]" />
              快速套用赛道起号画像
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#F6FAF8] hover:bg-[#EBF3EF] border border-[#DCE8E0] text-[#3D5E4C] transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form container */}
          <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#324B3C]">
                1. 目标受众群体 (人群)
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="例如：20-28岁在职/学生，想提升气质的普通女孩"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#324B3C]">
                2. 美商逆袭切入点 (场景与细分赛道)
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="例如：方圆脸淡颜发型修饰、黄黑皮透亮素颜"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#324B3C]">
                3. 当前所处阶段
              </label>
              <select
                value={currentStage}
                onChange={(e) => setCurrentStage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40 cursor-pointer"
              >
                <option value="0粉起号 / 破冰阶段 (前7天)">0粉起号 / 破冰阶段 (前7天)</option>
                <option value="已发10-30篇，卡在几百播放瓶颈期">已发10-30篇，卡在几百播放瓶颈期</option>
                <option value="万粉冲刺 / 提高粉丝粘性与互动率">万粉冲刺 / 提高粉丝粘性与互动率</option>
                <option value="商业化转型 / 接首条合规商单前的人设固化">商业化转型 / 接首条合规商单前的人设固化</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#324B3C]">
                4. 核心痛点与困惑
              </label>
              <textarea
                rows={3}
                value={painPoint}
                onChange={(e) => setPainPoint(e.target.value)}
                placeholder="例如：内容容易同质化、不知道怎样设计差异化封面与人设"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#324B3C]">
                5. 个人特质与优势 (核心价值)
              </label>
              <textarea
                rows={2}
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="例如：善于拆解SOP、真诚陪伴打卡、审美敏锐"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#6E947C] via-[#7DA28B] to-[#C27A83] text-white font-semibold text-xs shadow-md hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>策略顾问正在推演“人群×场景×价值”模型…</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>输出账号定位与起号全案 SOP</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Area */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-6 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi min-h-[550px] flex flex-col justify-between">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-[#FEF5F6] border border-[#F7C6CA] flex items-center justify-between gap-3 text-xs text-[#A63D49]">
                <span>{errorMessage}</span>
                <button
                  onClick={handleGenerate}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#F5D8DB] text-[#A63D49] hover:bg-[#FDF2F3] font-medium text-[11px] cursor-pointer"
                >
                  重试
                </button>
              </div>
            )}

            {strategyResult ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#EDF4F0] pb-3">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-5 h-5 text-[#6E947C]" />
                    <span className="font-bold text-sm text-[#273B2F]">
                      美商逆袭起号与定位全案诊断书
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#F2F7F4] text-[#426150] hover:bg-[#E3EFE8] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#5B886E]" /> : <Copy className="w-3.5 h-3.5" />}
                    一键复制策略全案
                  </button>
                </div>

                <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap selection:bg-[#E8F1EC] font-normal">
                  {strategyResult}
                </div>
              </div>
            ) : (
              <div className="my-auto flex flex-col items-center justify-center text-center p-8 text-gray-400 gap-3">
                <div className="w-16 h-16 rounded-3xl bg-[#F4F8F5] border border-[#DEEBE2] flex items-center justify-center text-[#8EA89D]">
                  <Compass className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#385242]">
                    尚未生成定位诊断书
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    在左侧设定你的受众与美商细分切入点，点击“输出账号定位与起号全案 SOP”，获取定制化的差异化矩阵与 30 天起号规划。
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
