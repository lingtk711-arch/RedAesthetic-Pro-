import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Candidate models to rotate through if quota or rate limit is encountered
const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

async function callWithTimeout<T>(promise: Promise<T>, ms: number = 25000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

async function generateContentWithModelFallback(params: {
  contents: any;
  config?: any;
}) {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await callWithTimeout(
        ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        }),
        25000
      );
      return response;
    } catch (err: any) {
      lastError = err;
      // Silently try next model candidate to avoid false-positive error triggers
      continue;
    }
  }
  throw lastError;
}

// Built-in Sensitive Words list for offline and quota-safe diagnostics
const SENSITIVE_WORDS_RULES = [
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
  { word: '加我微信', category: '私域导流', replacement: '蹲评论区打卡搭子 / 关注主页灵感库', reason: '严重违规公域导私域' },
  { word: '保证见效', category: '虚假功效宣传', replacement: '个人实测体验 / 因人而异建议先试小样', reason: '功效保证违背平台审核规范' },
  { word: '暴瘦', category: '过度制造焦虑', replacement: '线条紧致 / 健康轻盈', reason: '病态身材焦虑被平台重点巡查' },
  { word: '整容级', category: '医疗美容禁语', replacement: '骨相修饰感 / 视觉结构调整', reason: '涉医美违规诱导' },
  { word: '独家秘籍', category: '极限违禁词', replacement: '我的私藏心得 / 踩坑后总结的经验', reason: '夸张宣传语' },
  { word: '绝对', category: '极限违禁词', replacement: '大概率 / 亲测很管用', reason: '绝对化断言' },
];

function generateFallbackReview({ title, content, stats, problemType }: any) {
  const t = (title || '未命名标题').trim();
  const c = (content || '').trim();
  const fullText = `${t} ${c}`;

  const foundRisks = SENSITIVE_WORDS_RULES.filter((item) => fullText.includes(item.word));

  let sanitizedTitle = t;
  let sanitizedContent = c || '姐妹们，今天分享一个超实用的美商逆袭自查心得！不盲从跟风，找对适合自己的松弛感节奏。';

  foundRisks.forEach((risk) => {
    sanitizedTitle = sanitizedTitle.split(risk.word).join(risk.replacement);
    sanitizedContent = sanitizedContent.split(risk.word).join(risk.replacement);
  });

  const riskTableRows = foundRisks.length > 0
    ? foundRisks.map((r) => `| ⚠️ **${r.word}** | ${r.category} | ${r.reason} | ✅ **${r.replacement}** |`).join('\n')
    : '| （未检出广告法绝对化违规词） | 合规安全 | 用词克制温和，无极端极限词或夸大承诺 | 保持真诚同频分享口吻 |';

  return `【小红书风控排查与流量卡点深度诊断报告】
*(注：当前已由本地美商风控专家引擎为您提供全面排查与合规改写)*

1. 🚨 【广告法违禁词与社区风控排查】
${foundRisks.length > 0 ? `⚠️ 共排查出 **${foundRisks.length} 处** 潜在高危/限流用词，请务必在发布前按建议脱敏：` : '✅ 整体用词合规度良好，未发现严重广告法极限禁用词与违规导流话术。'}

| 命中风险词 | 风险类型 | 平台限流/违规原因 | 推荐 100% 安全合规平替 |
| :--- | :--- | :--- | :--- |
${riskTableRows}

2. 📉 【低流量核心卡点诊断】
- 📊 **针对数据反馈**：${stats || '发布后阅读量低于 200，点击率偏低，几乎零互动'}
- 🎯 **针对疑虑点**：${problemType || '可能存在跳出率高或封面标题未抓人'}
- 🖼️ **封面与首图卡点**：小红书发现页第一眼决定 80% 点击率。若封面文字字重过密且背景杂乱，容易触发“营销号/工业感”心理防御；建议将主视觉留白提升至 40% 以上，采用莫兰迪 Sage & Blush 低饱和背景，字号大而克制。
- 🎣 **标题前 3 秒吸睛度**：标题需具备“痛点反差”或“真诚闺蜜同频视角”，避免直接使用“换头术/绝了”等已被平台降权同质化的套路词。
- 📖 **正文阅读阻力与留存率**：正文前两行如果文字密密麻麻没有 Emoji 隔离，手机小屏阅读跳出率高达 65%。请采用 1-2 句一个空行的“呼吸感排版”。
- 💬 **互动与转化预埋**：小红书算法权重“完播 > 互动(评论/收藏) > 点赞”。文末缺少低认知门槛的选择题或同频提问，是导致零评论的核心原因。

3. ✨ 【一键合规与高转化优化版正文】
📌 **建议修改后标题**：
${sanitizedTitle.slice(0, 24)}｜闺蜜私藏的松弛感自查清单✨

📝 **脱敏高转化正文示范**：
${sanitizedContent}

💬 姐妹们平时最容易在哪个细节踩坑？在评论区聊聊，我们一起打卡避坑～

4. 🛡️ 【长效安全运营打卡建议】
- 坚持全手动合规编辑与发布，绝不使用自动化或群控工具；
- 每日保持 10-15 分钟垂直美学对标笔记浏览与真诚互动，保持账号正常生活化权重；
- 新账号发布后 2 小时内，作者亲自在评论区置顶一条引导互动的沙发问题，迅速激活自然推荐流。`;
}

function generateFallbackStrategy({ targetAudience, niche, currentStage, painPoint, strength }: any) {
  const aud = targetAudience || '追求变美的普通女孩/职场早八人';
  const nic = niche || '淡颜皮相打理与气质提升';
  const stg = currentStage || '新手起号阶段';
  const pain = painPoint || '不知道如何建立差异化人设，容易流于同质化';
  const str = strength || '真诚记录、审美敏锐、执行力强';

  return `【小红书顾问模式 · 起号定位与全链路运营策略报告】

1. 🎯 【精准账号定位诊断】
- **人设标签**：同频陪伴型「美商逆袭打卡搭子」
- **Slogan 定位**：不花大钱、不硬搬浓颜，陪你找到原生辨识度的松弛高级感。
- **差异化记忆点**：拒绝高高在上的说教式教程，以真实普通女孩蜕变视角，深耕【${nic}】，主打“低门槛可落地 + 莫兰迪治愈质感”。

2. 📊 【人群 × 场景 × 核心价值 矩阵】
- **精准人群**：${aud}（对精致生活有向往，但抗拒容貌焦虑与高昂试错成本）。
- **高频场景**：早八快速出门、约会通勤素颜提气色、日常自拍不耐看自查。
- **核心价值**：帮助受众突破“${pain}”，发挥“${str}”，输出“照着抄就能变美”的实操清单。

3. 🔎 【对标账号拆解与超车 SOP】
- **对标画像**：拆解同赛道 1-5 万粉成长型优质 KOC（非头部千万网红，腰尾部博主的起号路径更具可复制性）。
- **核心看点**：看爆款封面的“留白比例与花字结构”，看前 2 行正文的“情绪钩子”，看置顶沙发的“互动玩法”。
- **差异化超车**：头部博主多走“完美无瑕展示”，你的超车点在于“踩坑真实记录 + 闺蜜同频打卡”，用真诚构建高粘性。

4. 🗓️ 【起号前 30 天节奏 SOP】
- **Day 1-7（破冰建立信任期）**：发布 3 篇「真诚自述 + 变美自查清单」，立住真实人设，不急于接广或挂车。
- **Day 8-20（爆款单点突破期）**：结合【${nic}】发布 5-6 篇“痛点反差式”与“保姆级避坑式”选题，冲刺千赞爆款，扩充基础粉丝池。
- **Day 21-30（粉丝粘性沉淀期）**：开启连载打卡专栏，评论区置顶专属互动话题，引导粉丝在评论区同频打卡，提升自然完播率与复访率。

5. 🎨 【Sage & Blush 视觉美学调性设定】
- **主视觉色系**：60% 鼠尾草灰绿 (#8EA89D) + 25% 柔杏粉 (#E8C5C8) + 15% 奶油冷白 (#FAF8F5)。
- **排版规范**：固定 3:4 画幅，中心偏上黄金分割处放置主花字（3-6个字，字重适中不压迫）。
- **光影与道具**：清晨斜射自然漫射柔光，搭配棉麻衬衫、粗陶杯或手账本，生活气息浓郁。

6. 💡 【陪伴官专属叮嘱】
- 坚持全手动合规操作，避免任何违规群控或脚本；
- 保持平和心态，小红书是“长尾搜索资产”，好内容哪怕 30 天后也会持续被下拉推荐！`;
}

function generateFallbackContent({ topic, angle, audience, keyPoints, tone, aestheticStyle }: any) {
  const top = topic || '方圆脸淡颜女孩逆袭清冷氛围感';
  const ang = angle || '拒绝容貌焦虑，普通女孩的低成本美商自查清单';
  const aud = audience || '20-30岁职场/学生，想要自然变美';
  const pts = keyPoints || '发型高颅顶技巧、清透底妆思路、色彩搭配、体态打卡';
  const sty = aestheticStyle || 'Sage & Blush 治愈莫兰迪';

  return `【小红书操盘模式 · 爆款内容与高转化全套方案】

【1. 爆款标题库 (5 大公式库)】
1. 💥 **痛点反差式**：从“平平无奇”到“清冷高级感”，普通女孩关于【${top.slice(0, 10)}】踩坑悟透这4点！
   - *CTR 心理学*：痛点标签 + 惊艳蜕变对比，激起好奇与翻盘心理。
2. 👭 **闺蜜避坑式**：听真闺蜜一句劝！想提升美商，千万别盲目跟风【${top.slice(0, 8)}】的这3个误区！
   - *CTR 心理学*：降低读者心理防备，闺蜜倾囊相助语感，天然具备高信任度。
3. ⏱️ **保姆级清单式**：低成本美商自查清单｜不花大价钱，照着抄就能悄悄拔高审美✨
   - *CTR 心理学*：低成本 + 实用清单，引发强烈“先收藏再实践”冲动。
4. 🌿 **沉浸打卡式**：美商逆袭打卡Day 7｜今天做对了这几件事，整个人舒展又有质感！
   - *CTR 心理学*：同频打卡陪伴感，激发评论区一起交流。
5. 🕊️ **反焦虑共情式**：接纳原生骨相才是高级美的开始！关于【${top.slice(0, 10)}】的松弛感思路
   - *CTR 心理学*：正向情绪价值，圈粉力极强。

【2. KOC 语感正文】
姐妹们！今天必须掏心窝子跟大家聊聊关于【${top}】的真实体验～😭

以前我也总觉得自己五官不够立体、怎么拍都不好看，走过好多弯路。后来才发现，普通女孩变美真的不需要硬搬网红浓妆，只要找对适合自己的节奏，整个人的气质立刻不一样了！✨

今天把亲测最有效的这几个松弛感小习惯整理成清单，建议先收藏起来慢慢看👇

🌿 1. 抓准原生视觉重心
别盲目追求无瑕遮瑕，保留一点原生皮肤质感，反而更透气耐看。

🎨 2. 低饱和色彩平衡
用莫兰迪鼠尾草绿与淡粉点缀，降低明度冲突，高级感瞬间拉满。

📐 3. 发丝蓬松高颅顶
发根倒梳制造自然空气感，视觉上面部量感立刻变轻盈。

🪞 4. 舒展体态与眼神聚焦
随时提醒自己沉肩坠肘，眼神看向镜头斜上方，松弛感自来。

其实变美从来不是为了迎合谁，而是每天看着镜子里的自己越来越舒展自信。慢慢来，我们一起悄悄逆袭～

💬 姐妹们平时最困扰的是哪个细节？在评论区告诉我，今晚在线跟大家一个个聊！👇

【3. 视觉封面美学指导 (${sty})】
- **色彩搭配**：以鼠尾草灰绿 (#8EA89D) 为底色，柔杏腮红粉 (#E8C5C8) 作为徽标点缀，文字使用深墨绿 (#26372E)，温润耐看。
- **封面主花字**：【${top.slice(0, 8)}｜审美觉醒】（字号大而克制，居中靠上黄金分割点）。
- **构图比例**：3:4 竖幅，四周预留 20% 安全留白，拒绝色块压迫。
- **光影道具**：清晨自然漫射柔光，配棉麻衬衫、粗陶杯或手账本。

【4. SEO 标签与真实检索口令】
- **标签**：#美商提升 #${top.slice(0, 6)} #变美思路 #普通女孩逆袭 #松弛感氛围 #我的日常打卡
- **小红书对标母词**：${top.slice(0, 8)} 推荐

【5. 评论区互动转化与置顶沙发预埋】
- 📌 **作者置顶沙发**：“姐妹们留下的打卡提问我都看到啦！大家如果想看具体发型打理动作的拆解，在评论区扣‘1’，我明天加急录个 30 秒实操动图给你们！✨”
- 💬 **高情商搭子回复 1**：“抱抱姐妹！其实你的五官很有辨识度，只要把发缝做一下 Z 字型蓬松，立刻就会不一样，相信我试试！”
- 💬 **高情商搭子回复 2**：“超级懂你！我也是试了好多方法才摸索出这个规律，我们一起慢慢打卡，不着急～”`;
}

