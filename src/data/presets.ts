import { SensitiveWordMatch, OpenSourceSkill } from '../types';

// 开源社区 7 大小红书 Skill 权威体系与 SOP 标准
export const OPEN_SOURCE_SKILLS: OpenSourceSkill[] = [
  {
    id: 1,
    name: 'Skill 1: 账号定位 SOP',
    tag: '定位与起号',
    description: '采用“人群 × 场景 × 核心价值”公式，精准锚定垂直美商人设，规避同质化起号。',
    coreRule: '公式：目标精准人群 × 典型高频变美场景 × 差异化不可替代价值',
    modeLink: 'strategy',
    practicalTips: [
      '人设三件套：治愈系头像 + 陪伴型Slogan + 差异化经历标签（如方圆脸/黄黑皮打卡搭子）',
      '前30天规划：前7天破冰建立信任，第8-20天单点爆款突破，第21-30天粉丝粘性沉淀',
      '对标拆解：拆解同赛道爆款选题的“痛点切入角与反差”，而非抄袭文案表面',
    ],
  },
  {
    id: 2,
    name: 'Skill 2: 爆款标题 5 大公式库',
    tag: 'CTR 抓手',
    description: '前 3 秒抓住眼球，涵盖情绪钩子、痛点反差、悬念好奇、闺蜜避坑与沉浸打卡。',
    coreRule: '前10字必须包含【人群痛点 / 情绪冲突 / 具体数字】',
    modeLink: 'content',
    practicalTips: [
      '痛点反差式：从【痛点标签】到【高阶氛围感】，普通女孩踩坑悟透…',
      '闺蜜避坑式：听真闺蜜一句劝！别再盲目跟风【错误动作】…',
      '沉浸打卡式：美商逆袭Day X｜今天做对了这几件事…',
      '保姆级自查式：低成本变美清单｜不花大价钱照着抄…',
      '反焦虑共情式：接纳不完美才是高级美的开始…',
    ],
  },
  {
    id: 3,
    name: 'Skill 3: KOC 语感排版规范',
    tag: '完播与留存',
    description: '严格 400-800 字呼吸感排版，Emoji 分段隔离，拒绝居高临下，真诚闺蜜口吻。',
    coreRule: '字数严格控在 400-800 字；每段不超过 3 行；Emoji 作为视觉呼吸点',
    modeLink: 'content',
    practicalTips: [
      '前2行黄金留存区：直接给结论或共情痛点，严禁长篇废话开场白',
      '去 AI 味：多用“我们”、“亲测”、“听劝”、“悄悄说”，少用“综上所述”、“总而言之”',
      '视觉留白：善用空行和 Emoji 符号给读者呼吸空间',
    ],
  },
  {
    id: 4,
    name: 'Skill 4: 风控与合规规避库',
    tag: '权重防护',
    description: '广告法极限词拦截、功效虚假承诺排查与私域导流暗号平替，确保账号不降权。',
    coreRule: '绝不用绝对化词汇（最/第一）；绝不承诺超短时见效；公域严禁发联系方式',
    modeLink: 'review',
    practicalTips: [
      '极限词平替：“最强”→“心头好/宝藏”；“第一”→“优先级很高”',
      '功效虚假平替：“三天变白”→“28天打卡透亮感”；“速效换头”→“骨相修饰思路”',
      '私域导流安全话术：“加我V”→“蹲评论区打卡搭子/主页灵感库”',
    ],
  },
  {
    id: 5,
    name: 'Skill 5: 爆款选题打分与对标拆解',
    tag: '内容策略',
    description: '4 维全景评估：痛点共鸣度、差异新颖度、视觉呈现力、完播互动率（满分 100 分）。',
    coreRule: '总分 85+ 具备爆款潜力；对标同赛道高赞笔记进行“反向切入”超越',
    modeLink: 'scorer',
    practicalTips: [
      '共鸣度：是否切中目标人群当前的真实变美困境',
      '新颖度：是否提供区别于烂大街网红教程的清新视角',
      '视觉力：封面是否适合出 Sage & Blush 治愈高级网感图',
      '互动率：文末是否留有极低参与门槛的打卡问题',
    ],
  },
  {
    id: 6,
    name: 'Skill 6: 视觉封面美学与花字排版',
    tag: '封面跳出率',
    description: '主打【淡粉 + 淡绿】治愈系莫兰迪 Sage & Blush 配色，3:4 比例，中心偏上大字花字。',
    coreRule: '画幅固定 3:4 比例；主标字号大而克制；莫兰迪色系自然漫射光，拒绝高饱和',
    modeLink: 'content',
    practicalTips: [
      '构图：黄金分割，中心偏上三分之一处放置主花字',
      '配色法则：鼠尾草绿底色 + 柔杏腮红粉徽标，温润耐看',
      '拍摄要点：自然漫射柔光，配棉麻、陶罐、手账本等生活美学道具',
    ],
  },
  {
    id: 7,
    name: 'Skill 7: 评论区互动转化与粉丝沉淀 SOP',
    tag: '互动率权重',
    description: '结尾强共鸣低门槛 CTA 问句、作者置顶沙发预埋评论话术、合规粉丝打卡沉淀 SOP。',
    coreRule: '每篇文末必带 1 个低门槛选择题/打卡问句；发布后立即预埋置顶沙发诱饵',
    modeLink: 'content',
    practicalTips: [
      '低门槛诱饵：“选A还是选B？”、“你在几号位？”、“报身高脸型搭子帮你分析”',
      '作者置顶沙发：自留彩蛋或打卡清单，吸引第一波路人评论互动',
      '合规私域转化：主页合规放置“变美打卡群/灵感手账”，严禁私信发联系方式违规截流',
    ],
  },
];

