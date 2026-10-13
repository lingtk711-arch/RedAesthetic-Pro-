import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Check,
  Copy,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SENSITIVE_WORDS_DB } from '../data/presets';
import { SensitiveWordMatch } from '../types';

export const RiskToolsModal: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testText, setTestText] = useState('这个护肤品是全网第一强，保证见效，三天变白！加我微信私我领独家秘籍！');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: '全部违规类型' },
    { id: '极限违禁词', label: '广告法极限词' },
    { id: '虚假功效宣传', label: '夸大功效承诺' },
    { id: '私域导流', label: '公域引流违规' },
    { id: '医疗美容禁语', label: '涉医美违规术语' },
    { id: '过度制造焦虑', label: '容貌/身材焦虑' },
  ];

  const filteredWords = SENSITIVE_WORDS_DB.filter((item) => {
    const matchesSearch =
      item.word.includes(searchTerm) ||
      item.replacement.includes(searchTerm) ||
      item.reason.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Test text detection
  const detectedInTest = SENSITIVE_WORDS_DB.filter((item) => testText.includes(item.word));

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAutoReplaceTest = () => {
    let replaced = testText;
    detectedInTest.forEach((item) => {
      replaced = replaced.replaceAll(item.word, item.replacement);
    });
    setTestText(replaced);
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#F0F6F2] via-[#FDF9F8] to-[#F7EDED] rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#4B705B] shadow-xs">
            <ShieldCheck className="w-6 h-6 text-[#6E947C]" />
          </div>
          <div>
            <h2 className="font-serif-sc font-bold text-lg text-[#263C2E]">
              小红书美商赛道 · 风控规避库与合规平替字典
            </h2>
            <p className="text-xs text-[#5D7769] mt-0.5">
              避开广告法极限词、功效夸大承诺与私域截流暗号，保障账号长期高权重安全运营
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Live Tester */}
      <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#324B3C] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#C27A83]" />
            文案敏感词在线高亮实测区
          </span>
          {detectedInTest.length > 0 ? (
            <button
              onClick={handleAutoReplaceTest}
              className="px-3 py-1 text-xs font-semibold rounded-xl bg-[#6E947C] text-white hover:bg-[#5C8169] transition-colors cursor-pointer flex items-center gap-1"
            >
              一键替换为高情商合规词
            </button>
          ) : (
            <span className="text-xs text-[#4F8062] font-semibold flex items-center gap-1">
              ✓ 当前输入安全合规
            </span>
          )}
        </div>

        <textarea
          rows={3}
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="在此处粘贴任何你想测试的文案段落…"
          className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40"
        />

        {detectedInTest.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {detectedInTest.map((item, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-[#FFF5F6] border border-[#F8CCD0] text-[11px] flex items-center gap-1.5"
              >
                <span className="font-bold text-[#A83D48]">⚠️ 违规：{item.word}</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="text-[#326145] font-semibold">推荐平替：{item.replacement}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dictionary Search & Filter */}
      <div className="p-6 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索敏感词、合规替换或原因…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40"
            />
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-[#F4F8F5] rounded-xl border border-[#DEEBE2]">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-white text-[#2B4737] shadow-xs font-semibold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Word Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredWords.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-[#E2EDE5] bg-[#FAFBF9] hover:bg-white hover:border-[#BED6C7] transition-all flex flex-col justify-between gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#A63743] px-2 py-0.5 rounded-md bg-[#FFF0F2] border border-[#FAD0D5]">
                  ❌ 违禁词：{item.word}
                </span>
                <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 rounded bg-white border border-gray-100">
                  {item.category}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F0F6F2] border border-[#D2E4D8] flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-[#486B56]">
                    ✨ 推荐合规平替：
                  </span>
                  <p className="text-xs font-bold text-[#2A4B37] mt-0.5">
                    {item.replacement}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(item.replacement, `w-${idx}`)}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium bg-white text-[#385945] border border-[#C5DCD0] hover:bg-[#EBF3EE] transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copiedKey === `w-${idx}` ? <Check className="w-3 h-3 text-[#4A7A5D]" /> : <Copy className="w-3 h-3" />}
                  复制
                </button>
              </div>

              <p className="text-[11px] text-gray-500 leading-snug">
                ⚠️ 违规原因：{item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