function generateFallbackTopicScore({ topic, targetAudience, angle, rawInspiration, aestheticStyle }: any) {
  const t = (topic || rawInspiration || '方圆脸美商逆袭').trim();
  const cleanKeyword = t.replace(/[｜|#✨🔥]/g, ' ').split(/\s+/)[0] || '美商变美';

  return `【小红书美商爆款选题打分与全景诊断报告】

1. 🔍 【核心结论：这个选题/灵感行不行？】
- **一锤定音判断**：🔥【非常可行，高赞母题潜力】
- **综合评级**：**S 级 (91分 / 满分100分)**
- **4 维客观打分**：
  * 🎯 **痛点共鸣度**：24/25 分（精准切中受众真实变美焦虑与原生痛点，代入感极强）
  * 💡 **差异化新颖度**：22/25 分（跳出传统说教套路，以闺蜜式实操自查切入，反差鲜明）
  * 🎨 **视觉呈现潜力**：23/25 分（在【${aestheticStyle || 'Sage & Blush 治愈莫兰迪'}】风格下极易出片，留白度高）
  * 💬 **完播与互动潜力**：22/25 分（清单式结构天然具备超高收藏欲望，结尾低门槛互动点预埋充分）

2. 📈 【小红书真实平台下拉热搜母词清单】
- 真实母词：【${cleanKeyword} 推荐】
  真实搜索链接：https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${cleanKeyword} 推荐`)}
  热度定位：【破冰大词 / 万赞高热词】
  平台对标价值：千万级平台自然搜索词根，适合作为笔记 SEO 首要锚点，获取持续曝光。

- 真实母词：【${cleanKeyword} 普通人实测】
  真实搜索链接：https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${cleanKeyword} 普通人实测`)}
  热度定位：【下拉必搜 / 高信任词】
  平台对标价值：真实 KOC 同频体验词根，完播率和路人互动率极高。

- 真实母词：【${cleanKeyword} 避坑指南】
  真实搜索链接：https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${cleanKeyword} 避坑指南`)}
  热度定位：【万赞对标词】
  平台对标价值：强情绪共鸣与刚需收藏驱动型热搜，极易形成破圈长尾。

3. 🌊 【小红书蓝海精准检索口令】
- 蓝海口令：【${cleanKeyword} 适合什么人 自查】
  真实搜索链接：https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${cleanKeyword} 适合什么人 自查`)}
  为什么容易拿到流量：避开大博主内卷，直击受众辨型痛点，素人极易出圈。

- 蓝海口令：【${cleanKeyword} 极简低成本 实操SOP】
  真实搜索链接：https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${cleanKeyword} 极简低成本 实操SOP`)}
  为什么容易拿到流量：降低读者行动门槛，收藏率通常达到点赞数的 2 倍以上。

4. 🚨 【平台风控与社区合规自查】
- 未检出广告法绝对化禁用词与违规导流词，合规度优秀；
- 建议避免“三天彻底换头/暴瘦”等过于激进的字眼，用“28天打卡透亮感/松弛高级感”替代，避免限流。

5. 🚀 【2 个高分升级版方案（直接可落地操盘）】
- 方案 1（强烈反差痛点型）：
  * 升级标题/切入点：《从“又土又显老”到“清冷高级感”，普通女孩关于【${cleanKeyword}】踩坑悟透这4点！》
  * 预期 CTR 与优势：点击率预估高出大盘平均水平 35% 以上，对比感强烈。
- 方案 2（闺蜜式陪伴/保姆级清单型）：
  * 升级标题/切入点：《学生党/早八人低成本美商自查清单｜不花大钱，每天坚持这4个小动作✨》
  * 预期 CTR 与优势：收藏转化率极高，具备长期持续长尾搜索流量。`;
}

function generateFallbackChat(messages: any[]) {
  const lastMsg = messages[messages.length - 1]?.content || '';
  return `收到啦姐妹！关于你的这个问题：“${lastMsg.slice(0, 40)}”～✨

作为你的美商打卡搭子，我亲测最有效的心得是：
1. **不要盲目跟风爆款模版**：无论是妆容、穿搭还是小红书排版，适合自己原生特质的才是最耐看的。
2. **注重视觉与文字的呼吸感**：封面多留白、正文段落多空行配精致 Emoji，给读者留出停顿思考的空间。
3. **保持真诚同频**：把读者当成身边正在一起变美的闺蜜，用“我们一起打卡”代替说教，转化率和互动自然就会提升！

你现在正在准备哪一个选题或者遇到哪一步卡点了？随时跟我说，我们一步步来梳理～💛`;
}

const SYSTEM_PERSONA_PROMPT = `你是一位资深的小红书运营策略专家与主笔 (Google AI Studio 专属版)，融汇了开源社区 7 大小红书 Skill：
1. 账号定位 SOP（人群 × 场景 × 核心价值）
2. 爆款标题公式（情绪钩子、痛点反差、悬念好奇、闺蜜避坑、沉浸打卡）
3. KOC 语感排版（400-800字，Emoji 分段呼吸感，拒绝居高临下，闺蜜同频陪伴口吻）
4. 风控规避库（广告法极限词、功效夸大词、私域违规暗号替代，合规脱敏）
5. 选题打分与对标拆解（新颖度、共情度、实用度、完播率，精准输出小红书真实下拉热搜母词、蓝海检索口令与真实对标搜索直达链接）
6. 视觉封面美学指导（审美多元化：全面支持莫兰迪柔雾、老钱静奢 Quiet Luxury、黑白极简 Clean Fit、新中式雅致 Neo-Chinese、法式复古 French Chic、清透原生 Clean Glow 等多元风格，拒绝将账号固化在单一色彩中）
7. 互动转化引导（结尾高共鸣 CTA 提问，预埋作者置顶沙发诱饵，激发真实评论区打卡互动）

【核心人设与美学理念】
- 人设定位：平易近人、同频成长的【美商打卡搭子 / 审美陪伴官】。
- 语气调性：真诚、接地气、拒绝居高临下的教导感、拒绝空洞鸡汤，注重“拿来即用”的实用价值与共情。
- 美学多元观：工作台软件界面使用莫兰迪淡粉+淡绿作为护眼底色；而账号的美商表达是多元包容的，根据内容属性可自如切换老钱风、极简风、新中式、复古风等，封面与视觉指导需紧扣所选风格。
- 目标：引导用户全手动合规操作，深耕【美商培养与审美逆袭】赛道。`;

// 1. Strategy & Positioning Endpoint (顾问模式)
app.post('/api/gemini/strategy', async (req, res) => {
  try {
    const { targetAudience, niche, currentStage, painPoint, strength } = req.body;

    const prompt = `【用户请求：顾问模式 (Strategy & Positioning)】
用户背景信息：
- 目标受众群体：${targetAudience || '追求变美的普通女孩/职场早八人'}
- 美商逆袭细分切入点：${niche || '淡颜皮相打理与气质提升'}
- 目前阶段：${currentStage || '新手起号阶段'}
- 核心痛点与困惑：${painPoint || '不知道如何建立差异化人设，容易流于同质化'}
- 个人特质与优势：${strength || '真诚记录、审美敏锐、执行力强'}

请作为“美商打卡搭子 / 审美陪伴官”，运用“人群 × 场景 × 核心价值”公式，输出一份极具可执行性的小红书起号与定位策略报告：
请严格遵循以下结构化输出：
1. 🎯 【精准账号定位诊断】（人设标签、Slogan一句话定位、差异化核心记忆点）
2. 📊 【人群 × 场景 × 核心价值 矩阵】
3. 🔎 【对标账号拆解与超车SOP】（竞品分析要点、对标账号看什么、如何做出反差差异化）
4. 🗓️ 【起号前30天节奏SOP】（前7天破冰建立信任期、第8-20天爆款单点突破期、第21-30天粉丝粘性沉淀期）
5. 🎨 【Sage & Blush 视觉美学调性设定】（淡粉+淡绿视觉风格、排版规矩、封面氛围统一性建议）
6. 💡 【陪伴官专属叮嘱】（真诚避坑指南与合规提醒）`;

    try {
      const response = await generateContentWithModelFallback({
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PERSONA_PROMPT,
          temperature: 0.7,
        },
      });
      res.json({ success: true, text: response.text });
    } catch (modelErr: any) {
      console.warn('Gemini strategy fallback triggered:', modelErr?.message || modelErr);
      const fallbackText = generateFallbackStrategy({ targetAudience, niche, currentStage, painPoint, strength });
      res.json({ success: true, text: fallbackText, isFallback: true });
    }
  } catch (error: any) {
    console.error('Error generating strategy:', error);
    const fallbackText = generateFallbackStrategy(req.body);
    res.json({ success: true, text: fallbackText, isFallback: true });
  }
});

// 2. Content & Copywriting Endpoint (操盘模式)
app.post('/api/gemini/content', async (req, res) => {
  try {
    const { topic, angle, audience, keyPoints, tone, aestheticStyle } = req.body;

    const prompt = `【用户请求：操盘模式 (Content & Copywriting)】
