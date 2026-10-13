import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Plus,
  Flame,
  BookmarkCheck,
  Heart,
  Layers,
  Clock,
  Palette,
  Lightbulb,
  ArrowUpRight,
  Target,
  BarChart3,
  Check,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AestheticCheckinRecord } from '../types';
import { INITIAL_CHECKIN_HISTORY } from '../data/aestheticFeed';
import { AestheticDiagnosticLab } from './AestheticDiagnosticLab';
import { AestheticMicroClassroom } from './AestheticMicroClassroom';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

interface DeepKnowledgePoint {
  id: number;
  title: string;
  tag: string;
  theory: string;
  actionablePractice: string;
  targetPlatformTip: string;
}

interface DeepAdviceResponse {
  weakDimension: string;
  weakScore: number;
  diagnosisQuote: string;
  knowledgePoints: DeepKnowledgePoint[];
}

interface AestheticGrowthArchiveProps {
  onApplyToDraft?: (topic: string, angle: string, keyPoints: string) => void;
}

export const AestheticGrowthArchive: React.FC<AestheticGrowthArchiveProps> = ({
  onApplyToDraft,
}) => {
  const [history, setHistory] = useState<AestheticCheckinRecord[]>(INITIAL_CHECKIN_HISTORY);
  const [compareWithLastWeek, setCompareWithLastWeek] = useState(true);

  // New checkin form state
  const [showForm, setShowForm] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newCategory, setNewCategory] = useState<AestheticCheckinRecord['category']>('色彩与莫兰迪');
  const [newMood, setNewMood] = useState('✨');
  const [sliderColor, setSliderColor] = useState(86);
  const [sliderComposition, setSliderComposition] = useState(82);
  const [sliderStorytelling, setSliderStorytelling] = useState(84);
  const [sliderStyle, setSliderStyle] = useState(82);
  const [sliderHabit, setSliderHabit] = useState(90);
  const [sliderEditorial, setSliderEditorial] = useState(80);

  // AI Deep Advice State
  const [deepAdvice, setDeepAdvice] = useState<DeepAdviceResponse | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedKnowledgeId, setExpandedKnowledgeId] = useState<number | null>(1);

  // Listen to Firestore when user is authenticated
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        try {
          const checkinsRef = collection(db, 'users', user.uid, 'checkins');
          const q = query(checkinsRef, orderBy('createdAt', 'desc'));
          const unsubscribeSnapshot = onSnapshot(
            q,
            (snapshot) => {
              if (!snapshot.empty) {
                const remoteRecords: AestheticCheckinRecord[] = snapshot.docs.map((doc) => {
                  const data = doc.data();
                  return {
                    id: doc.id,
                    date: data.date || new Date().toISOString().slice(0, 10),
                    topic: data.topic || '审美打卡',
                    notes: data.notes || '',
                    category: data.category || '色彩与莫兰迪',
                    moodEmoji: data.moodEmoji || '✨',
                    scores: data.scores || {
                      colorSensitivity: 80,
                      postureAesthetics: 80,
                      whitespaceSense: 80,
                      styleIdentity: 80,
                      habitDiscipline: 80,
                      editorialConversion: 80,
                    },
                  };
                });
                setHistory(remoteRecords);
              }
            },
            (err) => {
              console.warn('Firestore snapshot error (falling back to local state):', err);
            }
          );
          return () => unsubscribeSnapshot();
        } catch (err) {
          console.warn('Firestore initialization error:', err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Baseline last week mock data for weekly evolution comparison
  const lastWeekBaseline = {
    colorSensitivity: 72,
    composition: 68,
    storytelling: 66,
    styleIdentity: 70,
    habitDiscipline: 76,
    editorialConversion: 64,
  };

  // Calculate dynamic radar averages from current history
  const calculateRadarAverages = () => {
    if (history.length === 0) {
      return {
        colorSensitivity: 75,
        composition: 70,
        storytelling: 72,
        styleIdentity: 68,
        habitDiscipline: 75,
        editorialConversion: 65,
      };
    }

    const totals = history.reduce(
      (acc, curr) => ({
        colorSensitivity: acc.colorSensitivity + curr.scores.colorSensitivity,
        composition: acc.composition + curr.scores.whitespaceSense,
        storytelling: acc.storytelling + curr.scores.postureAesthetics,
        styleIdentity: acc.styleIdentity + curr.scores.styleIdentity,
        habitDiscipline: acc.habitDiscipline + curr.scores.habitDiscipline,
        editorialConversion: acc.editorialConversion + curr.scores.editorialConversion,
      }),
      {
        colorSensitivity: 0,
        composition: 0,
        storytelling: 0,
        styleIdentity: 0,
        habitDiscipline: 0,
        editorialConversion: 0,
      }
    );

    const count = history.length;
    return {
      colorSensitivity: Math.round(totals.colorSensitivity / count),
      composition: Math.round(totals.composition / count),
      storytelling: Math.round(totals.storytelling / count),
      styleIdentity: Math.round(totals.styleIdentity / count),
      habitDiscipline: Math.round(totals.habitDiscipline / count),
      editorialConversion: Math.round(totals.editorialConversion / count),
    };
  };

  const radarScores = calculateRadarAverages();
  const overallAvg = Math.round(
    (radarScores.colorSensitivity +
      radarScores.composition +
      radarScores.storytelling +
      radarScores.styleIdentity +
      radarScores.habitDiscipline +
      radarScores.editorialConversion) /
      6
  );

  // Growth Stage Determination
  const getGrowthStage = () => {
    if (overallAvg >= 85) return { stage: '高阶美学主理人', next: '已臻化境 · 持续输出风格范式', progress: 95, icon: '👑' };
    if (overallAvg >= 75) return { stage: '氛围沉淀期', next: '距离高阶主理人还需保持 5 次打卡', progress: 78, icon: '🌿' };
    if (overallAvg >= 65) return { stage: '风格探索期', next: '距离氛围沉淀期还需提升画面构图留白', progress: 55, icon: '🌸' };
    return { stage: '美商觉醒期', next: '建议每日打卡积累色彩与发型认知', progress: 30, icon: '🌱' };
  };

  const growthStage = getGrowthStage();

  // Add new checkin
  const handleAddCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const record: AestheticCheckinRecord = {
      id: `checkin-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      topic: newTopic.trim(),
      notes: newNotes.trim() || '记录今日审美心流，保持自律与留白。',
      category: newCategory,
      scores: {
        colorSensitivity: sliderColor,
        postureAesthetics: sliderStorytelling,
        whitespaceSense: sliderComposition,
        styleIdentity: sliderStyle,
        habitDiscipline: sliderHabit,
        editorialConversion: sliderEditorial,
      },
      moodEmoji: newMood,
    };

    setHistory([record, ...history]);
    setNewTopic('');
    setNewNotes('');
    setShowForm(false);

    // If authenticated, persist to Firestore
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await addDoc(collection(db, 'users', currentUser.uid, 'checkins'), {
          ...record,
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not persist checkin to Firestore:', err);
      }
    }
  };

  // Dimensions setup for SVG Radar Chart (6 dimensions)
  const dimensions = [
    {
      key: 'colorSensitivity',
      label: '色彩敏锐度',
      value: radarScores.colorSensitivity,
      lastWeek: lastWeekBaseline.colorSensitivity,
      icon: '🎨',
      diff: radarScores.colorSensitivity - lastWeekBaseline.colorSensitivity,
    },
    {
      key: 'composition',
      label: '构图与留白',
      value: radarScores.composition,
      lastWeek: lastWeekBaseline.composition,
      icon: '📐',
      diff: radarScores.composition - lastWeekBaseline.composition,
    },
    {
      key: 'storytelling',
      label: '视觉叙事力',
      value: radarScores.storytelling,
      lastWeek: lastWeekBaseline.storytelling,
      icon: '📖',
      diff: radarScores.storytelling - lastWeekBaseline.storytelling,
    },
    {
      key: 'styleIdentity',
      label: '风格辨识度',
      value: radarScores.styleIdentity,
      lastWeek: lastWeekBaseline.styleIdentity,
      icon: '✨',
      diff: radarScores.styleIdentity - lastWeekBaseline.styleIdentity,
    },
    {
      key: 'habitDiscipline',
      label: '自律心流力',
      value: radarScores.habitDiscipline,
      lastWeek: lastWeekBaseline.habitDiscipline,
      icon: '⏳',
      diff: radarScores.habitDiscipline - lastWeekBaseline.habitDiscipline,
    },
    {
      key: 'editorialConversion',
      label: '网感转化率',
      value: radarScores.editorialConversion,
      lastWeek: lastWeekBaseline.editorialConversion,
      icon: '📱',
      diff: radarScores.editorialConversion - lastWeekBaseline.editorialConversion,
    },
  ];

  // SVG Radar coordinate helpers (Center at 160, 160; Max Radius = 105)
  const cx = 160;
  const cy = 160;
  const maxR = 105;

  const getCoordinates = (valuePercent: number, index: number, total: number = 6) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (Math.min(100, Math.max(20, valuePercent)) / 100) * maxR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y };
  };

  // Build polygon points string for current data & baseline data
  const currentPoints = dimensions
    .map((dim, i) => {
      const { x, y } = getCoordinates(dim.value, i);
      return `${x},${y}`;
    })
    .join(' ');

  const baselinePoints = dimensions
    .map((dim, i) => {
      const { x, y } = getCoordinates(dim.lastWeek, i);
      return `${x},${y}`;
    })
    .join(' ');

  // Identify lowest and highest dimensions for intelligent recommendations
  const sortedDims = [...dimensions].sort((a, b) => a.value - b.value);
  const weakestDim = sortedDims[0];
  const strongestDim = sortedDims[sortedDims.length - 1];

  // Fetch AI Deep Aesthetic Advice based on weakest dimension
  const fetchDeepAestheticAdvice = async () => {
    setIsLoadingAdvice(true);
    try {
      const res = await fetch('/api/aesthetic/deep-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weakestDimension: weakestDim,
          radarScores,
          historySummary: history.slice(0, 3).map((h) => ({
            date: h.date,
            topic: h.topic,
            notes: h.notes,
            category: h.category,
          })),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setDeepAdvice(json.data);
      } else {
        throw new Error(json.error || '获取建议失败');
      }
    } catch (err: any) {
      console.warn('AI advice fetch failed, using fallback:', err);
      // Fallback
      setDeepAdvice({
        weakDimension: weakestDim.label,
        weakScore: weakestDim.value,
        diagnosisQuote: `美不是元素的过度累加，而是精准克制的舍弃。在【${weakestDim.label}】上放慢节奏，方能唤醒隐秘的高级视觉秩序。`,
        knowledgePoints: [
          {
            id: 1,
            title: weakestDim.key === 'colorSensitivity' ? '莫兰迪调性灰度法则：7:2:1 黄金色彩明度梯次' : '负空间呼吸法则：留白不是空，而是视觉之气的流动',
            tag: '经典美学底层范式',
            theory: '源自极简主义与经典画派哲学。当视觉画面拥有至少 30% 以上的纯净呼吸区域（负空间）时，主体的情绪感和骨相辨识度才会自然凸显，避免小红书用户产生视觉疲劳。',
            actionablePractice: '在日常拍照或做封面时，严控主色调不超过两种，刻意留出三分之一的纯色呼吸区，拒绝元素过载。',
            targetPlatformTip: '封面大标题不要铺满，保留顶部留白并采用低饱和色调，笔记点击转化率显著提升。',
          },
          {
            id: 2,
            title: weakestDim.key === 'storytelling' ? '真实闺蜜耳语叙事法：从说教者到同频成长搭子' : '黄金三分法微动势：打破僵硬对称的动态平衡',
            tag: '叙事共情 & 视线锚点',
            theory: '读者对完美的精致面具具备本能防备，但对真实的探索过程毫无抵抗力。高级叙事是把“知识点”包裹在“一次晨间微小感悟”之中。',
            actionablePractice: '笔记开头两句先讲一个自己这周遇到的真实纠结或踩坑日常，再自然引出解决方案。',
            targetPlatformTip: '文案杜绝居高临下的专家语气，用“真闺蜜提醒/悄悄说”作为前缀，完播率提升40%。',
          },
          {
            id: 3,
            title: '微动势视线引导：从单一静止到情绪空气感',
            tag: '法式松弛 & 氛围感塑造',
            theory: '高级审美来自视觉动线的无声引导。肢体的微小倾斜（如微低头、眼神轻移）能赋予静态照片故事感，让观众视线自然聚焦于核心美感。',
            actionablePractice: '拍照时拒绝死板对视镜头，看向镜头左上方或低头拨弄耳发，捕捉发丝与光影的微动瞬间。',
            targetPlatformTip: '组图第2张放置局部细节特写（如手指抚摸耳饰、锁骨光影），极大地延长用户停留时长。',
          },
        ],
      });
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  // Trigger advice fetch on mount or when weakest dimension changes
  useEffect(() => {
    fetchDeepAestheticAdvice();
  }, [weakestDim.key]);

  const handleCopyKnowledge = (point: DeepKnowledgePoint) => {
    const text = `【深度美学知识点 · ${point.title}】\n🏷️ 属性：${point.tag}\n📖 原理解析：${point.theory}\n⚡ 本周微练习：${point.actionablePractice}\n💡 实操避坑：${point.targetPlatformTip}`;
    navigator.clipboard.writeText(text);
    setCopiedId(point.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Actionable suggestions based on user scores
  const aestheticAdvices = [
    {
      tag: '🔥 核心突破项',
      target: weakestDim.label,
      score: weakestDim.value,
      title: `补齐【${weakestDim.label}】短板：进行单点专项微练习`,
      action:
        weakestDim.key === 'composition'
          ? '拍照和做封面时严格执行“三分法与中心偏上留白”，背景保留至少30%纯净空气感，杜绝元素过载。'
          : weakestDim.key === 'storytelling'
          ? '文案前两行放弃说教，先讲述一个生活真实偶遇或变美踩坑小插曲，借由“真闺蜜耳边轻声分享”引发共鸣。'
          : weakestDim.key === 'colorSensitivity'
          ? '练习降低色彩明度与饱和度：整张图文只保留 1 组主色（如鼠尾草绿）与 1 个辅助点缀色（如腮红粉），其他一律用灰白黑打底。'
          : '针对性增加每日打卡深度，提炼 1-2 条可落地的结构化清单。',
    },
    {
      tag: '✨ 高光发扬项',
      target: strongestDim.label,
      score: strongestDim.value,
      title: `巩固【${strongestDim.label}】优势：打造专属审美超级记忆符号`,
      action: `你在${strongestDim.label}上已达到 ${strongestDim.value} 分高段位，建议在每篇小红书笔记的封面、文末签名或个人主页将其强化为你的人设金字招牌！`,
    },
    {
      tag: '🌱 进阶灵感推荐',
      target: '全域美商',
      score: overallAvg,
      title: '本周美学进阶阅读与训练推荐',
      action: '推荐每周观摩 1 场北欧/极简主义艺术展或浏览 5 篇 INS Sage & Blush 生活静物快拍，记录 3 个触动你的光影角度。',
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#EBF3EE] via-[#FAF6F2] to-[#F5E6E5] rounded-3xl border border-[#DFECE4] shadow-morandi flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#557764] shadow-xs">
            <TrendingUp className="w-6 h-6 text-[#7DA28B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-sc font-bold text-lg text-[#263C2E]">
                审美成长档案 · 动态美商进化雷达
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white text-[#7DA28B] font-semibold border border-[#D3E4DB]">
                当前段位：{growthStage.stage}
              </span>
            </div>
            <p className="text-xs text-[#5D7769] mt-0.5">
              每周记录色彩、构图、叙事力打卡数据，直观见证美商进化轨迹并获取进阶指导
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-2xl bg-[#6E947C] hover:bg-[#5C8169] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? '收起打卡表单' : '记录今日审美打卡'}</span>
        </button>
      </div>

      {/* New Checkin Drawer */}
      {showForm && (
        <form
          onSubmit={handleAddCheckin}
          className="p-6 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#EDF4F0] pb-3">
            <h3 className="font-bold text-sm text-[#273B2F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C27A83]" />
              填写今日审美打卡记录
            </h3>
            <span className="text-xs text-gray-400">
              {new Date().toISOString().slice(0, 10)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#324B3C]">
                打卡主题 / 核心实践
              </label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="例如：莫兰迪色系晨间穿搭呼应 / 封面 3:4 构图留白打卡"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4DB] text-xs focus:ring-2 focus:ring-[#8EA89D]/40"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#324B3C]">
                美商分类
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5E4DB] text-xs cursor-pointer"
              >
                <option value="色彩与莫兰迪">色彩与莫兰迪</option>
                <option value="骨相与发型">骨相与发型</option>
                <option value="穿搭与垂坠">穿搭与垂坠</option>
                <option value="生活留白心流">生活留白心流</option>
                <option value="网感与KOC表达">网感与KOC表达</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#324B3C]">
              今日审美心得体会 / 笔记
            </label>
            <textarea
              rows={3}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="记录今天在色彩感知、构图比例、画面叙事力上的真实沉淀…"
              className="w-full px-3.5 py-2 rounded-xl border border-[#D5E4DB] text-xs leading-relaxed focus:ring-2 focus:ring-[#8EA89D]/40"
            />
          </div>

          {/* 6 Dimension Sliders */}
          <div className="p-3.5 bg-[#FAFBF9] rounded-2xl border border-[#E5EFE8] flex flex-col gap-3">
            <span className="text-xs font-bold text-[#3B5D4B]">
              📊 今日 6 大维度自评 (将自动加权计算进阶雷达图)：
            </span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-gray-600">🎨 色彩敏锐度: {sliderColor}分</span>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={sliderColor}
                  onChange={(e) => setSliderColor(parseInt(e.target.value))}
                  className="accent-[#6E947C] cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-600">📐 构图与留白: {sliderComposition}分</span>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={sliderComposition}
                  onChange={(e) => setSliderComposition(parseInt(e.target.value))}
                  className="accent-[#6E947C] cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-600">📖 视觉叙事力: {sliderStorytelling}分</span>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={sliderStorytelling}
                  onChange={(e) => setSliderStorytelling(parseInt(e.target.value))}
                  className="accent-[#6E947C] cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-600">✨ 风格辨识度: {sliderStyle}分</span>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={sliderStyle}
                  onChange={(e) => setSliderStyle(parseInt(e.target.value))}
                  className="accent-[#6E947C] cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-600">⏳ 自律心流力: {sliderHabit}分</span>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={sliderHabit}
                  onChange={(e) => setSliderHabit(parseInt(e.target.value))}
                  className="accent-[#6E947C] cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-600">📱 网感转化率: {sliderEditorial}分</span>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={sliderEditorial}
                  onChange={(e) => setSliderEditorial(parseInt(e.target.value))}
                  className="accent-[#6E947C] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">今日心情：</span>
              {['🌱', '🌸', '✨', '☕', '🍃'].map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setNewMood(emoji)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center cursor-pointer border ${
                    newMood === emoji ? 'border-[#6E947C] bg-[#EBF3EF]' : 'border-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#6E947C] hover:bg-[#5C8169] text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                保存今日打卡并更新雷达图
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 美学微课堂 · 每日 3 分钟审美小知识 (自动针对缺失维度补齐) */}
      <AestheticMicroClassroom
        history={history}
        onApplyToDraft={onApplyToDraft}
      />

      {/* Main Grid: Weekly Dynamic Radar + Data-Driven Advancements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Dynamic Radar Visualization Component */}
        <div className="lg:col-span-6 p-6 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#EDF4F0] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#273B2F] flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-[#7CA18C]" />
                每周美商进化动态雷达图 (色彩·构图·叙事力)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                基于周度打卡连续计算 · 动态展示进阶弧线
              </p>
            </div>

            {/* Toggle Baseline Compare */}
            <button
              onClick={() => setCompareWithLastWeek(!compareWithLastWeek)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer border ${
                compareWithLastWeek
                  ? 'bg-[#EBF3EF] border-[#8EA89D] text-[#345944]'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              {compareWithLastWeek ? '对比上周基线: 开' : '对比上周基线: 关'}
            </button>
          </div>

          {/* SVG Radar Visual Canvas */}
          <div className="relative w-full aspect-square max-w-[340px] mx-auto flex items-center justify-center">
            <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-xs">
              <defs>
                {/* Sage and Blush radar gradient */}
                <linearGradient id="radarCurrentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8EA89D" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#E8BCBE" stopOpacity="0.45" />
                </linearGradient>

                <linearGradient id="radarBaselineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#CBDAD0" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#DFD2D4" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Concentric rings: 20%, 40%, 60%, 80%, 100% */}
              {[20, 40, 60, 80, 100].map((ringPercent) => {
                const ringPoints = [0, 1, 2, 3, 4, 5]
                  .map((idx) => {
                    const { x, y } = getCoordinates(ringPercent, idx);
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={ringPercent}
                    points={ringPoints}
                    fill={ringPercent === 100 ? '#FAFDFB' : 'transparent'}
                    stroke="#D9E6DE"
                    strokeWidth="1"
                    strokeDasharray={ringPercent < 100 ? '2 2' : 'none'}
                  />
                );
              })}

              {/* Radial Axis Lines */}
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const { x, y } = getCoordinates(100, idx);
                return (
                  <line
                    key={idx}
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke="#D2E3D8"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Last Week Baseline Polygon (If toggled) */}
              {compareWithLastWeek && (
                <polygon
                  points={baselinePoints}
                  fill="url(#radarBaselineGrad)"
                  stroke="#B0C2B8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  strokeLinejoin="round"
                />
              )}

              {/* Current Week Data Polygon */}
              <polygon
                points={currentPoints}
                fill="url(#radarCurrentGrad)"
                stroke="#6E947C"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Current Data points */}
              {dimensions.map((dim, i) => {
                const { x, y } = getCoordinates(dim.value, i);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="#C27A83" stroke="#FFFFFF" strokeWidth="1.5" />
                  </g>
                );
              })}

              {/* Dimension Labels around perimeter */}
              {dimensions.map((dim, i) => {
                const { x, y } = getCoordinates(126, i);
                return (
                  <text
                    key={i}
                    x={x}
                    y={y + 4}
                    fontSize="10"
                    fontWeight="600"
                    fill="#395244"
                    textAnchor="middle"
                    className="font-sans select-none"
                  >
                    {dim.label} {dim.value}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#6E947C]"></span>
              <span className="font-semibold text-gray-800">本周美商数据</span>
            </div>
            {compareWithLastWeek && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-dashed border-[#B0C2B8] bg-[#E8EFEA]"></span>
                <span>上周基线对比</span>
              </div>
            )}
          </div>

          {/* 6 Dimension Breakdown Cards with Weekly Delta */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-[#EDF4F0]">
            {dimensions.map((dim) => {
              const isUp = dim.diff > 0;
              return (
                <div
                  key={dim.key}
                  className="p-2.5 rounded-2xl bg-[#FAFBF9] border border-[#E6EFE9] flex flex-col justify-between gap-1"
                >
                  <div className="flex items-center justify-between text-xs text-gray-700">
                    <span className="flex items-center gap-1">
                      <span>{dim.icon}</span>
                      <span className="font-semibold text-[11px]">{dim.label}</span>
                    </span>
                    <span className="font-bold text-[#3B614D]">{dim.value}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">上周 {dim.lastWeek}</span>
                    <span
                      className={`font-semibold ${
                        isUp ? 'text-[#487E5C]' : 'text-gray-400'
                      }`}
                    >
                      {isUp ? `+${dim.diff} 🚀` : `${dim.diff}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: AI Deep Aesthetic Advice with 3 Knowledge Points + Growth Timeline */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* AI 进阶审美建议与 3 条深度美学知识点专属卡片 */}
          <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#EDF4F0] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#FAF0EF] flex items-center justify-center text-[#C27A83]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#273B2F] flex items-center gap-1.5">
                    基于打卡历史的 AI 进阶审美建议
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    针对薄弱环节【{weakestDim.label}】({weakestDim.value}分) 自动推送 3 条深度美学知识点
                  </p>
                </div>
              </div>

              <button
                onClick={fetchDeepAestheticAdvice}
                disabled={isLoadingAdvice}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-[#6E947C] bg-[#EEF5F1] hover:bg-[#E2EFE7] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="重新由 AI 推导"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingAdvice ? 'animate-spin' : ''}`} />
                <span>{isLoadingAdvice ? '深度推演中…' : '重新推导'}</span>
              </button>
            </div>

            {/* Diagnosis Quote */}
            {deepAdvice?.diagnosisQuote && (
              <div className="p-3.5 bg-gradient-to-r from-[#FBF5F2] via-[#F8FAF7] to-[#FAF3F4] rounded-2xl border border-[#E9DFD8] text-xs leading-relaxed text-[#4A3C38] flex items-start gap-2.5">
                <span className="text-base select-none">💬</span>
                <div>
                  <span className="font-bold text-[#8A5243] mr-1">导师寄语：</span>
                  <span>{deepAdvice.diagnosisQuote}</span>
                </div>
              </div>
            )}

            {/* 3 Deep Aesthetic Knowledge Points */}
            <div className="flex flex-col gap-3">
              {deepAdvice?.knowledgePoints.map((point) => {
                const isExpanded = expandedKnowledgeId === point.id;
                const isCopied = copiedId === point.id;
                return (
                  <div
                    key={point.id}
                    className="p-4 rounded-2xl border border-[#E4EEE7] bg-[#FAFBF9] hover:border-[#BED6C7] transition-all flex flex-col gap-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#EBF3EE] text-[#426651] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {point.id}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#2A4333]">
                              {point.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#D5E5DB] text-[#426651] font-semibold">
                              {point.tag}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopyKnowledge(point)}
                          className="p-1 rounded-lg hover:bg-white text-gray-400 hover:text-[#557764] transition-colors cursor-pointer"
                          title="复制该知识点到剪贴板"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => setExpandedKnowledgeId(isExpanded ? null : point.id)}
                          className="p-1 rounded-lg hover:bg-white text-gray-400 hover:text-gray-700 cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Knowledge Body */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-[#EDF4F0]/80">
                      {/* Theory */}
                      <div className="text-xs text-gray-700 leading-relaxed bg-white/90 p-2.5 rounded-xl border border-gray-100">
                        <span className="font-semibold text-[#324B3C] block mb-0.5">
                          🏛️ 美学底层原理剖析：
                        </span>
                        <span>{point.theory}</span>
                      </div>

                      {/* Actionable micro-practice */}
                      <div className="text-xs text-[#2F4D3B] leading-relaxed bg-[#EBF3EE]/60 p-2.5 rounded-xl border border-[#D5E5DB]">
                        <span className="font-semibold text-[#2D5A3F] block mb-0.5">
                          ⚡ 本周可执行单点微练习：
                        </span>
                        <span>{point.actionablePractice}</span>
                      </div>

                      {/* Target platform tip (expanded or always shown) */}
                      {isExpanded && (
                        <div className="text-xs text-[#6A463B] leading-relaxed bg-[#FDF4F0]/80 p-2.5 rounded-xl border border-[#F2DACF] animate-in fade-in duration-150">
                          <span className="font-semibold text-[#8C4638] block mb-0.5">
                            💡 小红书笔记/封面实战避坑：
                          </span>
                          <span>{point.targetPlatformTip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Growth Timeline of Check-in Entries */}
          <div className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#EDF4F0] pb-2">
              <span className="text-xs font-bold text-[#324B3C] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#7CA18C]" />
                审美成长足迹 (历史沉淀)
              </span>
              <span className="text-[11px] text-gray-400">
                共 {history.length} 条打卡记录 · 自动云端持久化
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="p-3 rounded-2xl border border-[#E3EDE6] bg-[#FAFBF9] hover:bg-white hover:border-[#BED6C7] transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{record.moodEmoji}</span>
                      <span className="text-xs font-bold text-[#2A4333]">
                        {record.topic}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">{record.date}</span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {record.notes}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-[#EEF5F1] text-[#476C56] font-medium">
                      #{record.category}
                    </span>
                    <span>
                      色彩 {record.scores.colorSensitivity} · 构图 {record.scores.whitespaceSense} · 叙事 {record.scores.postureAesthetics}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Aesthetic Diagnostic Lab: 12 Season Colors & Facial Bone Structure */}
      <AestheticDiagnosticLab onApplyToDraft={onApplyToDraft} />
    </div>
  );
};
