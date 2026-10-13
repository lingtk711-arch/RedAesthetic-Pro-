# RedAesthetic-Pro (小红书美商逆袭策略顾问与主笔)

> 专为小红书「美商培养 / 审美逆袭 / 形象改造」赛道打造的全链路运营与 AI 生产力工作台。融合爆款 SOP、实操数据大盘、Gemini 多模态视觉风格逆向引擎与合规风控诊断。

---

## 🌟 核心特色与功能矩阵

1. **7大爆款 SOP 创作引擎**
   - 痛点逆袭法、保姆级清单、反常识避坑、审美微课堂、对标拆解等多种小红书头部博主爆款结构。
   - 一键生成标题矩阵（高点击率、情绪价值、搜索词覆盖）与正文排版（Emoji、分段呼吸感、双话题标签）。

2. **多模态视觉风格克隆（Gemini 视觉逆向引擎）**
   - 支持上传任意小红书爆款封面截图或样图。
   - 自动逆向拆解：构图机位、莫兰迪/胶片配色方案、字体排版层级、情绪氛围、道具置景。
   - 生成 Midjourney / FLUX 级别的精细生图 Prompt 与 Canva / 剪映设计实操指引。

3. **视觉工坊 & 爆款封面画廊**
   - 内置高质量美商封面模板（骨相化妆、胶囊衣橱、极简穿搭、轻医美避坑）。
   - 智能提取 Hex 潘通/莫兰迪色卡，实时排版预览与文案打标。

4. **实时操盘看板 & 蓝海词库**
   - 动态监控互动率、爆款完播率、完读率与商单转化数据。
   - 赛道细分蓝海词挖掘与流量预警。

5. **小红书平台合规与敏感词风控**
   - 实时筛查医疗广告法违禁词、极端绝对化词汇与引流敏感词。
   - 智能给出温和替代方案，守护账号权重与自然流推荐。

---

## 🛠️ 技术栈

- **前端 / 界面**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **后端服务**: Node.js + Express (支持全栈托管与 SSR/Middleware 架构)
- **多模态 AI 引擎**: Google Gemini API (`@google/genai`)
- **数据持久化**: Google Cloud Firestore (实时同步与历史方案归档)

---

## 🚀 快速启动

### 1. 克隆仓库
```bash
git clone <YOUR_REPOSITORY_URL>
cd <REPOSITORY_NAME>
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
复制 `.env.example` 为 `.env`，并填入您的配置：
```bash
cp .env.example .env
```
配置项说明：
```env
GEMINI_API_KEY=你的Google_Gemini_API_Key
APP_URL=http://localhost:3000
```

### 4. 启动本地开发服务
```bash
npm run dev
```
打开浏览器访问 `http://localhost:3000` 即可开始使用。

---

## 📄 授权与许可

MIT License