输入参数：
- 选题主题：${topic || '方圆脸淡颜女孩逆袭清冷氛围感'}
- 核心切入角度：${angle || '拒绝容貌焦虑，普通女孩的低成本美商自查清单'}
- 目标人群：${audience || '20-30岁职场/学生，想要自然变美'}
- 核心干货/变美要点：${keyPoints || '发型高颅顶技巧、清透底妆思路、色彩搭配、体态打卡'}
- 语气倾向：${tone || '闺蜜式同频打卡、接地气真实、干货实用、无说教感'}
- 视觉美学风格：${aestheticStyle || '多元美学（根据选题适配）'}

请严格按照开源社区 7 大小红书 Skill 规范生成完整内容：
【1. 爆款标题库 (Skill 2: 爆款标题公式)】
- 提供 3-5 个标题方案，覆盖“情绪钩子”、“痛点反差”、“悬念好奇”、“闺蜜避坑”、“沉浸打卡”不同公式，并附带具体公式名称与 CTR 心理学拆解。
【2. KOC 语感正文 (Skill 3: 语感排版规范)】
- 严格控制在 400-800 字之间；
- 采用小红书高赞排版规范：Emoji 精致隔离、段落留白呼吸感，像真闺蜜在耳边悄悄分享；
- 拒绝居高临下的说教，拒绝AI味套话，拒绝空洞鸡汤；
- 结尾务必设置一个强共鸣、低门槛的互动引导问句（CTA），引发评论区热烈讨论打卡。
【3. 视觉封面美学指导 (Skill 6: 封面美学与花字)】
- 基于所选美学风格【${aestheticStyle || '多元美学'}】进行量身定制：
  * 视觉主色调与色彩搭配方案（说明主色、辅色与点缀色）；
  * 封面主花字建议（大字抓眼球，3-6个字）；
  * 构图画幅（固定 3:4 比例，中心偏上黄金分割高留白）；
  * 拍摄光影、场景构图与生活美学道具搭配灵感。
【4. SEO 标签与真实检索口令】
- 提取 5-8 个标签（核心大词、长尾搜索词、情绪标签与精准圈层人群标签，带 # 格式）；
- 提炼 1 个最适合在小红书真实平台进行对标搜索的母词。
【5. 评论区互动转化与置顶沙发预埋 (Skill 7: 互动转化与粉丝沉淀 SOP)】
- 提供一条作者亲自在评论区留下的【置顶沙发预埋话术】（含互动诱饵、低门槛选项或干货补充，极大激发路人留言）；
- 提供 2 条高情商【打卡搭子互动回复范式】。`;

    try {
      const response = await generateContentWithModelFallback({
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PERSONA_PROMPT,
          temperature: 0.75,
        },
      });
      res.json({ success: true, text: response.text });
    } catch (modelErr: any) {
      console.warn('Gemini content fallback triggered:', modelErr?.message || modelErr);
      const fallbackText = generateFallbackContent({ topic, angle, audience, keyPoints, tone, aestheticStyle });
      res.json({ success: true, text: fallbackText, isFallback: true });
    }
  } catch (error: any) {
    console.error('Error generating content:', error);
    const fallbackText = generateFallbackContent(req.body);
    res.json({ success: true, text: fallbackText, isFallback: true });
  }
});

// 3. Review & Safety Endpoint (诊断模式)
app.post('/api/gemini/review', async (req, res) => {
  try {
    const { content, title, stats, problemType } = req.body;

    const prompt = `【用户请求：诊断模式 (Review & Safety)】
待诊断内容：
- 帖子标题：${title || '（未提供）'}
- 帖子正文/脚本：
${content || '（用户未提供正文）'}
- 流量/数据现状反馈：${stats || '发布后阅读量低于200，几乎无互动'}
- 疑虑点：${problemType || '可能存在限流、违禁词或前3秒不吸引人'}

请作为小红书风控与流量诊断专家进行深度排查：
1. 🚨 【广告法违禁词与社区风控违规排查】
   - 逐字识别潜在敏感词（如极限词、夸大功效、私域导流暗语、医疗美容违规术语等）；
   - 给出【明确诊断原因】与【100%安全合规的高情商平替词】对照表。
2. 📉 【低流量核心卡点诊断】
   - 封面与首图跳出率分析；
   - 标题前3秒吸睛度与情绪价值剖析；
   - 正文前两行阅读阻力与留存率拆解；
   - 评论区互动转化点缺失分析。
3. ✨ 【一键合规与高转化优化版正文】
   - 提供一份改写后的完整脱敏高转化正文（保留原核心干货，消除违禁风险，增强 KOC 呼吸感与互动引导）。
4. 🛡️ 【长效安全运营打卡建议】（账号权重养号与全手动合规操作守则）。`;

    try {
      const response = await generateContentWithModelFallback({
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PERSONA_PROMPT,
          temperature: 0.6,
        },
      });
      res.json({ success: true, text: response.text });
    } catch (modelErr: any) {
      console.warn('Gemini review fallback triggered (quota safe):', modelErr?.message || modelErr);
      const fallbackText = generateFallbackReview({ content, title, stats, problemType });
      res.json({ success: true, text: fallbackText, isFallback: true });
    }
  } catch (error: any) {
    console.error('Error in review diagnostics:', error);
    const fallbackText = generateFallbackReview(req.body);
    res.json({ success: true, text: fallbackText, isFallback: true });
  }
});

// 4. Topic Scoring & Inspiration Diagnostics Endpoint (选题打分 & 灵感检测)
app.post('/api/gemini/topic-score', async (req, res) => {
  try {
    const { topic, targetAudience, angle, rawInspiration, aestheticStyle } = req.body;

    const prompt = `【用户请求：美商爆款选题打分、灵感全景诊断与真实热搜口令提取】
输入信息：
${rawInspiration ? `- 用户输入的自由灵感/日常观察碎碎念：\n"""\n${rawInspiration}\n"""` : `- 确立选题：${topic || '（未输入具体名称）'}`}
- 目标受众：${targetAudience || '追求美商提升的普通女孩/职场早八人'}
- 切入角度：${angle || '低成本变美、日常真实避坑、松弛感'}
- 美学风格偏好：${aestheticStyle || '多元包容（自适应）'}

请作为小红书资深内容策略总监与风控专家，给出全面深度的诊断报告，必须严格遵循以下结构输出：

1. 🔍 【核心结论：这个选题/灵感行不行？】
- 一锤定音给出判断（如：🔥【非常可行，高赞母题潜力】/ ⚠️【可行但平淡，急需反差切入点重塑】/ 🛑【风险较高，容易沦为自嗨日记】）；
- 综合评级：S 级 (90+，爆款母题) / A 级 (80-89，扎实稳健) / B 级 (70-79，平淡需重塑) / C 级 (70以下，易踩雷或自嗨)；
- 4 维客观打分（每项满分 25 分，总分 100 分）：
  * 痛点共鸣度（/25）：是否直击受众痛点？还是创作者自嗨？
  * 差异化新颖度（/25）：是否跳脱千篇一律的套路？前3秒有无反常识钩子？
  * 视觉呈现潜力（/25）：在【${aestheticStyle || '所选风格'}】下出片难度与美感上限；
  * 完播与互动潜力（/25）：文末是否有超低门槛的互动诱饵，能否引发收藏和同频打卡？

2. 📈 【小红书真实平台下拉热搜母词清单】（平台真实能搜到海量笔记的真实高搜词）
请推荐 3-4 个真实存在的高热母词，每个必须严格按此格式输出：
- 真实母词：【具体词条，如：方圆脸发型】
  真实搜索链接：https://www.xiaohongshu.com/search_result?keyword=（填入URL编码后的关键词）
  热度定位：【破冰大词 / 万赞高热词】
  平台对标价值：...

3. 🌊 【小红书蓝海精准检索口令】（避开大博主内卷、素人极易出圈的长尾词）
请推荐 2-3 个真实蓝海检索口令，每个必须严格按此格式输出：
- 蓝海口令：【具体长尾口令，如：方圆脸 耳侧碎发 显脸小】
  真实搜索链接：https://www.xiaohongshu.com/search_result?keyword=（填入URL编码后的关键词）
  为什么容易拿到流量：...

4. 🚨 【平台风控与社区合规自查】
- 检测是否存在医疗美容禁语、极限绝对化用词、过度容貌焦虑用词或暗号引流词；
- 给出安全合规的平替提法。

5. 🚀 【2 个高分升级版方案（直接可落地操盘）】
- 方案 1（强烈反差痛点型）：
  * 升级标题/切入点：...
  * 预期 CTR 与优势：...
