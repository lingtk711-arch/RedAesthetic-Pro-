import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Clock,
  Palette,
  RefreshCw,
  Copy,
  Check,
  Share2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Layers,
  ArrowRight,
  Search,
  Trash2,
  Sliders,
  Award,
  ChevronDown,
  ChevronUp,
  Flame,
  Star,
  ExternalLink,
} from 'lucide-react';
import { AestheticCheckinRecord, AestheticMicroLesson, AestheticDimensionType } from '../types';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface AestheticMicroClassroomProps {
  history: AestheticCheckinRecord[];
  onApplyToDraft?: (topic: string, angle: string, keyPoints: string) => void;
}

// 预设的高质量美学微课堂知识库（保障零延迟秒开与离线沉浸式体验）
const PRESET_LESSONS: Record<AestheticDimensionType, AestheticMicroLesson> = {
  'texture-material': {
    id: 'lesson-texture-preset-1',
    dimensionKey: 'texture-material',
    dimensionLabel: '材质感知',
    dimensionIcon: '🌾',
    lessonTitle: '【材质感知 · 3分钟极速吸收】粗陶与棉麻的触觉视觉化：拍出隔着屏幕都有呼吸的质感',
    badge: '本周打卡缺失 · 专项补齐',
    readTime: '⏱️ 3分钟极速吸收',
    isMissingDimension: true,
    coreConcept: '真正的高级感不是平滑无暇的塑料反光，而是微妙的微距漫反射。粗糙与温润的肌理反差，能唤醒观者的触觉联觉。',
    masterOrigin: '源自日本物派艺术（Mono-ha）与北欧有机现代主义。强调材料本身的自然物性，不加过度雕琢，借由原生态肌理传达宁静力量。',
    detailedExplanation: '当光线以 45 度侧角打在棉麻褶皱或粗陶气孔上时，会在微观层面形成细碎柔和的明暗阴影。这种明暗过渡能让手机屏幕前的读者大脑自动补全“摸上去粗粝却温热”的体感，瞬间击破数码画面的廉价塑料感。',
    colorPaletteAdvice: {
      name: '原陶与灰草绿织物色谱',
      hexes: ['#9AAEA3', '#E5CECE', '#F4EDE4', '#604C43'],
      description: '60% 胚布原麻白 + 25% 鼠尾草灰绿 + 15% 粗陶褐棕点缀',
    },
    dailyActionablePractice: '在窗边自然侧光下，用手机微距镜头靠近你手边的棉麻衣物、陶瓷水杯或粗糙纸张，捕捉微小的纤维与颗粒光泽，感受材质带来的体温。',
    redBookConversionTip: '封面切忌使用大面积纯平无纹理色块，在底层叠加 5% 不透明度的棉麻或纸质噪点底纹，质感与完播率瞬间翻倍。',
    quote: '物的体温藏在不经意抚摸到的微小粗糙里，那是对抗流水线虚无的锚。',
  },
  'color-psychology': {
    id: 'lesson-color-preset-1',
    dimensionKey: 'color-psychology',
    dimensionLabel: '色彩心理学',
    dimensionIcon: '🎨',
    lessonTitle: '【色彩心理学 · 3分钟极速吸收】低饱和莫兰迪的视网膜镇定机制：为什么柔粉配灰绿最能抚平焦虑？',
    badge: '本周打卡缺失 · 专项补齐',
    readTime: '⏱️ 3分钟极速吸收',
    isMissingDimension: true,
    coreConcept: '高饱和对比色强行刺激交感神经，制造短促紧张；而 7:3 莫兰迪低彩度互补色直接触发副交感神经，产生“被拥抱”的无防御安全感。',
    masterOrigin: '意大利静物大师乔治·莫兰迪（Giorgio Morandi）的灰色调哲学。他为所有鲜艳色彩加入灰度滤镜，抹去攻击性，回归万物平等的沉静秩序。',
    detailedExplanation: '鼠尾草绿 (#8EA89D) 位于冷暖光谱中性带，波长适中，使睫状肌自然放松；柔杏粉 (#E8C5C8) 则唤起对母体皮肤与晨曦的本能依恋。两色并置不仅毫无色彩冲突，反而搭建起一处供视线安心驻足的“视觉避难所”。',
    colorPaletteAdvice: {
      name: 'Sage & Blush 经典疗愈配比',
      hexes: ['#8EA89D', '#E8C5C8', '#FAF8F5', '#4E6759'],
      description: '70% 灰绿降噪底色 + 20% 柔杏粉氛围注入 + 10% 橄榄墨绿文字锚点',
    },
    dailyActionablePractice: '打开衣橱或梳妆台，挑出一件低彩度灰绿单品与一件淡粉小物并排放在自然光下，观察眼睛在注视 30 秒后的放松感。',
    redBookConversionTip: '小红书受众厌恶“荧光色警告”，将主视觉饱和度下调 25%，文案标题从“立刻搞定”变为“慢慢养出”，收藏率更高。',
    quote: '真正的温柔具有不动声色的力量，不必呼喊，自能沉淀人心。',
  },
  'composition': {
    id: 'lesson-comp-preset-1',
    dimensionKey: 'composition',
    dimensionLabel: '构图学',
    dimensionIcon: '📐',
    lessonTitle: '【构图学 · 3分钟极速吸收】负空间呼吸法则：留白不是空无，而是视觉气流的流动通道',
    badge: '本周打卡缺失 · 专项补齐',
    readTime: '⏱️ 3分钟极速吸收',
    isMissingDimension: true,
    coreConcept: '拥挤的元素剥夺读者的呼吸权；克制留出 35% 以上的空白区域，才能让主体和核心文案成为唯一的视觉主角。',
    masterOrigin: '东方传统画论“虚实相生，计白当黑”与包豪斯网格系统的完美融合。白非无物，留白是通向想象力无限延伸的门扉。',
    detailedExplanation: '在 3:4 竖屏信息流中，过度填满画面的排版会引发本能的信息窒息感。将主体置于九宫格偏下或侧边，让顶部或中央保留纯净空气带，视线便会从开阔处顺流而下，形成优雅的视觉滑梯效应。',
    colorPaletteAdvice: {
      name: '空间留白层次基调',
      hexes: ['#FAF9F6', '#DFE7E1', '#8EA89D', '#364D3F'],
      description: '大面积羊脂白背景 + 细线条引导 + 核心绿意视觉落点',
    },
    dailyActionablePractice: '拍摄今天喝的咖啡或茶杯，强制要求画面上方空出 1/2 以上的桌面与背景光斑，只拍杯子的一侧与轻微热气。',
    redBookConversionTip: '封面大标题千万不要居中死板铺满，顶端留出 15% 呼吸带，大字偏左上方排布，视觉冲击力与高级感立刻提升。',
    quote: '舍弃多余的杂念与摆设，留下风穿堂而过的空隙。',
  },
  'visual-storytelling': {
    id: 'lesson-story-preset-1',
    dimensionKey: 'visual-storytelling',
    dimensionLabel: '视觉叙事',
    dimensionIcon: '📖',
    lessonTitle: '【视觉叙事 · 3分钟极速吸收】微动势抓拍法则：如何让静止的照片拥有未完待续的故事感？',
    badge: '精选美商必修',
    readTime: '⏱️ 3分钟极速吸收',
    isMissingDimension: false,
    coreConcept: '死板的正对摆拍是静态标本，微小的动态趋势（微侧头、指尖轻抚、裙摆微扬）则是叙事的入口。',
    masterOrigin: '法国新浪潮电影的瞬间捕捉美学。生活的美存在于两段正式动作之间的过渡帧。',
    detailedExplanation: '静态照片最忌死板对称。通过肢体的非对称倾角或视线的偏离，在画面中制造出一种“似乎下一秒就会动起来”的心理期待。读者在下意识捕捉动态意图时，停留时长便悄然翻倍。',
    colorPaletteAdvice: {
      name: '电影感胶片微光色谱',
      hexes: ['#8CA397', '#D5A7A0', '#FBF8F3', '#3F4E44'],
      description: '复古暖白光晕 + 灰绿中景 + 浅胭脂情绪高光',
    },
    dailyActionablePractice: '尝试一次不看镜头的 3 连拍：看窗外、微低头系手链、转身回眸一瞬间，挑出最具空气感的一张。',
    redBookConversionTip: '第 1 张封面放微动势氛围抓拍，第 2 张放局部细节（如耳饰、锁骨），制造连贯的电影分镜感。',
    quote: '故事不发生在摆好的姿势里，而流淌在不经意的微动瞬间。',
  },
  'style-identity': {
    id: 'lesson-style-preset-1',
    dimensionKey: 'style-identity',
    dimensionLabel: '风格辨识',
    dimensionIcon: '✨',
    lessonTitle: '【风格辨识 · 3分钟极速吸收】骨相量感与极简 Clean Fit：打造让人过目不忘的超级视觉符号',
    badge: '精选美商必修',
    readTime: '⏱️ 3分钟极速吸收',
    isMissingDimension: false,
    coreConcept: '风格不是千人一面的网红公式，而是清晰认知自己的五官量感，并在每张照片中保持一致的视觉秩序。',
    masterOrigin: '老钱风（Quiet Luxury）与极简建筑学。不依靠大 Logo 和夸张色彩，仅凭利落剪裁与骨骼线条确立风格主权。',
    detailedExplanation: '小红书信息流每日产生海量图文，读者的记忆机制极度依赖“恒定常数”。无论你拍摄什么主题，保持一致的色调偏好（如 Sage & Blush）、固定的字体位置或独特的饰品点缀，便能构筑专属的超级品牌资产。',
    colorPaletteAdvice: {
      name: '辨识度极简秩序色谱',
      hexes: ['#799886', '#E2BABF', '#F8F6F2', '#2A3C31'],
      description: '统一基底色 + 标志性花字色 + 极简纯净边框',
    },
    dailyActionablePractice: '梳理自己最满意的 3 张往期照片，提炼出 1 个共同点（如高颅顶蓬松感、银色细耳钉或低饱和绿色调），将其定为接下来 1 周的常设视觉符号。',
    redBookConversionTip: '个人主页前 9 宫格封面保持统一色温和字重，新访客进店点击关注转化率提升 50% 以上。',
    quote: '风格是你对世界的一种坚定表态，它无需喧哗，自有回响。',
  },
};

