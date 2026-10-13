import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Compass,
  PenTool,
  Search,
  Award,
  Palette,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { OPEN_SOURCE_SKILLS } from '../data/presets';
import { ModeType } from '../types';

interface SkillMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: ModeType) => void;
}

export const SkillMatrixModal: React.FC<SkillMatrixModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  const [activeSkillId, setActiveSkillId] = useState<number>(1);
  const activeSkill = OPEN_SOURCE_SKILLS.find((s) => s.id === activeSkillId) || OPEN_SOURCE_SKILLS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#EBF3EF] via-[#FAF5F4] to-[#F5E8E7] border-b border-[#DEEBE2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#527763] shadow-xs">
              <Sparkles className="w-5 h-5 text-[#8EA89D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-sc font-bold text-base text-[#263C2E]">
                  开源社区 7 大小红书 Skill 权威体系与落地指南
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#4A6E59] font-semibold border border-[#D5E5DC]">
                  已全部深度融入
                </span>
              </div>
              <p className="text-xs text-[#6A8274] mt-0.5">
                深耕【美商培养与审美逆袭】赛道，全模块严格遵循开源最佳实践
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Left list of 7 skills */}
          <div className="md:col-span-5 p-4 overflow-y-auto max-h-[580px] flex flex-col gap-2 bg-[#FBFDFB]">
            <span className="text-[11px] font-bold text-[#557764] px-2 uppercase tracking-wider">
              ✦ 7 大核心 Skill 列表
            </span>
            {OPEN_SOURCE_SKILLS.map((skill) => {
              const isSelected = skill.id === activeSkillId;
              return (
                <button
                  key={skill.id}
                  onClick={() => setActiveSkillId(skill.id)}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col gap-1 border ${
                    isSelected
                      ? 'bg-white border-[#8EA89D] shadow-xs'
                      : 'border-transparent hover:bg-white hover:border-[#E2ECE5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-[#284233]' : 'text-gray-700'
                      }`}
                    >
                      {skill.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EBF3EF] text-[#446654] font-medium">
                      {skill.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-1">
                    {skill.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right detailed SOP viewer */}
          <div className="md:col-span-7 p-6 overflow-y-auto max-h-[580px] flex flex-col gap-5 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-[#8EA89D]">
                  SKILL {activeSkill.id} · {activeSkill.tag}
                </span>
                <h4 className="font-serif-sc font-bold text-lg text-[#263C2E] mt-0.5">
                  {activeSkill.name}
                </h4>
              </div>
              <button
                onClick={() => {
                  onSelectMode(activeSkill.modeLink);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#6E947C] hover:bg-[#5C8169] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <span>进入工作台执行</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Core rule */}
            <div className="p-3.5 rounded-2xl bg-[#F4F9F6] border border-[#DEEBE2] flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#3B614B]">
                ⚡ 核心法则 / 落地公式：
              </span>
              <p className="text-xs font-semibold text-[#274634] leading-relaxed">
                {activeSkill.coreRule}
              </p>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-700">📌 功能与设计逻辑：</span>
              <p className="text-xs text-gray-600 leading-relaxed">
                {activeSkill.description}
              </p>
            </div>

            {/* Practical Tips */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-700">
                ✅ 实操落地 SOP 与自检标准：
              </span>
              <div className="flex flex-col gap-2">
                {activeSkill.practicalTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#FAFBF9] border border-[#E8F0EA] text-xs text-gray-700 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#6E947C] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location in App */}
            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>对应工作台模块：{activeSkill.modeLink}</span>
              <span className="text-[#C27A83] font-medium">全手动合规操作指南</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