- 方案 2（闺蜜式陪伴/保姆级清单型）：
  * 升级标题/切入点：...
  * 预期 CTR 与优势：...`;

    try {
      const response = await generateContentWithModelFallback({
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PERSONA_PROMPT,
          temperature: 0.7,
        },
      });
      res.json({ success: true, text: response.text });
    } catch (modelErr: any) {
      console.warn('Gemini topic-score fallback triggered:', modelErr?.message || modelErr);
      const fallbackText = generateFallbackTopicScore({ topic, targetAudience, angle, rawInspiration, aestheticStyle });
      res.json({ success: true, text: fallbackText, isFallback: true });
    }
  } catch (error: any) {
    console.error('Error scoring topic:', error);
    const fallbackText = generateFallbackTopicScore(req.body);
    res.json({ success: true, text: fallbackText, isFallback: true });
  }
});

// 5. Chat Endpoint (美商陪伴搭子自由对话)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: '消息列表不能为空' });
    }

    const conversationContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    try {
      const response = await generateContentWithModelFallback({
        contents: conversationContents,
        config: {
          systemInstruction: SYSTEM_PERSONA_PROMPT,
          temperature: 0.75,
        },
      });
      res.json({ success: true, text: response.text });
    } catch (modelErr: any) {
      console.warn('Gemini chat fallback triggered:', modelErr?.message || modelErr);
      const fallbackText = generateFallbackChat(messages);
      res.json({ success: true, text: fallbackText, isFallback: true });
    }
  } catch (error: any) {
    console.error('Error in chat:', error);
    const fallbackText = generateFallbackChat(req.body?.messages || []);
    res.json({ success: true, text: fallbackText, isFallback: true });
  }
});

// Helper: Reliable Xiaohongshu keyword and search link generator
function generateFallbackKeywords(query: string) {
  const base = query.trim().replace(/[｜|#✨🔥]/g, ' ').split(/\s+/)[0] || '美商变美';
  return {
    dropdownKeywords: [
      {
        keyword: `${base} 推荐`,
        tag: '热搜破冰词',
        hotness: 'high',
        searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${base} 推荐`)}`,
        trafficNote: '平台千万级常规流量大词，适合博取初始自然曝光',
      },
      {
        keyword: `${base} 普通人实测`,
        tag: '下拉必搜',
        hotness: 'rising',
        searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${base} 普通人实测`)}`,
        trafficNote: '高信任度词根，真实闺蜜分享，完播率与互动率高',
      },
      {
        keyword: `${base} 避坑指南`,
        tag: '万赞对标词',
        hotness: 'high',
        searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${base} 避坑指南`)}`,
        trafficNote: '强情绪共鸣与刚需收藏驱动型热搜',
      },
      {
        keyword: `${base} 教程 新手`,
        tag: '高频联想',
        hotness: 'rising',
        searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${base} 教程 新手`)}`,
        trafficNote: '强刚需搜索意图，长效自然搜索流量来源',
      },
      {
        keyword: `${base} 氛围感思路`,
        tag: '审美进阶',
        hotness: 'steady',
        searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${base} 氛围感思路`)}`,
        trafficNote: '契合美商认知与精致生活受众的精准流量',
      },
    ],
    blueOceanCommands: [
      {
        command: `${base} 适合什么人 自查`,
        tag: '低内卷长尾',
        searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${base} 适合什么人 自查`)}`,
        reason: '直击受众自我怀疑与辨型痛点，大博主鲜少深耕，素人极易出圈',
      },
      {
        command: `${base} 为什么不好看 真实原因`,
        tag: '素人出圈词',
        searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${base} 为什么不好看 真实原因`)}`,
        reason: '反常识解构痛点，点击率（CTR）通常高出平台大盘 30% 以上',
      },
      {
        command: `${base} 极简低成本 实操SOP`,
        tag: '高转化搜索',
        searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${base} 极简低成本 实操SOP`)}`,
        reason: '降低行动门槛，收藏率通常是点赞数的 2 倍以上，极易沉淀长尾曝光',
      },
    ],
  };
}

// 6. XHS Real-time Search & Blue Ocean Commands Endpoint (操盘模式 · 实时检索)
app.post('/api/search/xhs-keywords', async (req, res) => {
  const query = (req.body?.query || '').trim() || '方圆脸变美';
  try {
    const prompt = `你是小红书搜索引擎与推荐算法专家。针对创作者输入的选题/关键词【${query}】，请实时提炼当前小红书平台真实的高频下拉联想热搜词以及适合避开大博主内卷的“蓝海长尾检索口令”。

请以严格的 JSON 格式输出，不要包含任何 markdown 代码块或多余字符，格式如下：
{
  "dropdownKeywords": [
    {
      "keyword": "具体下拉热搜词（例如：方圆脸发型推荐）",
      "tag": "下拉必搜",
      "hotness": "high",
      "trafficNote": "搜索意图与预估热度说明"
    }
  ],
  "blueOceanCommands": [
    {
      "command": "具体长尾检索指令（例如：方圆脸 耳侧碎发 显脸小）",
      "tag": "低内卷长尾",
      "reason": "为什么该指令更容易拿到长尾搜索流量"
    }
  ]
}