const LOCAL_STORAGE_SAVED_KEY = 'morandi_aesthetic_favorite_lessons_v1';

export const AestheticMicroClassroom: React.FC<AestheticMicroClassroomProps> = ({
  history,
  onApplyToDraft,
}) => {
  // 分析用户最近一周打卡缺失的维度
  const analyzeMissingDimensions = () => {
    // 统计各维度打卡频次
    const counts: Record<AestheticDimensionType, number> = {
      'texture-material': 0,
      'composition': 0,
      'color-psychology': 0,
      'visual-storytelling': 0,
      'style-identity': 0,
    };

    history.forEach((item) => {
      if (item.category === '色彩与莫兰迪' || item.scores?.colorSensitivity > 75) {
        counts['color-psychology'] += 1;
      }
      if (item.category === '生活留白心流' || item.scores?.whitespaceSense > 75) {
        counts['composition'] += 1;
      }
      if (item.category === '骨相与发型' || item.scores?.postureAesthetics > 75) {
        counts['visual-storytelling'] += 1;
      }
      if (item.category === '穿搭与垂坠' || item.scores?.styleIdentity > 75) {
        counts['style-identity'] += 1;
      }
      // 材质感知通常在默认打卡中较少提及
      if (item.notes?.includes('材质') || item.notes?.includes('面料') || item.notes?.includes('陶')) {
        counts['texture-material'] += 1;
      }
    });

    // 找出缺失（频次为0或最低）的维度列表
    const sorted = (Object.keys(counts) as AestheticDimensionType[]).sort(
      (a, b) => counts[a] - counts[b]
    );

    const missingDims = sorted.filter((dim) => counts[dim] === 0);
    const primaryMissing = missingDims.length > 0 ? missingDims[0] : sorted[0];

    return {
      counts,
      missingDims: missingDims.length > 0 ? missingDims : [sorted[0]],
      primaryMissing,
    };
  };

  const analysisResult = analyzeMissingDimensions();
  const [selectedDimension, setSelectedDimension] = useState<AestheticDimensionType>(
    analysisResult.primaryMissing
  );

  const [currentLesson, setCurrentLesson] = useState<AestheticMicroLesson>(
    PRESET_LESSONS[analysisResult.primaryMissing] || PRESET_LESSONS['texture-material']
  );

  const [activeTab, setActiveTab] = useState<'today' | 'favorites'>('today');
  const [favoriteLessons, setFavoriteLessons] = useState<AestheticMicroLesson[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_SAVED_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Failed to load cached favorite lessons:', e);
    }
    // 默认附带 1 篇经典收藏，让用户初次进入就有复习内容
    return [
      {
        ...PRESET_LESSONS['color-psychology'],
        isFavorited: true,
        savedAt: '2026-10-10 09:30',
      },
    ];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [favoriteFilter, setFavoriteFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 3 分钟阅读倒计时计时器 (180 秒)
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(180);
  };

  // 监听 Firebase 用户登录状态，同步加载云端收藏
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        try {
          const favRef = collection(db, 'users', user.uid, 'favoriteLessons');
          const q = query(favRef, orderBy('savedAt', 'desc'));
          const unsubSnapshot = onSnapshot(
            q,
            (snapshot) => {
              if (!snapshot.empty) {
                const remoteList: AestheticMicroLesson[] = snapshot.docs.map((doc) => ({
                  ...(doc.data() as AestheticMicroLesson),
                  id: doc.id,
                  isFavorited: true,
                }));
                setFavoriteLessons(remoteList);
                try {
                  localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(remoteList));
                } catch (e) {}
              }
            },
            (err) => console.warn('Favorite lessons Firestore snapshot error:', err)
          );
          return () => unsubSnapshot();
        } catch (err) {
          console.warn('Firestore fav lessons init error:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 切换选中的维度并自动加载该维度的微课
  const handleSelectDimension = (dim: AestheticDimensionType) => {
    setSelectedDimension(dim);
    const isMissing = analysisResult.missingDims.includes(dim);
    const preset = PRESET_LESSONS[dim];
    if (preset) {
      const isFav = favoriteLessons.some((item) => item.id === preset.id);
      setCurrentLesson({
        ...preset,
        isMissingDimension: isMissing,
        isFavorited: isFav,
      });
    }
    handleResetTimer();
  };

  // 调用 AI 实时重新生成今日新微课 (换一换)
  const handleGenerateNewLesson = async () => {
    setIsLoading(true);
    const isMissing = analysisResult.missingDims.includes(selectedDimension);
    const labelMap: Record<AestheticDimensionType, string> = {
      'texture-material': '材质感知',
      'color-psychology': '色彩心理学',
      'composition': '构图学',
      'visual-storytelling': '视觉叙事',
      'style-identity': '风格辨识',
    };

    try {
      const res = await fetch('/api/aesthetic/micro-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimensionKey: selectedDimension,
          dimensionLabel: labelMap[selectedDimension],
          isMissing,
          pastTopics: history.slice(0, 4).map((h) => h.topic),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const isFav = favoriteLessons.some((item) => item.id === json.data.id);
        setCurrentLesson({
          ...json.data,
          isFavorited: isFav,
        });
        handleResetTimer();
      } else {
        throw new Error(json.error || '生成失败');
      }
    } catch (err) {
      console.warn('Micro lesson generate failed, falling back:', err);
      const fallback = PRESET_LESSONS[selectedDimension];
      if (fallback) {
        setCurrentLesson({
          ...fallback,
          id: `lesson-${selectedDimension}-${Date.now()}`,
          isMissingDimension: isMissing,
          isFavorited: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 切换收藏状态
  const handleToggleFavorite = async (lesson: AestheticMicroLesson) => {
    const isCurrentlyFav = favoriteLessons.some((item) => item.id === lesson.id);
    let updated: AestheticMicroLesson[];

    if (isCurrentlyFav) {
      // 移除收藏
      updated = favoriteLessons.filter((item) => item.id !== lesson.id);
      if (currentLesson.id === lesson.id) {
        setCurrentLesson((prev) => ({ ...prev, isFavorited: false }));
      }
      // Firestore 同步删除
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'favoriteLessons', lesson.id));
        } catch (e) {
          console.warn('Could not delete from Firestore:', e);
        }
      }
    } else {
      // 添加收藏
      const newFavItem: AestheticMicroLesson = {
        ...lesson,
        isFavorited: true,
        savedAt: new Date().toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      updated = [newFavItem, ...favoriteLessons];
      if (currentLesson.id === lesson.id) {
        setCurrentLesson((prev) => ({ ...prev, isFavorited: true }));
      }
      // Firestore 同步保存
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await setDoc(doc(db, 'users', currentUser.uid, 'favoriteLessons', lesson.id), newFavItem);
        } catch (e) {
          console.warn('Could not save to Firestore:', e);
        }
      }
    }

    setFavoriteLessons(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  // 复制知识点到剪贴板
  const handleCopyLesson = (lesson: AestheticMicroLesson) => {
    const text = `【美学微课堂 · 3分钟极速吸收】\n🏷️ 维度：${lesson.dimensionLabel} (${lesson.badge})\n📖 课题：${lesson.lessonTitle}\n\n🏛️ 大师哲学溯源：\n${lesson.masterOrigin}\n\n✨ 核心原理解析：\n${lesson.coreConcept}\n${lesson.detailedExplanation}\n\n⚡ 今日1分钟微实操：\n${lesson.dailyActionablePractice}\n\n💡 小红书爆款避坑转化：\n${lesson.redBookConversionTip}\n\n💬 治愈美学箴言：\n"${lesson.quote}"`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 格式化时间为 mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 过滤后的收藏列表
  const filteredFavorites = favoriteLessons.filter((lesson) => {
    const matchesFilter = favoriteFilter === 'all' || lesson.dimensionKey === favoriteFilter;
    const matchesSearch =
      !searchQuery ||
      lesson.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.coreConcept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.dimensionLabel.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const dimensionTabs: Array<{
    key: AestheticDimensionType;
    label: string;
    icon: string;
    isMissing: boolean;
  }> = [
    {
      key: 'texture-material',
      label: '材质感知',
      icon: '🌾',
      isMissing: analysisResult.missingDims.includes('texture-material'),
    },
    {
      key: 'color-psychology',
      label: '色彩心理学',
      icon: '🎨',
      isMissing: analysisResult.missingDims.includes('color-psychology'),
    },
    {
      key: 'composition',
      label: '构图学',
      icon: '📐',
      isMissing: analysisResult.missingDims.includes('composition'),
    },
    {
      key: 'visual-storytelling',
      label: '视觉叙事',
      icon: '📖',
      isMissing: analysisResult.missingDims.includes('visual-storytelling'),
    },
    {
      key: 'style-identity',
      label: '风格辨识',
      icon: '✨',
      isMissing: analysisResult.missingDims.includes('style-identity'),
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-white via-[#FCFAF8] to-[#F5EFEA] rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-6">
      {/* 顶部标题与 Tab 切换 (今日微课堂 vs 收藏复习集) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#EDF4F0] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#EAF3EE] to-[#F9EFEF] border border-[#D7E8DE] flex items-center justify-center text-[#547965] shadow-xs">
            <BookOpen className="w-5 h-5 text-[#6B927B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-sc font-bold text-base text-[#283C2F]">
                美学微课堂 · 每日 3 分钟审美充能
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF3EE] text-[#476C56] font-semibold border border-[#D5E5DB] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#7FA690]" />
                自动针对打卡缺失维度补齐
              </span>
            </div>
            <p className="text-xs text-[#6B8475] mt-0.5">
              根据近一周打卡盲区，每日智能推送大师级美学知识碎片，搭配 180 秒极速吸收与长效复习锦囊
            </p>
          </div>
        </div>

        {/* 顶部主 Tab 切换 */}
        <div className="flex items-center gap-1.5 p-1 bg-[#EEF5F1] rounded-2xl border border-[#DBE7DF] self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'today'
                ? 'bg-white text-[#385B46] shadow-xs border border-[#D5E5DB]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6E947C]" />
            <span>今日微课 ✨</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-white text-[#A05C66] shadow-xs border border-[#ECD1D5]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-[#C37E88]" />
            <span>审美复习锦囊</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'favorites'
                  ? 'bg-[#FAF0F1] text-[#B86873]'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {favoriteLessons.length}
            </span>
          </button>
        </div>
      </div>

      {/* 视图 1：今日微课主界面 */}
      {activeTab === 'today' && (
        <div className="flex flex-col gap-5">
          {/* 缺失维度智能诊断提示条 */}
          <div className="p-3.5 bg-gradient-to-r from-[#F4F9F6] via-[#FAF6F3] to-[#FDF4F4] rounded-2xl border border-[#DFECE4] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-white border border-[#D7E7DC] flex items-center justify-center text-sm shadow-2xs shrink-0">
                🔍
              </span>
              <div className="text-[#3A5344]">
                <span className="font-bold text-[#2A4333] mr-1">本周打卡缺失诊断：</span>
                <span>
                  检测到您近 7 天在
                  {analysisResult.missingDims.map((dim, i) => (
                    <strong key={dim} className="text-[#965761] font-semibold mx-1">
                      【{PRESET_LESSONS[dim]?.dimensionLabel || dim}】
                    </strong>
                  ))}
                  未进行专项打卡，今日已优先为您生成补齐微课！
                </span>
              </div>
            </div>

            <span className="text-[11px] text-[#698474] bg-white/80 px-2.5 py-1 rounded-xl border border-[#DFEBE3] shrink-0">
              近一周打卡覆盖率：
              <strong className="text-[#3C644D]">
                {Math.round(((5 - analysisResult.missingDims.length) / 5) * 100)}%
              </strong>
            </span>
          </div>

          {/* 维度快捷切换筛选药丸 (Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-xs font-semibold text-gray-500 shrink-0 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-gray-400" />
              维度切换：
            </span>
            {dimensionTabs.map((dim) => {
              const isSelected = selectedDimension === dim.key;
              return (
                <button
                  key={dim.key}
                  onClick={() => handleSelectDimension(dim.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#6E947C] text-white shadow-xs font-semibold'
                      : 'bg-white text-gray-600 border border-[#DEEAE2] hover:bg-[#F4F8F5]'
                  }`}
                >
                  <span>{dim.icon}</span>
                  <span>{dim.label}</span>
                  {dim.isMissing && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#FBE8EA] text-[#C16B77] border border-[#F2D2D7]'
                      }`}
                    >
                      缺卡补齐
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 核心微课卡片 */}
          <div className="bg-white rounded-3xl border border-[#DFEBE3] p-6 shadow-sm flex flex-col gap-5 relative overflow-hidden">
            {/* 卡片顶部装饰底色 */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#95B1A2] via-[#E8C5C8] to-[#95B1A2]" />

            {/* 卡片头部：维度、倒计时器、操作按钮 */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#F0F5F2] pb-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-8 h-8 rounded-xl bg-[#EEF5F1] text-[#3D634C] flex items-center justify-center text-lg border border-[#D5E5DC]">
                  {currentLesson.dimensionIcon || '🎨'}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#324C3C]">
                      {currentLesson.dimensionLabel}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        currentLesson.isMissingDimension
                          ? 'bg-[#FBF1F2] text-[#B8606D] border-[#F2D0D6]'
                          : 'bg-[#F2F7F4] text-[#4E765F] border-[#D7E8DE]'
                      }`}
                    >
                      {currentLesson.badge}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {currentLesson.readTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* 180 秒极速吸收计时器 & 操作动作 */}
              <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
                {/* 3 分钟倒计时胶囊 */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F8FAF9] border border-[#DDEBE2] text-xs">
                  <Clock className="w-3.5 h-3.5 text-[#6E947C]" />
                  <span className="font-mono font-bold text-[#2A4333]">
                    {formatTimer(timerSeconds)}
                  </span>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-1 rounded-md hover:bg-white text-gray-500 hover:text-[#527762] transition-colors cursor-pointer"
                    title={isTimerRunning ? '暂停计时' : '开始 3 分钟极速阅读'}
                  >
                    {isTimerRunning ? (
                      <Pause className="w-3 h-3 text-[#A85865]" />
                    ) : (
                      <Play className="w-3 h-3 text-[#527762]" />
                    )}
                  </button>
                  <button
                    onClick={handleResetTimer}
                    className="p-1 rounded-md hover:bg-white text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    title="重置计时器"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* 换一换 AI 重新生成 */}
                <button
                  onClick={handleGenerateNewLesson}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#577966] bg-[#EEF5F1] hover:bg-[#E2EEE6] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="由 Gemini 重新生成今日新微课"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">
                    {isLoading ? '生成中…' : '换一课'}
                  </span>
                </button>

                {/* 收藏按钮 */}
                <button
                  onClick={() => handleToggleFavorite(currentLesson)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    currentLesson.isFavorited
                      ? 'bg-[#FAF0F1] text-[#BA5F6D] border-[#F2CDD3] shadow-xs'
                      : 'bg-white text-gray-600 border-[#DEEAE2] hover:bg-[#FAF4F4] hover:text-[#BA5F6D]'
                  }`}
                  title={currentLesson.isFavorited ? '取消收藏' : '收藏到复习锦囊'}
                >
                  {currentLesson.isFavorited ? (
                    <BookmarkCheck className="w-3.5 h-3.5 fill-[#BA5F6D] text-[#BA5F6D]" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span>{currentLesson.isFavorited ? '已收藏' : '收藏'}</span>
                </button>

                {/* 复制微课卡片 */}
                <button
                  onClick={() => handleCopyLesson(currentLesson)}
                  className="p-1.5 rounded-xl bg-white border border-[#DEEAE2] hover:bg-gray-50 text-gray-500 hover:text-[#527762] transition-colors cursor-pointer"
                  title="复制知识卡片"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* 课件标题 */}
            <div>
              <h4 className="font-serif-sc font-bold text-lg md:text-xl text-[#243B2D] leading-snug">
                {currentLesson.lessonTitle}
              </h4>
            </div>

            {/* 核心美学原理解析 & 大师哲学溯源 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 大师或艺术流派哲学溯源 */}
              <div className="p-4 rounded-2xl bg-[#FBF9F7] border border-[#EBE4DC] flex flex-col gap-2">
                <span className="text-xs font-bold text-[#86594C] flex items-center gap-1.5">
                  <span>🏛️</span>
                  <span>大师哲学与美学流派溯源</span>
                </span>
                <p className="text-xs text-[#52443F] leading-relaxed">
                  {currentLesson.masterOrigin}
                </p>
              </div>

              {/* 核心美学原理拆解 (30秒极速掌握) */}
              <div className="p-4 rounded-2xl bg-[#F4F9F6] border border-[#DDEBE2] flex flex-col gap-2">
                <span className="text-xs font-bold text-[#355B44] flex items-center gap-1.5">
                  <span>✨</span>
                  <span>核心美学原理 (30秒极速掌握)</span>
                </span>
                <p className="text-xs text-[#2F4739] leading-relaxed">
                  {currentLesson.coreConcept}
                </p>
              </div>
            </div>

            {/* 深入规律剖析 */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2EEE7] flex flex-col gap-2">
              <span className="text-xs font-bold text-[#2A4333] flex items-center gap-1.5">
                <span>📖</span>
                <span>深度规律剖析与视觉心流体验</span>
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">
                {currentLesson.detailedExplanation}
              </p>
            </div>

            {/* 莫兰迪配色方案建议 (如果有) */}
            {currentLesson.colorPaletteAdvice && (
              <div className="p-4 rounded-2xl bg-[#FCFAF8] border border-[#E9DFD8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#443834] flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#C27E86]" />
                    <span>{currentLesson.colorPaletteAdvice.name}</span>
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {currentLesson.colorPaletteAdvice.description}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentLesson.colorPaletteAdvice.hexes.map((hex, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-7 h-7 rounded-lg shadow-2xs border border-black/10 transition-transform hover:scale-110"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-mono text-[9px] text-gray-500">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 实操微练习与小红书实战避坑 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 今日 1 分钟微实操练习 */}
              <div className="p-4 rounded-2xl bg-[#EBF3EE] border border-[#D5E5DB] flex flex-col gap-2">
                <span className="text-xs font-bold text-[#2E5B41] flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>今日 1 分钟身边微实操动作</span>
                </span>
                <p className="text-xs text-[#2A4936] leading-relaxed">
                  {currentLesson.dailyActionablePractice}
                </p>
              </div>

              {/* 小红书封面与笔记转化避坑 */}
              <div className="p-4 rounded-2xl bg-[#FDF5F2] border border-[#F2DBD3] flex flex-col gap-2">
                <span className="text-xs font-bold text-[#914D3F] flex items-center gap-1.5">
                  <span>💡</span>
                  <span>小红书封面/排版实战避坑</span>
                </span>
                <p className="text-xs text-[#61362D] leading-relaxed">
                  {currentLesson.redBookConversionTip}
                </p>
              </div>
            </div>

            {/* 底部治愈金句 & 一键带入操盘模式 */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FBF6F3] via-[#FAF4F5] to-[#F5ECE8] border border-[#E9DDD5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#56423B]">
                <span className="text-base select-none">💬</span>
                <span className="italic font-serif-sc">“{currentLesson.quote}”</span>
              </div>

              {onApplyToDraft && (
                <button
                  onClick={() =>
                    onApplyToDraft(
                      currentLesson.lessonTitle,
                      `基于${currentLesson.dimensionLabel}与生活留白心流，拆解普通人的变美与审美提升闭环`,
                      `1. 核心美学原理：${currentLesson.coreConcept}\n2. 落地练习：${currentLesson.dailyActionablePractice}\n3. 实战转化避坑：${currentLesson.redBookConversionTip}`
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-[#6E947C] hover:bg-[#5C8069] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <span>一键带入【操盘模式】写笔记</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 视图 2：我的审美复习锦囊 (Favorites / Bookmark Archive) */}
      {activeTab === 'favorites' && (
        <div className="flex flex-col gap-5">
          {/* 筛选与搜索工具条 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#DFEBE3]">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setFavoriteFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  favoriteFilter === 'all'
                    ? 'bg-[#6E947C] text-white font-semibold'
                    : 'bg-[#EEF5F1] text-gray-600 hover:bg-[#E2EEE6]'
                }`}
              >
                全部 ({favoriteLessons.length})
              </button>
              {dimensionTabs.map((dim) => {
                const count = favoriteLessons.filter((f) => f.dimensionKey === dim.key).length;
                return (
                  <button
                    key={dim.key}
                    onClick={() => setFavoriteFilter(dim.key)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      favoriteFilter === dim.key
                        ? 'bg-[#6E947C] text-white font-semibold'
                        : 'bg-[#EEF5F1] text-gray-600 hover:bg-[#E2EEE6]'
                    }`}
                  >
                    <span>{dim.icon}</span>
                    <span>{dim.label}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* 搜索框 */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索复习小知识..."
                className="w-full pl-8 pr-3 py-1 rounded-xl text-xs border border-[#DCE8E0] bg-[#FAFBF9] focus:outline-none focus:ring-1 focus:ring-[#6E947C] text-gray-700"
              />
            </div>
          </div>

          {/* 收藏卡片网格 */}
          {filteredFavorites.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-dashed border-[#DFEBE3] flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF0F1] flex items-center justify-center text-[#B86873]">
                <Bookmark className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-sm text-[#273B2F]">暂无相关收藏知识卡片</h5>
              <p className="text-xs text-gray-500 max-w-sm">
                在【今日微课】中点击“⭐️ 收藏”按钮，即可将每日 3 分钟审美要点永久留存于此，供后续随手复习与内化！
              </p>
              <button
                onClick={() => setActiveTab('today')}
                className="mt-2 px-4 py-2 rounded-xl bg-[#6E947C] text-white text-xs font-semibold hover:bg-[#5B8069] transition-colors cursor-pointer"
              >
                返回今日微课探索
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFavorites.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-5 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi hover:border-[#BED6C7] transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-2.5">
                    {/* 卡片头部 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{lesson.dimensionIcon || '🎨'}</span>
                        <span className="text-xs font-bold text-[#324D3D]">
                          {lesson.dimensionLabel}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EEF5F1] text-[#476C56] font-medium">
                          {lesson.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyLesson(lesson)}
                          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                          title="复制该知识卡片"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleFavorite(lesson)}
                          className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="移除收藏"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 标题 */}
                    <h5 className="font-serif-sc font-bold text-sm text-[#273B2F] leading-snug">
                      {lesson.lessonTitle}
                    </h5>

                    {/* 核心概念 */}
                    <p className="text-xs text-gray-600 leading-relaxed bg-[#F8FAF9] p-3 rounded-2xl border border-[#E5EFE9]">
                      <strong className="text-[#324E3E] block mb-0.5">✨ 核心原理解析：</strong>
                      {lesson.coreConcept}
                    </p>

                    {/* 微实操动作 */}
                    <div className="text-xs text-[#2A4D37] bg-[#EBF3EE]/80 p-2.5 rounded-xl border border-[#D5E5DB]">
                      <span className="font-semibold block mb-0.5">⚡ 今日微练习：</span>
                      <span>{lesson.dailyActionablePractice}</span>
                    </div>

                    {/* 小红书避坑建议 */}
                    <div className="text-xs text-[#874A3D] bg-[#FDF5F2] p-2.5 rounded-xl border border-[#F2DACF]">
                      <span className="font-semibold block mb-0.5">💡 实战避坑提示：</span>
                      <span>{lesson.redBookConversionTip}</span>
                    </div>
                  </div>

                  {/* 底部信息与动作 */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#F0F5F2] text-[11px] text-gray-400">
                    <span>收藏于 {lesson.savedAt || '近期'}</span>

                    <button
                      onClick={() => {
                        setCurrentLesson(lesson);
                        setSelectedDimension(lesson.dimensionKey);
                        setActiveTab('today');
                      }}
                      className="text-[#577B66] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>展开沉浸复习</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
