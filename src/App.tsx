import React, { useState, useEffect, useRef } from 'react';
import { ModeType, PostDraft, AestheticInspiration } from './types';
import { Navigation } from './components/Navigation';
import { ModeStrategy } from './components/ModeStrategy';
import { DailyAestheticFeed } from './components/DailyAestheticFeed';
import { TopicScorer } from './components/TopicScorer';
import { ModeContent } from './components/ModeContent';
import { ModeReview } from './components/ModeReview';
import { AestheticGrowthArchive } from './components/AestheticGrowthArchive';
import { WorkbenchTrendDashboard } from './components/WorkbenchTrendDashboard';
import { ColorAestheticsLab } from './components/ColorAestheticsLab';
import { RiskToolsModal } from './components/RiskToolsModal';
import { CompanionChat } from './components/CompanionChat';
import { SkillMatrixModal } from './components/SkillMatrixModal';
import { PRESET_TOPICS } from './data/presets';
import { Sparkles, HeartHandshake, ShieldCheck, BookOpen, Compass, Cloud, Check } from 'lucide-react';
import { auth, db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function App() {
  // Ordered sequence requested by user:
  // 1. 顾问模式 (首位定位与起号SOP) -> 2. 审美热点 (每日10+推荐) -> 3. 选题打分 -> 4. 操盘模式 -> 5. 诊断模式 -> 6. 成长档案
  const [currentMode, setCurrentMode] = useState<ModeType>('strategy');
  const [isSkillMatrixOpen, setIsSkillMatrixOpen] = useState(false);
  const [scorerInitialTopic, setScorerInitialTopic] = useState('');
  const [scorerInitialAngle, setScorerInitialAngle] = useState('');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');

  // Initial default draft based on the first preset or cached local draft
  const defaultPreset = PRESET_TOPICS[0];
  const [currentDraft, setCurrentDraft] = useState<PostDraft>(() => {
    try {
      const cached = localStorage.getItem('redaesthetic_active_draft');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // ignore
    }
    return {
      id: 'draft-1',
      topic: defaultPreset.title,
      selectedTitle: '方圆脸淡颜女孩｜别硬搬浓颜，找对松弛清冷耐看美学',
      titles: [
        {
          title: '从“又土又钝”到清冷耐看感！方圆脸淡颜女孩踩坑3年悟出的美商底层逻辑',
          hookType: '痛点反差',
          analysis: '利用强烈反差痛点吸睛，唤醒共鸣',
        },
        {
          title: '听闺蜜一句劝！淡颜方圆脸别盲目画粗黑眼线了，松弛感全在这些细节里…',
          hookType: '闺蜜避坑',
          analysis: '闺蜜口吻降低戒备，高收藏潜力',
        },
        {
          title: '普通女孩美商逆袭Day 12｜做对这4个小动作，整张脸立刻舒展轻盈✨',
          hookType: '沉浸打卡',
          analysis: '打卡陪伴感，易引发评论区同频打卡',
        },
      ],
      body: `哈喽姐妹们！今天想和大家聊聊困扰我们很久的【方圆脸淡颜逆袭】打卡心得～🌱

很多人总觉得下颌骨明显、五官量感小就很吃亏，非要跟风画大浓妆、剪厚刘海，结果反而显得脸盘子又重又钝… 真的听真闺蜜一句劝，我们的美商在于【松弛感与留白】！

整理了这几条我亲测有效的日常变美清单，拿来就能用：

✨ 1. 颅顶外轮廓打造
不要一味靠两颊头发遮脸！用排骨梳倒梳发根，把头顶吹蓬松，纵向拉长比例，脸反而视觉上小一圈。

🌸 2. 弱化眼妆，强化气色
淡颜最怕厚重浓眼影。眼妆用低饱和杏仁奶茶色轻轻带过，把重心放在清透睫毛和温润低饱和腮红上。

🌿 3. 莫兰迪治愈配色
穿搭上主打鼠尾草绿与淡粉的呼应，整个人散发出干净、舒展、有审美的呼吸感。

审美是一场长久的自我探索，接纳自己的骨相特质才是真正高级的开始。

大家平时修饰方圆脸最常用哪招？或者还有哪些踩坑经历？快在评论区告诉我，我们一起打卡变美～👇`,
      pinnedComment: '姐妹们，方圆脸发型与修饰日常自查清单整理在置顶啦！评论区留个【1】或报身高脸型，美商搭子逐个帮你看～👇',
      visualGuidance: {
        coverFlowerText: '方圆脸淡颜｜审美觉醒',
        composition: '3:4 比例，中心偏上对齐，高留白治愈系莫兰迪',
        colorPalette: 'Sage & Blush (淡粉 + 淡绿) 经典治愈配色',
        lightingAndProps: '自然漫射光，配莫兰迪陶罐、棉麻衬衫或手账本',
      },
      seoTags: [
        '#美商逆袭',
        '#方圆脸发型',
        '#淡颜变美',
        '#治愈系美学',
        '#莫兰迪配色',
        '#审美陪伴官',
        '#普通女孩逆袭',
      ],
      ctaQuestion: '大家平时修饰方圆脸最常用哪招？快在评论区告诉我，我们一起打卡～',
      coverConfig: {
        theme: 'sage-blush',
        badge: '美商逆袭 · 打卡日常',
        mainTitle: '方圆脸淡颜｜审美觉醒',
        subTitle: '别硬搬浓颜，找对松弛耐看美学',
        dateOrDay: 'ESTHETICS COMPANION · SAGE & BLUSH',
      },
    };
  });

  const isRemoteSyncRef = useRef(false);

  // Real-time Firestore Cloud Sync for Drafts
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        try {
          const draftDocRef = doc(db, 'users', user.uid, 'drafts', 'active');
          const unsubscribeSnapshot = onSnapshot(
            draftDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const remoteDraft = docSnap.data() as PostDraft;
                if (remoteDraft && remoteDraft.topic) {
                  isRemoteSyncRef.current = true;
                  setCurrentDraft(remoteDraft);
                  try {
                    localStorage.setItem('redaesthetic_active_draft', JSON.stringify(remoteDraft));
                  } catch (e) {}
                  setSyncStatus('synced');
                }
              }
            },
            (err) => {
              console.warn('Firestore draft sync listener notice:', err);
              setSyncStatus('offline');
            }
          );
          return () => unsubscribeSnapshot();
        } catch (err) {
          console.warn('Firestore draft sync error:', err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync draft to localStorage and Firestore on change
  useEffect(() => {
    if (isRemoteSyncRef.current) {
      isRemoteSyncRef.current = false;
      return;
    }

    try {
      localStorage.setItem('redaesthetic_active_draft', JSON.stringify(currentDraft));
    } catch (e) {}

    const currentUser = auth.currentUser;
    if (currentUser) {
      setSyncStatus('saving');
      const timer = setTimeout(async () => {
        try {
          const draftDocRef = doc(db, 'users', currentUser.uid, 'drafts', 'active');
          await setDoc(draftDocRef, currentDraft, { merge: true });
          setSyncStatus('synced');
        } catch (err) {
          console.warn('Error saving draft to Firestore:', err);
          setSyncStatus('offline');
        }
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setSyncStatus('synced');
    }
  }, [currentDraft]);

  const handleUpdateDraft = (updated: Partial<PostDraft>) => {
    setCurrentDraft((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  // Replicate from Daily Aesthetic Feed
  const handleReplicateInspiration = (item: AestheticInspiration) => {
    setCurrentDraft((prev) => ({
      ...prev,
      id: `replicate-${Date.now()}`,
      topic: item.title,
      selectedTitle: item.title,
      coverConfig: {
        ...prev.coverConfig,
        mainTitle: item.title.slice(0, 14),
        subTitle: item.coreAngle.slice(0, 24),
        badge: item.badge,
      },
    }));
    // Flow: Jump to Content Mode
    setCurrentMode('content');
  };

  // Flow: Jump from Daily Feed to Scorer Mode
  const handleGoToScorer = (topic: string, angle: string) => {
    setScorerInitialTopic(topic);
    setScorerInitialAngle(angle);
    setCurrentMode('scorer');
  };

  // Flow: Adopt upgraded topic from Scorer to Content Draft
  const handleAdoptFromScorer = (adoptedTopic: string, adoptedAngle: string) => {
    setCurrentDraft((prev) => ({
      ...prev,
      id: `adopted-${Date.now()}`,
      topic: adoptedTopic,
      selectedTitle: adoptedTopic,
      coverConfig: {
        ...prev.coverConfig,
        mainTitle: adoptedTopic.slice(0, 14),
        subTitle: adoptedAngle.slice(0, 24),
        badge: '高赞对标',
      },
    }));
    setCurrentMode('content');
  };

  // Flow: Jump from Content to Review Mode
  const handleGoToReview = () => {
    setCurrentMode('review');
  };

  // Flow: Apply Lab Diagnostic to Content Draft
  const handleApplyDiagnosticToDraft = (topic: string, angle: string, keyPoints: string) => {
    setCurrentDraft((prev) => ({
      ...prev,
      id: `diagnostic-${Date.now()}`,
      topic,
      selectedTitle: topic,
      coverConfig: {
        ...prev.coverConfig,
        mainTitle: topic.slice(0, 14),
        subTitle: angle.slice(0, 24),
        badge: '美商自测逆袭',
      },
    }));
    setCurrentMode('content');
  };

  // Flow: Transfer from Workbench 24h Trend Dashboard directly into Content Mode
  const handleTransferFromTrendDashboard = (topicData: {
    topic: string;
    angle: string;
    audience: string;
    coverMain: string;
    coverSub: string;
    keyPoints: string;
  }) => {
    setCurrentDraft((prev) => ({
      ...prev,
      id: `trend-${Date.now()}`,
      topic: topicData.topic,
      selectedTitle: topicData.topic,
      coverConfig: {
        ...prev.coverConfig,
        mainTitle: topicData.coverMain,
        subTitle: topicData.coverSub,
        badge: '高藏赞对标',
      },
    }));
    setCurrentMode('content');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-[#2F3833]">
      {/* Global Header Navigation */}
      <Navigation
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        onOpenSkillMatrix={() => setIsSkillMatrixOpen(true)}
        syncStatus={syncStatus}
      />

      {/* Main Workspace Body (Ordered sequence) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* 工作台顶部实时数据看板：审美赛道近24小时互动率（收藏/点赞比）最高的三大细分话题 */}
        <WorkbenchTrendDashboard
          onTransferToContentMode={handleTransferFromTrendDashboard}
        />

        {/* 1. 顾问模式 (首位定位与起号SOP) */}
        {currentMode === 'strategy' && <ModeStrategy />}

        {/* 2. 每日审美热点 (小红书 + INS 推荐，一键模仿) */}
        {currentMode === 'feed' && (
          <DailyAestheticFeed
            onReplicate={handleReplicateInspiration}
            onGoToScorer={handleGoToScorer}
            onGoToStrategy={() => setCurrentMode('strategy')}
          />
        )}

        {/* 3. 选题打分 (审题与对标升级) */}
        {currentMode === 'scorer' && (
          <TopicScorer
            initialTopic={scorerInitialTopic}
            initialAngle={scorerInitialAngle}
            onAdoptTopic={handleAdoptFromScorer}
          />
        )}

        {/* 4. 操盘模式 (爆款文案与真机预览) */}
        {currentMode === 'content' && (
          <ModeContent
            currentDraft={currentDraft}
            onUpdateDraft={handleUpdateDraft}
            onGoToReview={handleGoToReview}
            onGoToColorLab={() => setCurrentMode('color-lab')}
          />
        )}

        {/* 色彩美学实验室 (照片莫兰迪色彩提取与色彩心理学深度解读) */}
        {currentMode === 'color-lab' && (
          <ColorAestheticsLab
            currentDraft={currentDraft}
            onUpdateDraft={handleUpdateDraft}
            onGoToContentMode={() => setCurrentMode('content')}
          />
        )}

        {/* 5. 诊断模式 (风控排查与合规自检) */}
        {currentMode === 'review' && (
          <ModeReview
            initialTitle={currentDraft.selectedTitle}
            initialContent={currentDraft.body}
          />
        )}

        {/* 6. 审美成长档案 (每日打卡与进阶雷达图) */}
        {currentMode === 'growth' && (
          <AestheticGrowthArchive onApplyToDraft={handleApplyDiagnosticToDraft} />
        )}

        {/* 辅助工具 */}
        {currentMode === 'risk-tools' && <RiskToolsModal />}
        {currentMode === 'chat' && <CompanionChat />}
      </main>

      {/* 7-Skill Matrix Knowledge Modal */}
      <SkillMatrixModal
        isOpen={isSkillMatrixOpen}
        onClose={() => setIsSkillMatrixOpen(false)}
        onSelectMode={setCurrentMode}
      />

      {/* Footer & Compliance Principles */}
      <footer className="mt-12 border-t border-[#E3ECE6] bg-white/70 py-8 text-xs text-[#73887C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif-sc font-bold text-sm text-[#385142]">
              小红书美商逆袭策略顾问与主笔
            </span>
            <span className="text-[#C27A83]">✦</span>
            <span>引导全手动合规操作 · 拒绝违规自动化与虚假夸大</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6E947C]" /> 广告法自检
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#6E947C]" /> 7大开源Skill集成
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-[#C27A83]" /> 美商打卡搭子
            </span>
            <span>·</span>
            <span>Sage & Blush 治愈美学</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