// 风控规避库与广告法自检字典 (小红书合规专版)
export const SENSITIVE_WORDS_DB: SensitiveWordMatch[] = [
  { word: '最强', category: '极限违禁词', replacement: '心头好 / 宝藏 / 很契合我的', reason: '广告法绝对化极限用词，平台算法易拦截' },
  { word: '第一', category: '极限违禁词', replacement: '前列 / 优先级很高 / 很受认可', reason: '绝对化排他用词' },
  { word: '顶级', category: '极限违禁词', replacement: '高质感 / 惊喜之选', reason: '绝对化极限用词' },
  { word: '完美', category: '极限违禁词', replacement: '刚刚好 / 令人舒服的 / 契合度极高', reason: '广告法禁用绝对化词' },
  { word: '彻底治愈', category: '医疗美容禁语', replacement: '温和改善 / 周期性稳定', reason: '普通护肤/日常美商不得宣称医疗治愈效果' },
  { word: '三天变白', category: '虚假功效宣传', replacement: '坚持28天打卡透亮感 / 告别暗沉感', reason: '承诺超短时见效属于虚假夸大功效' },
  { word: '速效瘦身', category: '虚假功效宣传', replacement: '体态轻盈打卡 / 视觉显瘦思路', reason: '制造身材焦虑及夸大效果' },
  { word: '换头术', category: '医疗美容禁语', replacement: '皮相修饰思路 / 氛围感逆袭小妙招', reason: '平台专项整治整容医美诱导用语' },
  { word: '微信', category: '私域导流', replacement: '蹲评论区打卡搭子 / 点击主页灵感库', reason: '小红书严厉打击公域转私域联系方式' },
  { word: '私我', category: '私域导流', replacement: '评论区扣1拉群互勉 / 留下你的问题我们一起聊', reason: '疑似私下导流关键词' },
  { word: '加v', category: '私域导流', replacement: '一起打卡陪伴', reason: '私域导流高危词' },
  { word: '保证见效', category: '虚假功效宣传', replacement: '个人实测体验 / 因人而异建议先试小样', reason: '功效保证违背平台审核规范' },
  { word: '暴瘦', category: '过度制造焦虑', replacement: '线条紧致 / 健康轻盈', reason: '病态身材焦虑被平台重点巡查' },
  { word: '整容级', category: '医疗美容禁语', replacement: '骨相修饰感 / 视觉结构调整', reason: '涉医美违规诱导' },
  { word: '永久', category: '极限违禁词', replacement: '长久保持好习惯 / 养出好状态', reason: '绝对化时效承诺' },
  { word: '独家秘籍', category: '极限违禁词', replacement: '我的私藏心得 / 踩坑后总结的经验', reason: '夸张宣传语' },
];

