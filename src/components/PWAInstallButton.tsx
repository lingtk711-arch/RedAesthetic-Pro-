import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share, PlusSquare, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide the install button
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#4A6556] to-[#618571] text-white text-xs font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          title="将应用安装到手机、平板或桌面"
        >
          <Download className="w-3.5 h-3.5" />
          <span>安装到设备</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F5F2] hover:bg-[#E2EDE5] text-[#365141] text-xs font-semibold border border-[#D5E5DA] shadow-xs transition-all cursor-pointer"
          title="添加到 iPhone / iPad 主屏幕"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#5B886E]" />
          <span>添加至主屏幕</span>
        </button>
      )}

      {/* iOS / iPadOS Safari Guided Installation Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#DFEBE3] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F5F2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EDF4F0] flex items-center justify-center text-[#4A6556]">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-serif-sc font-bold text-sm text-[#243B2E]">
                  添加到手机 / 平板主屏幕
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5D7769] leading-relaxed">
              在 Safari 浏览器中将本工作台安装为独立 App，即可享受全屏原生交互、秒开启动与离线缓存保障：
            </p>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAF8] border border-[#E3EFE7]">
                <div className="w-6 h-6 rounded-lg bg-[#E3EFE7] flex items-center justify-center text-[#4A6556] font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs text-gray-700">
                  点击 Safari 底部（或 iPad 顶部工具栏）的 <span className="inline-flex items-center gap-1 font-bold text-[#4A6556]"><Share className="w-3.5 h-3.5" /> 分享</span> 按钮
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAF8] border border-[#E3EFE7]">
                <div className="w-6 h-6 rounded-lg bg-[#E3EFE7] flex items-center justify-center text-[#4A6556] font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs text-gray-700">
                  在弹出的分享菜单中向下滑动，找到并点击 <span className="inline-flex items-center gap-1 font-bold text-[#4A6556]"><PlusSquare className="w-3.5 h-3.5" /> 添加到主屏幕</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAF8] border border-[#E3EFE7]">
                <div className="w-6 h-6 rounded-lg bg-[#E3EFE7] flex items-center justify-center text-[#4A6556] font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs text-gray-700">
                  右上角点击 <span className="font-bold text-[#4A6556]">「添加」</span>，即可在桌面直接启动使用！
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-2 py-2.5 rounded-2xl bg-[#4A6556] text-white text-xs font-semibold hover:bg-[#3B5245] transition cursor-pointer flex items-center justify-center gap-1.5"
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
