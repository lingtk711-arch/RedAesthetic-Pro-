import React, { useState } from 'react';
import {
  TrendingUp,
  Bookmark,
  Flame,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { PostDraft } from '../types';

interface TrendTopicItem {
  id: string;
  topic: string;
  angle: string;
  audience: string;
  saveLikeRatio: string; // e.g. "1.86 : 1"
  saveLikeRatioNum: number;
  increment24h: string; // e.g. "+18.4k"
  searchIndex: number; // e.g. 98
  tag: string;
  tagColor: string;
  coverMain: string;
  coverSub: string;
  hourlyPoints: number[]; // 24 points normalized (0 - 100)
  peakHour: string;
  keyPoints: string;
}

const TOP_TREND_TOPICS: TrendTopicItem[] = [
  {
    id: 'trend-1',
    topic: '方圆脸淡颜女孩｜别硬搬浓颜，找对松弛耐看美学',
    angle: '发根倒梳拉高颅顶 + 轻眼影重低饱和腮红 + 莫兰迪鼠尾草绿呼应',
    audience: '方圆脸、下颌骨有钝感、跟风大浓妆踩雷的年轻女孩',
    saveLikeRatio: '1.86 : 1',
    saveLikeRatioNum: 1.86,
    increment24h: '+21.3k 互动',
    searchIndex: 98,
    tag: 'S级超高收藏长尾',
    tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    coverMain: '方圆脸淡颜｜审美觉醒',
    coverSub: '别硬搬浓颜，找对松弛耐看美学',
    peakHour: '昨天 21:30 晚高峰',
    keyPoints: '发根倒梳蓬松拉高颅顶、轻修容重腮红淡化骨骼感、莫兰迪鼠尾草绿耳饰提亮、眼神聚焦练习',
    // 24 hours wave: rising towards evening
    hourlyPoints: [35, 38, 42, 40, 39, 41, 45, 52, 60, 68, 72, 70, 75, 78, 80, 85, 88, 92, 96, 100, 95, 90, 86, 88],
  },
  {
    id: 'trend-2',
    topic: '早八人10分钟莫兰迪极简胶囊衣橱｜穿出舒展静奢感',
    angle: '上浅下深淡粉+鼠尾草绿色彩呼应，垂坠剪裁视觉拔高10cm',
    audience: '通勤早八职场人、穿搭缺乏灵感、想要兼顾舒服与质感的女生',
    saveLikeRatio: '1.64 : 1',
    saveLikeRatioNum: 1.64,
    increment24h: '+16.8k 互动',
    searchIndex: 94,
    tag: '长效搜索常青树',
    tagColor: 'bg-blue-50 text-blue-800 border-blue-200',
    coverMain: '早八10分钟｜胶囊衣橱',
    coverSub: 'Sage & Blush 治愈配色，穿出松弛气场',
    peakHour: '今日 07:45 早通勤',
    keyPoints: '上浅下深视线上移、高腰垂坠西装裤修饰腿型、淡粉+鼠尾草绿色彩呼应、露出纤细手腕与锁骨',
    // 24 hours wave: morning surge
    hourlyPoints: [28, 30, 32, 35, 45, 75, 95, 98, 85, 78, 72, 70, 74, 76, 75, 80, 82, 86, 89, 90, 88, 82, 78, 75],
  },
  {
    id: 'trend-3',
    topic: '黄黑皮原生光泽肌｜不刷酸不猛药，28天养皮作息自查',
    angle: '早抗氧温和植萃 + 低GI抗糖 + 规律物理防晒养出原生温润感',
    audience: '熬夜暗沉蜡黄皮、敏感肌容易烂脸、追求健康透亮感的女生',
    saveLikeRatio: '1.52 : 1',
    saveLikeRatioNum: 1.52,
    increment24h: '+13.5k 互动',
    searchIndex: 91,
    tag: '蓝海搜索飙升榜',
    tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
    coverMain: '黄皮女孩｜告别蜡黄光泽皮',
    coverSub: '不用猛药，28天养出原生透亮光泽',
    peakHour: '昨天 23:00 睡前护肤',
    keyPoints: '早C晚A替代为温和植萃抗氧、早晨一杯温润柠檬水、低GI饮食减少糖化暗沉、规律物理防晒',
    // 24 hours wave: double peak afternoon & night
    hourlyPoints: [40, 38, 36, 35, 34, 38, 48, 55, 62, 65, 70, 72, 75, 78, 82, 85, 88, 90, 94, 98, 99, 92, 85, 80],
  },
];

interface WorkbenchTrendDashboardProps {
  onTransferToContentMode: (topicData: {
    topic: string;
    angle: string;
    audience: string;
    coverMain: string;
    coverSub: string;
    keyPoints: string;
  }) => void;
}

export const WorkbenchTrendDashboard: React.FC<WorkbenchTrendDashboardProps> = ({
  onTransferToContentMode,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('刚刚实时更新');
  const [activeTooltip, setActiveTooltip] = useState<{ topicId: string; hour: number; val: number } | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated('刚刚更新 · 毫秒级同步');
    }, 600);
  };

  // Helper to generate SVG path for a 24-point sparkline
  const generateSvgPath = (points: number[], width: number = 220, height: number = 44) => {
    const step = width / (points.length - 1);
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    const coords = points.map((p, idx) => {
      const x = idx * step;
      // invert Y (SVG top is 0)
      const y = height - ((p - min) / range) * (height - 10) - 5;
      return { x, y };
    });

    // Build cubic bezier curve
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    const fillPath = `${d} L ${width} ${height} L 0 ${height} Z`;

    return { strokePath: d, fillPath, coords };
  };

  return (
    <div className="mb-6 rounded-3xl bg-white border border-[#DFEBE3] shadow-morandi overflow-hidden transition-all">
      {/* Top Banner Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-[#F3F8F5] via-[#FAFBF9] to-[#F7F3F3] border-b border-[#E6EFE9] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4A725B] text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#2A4434]">
                小红书审美赛道 · 24小时高互动率趋势看板
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F3ED] text-[#2F523D] font-bold border border-[#CBDED3]">
                藏赞比 &gt; 1.5 黄金筛选
              </span>
            </div>
            <p className="text-[11px] text-[#5C7768] mt-0.5">
              实时监控“收藏/点赞比”最高的 3 大细分话题 · 高长尾搜索截流与深度信任变现
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 hidden sm:inline">{lastUpdated}</span>
          <button
            onClick={handleRefresh}
            title="刷新大盘实时热度"
            className="p-1.5 rounded-lg text-gray-500 hover:text-[#4A725B] hover:bg-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#4A725B]' : ''}`} />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-white transition-colors flex items-center gap-1 text-xs cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <span>展开</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>收起</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TOP_TREND_TOPICS.map((item, idx) => {
              const { strokePath, fillPath, coords } = generateSvgPath(item.hourlyPoints, 240, 48);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-gradient-to-br from-[#FAFBF9] to-[#F5F8F6] border border-[#E1EDE5] hover:border-[#8EA89D] p-4 flex flex-col justify-between gap-3 shadow-xs hover:shadow-morandi transition-all group"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-[#4A725B] text-white text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${item.tagColor}`}>
                          {item.tag}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[#FF2442] flex items-center gap-0.5">
                        <Flame className="w-3 h-3" />
                        搜索指数 {item.searchIndex}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-800 leading-snug group-hover:text-[#2A4434] transition-colors line-clamp-2">
                      {item.topic}
                    </h4>

                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.angle}
                    </p>
                  </div>

                  {/* SVG Sparkline Curve */}
                  <div className="pt-2 border-t border-[#E8F1EB]">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-[#4A725B]" />
                        近24h藏赞比：
                        <strong className="text-xs font-bold text-[#2A4434]">{item.saveLikeRatio}</strong>
                      </span>
                      <span className="text-[#3A5D48] font-medium">{item.increment24h}</span>
                    </div>

                    {/* Chart Container */}
                    <div className="relative w-full h-12 bg-white/70 rounded-lg border border-[#E6EFE9] overflow-hidden flex items-center justify-center">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 240 48"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#8EA89D" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#8EA89D" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={fillPath} fill={`url(#grad-${item.id})`} />
                        <path
                          d={strokePath}
                          fill="none"
                          stroke="#4A725B"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      {/* Sparkline Overlay Info */}
                      <div className="absolute bottom-1 right-2 text-[9px] text-gray-400">
                        {item.peakHour}
                      </div>
                    </div>
                  </div>

                  {/* Transfer Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() =>
                        onTransferToContentMode({
                          topic: item.topic,
                          angle: item.angle,
                          audience: item.audience,
                          coverMain: item.coverMain,
                          coverSub: item.coverSub,
                          keyPoints: item.keyPoints,
                        })
                      }
                      className="w-full py-2 px-3 rounded-xl bg-[#4A725B] hover:bg-[#395A47] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer group-hover:scale-[1.01]"
                    >
                      <span>一键转入【操盘模式】</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Guidance footer */}
          <div className="mt-3.5 px-3 py-2 rounded-xl bg-[#F6FAF7] border border-dashed border-[#D3E4DB] flex items-center justify-between text-[11px] text-[#4F6E5C]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C27A83]" />
              <span>
                <strong>小红书长尾算法逻辑：</strong> 藏赞比 &gt; 1.2 即触发系统高权重长尾搜索推荐池；上述 Top 3 细分话题平均藏赞比达 1.67:1，极易积累自然搜索长效流量。
              </span>
            </div>
            <span className="text-[10px] text-gray-400 hidden md:inline">支持一键直接带入选题与封面</span>
          </div>
        </div>
      )}
    </div>
  );
};
