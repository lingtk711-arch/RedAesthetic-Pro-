import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  Award,
  PenTool,
  Search,
  TrendingUp,
  ShieldCheck,
  MessageSquareHeart,
  Palette,
  LogIn,
  LogOut,
  User as UserIcon,
  Cloud,
} from 'lucide-react';
import { ModeType } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, User } from '../firebase';
import { PWAInstallButton } from './PWAInstallButton';

interface NavigationProps {
  currentMode: ModeType;
  onSelectMode: (mode: ModeType) => void;
  onOpenSkillMatrix: () => void;
  syncStatus?: 'synced' | 'saving' | 'offline';
}

export const Navigation: React.FC<NavigationProps> = ({
  currentMode,
  onSelectMode,
  onOpenSkillMatrix,
  syncStatus = 'synced',
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.warn('Sign-out error:', err);
    }
  };

  const modes: Array<{ id: ModeType; label: string; icon: React.ReactNode; desc: string; badge?: string }> = [
    {
      id: 'strategy',
      label: '顾问模式',
      icon: <Compass className="w-4 h-4" />,
      desc: '账号定位SOP · 矩阵诊断 · 起号节奏',
      badge: '首位SOP',
    },
    {
      id: 'feed',
      label: '审美热点',
      icon: <Sparkles className="w-4 h-4" />,
      desc: '小红书 & INS 推荐 · 一键模仿',
      badge: '每日10+',
    },
    {
      id: 'scorer',
      label: '选题打分',
      icon: <Award className="w-4 h-4" />,
      desc: '共情度 · 视觉力 · 爆款潜力诊断',
    },
    {
      id: 'content',
      label: '操盘模式',
      icon: <PenTool className="w-4 h-4" />,
      desc: '爆款标题 · KOC正文 · 视觉封面',
      badge: '核心创作',
    },
    {
      id: 'color-lab',
      label: '色彩实验室',
      icon: <Palette className="w-4 h-4" />,
      desc: '照片莫兰迪色彩提取 · 色彩心理学解读',
      badge: 'Sage & Blush',
    },
    {
      id: 'review',
      label: '诊断模式',
      icon: <Search className="w-4 h-4" />,
      desc: '敏感词自检 · 低流量排查 · 合规改写',
      badge: '风控自检',
    },
    {
      id: 'growth',
      label: '成长档案',
      icon: <TrendingUp className="w-4 h-4" />,
      desc: '每日打卡 · 6维审美认知雷达图',
      badge: '进阶记录',
    },
    {
      id: 'risk-tools',
      label: '合规词库',
      icon: <ShieldCheck className="w-4 h-4" />,
      desc: '广告法禁语 · 私域脱敏 · 平替速查',
    },
    {
      id: 'chat',
      label: '美商搭子',
      icon: <MessageSquareHeart className="w-4 h-4" />,
      desc: '同频成长 · 审美打卡 · 专属答疑',
    },
  ];

  return (
    <header className="border-b border-[#E3ECE6] bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8EA89D] via-[#A7C2B4] to-[#E8BCBE] p-[2px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-[#FAFBF9] rounded-[14px] flex items-center justify-center text-[#557564]">
              <Sparkles className="w-5 h-5 text-[#8EA89D]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-sc font-bold text-lg text-[#2A3B31] tracking-tight">
                美商逆袭策略顾问与主笔
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#EBF3EF] text-[#476B57] border border-[#D5E4DC]">
                Google AI Studio 专属版
              </span>
              <span
                className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#FAF6F6] text-[#7A5459] border border-[#F3DFE2]"
                title="手机、平板与电脑自动双向保存"
              >
                <Cloud className={`w-3 h-3 ${syncStatus === 'saving' ? 'animate-pulse text-[#C27A83]' : 'text-[#8EA89D]'}`} />
                <span>
                  {syncStatus === 'saving'
                    ? '正在同步...'
                    : syncStatus === 'offline'
                    ? '本地离线保护中'
                    : '多端实时云同步就绪'}
                </span>
              </span>
            </div>
            <p className="text-xs text-[#708479] flex items-center gap-1.5 mt-0.5">
              <span>平易近人的美商打卡搭子</span>
              <span className="inline-block w-1 h-1 rounded-full bg-[#B2CCC0]"></span>
              <span className="text-[#C27A83] font-medium">Sage & Blush 治愈美学</span>
              <span className="inline-block w-1 h-1 rounded-full bg-[#B2CCC0]"></span>
              <span>7大开源小红书Skill集成</span>
            </p>
          </div>
        </div>

        {/* Navigation tabs & Skill Matrix button */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <nav className="flex items-center gap-1.5 p-1 bg-[#F2F6F3] rounded-2xl border border-[#DFEAE2]">
            {modes.map((item) => {
              const isActive = currentMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectMode(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer relative ${
                    isActive
                      ? 'bg-white text-[#294234] shadow-sm font-semibold'
                      : 'text-[#647C6F] hover:text-[#2A3B31] hover:bg-white/50'
                  }`}
                >
                  <span className={isActive ? 'text-[#6E947C]' : 'text-[#8EA89D]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-[#F9EAEB] text-[#B05B66]'
                          : 'bg-[#E7EFEA] text-[#557564]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Dedicated 7-Skill Matrix trigger */}
          <button
            onClick={onOpenSkillMatrix}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-[#FAF0EF] to-[#EDF5F0] hover:from-[#F5E5E3] hover:to-[#E1EDE5] text-[#476654] border border-[#D5E5DB] shadow-xs cursor-pointer transition-all whitespace-nowrap"
            title="查看开源社区 7 大小红书 Skill 权威体系与落地 SOP"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C27A83]" />
            <span>7大Skill图谱</span>
          </button>

          {/* PWA In-App Install Button */}
          <PWAInstallButton />

          {/* Firebase Google Auth Button / User Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1 border-l border-[#DFEAE2]">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-[#EBF3EF] border border-[#D0E2D7] text-xs text-[#2A4333]"
                title={currentUser.email || currentUser.displayName || ''}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-[#5D846E]" />
                )}
                <span className="max-w-[80px] truncate text-[11px] font-semibold">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || '美商主理人'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                title="退出登录"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold bg-white hover:bg-[#F6FAF7] text-[#3B5B49] border border-[#D2E2D8] shadow-2xs cursor-pointer transition-all whitespace-nowrap"
              title="登录以同步云端审美打卡数据"
            >
              <LogIn className="w-3.5 h-3.5 text-[#6E947C]" />
              <span>Google 登录</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