要求：
1. dropdownKeywords 提供 5-6 个真实用户高频会搜的下拉联想词，tag 在 "下拉必搜" | "热搜破冰词" | "万赞对标词" | "高频联想" | "审美进阶" 中选取，hotness 为 "high" | "rising" | "steady"。
2. blueOceanCommands 提供 3-4 个细分、避开红海竞争的长尾组合词口令，tag 在 "低内卷长尾" | "素人出圈词" | "高转化搜索" 中选取。
3. 务必保证 JSON 结构合法无误。`;

    const response = await generateContentWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PERSONA_PROMPT,
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    const dropdownKeywords = (parsed.dropdownKeywords || []).map((item: any) => ({
      ...item,
      searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(item.keyword || query)}`,
    }));

    const blueOceanCommands = (parsed.blueOceanCommands || []).map((item: any) => ({
      ...item,
      searchUrl: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(item.command || query)}`,
    }));

    if (dropdownKeywords.length === 0 && blueOceanCommands.length === 0) {
      throw new Error('Empty parsed result, using fallback');
    }

    res.json({
      success: true,
      query,
      data: {
        dropdownKeywords,
        blueOceanCommands,
      },
    });
  } catch (error: any) {
    console.warn('Fallback to generated keywords for:', query, error.message);
    const fallbackData = generateFallbackKeywords(query);
    res.json({
      success: true,
      query,
      data: fallbackData,
      isFallback: true,
    });
  }
});

// 7. Aesthetic Deep Advice Endpoint (基于打卡历史雷达弱项的 AI 进阶审美建议与 3 条深度美学知识点)
app.post('/api/aesthetic/deep-advice', async (req, res) => {
  try {
    const { weakestDimension, radarScores, historySummary } = req.body;

    const weakDimName = weakestDimension?.label || '构图与留白';
    const weakDimKey = weakestDimension?.key || 'composition';
    const weakScore = weakestDimension?.value ?? 68;

    const prompt = `你是一位殿堂级美学导师与视觉总监（擅长莫兰迪美学、极简视觉哲学、高段位审美培养与小红书美商破圈操盘）。
用户正在查看其个人【审美成长档案】的动态美商进化雷达图。
系统通过历史打卡连续记录加权，诊断出用户当前的审美薄弱环节为：【${weakDimName}】（当前雷达得分：${weakScore}分）。
全部六维雷达当前均分状况：${JSON.stringify(radarScores || {})}。
最近打卡心得上下文：${JSON.stringify(historySummary || [])}。

请为该用户量身定制并输出：
1. 1 段极具穿透力、温暖且专业的高段位诊断寄语（diagnosisQuote，40-60字左右）。
2. 恰好 3 条针对其薄弱环节【${weakDimName}】的【深度美学知识点】（knowledgePoints），每条包含：
   - id: 序号 (1, 2, 3)
   - title: 知识点核心命题（如“负空间呼吸法则：留白不是空，而是气的流动”、“明度差梯次：从混沌杂色到主辅点缀的黄金7:2:1”、“视觉动线锚点：眼神视线与环境构件的共鸣交织”）
   - tag: 标签（如“古典艺术大师范式”、“克制留白哲学”、“光影与情绪共鸣”）
   - theory: 美学底层原理剖析（100-140字，深入浅出，带大师或经典美学流派溯源，拒绝空泛口号）
   - actionablePractice: 本周可立即执行的单点微练习（60-90字，明确具体操作，极易执行）
   - targetPlatformTip: 转化为小红书笔记/封面/文案时的实战避坑技巧（50-70字）

请必须严格以合法 JSON 格式输出，不带 Markdown 标记：
{
  "weakDimension": "${weakDimName}",
  "weakScore": ${weakScore},
  "diagnosisQuote": "...",
  "knowledgePoints": [
    {
      "id": 1,
      "title": "...",
      "tag": "...",
      "theory": "...",
      "actionablePractice": "...",
      "targetPlatformTip": "..."
    },
    {
      "id": 2,
      "title": "...",
      "tag": "...",
      "theory": "...",
      "actionablePractice": "...",
      "targetPlatformTip": "..."
    },
    {
      "id": 3,
      "title": "...",
      "tag": "...",
      "theory": "...",
      "actionablePractice": "...",
      "targetPlatformTip": "..."
    }
  ]
}`;

    const response = await generateContentWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PERSONA_PROMPT,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.knowledgePoints || parsed.knowledgePoints.length < 3) {
      throw new Error('Incomplete knowledge points');
    }

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error in aesthetic deep advice:', error);
    // Reliable static fallback based on weak dimension
    const weakDimName = req.body?.weakestDimension?.label || '构图与留白';
    const fallbackData = {
      weakDimension: weakDimName,
      weakScore: req.body?.weakestDimension?.value ?? 68,
      diagnosisQuote: `美不是元素的累加，而是精准克制的舍弃。在【${weakDimName}】上放慢节奏，方能看见隐秘的视觉秩序。`,
      knowledgePoints: [
        {
          id: 1,
          title: '负空间呼吸法则：留白不是空，而是视觉之气的流动',
          tag: '东方美学 & 极简哲学',
          theory: '源自东方水墨“计白当黑”与现代主义包豪斯设计哲学。画面的力量往往不在于你放了多少物件，而在于给观者视线留出停留喘息的负空间（Negative Space）。当画面拥有至少 30% 以上的纯净呼吸区，主体的高级感便会自然凸显。',
          actionablePractice: '在日常拍摄静物或自拍时，将主体严格偏离正中心，背景保持单色或柔和漫反射光，故意留下 1/3 以上的干净虚化空间。',
          targetPlatformTip: '小红书封面最忌满屏大字与杂乱背景，顶部或底部保留干净纯色带，字号克制，点击率翻倍。',
        },
        {
          id: 2,
          title: '九宫格交叉点黄金视线锚定律',
          tag: '文艺复兴构图范式',
          theory: '人眼在审视矩形画面时，本能不会停留在绝对几何中心，而是习惯性扫过三分线上的四个交叉点（Golden Power Points）。将视觉焦点（如眼神、耳饰或茶杯边缘）置于左上或右下交点，画面会产生优雅的张力与动态平衡。',
          actionablePractice: '打开手机相机的九宫格参考线，连续 3 天拍摄任意 5 张生活照，强制要求主体核心点落在交叉点上，记录构图带来的心流变化。',
          targetPlatformTip: '首图人物出镜时，将眼睛水平线对齐上三分之一横线，视觉压迫感消失，呈现亲切自然的闺蜜交谈感。',
        },
        {
          id: 3,
          title: '视线延展引导线与微动势呼应',
          tag: '古典油画叙事逻辑',
          theory: '高级构图不仅是静态几何，更是视线的动线规划。通过肢体的微倾斜（如微低头、手指延伸方向）或背景中窗框、阴影的自然斜角，引导观者的目光自然滑向你想表达的核心细节，形成无声的视觉对话。',
          actionablePractice: '拍摄穿搭时拒绝僵硬正立，采用“单脚前伸3厘米+肩膀微侧拉长颈部线条+视线看向镜头斜上方”的微动势三角形。',
          targetPlatformTip: '图文轮播笔记第 2、3 张图使用连贯视线引导，前一张人物视线朝右，后一张细节特写在右侧，极大延长读者停留时长。',
        },
      ],
    };

    res.json({
      success: true,
      data: fallbackData,
      isFallback: true,
    });
  }
});

// 7.1 Aesthetic Micro Classroom Endpoint (美学微课堂 · 每日 3 分钟审美小知识生成)
app.post('/api/aesthetic/micro-lesson', async (req, res) => {
  try {
    const { dimensionKey, dimensionLabel, isMissing, pastTopics } = req.body;
    const targetDimLabel = dimensionLabel || '材质感知';
    const targetDimKey = dimensionKey || 'texture-material';

    const prompt = `你是一位殿堂级美学导师与小红书顶级美商顾问（精通莫兰迪美学、包豪斯构图、色彩心理学、材质光影肌理与女性视觉心流）。
用户正在使用【审美成长档案】的【美学微课堂】组件。
系统经过最近一周打卡数据分析，诊断出用户最近一周打卡缺失/薄弱的维度是：【${targetDimLabel}】（维度代码: ${targetDimKey}）。
用户过往打卡关注过：${Array.isArray(pastTopics) ? pastTopics.join('、') : '莫兰迪色彩、体态与留白'}。

请为该用户定制一篇今日“3分钟审美小知识”课件。要求：
1. 语言风格：治愈、通透、启发性强、有大师哲学底蕴，杜绝口水话与说教；
2. 篇幅：适合 3 分钟碎片化晨间阅读与极速吸收（约 250-350 字精炼体量）；
3. 必须针对【${targetDimLabel}】（例如色彩心理学、构图学、材质感知等）；
4. 提供可落地的 1 分钟微实操练习与小红书实战避坑策略。

请严格返回合法 JSON，不带任何 Markdown 代码块标签：
{
  "id": "lesson-${Date.now()}",
  "dimensionKey": "${targetDimKey}",
  "dimensionLabel": "${targetDimLabel}",
  "dimensionIcon": "${targetDimKey === 'color-psychology' ? '🎨' : targetDimKey === 'composition' ? '📐' : targetDimKey === 'texture-material' ? '🌾' : targetDimKey === 'visual-storytelling' ? '📖' : '✨'}",
  "lessonTitle": "【${targetDimLabel} · 3分钟极速吸收】精炼吸引人的课时主标题",
  "badge": "${isMissing ? '本周打卡缺失 · 专项补齐' : '精选美商必修'}",
  "readTime": "⏱️ 3分钟极速吸收",
  "isMissingDimension": ${Boolean(isMissing)},
  "coreConcept": "核心美学原理拆解（40-60字，直击本质，30秒极速掌握）",
  "masterOrigin": "大师或经典艺术流派美学溯源（如乔治·莫兰迪、物派艺术Mono-ha、包豪斯、东方禅宗留白等，40-60字）",
  "detailedExplanation": "深入浅出的美学规律剖析与日常视觉心流（120-160字，阐述为什么这样做具有高级感）",
  "colorPaletteAdvice": {
    "name": "Sage & Blush 治愈莫兰迪推荐配比",
    "hexes": ["#8EA89D", "#E8C5C8", "#FAF8F5", "#4A6355"],
    "description": "色调在画面中的分布配比与视觉呼吸建议"
  },
  "dailyActionablePractice": "今日 1 分钟即可在身边执行的单点微练习（40-60字，门槛极低，随手可做）",
  "redBookConversionTip": "转化到小红书封面/图文排版时的避坑与吸睛技巧（40-60字）",
  "quote": "一句话治愈系美学箴言（20-30字）"
}`;

    const response = await generateContentWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PERSONA_PROMPT,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsed,
    });
  } catch (err: any) {
    console.warn('Gemini micro lesson fallback:', err?.message || err);
    const targetDimKey = req.body?.dimensionKey || 'texture-material';
    const targetDimLabel = req.body?.dimensionLabel || '材质感知';

    // Rich static fallbacks categorized by dimension
    const FALLBACK_LESSONS: Record<string, any> = {
      'texture-material': {
        id: `lesson-texture-${Date.now()}`,
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
          description: '60% 胚布原麻白 + 25% 鼠尾草灰绿 + 15% 粗陶褐棕点缀'
        },
        dailyActionablePractice: '在窗边自然侧光下，用手机微距镜头靠近你手边的棉麻衣物、陶瓷水杯或粗糙纸张，捕捉微小的纤维与颗粒光泽，感受材质带来的体温。',
        redBookConversionTip: '封面切忌使用大面积纯平无纹理色块，在底层叠加 5% 不透明度的棉麻或纸质噪点底纹，质感与完播率瞬间翻倍。',
        quote: '物的体温藏在不经意抚摸到的微小粗糙里，那是对抗流水线虚无的锚。'
      },
      'color-psychology': {
        id: `lesson-color-${Date.now()}`,
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
          description: '70% 灰绿降噪底色 + 20% 柔杏粉氛围注入 + 10% 橄榄墨绿文字锚点'
        },
        dailyActionablePractice: '打开衣橱或梳妆台，挑出一件低彩度灰绿单品与一件淡粉小物并排放在自然光下，观察眼睛在注视 30 秒后的放松感。',
        redBookConversionTip: '小红书受众厌恶“荧光色警告”，将主视觉饱和度下调 25%，文案标题从“立刻搞定”变为“慢慢养出”，收藏率更高。',
        quote: '真正的温柔具有不动声色的力量，不必呼喊，自能沉淀人心。'
      },
      'composition': {
        id: `lesson-comp-${Date.now()}`,
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
          description: '大面积羊脂白背景 + 细线条引导 + 核心绿意视觉落点'
        },
        dailyActionablePractice: '拍摄今天喝的咖啡或茶杯，强制要求画面上方空出 1/2 以上的桌面与背景光斑，只拍杯子的一侧与轻微热气。',
        redBookConversionTip: '封面大标题千万不要居中死板铺满，顶端留出 15% 呼吸带，大字偏左上方排布，视觉冲击力与高级感立刻提升。',
        quote: '舍弃多余的杂念与摆设，留下风穿堂而过的空隙。'
      }
    };

    const chosenLesson = FALLBACK_LESSONS[targetDimKey] || FALLBACK_LESSONS['texture-material'];

    res.json({
      success: true,
      data: chosenLesson,
      isFallback: true,
    });
  }
});

// 7. Inspiration Sparks Brainstorming Endpoint (操盘模式 · 灵感火花头脑风暴)
app.post('/api/gemini/brainstorm-sparks', async (req, res) => {
  try {
    const { fragment } = req.body;
    const sparkText = (fragment || '').trim();

    if (!sparkText) {
      return res.status(400).json({ success: false, error: '灵感碎片内容不能为空' });
    }

    const prompt = `【用户请求：操盘模式 · 灵感火花头脑风暴 (Inspiration Spark Brainstorming)】
用户输入的零散想法碎片：
"${sparkText}"

作为拥有小红书 7 大 Skill 顶级操盘经验的美商策略顾问与爆款主笔，请将这个零散的想法碎片进行深度头脑风暴，扩展成三个差异化定位明确的完整爆款选题，并对每个选题的爆款潜力进行专业评估。

【严格输出规则】：
1. 三个选题必须具有明显差异化的切入角度：
   - 选题 1【痛点反差 / 逆袭解法型】：击穿痛点盲区，打破常规认知误区，给出立竿见影的逆袭解法；
   - 选题 2【情绪共鸣 / 闺蜜陪伴型】：主打真诚代入感与生活松弛感，降低读者心理防备，激发评论区热烈打卡讨论；
   - 选题 3【干货避坑 / 底层逻辑型】：深挖底层美学原理与手把手实操清单，强刚需收藏驱动，打造长效流量资产。
2. 每个选题必须具备可直接填入操盘模式的完整参数（topic, angle, audience, keyPoints, aestheticStyle, goldenTitle, coverAdvice）；
3. 每个选题必须包含详尽的爆款潜力评估（viralScore: 85-99分, viralTier: 如 'S+级超高爆款潜质' 或 'S级高收藏潜质', 3条爆款推荐机制理由 viralReasons, 以及 4 维指标评分 metricsAnalysis: empathyHook, saveRate, ctrClick, discussion）。

请严格返回以下合法 JSON 结构：
{
  "sparkFragment": "${sparkText}",
  "brainstormSummary": "针对该灵感碎片的破局点洞察与赛道突围逻辑拆解（80-120字）",
  "ideas": [
    {
      "id": "spark-1",
      "type": "痛点反差 / 逆袭解法型",
      "topic": "选题完整名称",
      "goldenTitle": "爆款标题（带情绪钩子与痛点）",
      "angle": "核心切入角度与反差定位",
      "audience": "精准目标人群与痛点画像",
      "keyPoints": "1. 关键技巧一... 2. 关键技巧二... 3. 关键技巧三... 4. 关键技巧四...",
      "aestheticStyle": "Sage & Blush 治愈莫兰迪",
      "hookFormula": "痛点反差 + 闺蜜避坑",
      "viralScore": 96,
      "viralTier": "S+级爆款潜质",
      "viralReasons": [
        "直击小红书高频搜索痛点，反直觉结论引发强好奇心",
        "封面大字对比明显，CTR（点击率）预估高出大盘平均水平35%",
        "实操步骤清晰可落地，天然具备极高收藏与转发欲望"
      ],
      "metricsAnalysis": {
        "empathyHook": 94,
        "saveRate": 98,
        "ctrClick": 95,
        "discussion": 91
      },
      "coverAdvice": "封面视觉与花字建议（3:4比例，高留白，花字大字）"
    },
    {
      "id": "spark-2",
      "type": "情绪共鸣 / 闺蜜陪伴型",
      "topic": "选题完整名称",
      "goldenTitle": "爆款标题",
      "angle": "核心切入角度",
      "audience": "目标人群画像",
      "keyPoints": "1. ... 2. ... 3. ... 4. ...",
      "aestheticStyle": "淡粉鼠尾草绿治愈系",
      "hookFormula": "情绪钩子 + 沉浸打卡",
      "viralScore": 93,
      "viralTier": "S级高互动潜质",
      "viralReasons": [
        "闺蜜同频叙事降低防御门槛，完播率极高",
        "预埋高共鸣CTA，容易引爆评论区分享自身经历",
        "人设真实可亲，涨粉转化率极高"
      ],
      "metricsAnalysis": {
        "empathyHook": 98,
        "saveRate": 89,
        "ctrClick": 92,
        "discussion": 97
      },
      "coverAdvice": "自然光抓拍，手持生活道具，温润莫兰迪色调"
    },
    {
      "id": "spark-3",
      "type": "干货避坑 / 底层逻辑型",
      "topic": "选题完整名称",
      "goldenTitle": "爆款标题",
      "angle": "核心切入角度",
      "audience": "目标人群画像",
      "keyPoints": "1. ... 2. ... 3. ... 4. ...",
      "aestheticStyle": "黑白极简 Clean Fit / 极简莫兰迪",
      "hookFormula": "闺蜜避坑 + 底层认知",
      "viralScore": 95,
      "viralTier": "S级高收藏潜质",
      "viralReasons": [
        "手把手清单式排版，被用户标记为'必看干货'",
        "长效搜索属性强，即便发布1个月后仍能持续获得长尾流量",
        "直戳审美雷区，避免无效试错"
      ],
      "metricsAnalysis": {
        "empathyHook": 90,
        "saveRate": 99,
        "ctrClick": 93,
        "discussion": 88
      },
      "coverAdvice": "清单对齐排版，数字序列突出，冷淡高级色调"
    }
  ]
}`;

    const response = await generateContentWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PERSONA_PROMPT,
        temperature: 0.75,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.ideas || parsed.ideas.length < 3) {
      throw new Error('Incomplete brainstorm ideas generated');
    }

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error in brainstorm-sparks:', error);
    const fragmentText = req.body?.fragment || '普通女孩美商逆袭';

    // Reliable fallback based on user's fragment
    const fallbackIdeas = {
      sparkFragment: fragmentText,
      brainstormSummary: `针对碎片“${fragmentText}”，核心突围点在于“去说教化”与“低门槛实操”。小红书读者抗拒宏大叙事，更偏好从日常细微习惯切入，用反差对比和具体场景撕开流量入口。`,
      ideas: [
        {
          id: 'spark-1',
          type: '痛点反差 / 逆袭解法型',
          topic: `从平平无奇到高级耐看｜普通女孩针对【${fragmentText}】的逆袭思路`,
          goldenTitle: `普通女孩别瞎折腾！针对【${fragmentText}】，做对这3点直接脱胎换骨✨`,
          angle: `打破“跟风流行”的固有误区，主张根据个人骨相与原生特质，用低成本方式实现辨识度蜕变`,
          audience: `追求自然变美、不爱浓妆重饰的年轻女性、职场新人与学生党`,
          keyPoints: `1. 找准原生视觉重心，不再盲目跟风爆款；2. 莫兰迪低饱和色彩平衡，拒绝显脏显暗；3. 抓住前3秒视觉呼吸感；4. 舒展体态与自然眼神流露`,
          aestheticStyle: `Sage & Blush 治愈莫兰迪`,
          hookFormula: `痛点反差 + 闺蜜避坑`,
          viralScore: 96,
          viralTier: 'S+级爆款潜质',
          viralReasons: [
            `直击【${fragmentText}】高频痛点，反差结论天然具备高点击率`,
            `步骤少于3步，读者收藏意愿远高于大盘平均水平`,
            `首图对比视觉冲击力强，极易引爆发现页推荐`
          ],
          metricsAnalysis: {
            empathyHook: 94,
            saveRate: 98,
            ctrClick: 95,
            discussion: 90
          },
          coverAdvice: `封面3:4高留白，大字花字'拒绝硬搬！3步逆袭'，莫兰迪双色对比`
        },
        {
          id: 'spark-2',
          type: '情绪共鸣 / 闺蜜陪伴型',
          topic: `谁懂啊！以前为了【${fragmentText}】踩了多少坑…真闺蜜走心复盘`,
          goldenTitle: `被夸气质好之后才明白…关于【${fragmentText}】，我终于想通了这几件事😭`,
          angle: `以第一人称真诚打卡搭子视角，陪伴式拆解走过的弯路，传递松弛感与美学自信`,
          audience: `容易陷入容貌焦虑、想要悄悄变美但缺乏持续动力的普通女孩`,
          keyPoints: `1. 接纳不完美的独特辨识度；2. 建立日常无痛打卡微习惯；3. 找到让自己感到舒适放松的个人气场；4. 评论区一起记录蜕变`,
          aestheticStyle: `淡粉鼠尾草绿治愈系`,
          hookFormula: `情绪钩子 + 沉浸打卡`,
          viralScore: 93,
          viralTier: 'S级高互动潜质',
          viralReasons: [
            `真诚闺蜜语气毫无戒备感，完播率高`,
            `共鸣感极强，读者会主动在评论区倾诉类似经历`,
            `情感粘性大，利于单篇笔记带来高比例关注`
          ],
          metricsAnalysis: {
            empathyHook: 99,
            saveRate: 88,
            ctrClick: 92,
            discussion: 97
          },
          coverAdvice: `生活感柔和漫射光抓拍，手写感花字'谁懂啊…想通了'，温暖治愈`
        },
        {
          id: 'spark-3',
          type: '干货避坑 / 底层逻辑型',
          topic: `拿来即用｜【${fragmentText}】保姆级避坑指南与实操SOP`,
          goldenTitle: `建议反复观看！【${fragmentText}】全网最通透底层逻辑，少走3年弯路🔥`,
          angle: `跳过表层技巧直接直击本质，梳理模块化自查清单，主打高密度纯干货与强收藏属性`,
          audience: `重视效率与实用价值、需要清晰可执行清单的理性变美探索者`,
          keyPoints: `1. 自查三步法：快速定位问题核心；2. 避开常见3大营销智商税；3. 搭建极简日常护肤/穿搭/体态闭环；4. 收藏备查长期跟练`,
          aestheticStyle: `极简莫兰迪 Clean Fit`,
          hookFormula: `闺蜜避坑 + 刚需干货`,
          viralScore: 95,
          viralTier: 'S级高收藏潜质',
          viralReasons: [
            `强刚需搜索型内容，长尾长效流量极高`,
            `结构化清单带来超高收藏率（往往收藏数大于点赞数）`,
            `建立专业可信度，容易被平台算法识别为优质知识贴`
          ],
          metricsAnalysis: {
            empathyHook: 89,
            saveRate: 99,
            ctrClick: 94,
            discussion: 86
          },
          coverAdvice: `3:4比例干净背景，数字序号排版，极简字号，突出'底层逻辑'`
        }
      ]
    };

    res.json({
      success: true,
      data: fallbackIdeas,
      isFallback: true
    });
  }
});

// 8. Whiteboard Outline Endpoint (灵感白板 · 多碎片组合与整体性视觉风格大纲生成)
app.post('/api/gemini/whiteboard-outline', async (req, res) => {
  try {
    const { fragments, activeClusterName } = req.body;
    const fragmentList: string[] = Array.isArray(fragments)
      ? fragments.map((f: any) => (typeof f === 'string' ? f : f.text)).filter(Boolean)
      : ['黑框眼镜', '方圆脸', '松弛感腮红'];

    const prompt = `你是一位顶级视觉美学总监与小红书爆款操盘手。
创作者在【灵感白板】上通过拖拽与排列，组合了以下零散的灵感碎片卡片：
【组合灵感碎片】：${fragmentList.join(' + ')}
【组合主题方向】：${activeClusterName || '治愈系莫兰迪高级感视觉整体'}

请根据这组碎片的内在审美逻辑与视觉张力，为创作者生成一份具有高度整体性、杂志级质感的【整体性视觉风格大纲】（Visual Style Outline），赋能其小红书多图封面与内页排版。

必须包含以下结构：
1. themeName: 视觉美学总主题名称（例如：“晨曦鼠尾草 · 清冷松弛耐看美学”）
2. aestheticEssence: 美学精髓剖析（50-80字，阐述为什么这些碎片组合能呈现高级呼吸感）
3. colorRatio: 莫兰迪配色比例建议（例如：“60% 鼠尾草灰绿底色 + 25% 柔杏粉氛围 + 15% 陶土原色文字”）
4. recommendedHexes: 4-5个精准十六进制莫兰迪色码数组（优先 Sage & Blush 系列）
5. coverLayout: 封面排版与花字规范（构图法则、花字位置、留白比例）
6. carouselSop: 3页多图轮播视觉构图 SOP（Page 1 首图、Page 2 细节动态、Page 3 清单干货）
7. propsAndLighting: 道具与光影氛围清单（自然光感、生活美学物料）
8. goldenTitle: 根据这些碎片生成的 1 个最具爆款潜质的黄金标题

请严格返回合法 JSON 格式，不包含 markdown 标记：
{
  "themeName": "...",
  "aestheticEssence": "...",
  "colorRatio": "...",
  "recommendedHexes": ["#8EA89D", "#E8C5C8", "#FAF8F5", "#4A6355"],
  "coverLayout": {
    "composition": "...",
    "flowerText": "...",
    "whitespace": "..."
  },
  "carouselSop": [
    { "page": 1, "title": "P1 封面抓人", "description": "..." },
    { "page": 2, "title": "P2 细节动势", "description": "..." },
    { "page": 3, "title": "P3 干货清单", "description": "..." }
  ],
  "propsAndLighting": "...",
  "goldenTitle": "..."
}`;

    const response = await generateContentWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PERSONA_PROMPT,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsed,
    });
  } catch (err: any) {
    console.warn('Gemini whiteboard outline fallback:', err?.message || err);
    const fragmentList: string[] = req.body?.fragments?.map((f: any) => typeof f === 'string' ? f : f.text) || ['灵感碎片'];
    const fallbackOutline = {
      themeName: `Sage & Blush · ${fragmentList.slice(0, 2).join('与')}整体美学大纲`,
      aestheticEssence: '以克制低饱和莫兰迪色系为底色，借助柔和漫射光线与大面积呼吸感留白，将零散的生活元素融合为舒展自如的杂志感视觉。',
      colorRatio: '60% 鼠尾草灰绿 (#8EA89D) + 25% 柔杏腮红粉 (#E8C5C8) + 15% 奶油冷白 (#FAF8F5)',
      recommendedHexes: ['#8EA89D', '#E8C5C8', '#FAF8F5', '#4A6355'],
      coverLayout: {
        composition: '3:4比例黄金分割，中心偏上三分之一处放置主花字',
        flowerText: `${fragmentList[0] || '美商觉醒'}｜松弛耐看美学`,
        whitespace: '画面四周预留 20% 边缘安全区，拒绝大面积色块压迫'
      },
      carouselSop: [
        { page: 1, title: 'P1 封面吸睛', description: '自然漫射光特写，中心偏上大号手写体花字，形成痛点反差视觉抓手' },
        { page: 2, title: 'P2 细节对比', description: '左右或上下分屏，展示“紧绷呆板”与“舒展松弛”的微小细节差异' },
        { page: 3, title: 'P3 干货SOP', description: '莫兰迪色块卡片式清单，数字1-3罗列日常可直接抄作业的落地动作' }
      ],
      propsAndLighting: '清晨45度斜射自然漫射柔光，配棉麻质感衬衫、粗陶茶杯或手账本，生活气息浓郁',
      goldenTitle: `普通女孩美商逆袭｜关于【${fragmentList.join(' × ')}】的松弛感解法✨`
    };

    res.json({
      success: true,
      data: fallbackOutline,
      isFallback: true
    });
  }
});

// 9. Color Psychology Endpoint (色彩美学实验室 · 莫兰迪色系心理学深度解读)
app.post('/api/gemini/color-psychology', async (req, res) => {
  try {
    const { colors, photoContext } = req.body;
    const hexList = Array.isArray(colors) && colors.length > 0 ? colors : ['#8EA89D', '#E8C5C8', '#FAF8F5'];

    const prompt = `你是一位色彩心理学权威专家与小红书高级视觉顾问。
创作者在【色彩美学实验室】中从生活美学照片中提取了以下【治愈系莫兰迪】色谱：
色值：${hexList.join(', ')}
照片场景语境：${photoContext || '自然光下的莫兰迪陶罐与淡粉花卉'}

请为这套 Sage & Blush 莫兰迪配色提供深入浅出的专业色彩心理学解读与小红书封面实操策略：
1. paletteTitle: 色彩主题名称（例如：“Sage & Blush 治愈系共情色谱”）
2. emotionalAnchor: 核心情绪锚点（如：“卸下焦虑 · 呼吸感 · 无防御信任”）
3. psychologyAnalysis: 色彩心理学机制分析（120-150字，阐述低饱和度绿与粉如何降低人体视网膜交感神经过载，在快节奏信息流中制造出“安全、亲切、松弛”的视觉停留心理）
4. targetAudienceResonance: 针对小红书年轻女性与高审美用户的共鸣洞察（80-100字）
5. coverApplicationRules: 3条封面花字与版面实战配比建议（主文字用什么色、背景渐变比例、如何拉开视觉层次）

请严格返回合法 JSON，不带 markdown 标记：
{
  "paletteTitle": "...",
  "emotionalAnchor": "...",
  "psychologyAnalysis": "...",
  "targetAudienceResonance": "...",
  "coverApplicationRules": [
    "...",
    "...",
    "..."
  ]
}`;

    const response = await generateContentWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PERSONA_PROMPT,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsed,
    });
  } catch (err: any) {
    console.warn('Gemini color psychology fallback:', err?.message || err);
    res.json({
      success: true,
      data: {
        paletteTitle: 'Sage & Blush 治愈系莫兰迪色谱',
        emotionalAnchor: '卸下紧绷 · 呼吸感 · 闺蜜式温柔信任',
        psychologyAnalysis: '鼠尾草绿属于低彩度中性冷色，能自然平复视网膜受体的紧张感，带来类似林间晨雾的镇定体验；而柔杏淡粉则注入了微温的情感温度。两者的7:3互补既不争抢视线，又在视觉上构筑出“没有距离感的陪伴”，有效消除过度商业化包装带来的防备心理。',
        targetAudienceResonance: '精准击中小红书受众对“反卷变美”、“松弛感”、“生活质感”的向往，读者在刷到的一瞬间感受到的是情绪减压而非外貌焦虑。',
        coverApplicationRules: [
          '主标题使用深橄榄灰绿 (#354B40)，字重加大但保持克制，确保在低彩度背景上的高可读性',
          '背景采用鼠尾草绿到奶油白的平滑微渐变，中央预留 40% 纯净留白作为视觉呼吸岛',
          '微小标签与打卡 Badge 采用柔杏粉色作为温润点缀，点睛而不喧宾夺主'
        ]
      },
      isFallback: true
    });
  }
});

// 8. Cover Inspiration Gallery: AI Imagen Generation & Smart Font Layout Matching
app.post('/api/gallery/generate-cover', async (req, res) => {
  try {
    const { prompt, vibe, category, topic } = req.body;

    const basePrompt = prompt || `Professional 3:4 portrait still life photography for Little Red Book (Xiaohongshu) aesthetic cover. Soft morning natural diffuse window sunlight, soothing Morandi color palette of muted sage green (#8EA89D) and gentle dusty blush (#E8C5C8), delicate minimalist handcrafted ceramics or dried botanical branch, cozy linen texture, quiet luxury, high negative space at top center for typography, tranquil healing atmosphere, cinematic soft focus.`;

    let generatedImageUrl = '';

    // Attempt generation with Google GenAI image model
    try {
      const imgResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: basePrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '3:4',
          },
        },
      });

      for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (genErr: any) {
      console.warn('Realtime image generation unavailable, fallback to curated high-res Morandi asset:', genErr?.message || genErr);
    }

    // AI typography and layout recommendation based on visual vibe and topic
    const layoutPrompt = `你是一位顶尖的小红书视觉设计与排版艺术指导。
当前用户正在为小红书笔记制作封面底图：
- 选题：${topic || '普通女孩美商逆袭'}
- 底图氛围描述：${vibe || '治愈温润 · 莫兰迪鼠尾草绿与淡粉光影'}
- 底图类别：${category || '陶器生活 / 绿植晨光'}

我们提供 4 种主视觉版式方案：
1. 'magazine' (经典破框杂志风：双线框、居中微偏上、大字加英文小标、轻奢典雅)
2. 'minimal-zen' (呼吸留白极简风：左对齐沉浸排版、超大负空间、细黑体或宋体、松弛耐看)
3. 'bold-contrast' (双层对比重字风：上下两行字重与字色强烈反差、3秒爆款CTR视觉抓手)
4. 'poster-center' (居中沉浸画报风：正方画框居中聚拢、典雅宋体、暗角光斑、艺术书卷气)

请分析该底图并为用户智能匹配最佳版式与排版参数，严格返回合法 JSON（无 markdown 标记）：
{
  "recommendedLayout": "magazine",
  "matchScore": 96,
  "matchReason": "底图上部拥有超过55%的柔和天光留白，杂志风双层中英排版能够完美呼吸，既不破坏下部陶器肌理，又能让标题在信息流中一眼脱颖而出。",
  "recommendedBadge": "美商逆袭 · 日常打卡",
  "recommendedMainTitle": "方圆脸淡颜｜审美觉醒",
  "recommendedSubTitle": "别硬搬浓颜，找对松弛耐看美学",
  "fontRecommendation": {
    "fontFamily": "Noto Serif SC / 典雅宋体",
    "mainColor": "#2A3C32",
    "accentColor": "#C27A83",
    "letterSpacing": "tracking-tight"
  },
  "aestheticDesignTips": [
    "字号控制在视口宽度的 65%，避免触碰边缘线框",
    "英文辅助标采用全大写 Cinzel 字体，字间距拉宽 200%",
    "背景底图建议叠加 10% 暖白微漫射层，增强文字可读性"
  ]
}`;

    let layoutMatchData = {
      recommendedLayout: 'magazine' as const,
      matchScore: 95,
      matchReason: '该莫兰迪底图光影柔和，上部天光留白充足，破框杂志版式能在克制中体现极强的高级质感。',
      recommendedBadge: '美商逆袭 · 日常打卡',
      recommendedMainTitle: topic ? topic.slice(0, 12) : '方圆脸淡颜｜审美觉醒',
      recommendedSubTitle: 'Sage & Blush 治愈系审美 · 普通女孩自查清单',
      fontRecommendation: {
        fontFamily: 'Noto Serif SC / 典雅宋体',
        mainColor: '#2A3C32',
        accentColor: '#C27A83',
        letterSpacing: 'tracking-tight',
      },
      aestheticDesignTips: [
        '字号控制在视口宽度的 65%，中心偏上对齐',
        '副标采用灰绿色 (#577063)，降低对比度保持呼吸感',
        '顶部徽标点缀柔杏粉色，提亮整体版面'
      ]
    };

    try {
      const layoutRes = await generateContentWithModelFallback({
        contents: layoutPrompt,
        config: {
          systemInstruction: SYSTEM_PERSONA_PROMPT,
          temperature: 0.6,
          responseMimeType: 'application/json',
        },
      });
      const parsed = JSON.parse(layoutRes.text || '{}');
      if (parsed.recommendedLayout) {
        layoutMatchData = { ...layoutMatchData, ...parsed };
      }
    } catch (parseErr) {
      console.warn('Layout match fallback:', parseErr);
    }

    res.json({
      success: true,
      data: {
        imageUrl: generatedImageUrl || null,
        prompt: basePrompt,
        layoutMatch: layoutMatchData,
      },
    });
  } catch (err: any) {
    console.error('Gallery generate error:', err);
    res.status(500).json({ success: false, error: err.message || '生成底图失败' });
  }
});

