import React, { useState } from 'react';
import {
  Sparkles,
  Palette,
  Eye,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Heart,
  Smile,
  Sliders,
} from 'lucide-react';

interface AestheticDiagnosticLabProps {
  onApplyToDraft?: (topic: string, angle: string, keyPoints: string) => void;
}

export const AestheticDiagnosticLab: React.FC<AestheticDiagnosticLabProps> = ({
  onApplyToDraft,
}) => {
  const [activeTab, setActiveTab] = useState<'color' | 'face'>('color');

  // 1. Personal Color Analysis State
  const [veinTone, setVeinTone] = useState<'cool' | 'warm' | 'neutral'>('cool');
  const [jewelryPref, setJewelryPref] = useState<'silver' | 'gold' | 'both'>('silver');
  const [contrastLevel, setContrastLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [saturationPref, setSaturationPref] = useState<'muted' | 'vibrant'>('muted');

  // 2. Face Shape State
  const [faceRatio, setFaceRatio] = useState<'short' | 'balanced' | 'long'>('short');
  const [jawlineAngle, setJawlineAngle] = useState<'blunt' | 'sharp' | 'soft'>('blunt');
  const [cheekboneProminence, setCheekboneProminence] = useState<'smooth' | 'high'>('smooth');
  const [skullHeight, setSkullHeight] = useState<'low' | 'moderate' | 'high'>('low');

  const [copied, setCopied] = useState(false);

  // Derive Color Diagnosis Result
  const getColorResult = () => {
    if (veinTone === 'cool' || jewelryPref === 'silver') {
      if (saturationPref === 'muted') {
        return {
          season: '柔夏型 (Soft Summer) · 灰冷调氛围美人',
          tag: '清冷莫兰迪本命',
          desc: '天生自带一层温柔清透的薄雾感，最忌讳荧光亮色和厚重深黑。',
          bestColors: ['#8EA89D (鼠尾草绿)', '#D89A9E (干枯玫瑰粉)', '#A7BDD0 (雾霾蓝)', '#D5CDD4 (浅丁香紫)'],
          avoidColors: ['荧光橙', '亮土黄', '纯高光亮金'],
          makeupAdvice: '低饱和豆沙粉腮红、灰粉色唇泥，弱化眼影修容，突出睫毛与清透底妆。',
          wardrobeFormula: '70% 浅灰白/燕麦色 + 30% 莫兰迪鼠尾草绿或灰粉呼应。',
        };
      } else {
        return {
          season: '净冬型 (Clear Winter) · 高冷清艳美人',
          tag: '黑白极简本命',
          desc: '五官黑白分明，对比强烈，能轻松压住大面积纯白、墨黑与宝石冷色。',
          bestColors: ['#2F3E46 (深松针灰)', '#C73859 (浆果红)', '#000000 (纯墨黑)', '#FFFFFF (冷白)'],
          avoidColors: ['暖驼色', '浊土黄', '泛黄橘粉'],
          makeupAdvice: '红唇点睛，利落内眼线，底妆保持无瑕哑光。',
          wardrobeFormula: '黑白利落撞色，银质极简几何耳饰。',
        };
      }
    } else {
      if (saturationPref === 'muted') {
        return {
          season: '柔秋型 (Soft Autumn) · 温暖油画感美人',
          tag: '大地与陶土质感',
          desc: '温润内敛，如秋日落叶与羊绒毛衣，适合带有灰暖调的低饱和色彩。',
          bestColors: ['#A68A77 (燕麦暖驼)', '#B07D62 (焦糖陶土)', '#8A9A86 (茶橄榄绿)', '#E6D7C3 (奶油杏白)'],
          avoidColors: ['荧光粉', '冷灰紫', '死白'],
          makeupAdvice: '杏仁奶茶色眼影、肉桂乌龙色唇膏，腮红打在面中营造微醺感。',
          wardrobeFormula: '大地色系深浅叠穿，配粗陶质感或亚麻棉麻面料。',
        };
      } else {
        return {
          season: '浅春型 (Light Spring) · 明媚元气美人',
          tag: '初春暖光氧气感',
          desc: '皮肤底色泛暖，瞳孔清亮有神，穿轻盈的暖调明亮色整个人立刻发光。',
          bestColors: ['#EAA495 (奶油蜜桃)', '#A2CEB7 (薄荷浅绿)', '#F5E6CA (鹅蛋黄)', '#E89885 (珊瑚粉)'],
          avoidColors: ['深沉老气灰黑', '冷调暗紫'],
          makeupAdvice: '透光感果冻唇釉、珊瑚粉橘腮红、卧蚕提亮。',
          wardrobeFormula: '浅色系混搭，棉质衬衫搭配浅米色高腰裤。',
        };
      }
    }
  };

  // Derive Face Shape Result
  const getFaceResult = () => {
    if (jawlineAngle === 'blunt' || faceRatio === 'short') {
      return {
        shape: '方圆脸 (Round-Square) · 耐看抗老骨相',
        tag: '普通女孩最高级的大气骨相',
        features: '下颌角折角略低、下巴圆润稍短、面部五官量感适中。',
        misconception: '❌ 盲目用厚刘海和两颊厚头发遮脸（反而显得脸盘更重更钝）。',
        solution: '✨ 发根倒梳拉高纵向颅顶，耳际碎发外翻露出双耳与下颌线，以“横向舒展”代替“拼命遮掩”。',
        makeupKey: '强调面中腮红膨胀感，弱化下颌修容（避免侧脸显脏），眼妆重睫毛轻眼影。',
        accessories: '微长款垂坠耳线或莫兰迪小圈耳环，纵向拉长颈部线条。',
      };
    } else if (jawlineAngle === 'sharp' && faceRatio === 'balanced') {
      return {
        shape: '心形/鹅蛋脸 (Oval-Heart) · 轻盈上镜骨相',
        tag: '灵动上镜比例',
        features: '下巴收尖，面部线条流畅，额部与苹果肌饱满。',
        misconception: '❌ 顶部发型堆砌过厚，导致头重脚轻。',
        solution: '✨ 侧分大波浪或轻盈法式八字刘海，平衡额部与下巴比例。',
        makeupKey: '柔和眉形，突出饱满苹果肌与水润唇妆。',
        accessories: '珍珠耳钉、圆弧形耳圈，中和尖锐感。',
      };
    } else {
      return {
        shape: '菱形/骨相脸 (Diamond-Structured) · 清冷超模感',
        tag: '清冷高级骨相美',
        features: '颧骨微突，太阳穴与下颌线略有收窄，轮廓分明。',
        misconception: '❌ 贴头皮紧绷大光明发型（暴露太阳穴凹陷）。',
        solution: '✨ 龙须碎发遮挡太阳穴，蓬松卷发在颧骨上方形成弧度，视觉柔化棱角。',
        makeupKey: '高光提亮面中与太阳穴，骨相高光代替大面积暗色修容。',
        accessories: '大体量圆环或水滴形耳饰，填补下颌收窄空缺。',
      };
    }
  };

  const colorResult = getColorResult();
  const faceResult = getFaceResult();

  const handleApplyToDraft = () => {
    if (!onApplyToDraft) return;
    if (activeTab === 'color') {
      onApplyToDraft(
        `${colorResult.season}｜普通女孩如何找对本命色盘？`,
        `拒绝盲目跟风，测出你的四季个人色彩与Sage&Blush配色法则`,
        `1. ${colorResult.desc} 2. 本命色推荐：${colorResult.bestColors.join('、')} 3. 避坑雷区：${colorResult.avoidColors.join('、')} 4. 妆造法则：${colorResult.makeupAdvice}`
      );
    } else {
      onApplyToDraft(
        `${faceResult.shape}女孩美商觉醒｜别再死板遮脸了！`,
        `听闺蜜一句劝，方圆脸不是缺陷，找对发根蓬松度与骨相留白整个人高级耐看`,
        `1. 骨相特征：${faceResult.features} 2. 避开误区：${faceResult.misconception} 3. 破局思路：${faceResult.solution} 4. 妆容秘诀：${faceResult.makeupKey}`
      );
    }
  };

  const handleCopySummary = () => {
    const text = activeTab === 'color'
      ? `【美商色彩季型自测结果】\n类型：${colorResult.season}\n核心评价：${colorResult.desc}\n本命配色：${colorResult.bestColors.join(' ')}\n妆容建议：${colorResult.makeupAdvice}\n穿搭公式：${colorResult.wardrobeFormula}`
      : `【面部骨相自测结果】\n脸型：${faceResult.shape}\n骨相特点：${faceResult.features}\n发型思路：${faceResult.solution}\n妆容重心：${faceResult.makeupKey}\n耳饰选择：${faceResult.accessories}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-[#DFEBE3] shadow-morandi flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-[#EDF4F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif-sc font-bold text-base text-[#273B2F] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C27A83]" />
              美商诊断实验室 (12季型色彩 × 骨相脸型)
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#3D614E] font-semibold border border-[#D5E5DC]">
              开源算法模型轻量落地
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            融合开源社区《PersonalColorAnalyst》与《Face-Shape-Detector》参数体系，测试出你的专属本命风格
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-[#F2F6F3] rounded-2xl border border-[#DEEBE2] text-xs">
          <button
            onClick={() => setActiveTab('color')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'color'
                ? 'bg-white text-[#294234] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#C27A83]" />
            12季型个人色彩测算
          </button>
          <button
            onClick={() => setActiveTab('face')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'face'
                ? 'bg-white text-[#294234] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#6E947C]" />
            骨相脸型与三庭自查
          </button>
        </div>
      </div>

      {/* Main interactive area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-[#FAFBF9] border border-[#E5EFE8] flex flex-col gap-4">
          <span className="text-xs font-bold text-[#3B5E4C] flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#8EA89D]" />
            {activeTab === 'color' ? '选择你的生理特征参数：' : '选择你的面部骨骼比例：'}
          </span>

          {activeTab === 'color' ? (
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-gray-600 font-medium">1. 手腕血管颜色倾向：</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'cool', label: '蓝紫居多 (冷皮)' },
                    { id: 'warm', label: '绿色居多 (暖皮)' },
                    { id: 'neutral', label: '蓝绿兼有 (中性)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setVeinTone(item.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-center border cursor-pointer ${
                        veinTone === item.id
                          ? 'bg-[#EBF3EF] border-[#8EA89D] text-[#294634] font-semibold'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-600 font-medium">2. 首饰佩戴衬肤感：</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'silver', label: '带银饰更显白' },
                    { id: 'gold', label: '带金饰更显气色' },
                    { id: 'both', label: '金银差别不大' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setJewelryPref(item.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-center border cursor-pointer ${
                        jewelryPref === item.id
                          ? 'bg-[#EBF3EF] border-[#8EA89D] text-[#294634] font-semibold'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-600 font-medium">3. 色彩饱和度偏好：</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'muted', label: '适合灰蒙蒙低饱和 (柔调)' },
                    { id: 'vibrant', label: '适合鲜亮分明色 (净调)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSaturationPref(item.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-center border cursor-pointer ${
                        saturationPref === item.id
                          ? 'bg-[#EBF3EF] border-[#8EA89D] text-[#294634] font-semibold'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-gray-600 font-medium">1. 脸长与脸宽视觉比例：</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'short', label: '短圆 (宽≈长)' },
                    { id: 'balanced', label: '适中 (鹅蛋比)' },
                    { id: 'long', label: '长窄 (长>宽)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setFaceRatio(item.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-center border cursor-pointer ${
                        faceRatio === item.id
                          ? 'bg-[#EBF3EF] border-[#8EA89D] text-[#294634] font-semibold'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-600 font-medium">2. 下颌拐角线条特征：</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'blunt', label: '拐角低/骨感方钝' },
                    { id: 'soft', label: '圆润顺滑肉感' },
                    { id: 'sharp', label: '尖窄利落' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setJawlineAngle(item.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-center border cursor-pointer ${
                        jawlineAngle === item.id
                          ? 'bg-[#EBF3EF] border-[#8EA89D] text-[#294634] font-semibold'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-600 font-medium">3. 颅顶高度感：</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'low', label: '贴头皮/低颅顶' },
                    { id: 'moderate', label: '正常中等' },
                    { id: 'high', label: '头包脸/高颅顶' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSkullHeight(item.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-center border cursor-pointer ${
                        skullHeight === item.id
                          ? 'bg-[#EBF3EF] border-[#8EA89D] text-[#294634] font-semibold'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Output Diagnosis Result */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-gradient-to-br from-[#FBFDFB] to-[#F7FAF8] border border-[#DEECE2] flex flex-col justify-between gap-4">
          {activeTab === 'color' ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#476C56]">
                    {colorResult.tag}
                  </span>
                  <h4 className="font-serif-sc font-bold text-base text-[#24372B] mt-1">
                    {colorResult.season}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopySummary}
                    className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#4A775C]" /> : <Copy className="w-3 h-3" />}
                    复制自测报告
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-gray-100">
                {colorResult.desc}
              </p>

              {/* Best colors */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-[#355242]">🎨 本命莫兰迪色系推荐：</span>
                <div className="flex flex-wrap gap-2">
                  {colorResult.bestColors.map((c, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-xl bg-white border border-[#D5E5DB] text-[#2F4F3D] font-medium shadow-2xs">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-[#FFF6F7] border border-[#FADBDD]">
                  <span className="font-bold text-[#A84552]">⚠️ 慎选雷区色：</span>
                  <p className="text-gray-600 mt-0.5">{colorResult.avoidColors.join('、')}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F0F7F3] border border-[#D5E8DC]">
                  <span className="font-bold text-[#3D694F]">💄 妆造搭配秘诀：</span>
                  <p className="text-gray-600 mt-0.5">{colorResult.makeupAdvice}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#476C56]">
                    {faceResult.tag}
                  </span>
                  <h4 className="font-serif-sc font-bold text-base text-[#24372B] mt-1">
                    {faceResult.shape}
                  </h4>
                </div>
                <button
                  onClick={handleCopySummary}
                  className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-[#4A775C]" /> : <Copy className="w-3 h-3" />}
                  复制报告
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-gray-100 text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">骨相特征：</span>
                <span>{faceResult.features}</span>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FFF6F7] border border-[#FADBDD] text-gray-700">
                  <span className="font-bold text-[#A84552]">常犯误区：</span>
                  <span>{faceResult.misconception}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F0F7F3] border border-[#D5E8DC] text-gray-700">
                  <span className="font-bold text-[#3D694F]">破局发力点：</span>
                  <span>{faceResult.solution}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 flex justify-between pt-1">
                <span>配饰选择：{faceResult.accessories}</span>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
            <button
              onClick={handleApplyToDraft}
              className="px-4 py-2 rounded-xl bg-[#6E947C] hover:bg-[#5C8169] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>一键将自测方案载入【操盘模式】生成笔记</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