export const TITLE_FORMULAS = [
  {
    name: '痛点反差式',
    tag: '情绪与共鸣',
    formula: '从【人人笑的痛点标签】到【高审美/氛围感惊艳】，普通女孩踩了多少坑才悟透…',
    example: '从“又土又显老”到“清冷高级感”，方圆脸女孩踩坑3年悟出这4点！',
    suitability: '适合阶段蜕变对比、素人真实翻盘故事',
  },
  {
    name: '闺蜜避坑式',
    tag: '真诚陪伴',
    formula: '听真闺蜜一句劝！【某类人群】别再盲目【错误动作】了，真正的美商都在这…',
    example: '听闺蜜一句劝！淡颜黄黑皮别再盲目刷酸了，养出透光皮先戒掉这3个毛病！',
    suitability: '适合护肤、化妆、穿搭避雷干货',
  },
  {
    name: '沉浸打卡式',
    tag: '同频成长',
    formula: '打工人美商逆袭Day【X】｜今天做对了这几件事，整个人舒展又有质感✨',
    example: '普通女孩美商逆袭Day 7｜早八10分钟搞定松弛感伪素颜，被同事追问方法！',
    suitability: '适合打卡陪伴官日常更帖，极易拉近距离',
  },
  {
    name: '保姆级清单式',
    tag: '高收藏率',
    formula: '【目标人群】低成本变美清单｜不花大价钱，照着抄就能悄悄拔高审美…',
    example: '学生党/早八人低成本美商自查清单｜不花大钱，每天坚持这4个小动作',
    suitability: '适合知识点整理、SOP清单、高收藏爆款',
  },
  {
    name: '反焦虑共情式',
    tag: '治愈清醒',
    formula: '接纳不完美才是高级美的开始！【外貌特质】如何找对自己的本命风格？',
    example: '别再嫌弃自己的肉圆脸了！找对这组莫兰迪配比，直接晋升耐看型美人！',
    suitability: '适合美学认知升级、心理赋能、价值观圈粉',
  },
];

export interface PresetTopic {
  id: string;
  category: string;
  title: string;
  angle: string;
  audience: string;
  keyPoints: string;
  coverMain: string;
  coverSub: string;
  badge: string;
}

export const PRESET_TOPICS: PresetTopic[] = [
  {
    id: 'round-face-aesthetic',
    category: '骨相与发型',
    title: '方圆脸淡颜女孩的氛围感逆袭思路',
    angle: '不盲从网红浓颜，借由蓬松发丝与舒展眉眼打造清冷耐看美学',
    audience: '方圆脸、五官量感小、不知道如何凸显风格的年轻女生',
    keyPoints: '发根倒梳蓬松拉高颅顶、轻修容重腮红淡化骨骼感、莫兰迪鼠尾草绿耳饰提亮、眼神聚焦练习',
    coverMain: '方圆脸淡颜｜审美觉醒',
    coverSub: '别硬搬浓颜，找对松弛耐看美学',
    badge: '美商逆袭指南',
  },
  {
    id: 'skin-glow-habit',
    category: '皮相与素颜',
    title: '黄黑皮素颜不再暗沉！普通女孩的28天养皮作息',
    angle: '拒绝猛药烂脸，从作息、温和清洁与内调水分建立透亮原生皮',
    audience: '长期熬夜、早八气色暗黄、护肤容易跟风踩雷的女生',
    keyPoints: '早C晚A替代为温和植萃抗氧、早晨一杯温润柠檬水、低GI饮食减少糖化暗沉、规律物理防晒',
    coverMain: '黄皮女孩｜告别蜡黄透光皮',
    coverSub: '不用猛药，28天养出温润原生光泽',
    badge: '打卡搭子日常',
  },
  {
    id: 'petite-capsule-style',
    category: '穿搭与比例',
    title: '158小个子梨形女生的莫兰迪极简胶囊衣橱',
    angle: '不刻意穿恨天高，通过淡绿与淡粉的视线上移与垂坠剪裁穿出168气场',
    audience: '小个子、假胯宽、不知道怎么穿出高级清冷感的女生',
    keyPoints: '上浅下深视线上移、高腰垂坠西装裤修饰腿型、淡粉+鼠尾草绿色彩呼应、露出纤细手腕与锁骨',
    coverMain: '158梨形身材｜穿出舒展比例',
    coverSub: 'Sage & Blush 治愈配色，视觉提拔10cm',
    badge: '美学衣橱SOP',
  },
  {
    id: 'morning-routine-vibe',
    category: '早八与打工人',
    title: '打工人10分钟速成“看起来过得很好”的松弛美商',
    angle: '告别疲惫班味，用极简晨间流程焕发精神与从容气场',
    audience: '职场早八人、通勤时间紧、希望提升职场第一印象的女生',
    keyPoints: '定妆喷雾混合素颜霜快速均匀肤色、有色润唇膏提气色、顺滑发尾涂抹香氛精油、深呼吸拉伸肩膀开肩',
    coverMain: '早八10分钟｜褪去疲惫班味',
    coverSub: '低成本自律，随时保持舒展从容',
    badge: '早八变美打卡',
  },
];