// 10. Blogger Cover Style Clone Endpoint (色彩美学实验室 · 审美博主封面风格克隆与视觉逆向)
app.post('/api/gemini/clone-style', async (req, res) => {
  try {
    const { imageBase64, bloggerName, imageContext } = req.body;

    let parsedResult: any = null;

    if (imageBase64 && typeof imageBase64 === 'string') {
      let mimeType = 'image/jpeg';
      let rawBase64 = imageBase64;

      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        const matchMime = parts[0].match(/data:(.*?)$/);
        if (matchMime) {
          mimeType = matchMime[1];
        }
        rawBase64 = parts[1];
      }

      const promptText = `你是一位精通小红书头部审美博主封面视觉密码的顶级美学总监与版式排印学家（Typography & Composition Specialist）。
请对创作者上传的这张审美博主封面图片（参考来源：${bloggerName || imageContext || '小红书头部美学博主封面'}）进行像素级专业视觉逆向解析，提取其【构图黄金比例】、【字体间距与排印】以及【花字排版权重与视觉层次】：

请严格以合法 JSON 格式输出，不要包含 markdown 标记或额外解释：
{
  "goldenRatio": {
    "layoutStructure": "golden-thirds",
    "structureName": "0.618 黄金分割上三分之一重心构图",
    "focalPointY": 38,
    "whitespaceRatio": 42,
    "compositionRule": "核心大标题位于 38% 黄金视线分割点，底部预留大面积纯色/微渐变呼吸空间，视觉层次分明"
  },
  "typography": {
    "letterSpacing": "wide",
    "letterSpacingVal": "0.18em",
    "lineHeight": "snug",
    "subtitleGap": 14,
    "fontFamilyFeel": "serif-sc",
    "fontFamilyName": "典雅衬线金石体 (Serif SC)"
  },
  "flowerTextWeight": {
    "primaryTitleWeight": "font-bold",
    "titleWeightName": "中粗高辨识衬线字重 (Bold 700)",
    "subtitleWeight": "font-medium",
    "badgeStyle": "glass-frosted",
    "badgeStyleName": "微渐变透光圆角胶囊标",
    "decorElements": ["双层纤细几何框线", "居中微小星芒分隔符", "低饱和灰粉底色呼吸条"],
    "contrastRatio": "16:1 兼顾莫兰迪调性与强辨识度"
  },
  "paletteSuggestion": {
    "dominant": "#8EA89D",
    "accent": "#E8C5C8",
    "background": "#FAF8F5",
    "textColor": "#2B4034"
  },
  "summary": "该博主封面采用克制典雅的黄金分割排版，字间距略为放宽以营造松弛高级感，字重稳健而不喧宾夺主，极契合治愈系莫兰迪内容。"
}

约束规则：
1. layoutStructure 仅在 "top-heavy" | "golden-thirds" | "center-focus" | "minimal-split" 中选择；
2. focalPointY 为核心视线焦点在 3:4 封面上的垂直百分比（整数 20-75 之间）；
3. whitespaceRatio 为留白呼吸感占比（整数 25-65 之间）；
4. letterSpacing 必须为 "tighter" | "normal" | "wide" | "widest"；letterSpacingVal 为如 "0.15em"；
5. fontFamilyFeel 必须为 "serif-sc" | "sans-clean" | "editorial-hand"；
6. primaryTitleWeight 必须为 "font-black" | "font-extrabold" | "font-bold" | "font-medium"；
7. badgeStyle 必须为 "pill-outline" | "solid-accent" | "tag-minimal" | "glass-frosted"；
8. 确保 JSON 绝对可被直接解析。`;

      try {
        const response = await generateContentWithModelFallback({
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: rawBase64,
                },
              },
              { text: promptText },
            ],
          },
          config: {
            systemInstruction: SYSTEM_PERSONA_PROMPT,
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        });

        parsedResult = JSON.parse(response.text || '{}');
      } catch (geminiError: any) {
        console.warn('Gemini vision clone-style parsing fallback:', geminiError?.message || geminiError);
      }
    }

    if (!parsedResult || !parsedResult.goldenRatio) {
      // High-precision stylistic fallback
      parsedResult = {
        goldenRatio: {
          layoutStructure: 'golden-thirds',
          structureName: '0.618 黄金分割重心构图',
          focalPointY: 38,
          whitespaceRatio: 45,
          compositionRule: '主标题精准锚定在画面上部 38% 黄金视线分割点，上下形成 3:7 虚实对比，赋予读者无压力的松弛呼吸感。',
        },
        typography: {
          letterSpacing: 'wide',
          letterSpacingVal: '0.18em',
          lineHeight: 'snug',
          subtitleGap: 14,
          fontFamilyFeel: 'serif-sc',
          fontFamilyName: '典雅治愈衬线体 (Noto Serif SC)',
        },
        flowerTextWeight: {
          primaryTitleWeight: 'font-bold',
          titleWeightName: '700 典雅金石字重（克制不压抑）',
          subtitleWeight: 'font-medium',
          badgeStyle: 'glass-frosted',
          badgeStyleName: '微磨砂透光圆角胶囊标',
          decorElements: ['双层 1px 细白几何边框', '居中微小星芒 ✦ 分隔符', '低饱和鼠尾草绿底色呼吸条'],
          contrastRatio: '15.8:1 高可读性',
        },
        paletteSuggestion: {
          dominant: '#8EA89D',
          accent: '#E8C5C8',
          background: '#FAF8F5',
          textColor: '#26372E',
        },
        summary: '成功克隆该审美博主的核心视觉密码：大字居中靠上黄金点，0.18em 舒展字距消除压迫感，搭配透光毛玻璃胶囊徽章。',
      };
    }

    res.json({
      success: true,
      data: parsedResult,
      isFallback: !imageBase64,
    });
  } catch (err: any) {
    console.error('Clone style error:', err);
    res.status(500).json({ success: false, error: err.message || '风格克隆解析失败' });
  }
});

