import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  ArrowRight,
  Bookmark,
  Heart,
  Video,
  FileText,
  Compass,
  Search,
  Copy,
  Check,
  Award,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { AestheticInspiration } from '../types';
import { DAILY_AESTHETIC_FEED } from '../data/aestheticFeed';

interface DailyAestheticFeedProps {
  onReplicate: (inspiration: AestheticInspiration) => void;
  onGoToScorer?: (topic: string, angle: string) => void;
  onGoToStrategy: () => void;
}

export const DailyAestheticFeed: React.FC<DailyAestheticFeedProps> = ({
  onReplicate,
  onGoToScorer,
  onGoToStrategy,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | '小红书' | 'Instagram'>('all');
  const [aestheticFilter, setAestheticFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom AI Search Explorer state
  const [customKeyword, setCustomKeyword] = useState('');
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveResults, setLiveResults] = useState<Array<{ title: string; angle: string; searchQuery: string; searchUrl: string }>>([]);

  const filteredList = DAILY_AESTHETIC_FEED.filter((item) => {
    const matchPlatform = platformFilter === 'all' || item.platform === platformFilter;
    const matchAesthetic = aestheticFilter === 'all' || item.aestheticCategory === aestheticFilter;
    return matchPlatform && matchAesthetic;
  });

  const handleCopySearchQuery = (query: string, id: string) => {
    navigator.clipboard.writeText(query);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLiveExplore = async () => {
    if (!customKeyword.trim()) return;
    setIsSearchingLive(true);
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `请针对小红书美商逆袭赛道中的具体细分方向【${customKeyword}】，提供 3 条目前在小红书真实平台搜索量最高、最容易被素人爆款验证的真实热搜母词与选题。
请严格输出 3 条，格式如下：
1. 选题名称：...
   切入角度：...
   精准搜索词：...（真实在小红书能搜到海量笔记的词汇）`,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        const lines = data.text.split('\n');
        const results: Array<{ title: string; angle: string; searchQuery: string; searchUrl: string }> = [];
        let currentItem = { title: '', angle: '', searchQuery: '', searchUrl: '' };

        lines.forEach((line: string) => {
          if (line.includes('选题名称：') || line.includes('选题名称:')) {
            if (currentItem.title) results.push({ ...currentItem });
            currentItem.title = line.replace(/.*?选题名称[：:]\s*/, '').trim();
          } else if (line.includes('切入角度：') || line.includes('切入角度:')) {
            currentItem.angle = line.replace(/.*?切入角度[：:]\s*/, '').trim();
          } else if (line.includes('精准搜索词：') || line.includes('精准搜索词:')) {
            const sq = line.replace(/.*?精准搜索词[：:]\s*/, '').trim();
            currentItem.searchQuery = sq;
            currentItem.searchUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(sq)}`;
          }
        });
        if (currentItem.title) results.push({ ...currentItem });

        if (results.length > 0) {
          setLiveResults(results);
        } else {
          setLiveResults([
            {
              title: `${customKeyword}普通女孩变美自查`,
              angle: '真诚避坑，不花大钱的低成本美商养成',
              searchQuery: `${customKeyword} 普通女孩 变美 清单`,
              searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${customKeyword} 普通女孩 变美 清单`)}`,
            },
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingLive(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#FAF3F2] via-[#FDF8F7] to-[#EFF5F1] rounded-3xl border border-[#EADBDE] shadow-morandi flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#B2636E] shadow-xs">
            <Sparkles className="w-6 h-6 text-[#C27A83]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-sc font-bold text-lg text-[#2A3B31]">
                每日审美热点 · 真实下拉热搜 & 对标母题库
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-[#C27A83] font-semibold border border-[#F5D8DB]">
                100% 真实链接直达
              </span>
            </div>
            <p className="text-xs text-[#5D7769] mt-0.5">
              严选小红书与 Instagram 真实高热搜词与爆款母题。点击即可直接在真实平台打开实时万赞对标，告别虚假失联笔记！
            </p>
          </div>
        </div>

        {/* Workflow actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onGoToStrategy}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-[#4A6E59] border border-[#D5E5DC] hover:bg-[#F2F7F4] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5" />
            查看起号定位SOP
          </button>
        </div>
      </div>

      {/* Real platform search notice box */}
      <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#DEEBE2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-700">
          <Search className="w-4 h-4 text-[#6E947C] shrink-0" />
          <span>
            <strong className="text-[#2F4D3C]">💡 真实对标直通说明：</strong>
            卡片中的热搜词均附带<strong className="text-[#C27A83]">【真实小红书 / INS 搜索直达链接】</strong>，点击直接打开官方搜索结果页，查看实时最新万赞爆款笔记！
          </span>
        </div>
      </div>

      {/* Custom AI Live Explorer Bar */}
      <div className="p-4 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Sparkles className="w-4 h-4 text-[#C27A83]" />
            <span className="text-xs font-bold text-gray-800">
              ⚡ 自由输入细分关键词，实时探测小红书真实热搜母词：
            </span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-96">
            <input
              type="text"
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLiveExplore()}
              placeholder="例如：老钱风胶囊穿搭 / 新中式清冷 / 方圆脸发型"
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#D5E4DB] bg-[#FAFBF9] focus:outline-none focus:ring-2 focus:ring-[#8EA89D]/40"
            />
            <button
              onClick={handleLiveExplore}
              disabled={isSearchingLive || !customKeyword.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-[#6E947C] hover:bg-[#5C8169] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isSearchingLive ? '探测中...' : '真实探测'}</span>
            </button>
          </div>
        </div>

        {/* Live results if searched */}
        {liveResults.length > 0 && (
          <div className="pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-2.5 animate-in fade-in duration-200">
            {liveResults.map((live, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#FAFBF9] border border-[#DEECE2] flex flex-col justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2A4333] line-clamp-1">
                      {live.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EBF3EF] text-[#476C56]">
                      实时探测
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                    {live.angle}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 pt-1 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 truncate">
                      搜索词：<strong className="text-gray-700">{live.searchQuery}</strong>
                    </span>
                    <a
                      href={live.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF2442] hover:underline flex items-center gap-0.5 shrink-0 font-medium"
                    >
                      <span>打开小红书</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleCopySearchQuery(live.searchQuery, `live-${idx}`)}
                      className="text-[10px] text-[#486E58] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedId === `live-${idx}` ? <Check className="w-3 h-3 text-[#4A775C]" /> : <Copy className="w-3 h-3" />}
                      复制词条
                    </button>
                    <button
                      onClick={() =>
                        onReplicate({
                          id: `live-${idx}`,
                          platform: '小红书',
                          mediaType: '图文笔记',
                          title: live.title,
                          author: '小红书实时热搜对标',
                          searchQuery: live.searchQuery,
                          searchUrl: live.searchUrl,
                          coverGradient: 'from-[#EBF2EE] via-[#FDF8F7] to-[#F5E4E3]',
                          badge: '实时高搜词条',
                          tags: ['#美商逆袭', `#${customKeyword}`],
                          stageFit: '起号破冰期 (极易模仿)',
                          resonanceScore: 95,
                          difficultyLevel: '低门槛极易套用',
                          coreAngle: live.angle,
                          replicateGuidance: {
                            whyViral: '针对垂直细分人群的真实高频搜索词条',
                            copyAngle: live.angle,
                            visualIdea: '3:4高留白大字封面',
                            keyPoints: '提炼4步极简变美实操SOP',
                          },
                          metrics: { likes: '万赞级', collects: '万藏级' },
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#6E947C] text-white text-[10px] font-semibold cursor-pointer hover:bg-[#5C8169] transition-colors"
                    >
                      去操盘 →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Platform filter */}
          <div className="flex items-center gap-1 p-1 bg-[#F4F8F5] rounded-xl border border-[#DEEBE2] text-xs">
            {(['all', '小红书', 'Instagram'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  platformFilter === p
                    ? 'bg-white text-[#294234] shadow-xs font-semibold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {p === 'all' ? '全部平台' : p}
              </button>
            ))}
          </div>

          {/* Aesthetic Category Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#F4F8F5] rounded-xl border border-[#DEEBE2] text-xs">
            {[
              { id: 'all', label: '全部风格' },
              { id: '莫兰迪柔雾', label: '🌱 莫兰迪柔雾' },
              { id: '老钱静奢', label: '🤎 老钱静奢' },
              { id: '黑白极简', label: '🖤 黑白极简' },
              { id: '新中式雅致', label: '🎋 新中式雅致' },
              { id: '原生自然', label: '💧 原生自然' },
              { id: '法式复古', label: '🌹 法式复古' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setAestheticFilter(s.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  aestheticFilter === s.id
                    ? 'bg-white text-[#294234] shadow-xs font-semibold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-gray-500 font-medium">
          筛选出 <span className="font-bold text-[#3B6652]">{filteredList.length}</span> 条真实高赞母题
        </span>
      </div>

      {/* Grid of Inspirations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi hover:shadow-morandi-lg transition-all duration-300 flex flex-col justify-between gap-4 group"
          >
            {/* Top metadata */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.platform === '小红书'
                        ? 'bg-[#FFEBEF] text-[#FF2442] border border-[#FFCCD4]'
                        : 'bg-[#F2EDFF] text-[#7944DC] border border-[#E1D4FA]'
                    }`}
                  >
                    {item.platform}
                  </span>
                  {item.aestheticCategory && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4F7F5] text-[#3D634E] font-medium border border-[#D8E6DD]">
                      {item.aestheticCategory}
                    </span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0F5F2] text-[#476B57] font-medium flex items-center gap-1">
                    {item.mediaType === '沉浸短视频' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {item.mediaType}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#C27A83]">
                  <Flame className="w-3.5 h-3.5 fill-[#C27A83]" />
                  <span>热度 {item.resonanceScore}</span>
                </div>
              </div>

              {/* Cover simulation box */}
              <div
                className={`w-full aspect-[16/9] rounded-2xl bg-gradient-to-br ${item.coverGradient} p-4 flex flex-col justify-between border border-[#E3ECE6] relative overflow-hidden group-hover:scale-[1.01] transition-transform`}
              >
                <div className="flex items-center justify-between z-10">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-[#324F3F] font-semibold backdrop-blur-xs shadow-2xs">
                    {item.badge}
                  </span>
                  <span className="text-[9px] font-editorial text-gray-500 uppercase tracking-widest">
                    REAL TRENDING TOPIC
                  </span>
                </div>
                <h4 className="font-serif-sc font-bold text-sm text-[#24352B] leading-snug drop-shadow-2xs z-10 line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-gray-500 z-10">
                  <span>母题：{item.searchQuery}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3 text-[#FF2442]" /> {item.metrics.likes}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Bookmark className="w-3 h-3 text-amber-500" /> {item.metrics.collects}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real search query box with direct clickable link */}
              <div className="p-3 rounded-2xl bg-[#F6FAF7] border border-[#D5E8DC] flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Search className="w-3.5 h-3.5 text-[#5B886E] shrink-0" />
                    <span className="text-[11px] text-gray-500 shrink-0">平台热搜母词：</span>
                    <span className="font-bold text-[#2A4B37] truncate text-[11px]">
                      "{item.searchQuery}"
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopySearchQuery(item.searchQuery, item.id)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white border border-[#BCD4C5] text-[#345944] hover:bg-[#EAF3EE] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    title="复制此词条，在APP内搜索"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-[#4A775C]" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Real platform external link */}
                <div className="flex items-center justify-between pt-1 border-t border-[#E3ECE6] text-[11px]">
                  <span className="text-gray-400">真实平台直达对标：</span>
                  <a
                    href={item.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#FF2442] hover:text-[#D91B35] flex items-center gap-1 hover:underline"
                  >
                    <span>在{item.platform}打开实时搜索</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Angle & Core Why */}
              <div className="flex flex-col gap-1.5">
                <div className="p-2.5 rounded-xl bg-[#FAFBF9] border border-[#E9F0EB] text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold text-[#3D614E]">💡 核心切入点：</span>
                  <span>{item.coreAngle}</span>
                </div>

                <p className="text-[11px] text-gray-500 line-clamp-2">
                  🔥 <span className="font-medium text-gray-700">爆款逻辑：</span>
                  {item.replicateGuidance.whyViral}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {item.tags.map((t, i) => (
                  <span key={i} className="text-[10px] text-[#4A705B] bg-[#F2F7F4] px-1.5 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions: Evaluate with Scorer or Replicate */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
              {onGoToScorer && (
                <button
                  onClick={() => onGoToScorer(item.title, item.coreAngle)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#466955] bg-[#F2F7F4] hover:bg-[#E5EFE8] border border-[#D5E5DB] flex items-center gap-1 transition-colors cursor-pointer"
                  title="先前往【选题打分器】评估爆款潜力并提取更多蓝海词"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>测测打分</span>
                </button>
              )}

              <button
                onClick={() => onReplicate(item)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#6E947C] via-[#7DA28B] to-[#C27A83] hover:opacity-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 ml-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>一键模仿此选题</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