export const DIVERSE_AESTHETIC_PALETTES = [
  {
    id: 'sage-blush',
    name: 'Sage & Blush 治愈莫兰迪',
    tag: '治愈温润',
    bg: 'bg-gradient-to-br from-[#EBF2EE] via-[#FDF8F7] to-[#F5E4E3]',
    accentBg: '#95B1A2',
    accentText: '#476355',
    subText: '#9A6B73',
    cardBorder: 'border-[#CBDAD0]',
    previewHexes: ['#95B1A2', '#F5E4E3', '#476355', '#EBF2EE'],
  },
  {
    id: 'old-money-earth',
    name: 'Old Money 老钱大地色',
    tag: '高级静奢',
    bg: 'bg-gradient-to-br from-[#F5EFE6] via-[#FAF6F0] to-[#EBDDCF]',
    accentBg: '#A68067',
    accentText: '#593F30',
    subText: '#876956',
    cardBorder: 'border-[#DEC8B6]',
    previewHexes: ['#A68067', '#EBDDCF', '#593F30', '#FAF6F0'],
  },
  {
    id: 'espresso-coffee',
    name: 'Espresso & Cream 意式奶咖',
    tag: '松弛智性',
    bg: 'bg-gradient-to-br from-[#F2ECE4] via-[#F8F5F0] to-[#E4D7C8]',
    accentBg: '#6E5444',
    accentText: '#403025',
    subText: '#8A6E5C',
    cardBorder: 'border-[#D4C3B2]',
    previewHexes: ['#6E5444', '#E4D7C8', '#403025', '#F8F5F0'],
  },
  {
    id: 'serene-blue',
    name: 'Serene Blue 雾霾静谧蓝',
    tag: '清冷高级',
    bg: 'bg-gradient-to-br from-[#E6EEF2] via-[#F4F8FA] to-[#DAE5EC]',
    accentBg: '#6B8E9E',
    accentText: '#344E5B',
    subText: '#7B8894',
    cardBorder: 'border-[#C2D4DF]',
    previewHexes: ['#6B8E9E', '#DAE5EC', '#344E5B', '#F4F8FA'],
  },
  {
    id: 'minimal-monochrome',
    name: 'Monochrome 极简黑白灰',
    tag: '极简克制',
    bg: 'bg-gradient-to-br from-[#ECEEEF] via-[#F7F8F9] to-[#DFE1E3]',
    accentBg: '#2C3238',
    accentText: '#181C20',
    subText: '#5A626A',
    cardBorder: 'border-[#CCD0D4]',
    previewHexes: ['#2C3238', '#DFE1E3', '#181C20', '#F7F8F9'],
  },
  {
    id: 'vintage-rose',
    name: 'French Rose 法式干枯玫瑰',
    tag: '浪漫复古',
    bg: 'bg-gradient-to-br from-[#F7EBEB] via-[#FCF5F5] to-[#EED7D9]',
    accentBg: '#A3656C',
    accentText: '#66363B',
    subText: '#8E5A61',
    cardBorder: 'border-[#DEC0C4]',
    previewHexes: ['#A3656C', '#EED7D9', '#66363B', '#FCF5F5'],
  },
  {
    id: 'zen-bamboo',
    name: 'Zen Bamboo 东方素竹茶青',
    tag: '东方清欢',
    bg: 'bg-gradient-to-br from-[#E8EEE8] via-[#F6F8F6] to-[#DCEDDE]',
    accentBg: '#618264',
    accentText: '#324734',
    subText: '#59705B',
    cardBorder: 'border-[#C7DAC9]',
    previewHexes: ['#618264', '#DCEDDE', '#324734', '#F6F8F6'],
  },
  {
    id: 'cream-minimal',
    name: 'Cream & Tea 羊脂奶油白',
    tag: '素雅留白',
    bg: 'bg-gradient-to-br from-[#FBF9F5] via-[#F6F2EA] to-[#EBE7DD]',
    accentBg: '#8A9A86',
    accentText: '#4A4C40',
    subText: '#B08882',
    cardBorder: 'border-[#DFDACD]',
    previewHexes: ['#8A9A86', '#FBF9F5', '#4A4C40', '#B08882'],
  },
];