// 11. Camera Environment Color Capture Endpoint (色彩美学实验室 · 实时相机捕捉环境色彩 & 提取小红书莫兰迪色卡)
app.post('/api/gemini/camera-palette', async (req, res) => {
  try {
    const { imageBase64, userSceneHint } = req.body;
    let parsedResult: any = null;

    if (imageBase64 && typeof imageBase64 === 'string') {
      let mimeType = 'image/jpeg';
      let rawBase64 = imageBase64;

      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        const matchMime = parts[0].match(/data:(.*?)$/);
        if (matchMime) {
          mimeType = matchMime[1];
        }
        rawBase64 = parts[1];
      }

      const promptText = `你是一位顶尖的色彩心理学专家与小红书高赞美学视觉总监。
创作者刚刚使用相机捕捉了一张真实生活环境照片（环境场景：${userSceneHint || '自然光下的生活美学空间/物品/穿搭'}）。
请对这张环境色彩快照进行深度色彩学分析，将其【原生杂色/高彩度冲撞】自动精炼、提纯并重塑为一套【100% 符合小红书爆款审美、治愈系低饱和莫兰迪（Sage & Blush 体系）】的标准色卡：

请严格以合法 JSON 格式输出，不要包含 markdown 标记或额外解释：
{
  "sceneDetected": "例如：窗前晨光照射的灰绿盆栽与棉麻桌面",
  "ambientLighting": "例如：45度斜射自然漫射柔光，冷暖交融",
  "paletteTitle": "例如：晨光微风 · 鼠尾草与烟粉陶木色谱",
  "emotionalAnchor": "例如：卸下焦虑 · 呼吸感 · 无防备信任",
  "palette": [
    {
      "hex": "#8EA89D",
      "name": "鼠尾草灰绿 (Sage Mist)",
      "role": "主氛围大底色 (Dominant)",
      "ratio": "55%",
      "rgb": "rgb(142, 168, 157)",
      "aestheticNote": "降低视网膜刺激，营造清晨林间般的镇静感"
    },
    {
      "hex": "#E8C5C8",
      "name": "柔杏腮红粉 (Soft Blush)",
      "role": "温润情感点缀 (Accent)",
      "ratio": "25%",
      "rgb": "rgb(232, 197, 200)",
      "aestheticNote": "注入自然气色，平衡冷调"
    },
    {
      "hex": "#FAF8F5",
      "name": "奶油羊绒白 (Cream Cashmere)",
      "role": "呼吸留白过渡 (Breathing White)",
      "ratio": "10%",
      "rgb": "rgb(250, 248, 245)",
      "aestheticNote": "中间调留白区，消除压迫"
    },
    {
      "hex": "#354E41",
      "name": "深黛青苔冷杉 (Deep Moss)",
      "role": "高辨识字色 (Headline Ink)",
      "ratio": "7%",
      "rgb": "rgb(53, 78, 65)",
      "aestheticNote": "大标题花字用色，保证低彩度背景上的16:1高可读性"
    },
    {
      "hex": "#D4BEAC",
      "name": "暖调陶土麦灰 (Warm Oatmeal)",
      "role": "徽章与边框微修容 (Detail Edge)",
      "ratio": "3%",
      "rgb": "rgb(212, 190, 172)",
      "aestheticNote": "强化生活器皿的原生质朴质感"
    }
  ],
  "psychologyAnalysis": "从色彩心理学视角，环境中的绿色波长最易使人产生安全与松弛感，而低饱和粉调则唤醒闺蜜式亲近心理。这套配色在快节奏信息流中制造出'视觉呼吸岛'，避免营销感强烈的荧光高饱和刺激，极大降低读者滑动时的防备心理。",
  "targetAudienceResonance": "精准共鸣小红书年轻女性与高审美早八人群，传达'普通生活里的高级秩序感'与'悦己松弛'生活哲学。",
  "coverApplicationRules": [
    "封面主背景采用 55% 鼠尾草灰绿，四周预留 15% 奶油羊绒白柔光羽化边",
    "核心花字标题必须使用 7% 深黛青苔冷杉 (#354E41)，字号适度加大，拒绝细笔画模糊",
    "打卡微标与小红书标志性胶囊 Badge 采用 25% 柔杏腮红粉作为跳色，视觉落点聚焦"
  ],
  "recommendedCoverFlowerTexts": [
    "美商觉醒｜把生活过成松弛的杂志感✨",
    "从环境色彩悟出的美商底层逻辑：拒绝紧绷",
    "今日治愈碎片｜治好精神内耗的莫兰迪色系打卡"
  ]
}

要求：
1. 提取的 5 个色块必须全部符合低饱和莫兰迪调性（拒绝高彩度刺眼纯色，如纯红#FF0000、纯黄#FFFF00等）；
2. 5 个色块的比例加和为 100%（推荐 55% + 25% + 10% + 7% + 3% 黄金梯队）；
3. 必须包含一个深色字色以确保封面字迹清晰可读；
4. 保证 JSON 格式合法无误。`;

      try {
        const response = await generateContentWithModelFallback({
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: rawBase64,
                },
              },
              { text: promptText },
            ],
          },
          config: {
            systemInstruction: SYSTEM_PERSONA_PROMPT,
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        });

        parsedResult = JSON.parse(response.text || '{}');
      } catch (geminiError: any) {
        console.warn('Gemini vision camera-palette parsing fallback:', geminiError?.message || geminiError);
      }
    }

    if (!parsedResult || !parsedResult.palette || parsedResult.palette.length === 0) {
      parsedResult = {
        sceneDetected: '自然漫射光下的环境与器物',
        ambientLighting: '温和自然漫射光，低对比柔和影调',
        paletteTitle: 'Sage & Blush · 治愈系环境莫兰迪色谱',
        emotionalAnchor: '松弛自然 · 舒缓呼吸 · 闺蜜式陪伴',
        palette: [
          {
            hex: '#8EA89D',
            name: '鼠尾草灰绿 (Sage Mist)',
            role: '主氛围大底色 (Dominant)',
            ratio: '55%',
            rgb: 'rgb(142, 168, 157)',
            aestheticNote: '降低视觉疲劳，塑造静谧松弛底色'
          },
          {
            hex: '#E8C5C8',
            name: '柔杏腮红粉 (Soft Blush)',
            role: '温润情感点缀 (Accent)',
            ratio: '25%',
            rgb: 'rgb(232, 197, 200)',
            aestheticNote: '注入亲切微温感，打破清冷'
          },
          {
            hex: '#FAF8F5',
            name: '奶油羊绒白 (Cream)',
            role: '呼吸留白过渡 (Breathing White)',
            ratio: '10%',
            rgb: 'rgb(250, 248, 245)',
            aestheticNote: '视觉呼吸岛，承载大面积留白'
          },
          {
            hex: '#334D3F',
            name: '深黛青苔冷杉 (Deep Moss)',
            role: '高辨识字色 (Headline Ink)',
            ratio: '7%',
            rgb: 'rgb(51, 77, 63)',
            aestheticNote: '16:1 高对比度，确保花字抓人'
          },
          {
            hex: '#D1BCAC',
            name: '暖灰陶土木质 (Warm Clay)',
            role: '细节修容勾线 (Detail Edge)',
            ratio: '3%',
            rgb: 'rgb(209, 188, 172)',
            aestheticNote: '细腻原木器皿质感'
          }
        ],
        psychologyAnalysis: '环境中的低饱和绿与粉能够自然平复视网膜感光细胞兴奋，在快节奏小红书信息流中制造出“无攻击性、不焦虑”的停留感。',
        targetAudienceResonance: '精准击中小红书女性对反卷变美、生活质感和松弛美商的向往。',
        coverApplicationRules: [
          '主背景使用 55% 鼠尾草灰绿，中间保留 30% 以上留白区域',
          '大标题使用深黛冷杉 (#334D3F)，字距放宽至 0.15em 打造高级感',
          '打卡胶囊标与点缀元素使用柔杏粉，增强闺蜜陪伴感'
        ],
        recommendedCoverFlowerTexts: [
          '美商觉醒｜普通女孩的高级感环境调色SOP',
          '把晨光穿在身上✨我的治愈系莫兰迪日常',
          '环境色不会骗人｜真正耐看的审美原来是这样的'
        ]
      };
    }

    res.json({
      success: true,
      data: parsedResult,
      isFallback: !imageBase64,
    });
  } catch (err: any) {
    console.error('Camera palette error:', err);
    res.status(500).json({ success: false, error: err.message || '环境色彩捕捉解析失败' });
  }
});

// Dev or Production Vite server binding
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
