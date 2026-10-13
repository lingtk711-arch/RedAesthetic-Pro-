import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  X,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isWeChat, setIsWeChat] = useState<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      setIsWeChat(/micromessenger/i.test(ua));
      setIsMobileDevice(/iphone|ipad|ipod|android|mobile/i.test(ua));
    }
  }, []);

  // If already installed and running standalone, show subtle verified status if needed
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl bg-[#EDF5F0] text-[#365141] font-semibold border border-[#D5E5DA]" title="已安装为桌面应用，离线常驻稳定">
        <ShieldCheck className="w-3.5 h-3.5 text-[#4A725B]" />
        <span>桌面 App 常驻</span>
      </span>
    );
  }

  const handleOpenInstall = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {/* 1. Header/Navbar Compact Install Trigger */}
      <button
        onClick={handleOpenInstall}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#4A6556] to-[#5C826C] hover:from-[#3E5C4A] hover:to-[#4A6F5A] text-white text-xs font-semibold shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        title="下载安装为手机/桌面独立 App"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#F3DDE0]" />
        <span>安装到桌面</span>
      </button>

      {/* 2. Floating Mobile Bottom Smart Bar (Appears on Mobile when not standalone) */}
      {isMobileDevice && !isBannerDismissed && (
        <div className="fixed bottom-4 inset-x-3 sm:inset-x-6 z-40 animate-fade-in pointer-events-auto">
          <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#CBDED3] shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#4A725B] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#F3DDE0]" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-[#2A4434] truncate">
                  安装美商工作台到手机桌面
                </span>
                <span className="text-[10px] text-[#5D7769] truncate">
                  全屏秒开 · 永不休眠 · 离线稳定防掉线
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleOpenInstall}
                className="px-3 py-1.5 rounded-xl bg-[#4A725B] hover:bg-[#3B5B49] text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer whitespace-nowrap"
              >
                添加桌面
              </button>
              <button
                onClick={() => setIsBannerDismissed(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition cursor-pointer"
                title="暂不提醒"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Detailed Multi-Platform Guided Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#DFEBE3] flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F5F2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EDF4F0] flex items-center justify-center text-[#4A725B]">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-serif-sc font-bold text-sm text-[#243B2E]">
                  安装到手机主屏幕
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5D7769] leading-relaxed">
              安装为桌面 App 后，将享有独立图标、全屏沉浸操作与本地离线缓存，告别浏览器地址栏与连接超时：
            </p>

            {/* WeChat Warning if detected */}
            {isWeChat && (
              <div className="p-3 rounded-2xl bg-[#FFF6E5] border border-[#F5E0B8] flex items-start gap-2.5 text-xs text-[#8A5812]">
                <ExternalLink className="w-4 h-4 shrink-0 mt-0.5 text-[#C4801B]" />
                <div>
                  <strong className="block font-bold">当前在微信内置浏览器中：</strong>
                  微信不支持直接添加桌面。请点击右上角 <span className="font-bold">【···】</span> ➔ 选择 <span className="font-bold">【在浏览器中打开】</span>，即可一键添加！
                </div>
              </div>
            )}

            {/* Platform Guides */}
            {isIOS ? (
              /* Apple iOS / Safari Step-by-Step */
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAF8] border border-[#E3EFE7]">
                  <div className="w-6 h-6 rounded-lg bg-[#E3EFE7] flex items-center justify-center text-[#4A725B] font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-gray-700">
                    在 <span className="font-bold text-[#4A725B]">Safari 浏览器</span> 中打开本页面，点击屏幕底部（或 iPad 顶部工具栏）的 <span className="inline-flex items-center gap-1 font-bold text-[#4A725B]"><Share className="w-3.5 h-3.5" /> 分享</span> 按钮
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAF8] border border-[#E3EFE7]">
                  <div className="w-6 h-6 rounded-lg bg-[#E3EFE7] flex items-center justify-center text-[#4A725B] font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-gray-700">
                    在弹出的菜单中向下轻滑，找到并点击 <span className="inline-flex items-center gap-1 font-bold text-[#4A725B]"><PlusSquare className="w-3.5 h-3.5" /> 添加到主屏幕</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAF8] border border-[#E3EFE7]">
                  <div className="w-6 h-6 rounded-lg bg-[#E3EFE7] flex items-center justify-center text-[#4A725B] font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-gray-700">
                    点击右上角 <span className="font-bold text-[#4A725B]">「添加」</span>，即可在手机桌面像原生 App 一样直接启动！
                  </div>
                </div>
              </div>
            ) : (
              /* Android / Chrome Step-by-Step */
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAF8] border border-[#E3EFE7]">
                  <div className="w-6 h-6 rounded-lg bg-[#E3EFE7] flex items-center justify-center text-[#4A725B] font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-gray-700">
                    在手机自带浏览器或 Chrome 中，点击右上角（或底部）的 <span className="font-bold text-[#4A725B]">【⋮ 三点菜单】</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAF8] border border-[#E3EFE7]">
                  <div className="w-6 h-6 rounded-lg bg-[#E3EFE7] flex items-center justify-center text-[#4A725B] font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-gray-700">
                    选择 <span className="font-bold text-[#4A725B]">「安装应用」</span> 或 <span className="font-bold text-[#4A725B]">「添加到主屏幕」</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAF8] border border-[#E3EFE7]">
                  <div className="w-6 h-6 rounded-lg bg-[#E3EFE7] flex items-center justify-center text-[#4A725B] font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-gray-700">
                    确认后即在手机桌面生成美商图标，支持离线全屏运行！
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full mt-2 py-2.5 rounded-2xl bg-[#4A725B] text-white text-xs font-semibold hover:bg-[#3B5245] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>我知道了</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