export const SAGE_BLUSH_PALETTES = DIVERSE_AESTHETIC_PALETTES;

// 4 种小红书治愈系主视觉版式与字体排版设定
export interface CoverLayoutOption {
  id: 'magazine' | 'minimal-zen' | 'bold-contrast' | 'poster-center';
  name: string;
  tag: string;
  description: string;
  fontFamily: string;
  letterSpacing: string;
  alignment: 'center' | 'left' | 'staggered';
  features: string[];
}

export const COVER_LAYOUT_OPTIONS: CoverLayoutOption[] = [
  {
    id: 'magazine',
    name: '经典破框杂志风',
    tag: '高级网感',
    description: '衬线英文大标叠加精巧中文字体，顶部胶囊徽章与细线边框，典雅轻奢。',
    fontFamily: 'font-serif-sc',
    letterSpacing: 'tracking-tight',
    alignment: 'center',
    features: ['英文辅助小标题', '双层精致线框', '居中偏上视觉重心', '细长分割线'],
  },
  {
    id: 'minimal-zen',
    name: '呼吸留白极简风',
    tag: '松弛治愈',
    description: '左对齐横向留白，超低视觉侵扰，大面积露出底图漫射光质感，松弛耐看。',
    fontFamily: 'font-sans',
    letterSpacing: 'tracking-widest',
    alignment: 'left',
    features: ['左侧沉浸排版', '大面积高留白', '轻量级无衬线字', '微小标签角落点缀'],
  },
  {
    id: 'bold-contrast',
    name: '双层对比重字风',
    tag: '高点击率CTR',
    description: '主花字分两行粗细反差（第一行高饱和/强调色，第二行加粗黑体），3秒抓眼球。',
    fontFamily: 'font-sans',
    letterSpacing: 'tracking-normal',
    alignment: 'center',
    features: ['醒目色块字底衬', '强弱字重对比', '信息流停留率高', '适合干货避坑'],
  },
  {
    id: 'poster-center',
    name: '居中沉浸画报风',
    tag: '艺术审美',
    description: '中心黄金分割正方形居中画框，典雅宋体加阴影，宛如实体美学画册封面。',
    fontFamily: 'font-serif-sc',
    letterSpacing: 'tracking-wide',
    alignment: 'center',
    features: ['画框聚拢聚焦', '典雅宋体书卷气', '底图四周暗角虚化', '适合审美觉醒'],
  },
];

// 治愈系莫兰迪底图灵感库精选
export interface CuratedGalleryItem {
  id: string;
  title: string;
  category: '陶器生活' | '绿植晨光' | '松弛手账' | '棉麻质感' | '极简空间' | '晨光光影';
  vibe: string;
  paletteTheme: string;
  recommendedLayout: 'magazine' | 'minimal-zen' | 'bold-contrast' | 'poster-center';
  layoutReason: string;
  prompt: string;
  gradientFallback: string;
  recommendedBadge: string;
  titleTone: string;
  visualKeywords: string[];
  imageUrl: string;
}

export const CURATED_MORANDI_GALLERY: CuratedGalleryItem[] = [
  {
    id: 'gallery-1',
    title: '晨光鼠尾草陶罐与尤加利枝',
    category: '陶器生活',
    vibe: '静谧安宁 · 温润手作感',
    paletteTheme: 'sage-blush',
    recommendedLayout: 'magazine',
    layoutReason: '陶罐位于画幅下方，上方留出 60% 漫射光纯净天光，极度适合经典破框杂志大字排版。',
    prompt: 'Still life photography of handcrafted matte sage green ceramic vase with single dried eucalyptus branch, soft morning golden diffuse sunlight through sheer linen curtain, warm cream background with generous negative space at top, minimalist wabi-sabi aesthetics, healing pastel tones of sage and blush.',
    gradientFallback: 'from-[#EBF3EF] via-[#F8F9F8] to-[#E2EBE5]',
    recommendedBadge: '美商逆袭 · 日常打卡',
    titleTone: '方圆脸淡颜｜审美觉醒',
    visualKeywords: ['陶罐', '晨光', '尤加利', '高留白'],
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gallery-2',
    title: '纯净棉麻浅粉褶皱与手账本',
    category: '松弛手账',
    vibe: '闺蜜日常 · 触手可及的温度',
    paletteTheme: 'vintage-rose',
    recommendedLayout: 'minimal-zen',
    layoutReason: '细腻织物肌理自右向左自然延伸，左侧纯净平滑，完美适配左对齐呼吸留白排版。',
    prompt: 'Top-down flatlay of natural washed linen fabric in soft dusty blush and sage green tones, an open aesthetic journal with brass clip, warm morning lighting, clean negative space, calm relaxing feminine routine, minimal editorial layout.',
    gradientFallback: 'from-[#FDF7F8] via-[#FAF3F4] to-[#F2E5E7]',
    recommendedBadge: '闺蜜手账 · 变美清单',
    titleTone: '普通女孩｜低成本美商清单',
    visualKeywords: ['棉麻', '手账本', '裸粉', '日常记录'],
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gallery-3',
    title: '清透绿植叶影与晨雾漫射光',
    category: '绿植晨光',
    vibe: '原生呼吸 · 自然生机',
    paletteTheme: 'zen-bamboo',
    recommendedLayout: 'bold-contrast',
    layoutReason: '晨曦光影具有天然层次与清透对比，双层重字能在此光影下形成极为清晰的视觉聚焦点。',
    prompt: 'Sunlight and plant leaf shadows cast on a smooth sage green plaster wall, clean airy aesthetic, soft delicate shadow textures, high key lighting, tranquil modern oriental minimalism, ample blank space for text.',
    gradientFallback: 'from-[#EDF4EE] via-[#F5FAF6] to-[#DBE8DE]',
    recommendedBadge: '护肤养皮 · 原生光泽',
    titleTone: '黄黑皮素颜｜告别暗沉透光皮',
    visualKeywords: ['叶影', '漫射光', '晨曦', '原生感'],
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gallery-4',
    title: '水泥粗陶花器与干枯粉白芦苇',
    category: '极简空间',
    vibe: '静奢克制 · 骨相结构美',
    paletteTheme: 'old-money-earth',
    recommendedLayout: 'poster-center',
    layoutReason: '画幅具有天然的对称构图与低饱和高级灰调，中央画框式排版能够将视觉牢牢锁在核心价值上。',
    prompt: 'Minimalist interior aesthetic, textured architectural pedestal with delicate blush dried pampas grass, warm ivory and muted taupe tones, soft architectural studio shadows, quiet luxury calming composition.',
    gradientFallback: 'from-[#F4EFEA] via-[#FBF8F5] to-[#E9DFD5]',
    recommendedBadge: '骨相发型 · 清冷气质',
    titleTone: '普通女孩｜松弛感骨相思路',
    visualKeywords: ['静奢', '粗陶', '芦苇', '空间留白'],
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gallery-5',
    title: '羊脂奶油白书本与一杯温润奶茶',
    category: '棉麻质感',
    vibe: '松弛慢活 · 治愈治燥',
    paletteTheme: 'cream-minimal',
    recommendedLayout: 'magazine',
    layoutReason: '低饱和大地奶茶色调具备极高的亲和度与包容性，大字体杂志标能迅速传达舒缓自律的生活哲学。',
    prompt: 'Cozy aesthetic morning table setting, ceramic coffee cup with oat latte, linen napkin in soft sage green, hardcover art book on warm cream surface, cinematic gentle daylight, relaxing calm morning vibe.',
    gradientFallback: 'from-[#FBF9F5] via-[#F5EFE6] to-[#ECE3D5]',
    recommendedBadge: '早八打卡 · 10分钟速成',
    titleTone: '早八10分钟｜褪去疲惫班味',
    visualKeywords: ['咖啡', '奶茶', '艺术书', '早八自律'],
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'gallery-6',
    title: '晨光穿透百叶窗的莫兰迪几何光斑',
    category: '晨光光影',
    vibe: '理智清醒 · 结构分明',
    paletteTheme: 'minimal-monochrome',
    recommendedLayout: 'bold-contrast',
    layoutReason: '几何百叶窗投影自带现代线条韵律，强反差主标能与其形成强有力的现代美学张力。',
    prompt: 'Morning sunlight through window blinds creating geometric stripes of light and shadow on warm muted plaster wall, minimalist architectural aesthetic, soothing pale sage and blush tones, high resolution quiet peaceful room.',
    gradientFallback: 'from-[#EEF1EF] via-[#F7FAF8] to-[#DFE5E1]',
    recommendedBadge: '美商思维 · 底层逻辑',
    titleTone: '审美升级｜避开盲目跟风',
    visualKeywords: ['百叶窗', '光斑', '现代线条', '理性美学'],
    imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
  },
];

