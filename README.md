# AI Component Generator

> 用自然语言描述，AI 帮你生成可直接使用的 React 组件

**线上地址：** https://ai-components-peach.vercel.app

![demo](./public/demo.png)

---

## 功能特性

**🤖 自然语言生成**
输入描述，AI 实时流式输出 React 组件代码，首字节延迟 <500ms

**💬 多轮对话修改**
生成后可以继续说「把颜色改成蓝色」「加一个搜索框」，AI 基于上一版本迭代修改

**⚡ 实时预览**
集成 Sandpack 浏览器沙箱，代码生成的同时实时渲染组件效果

**✏️ 代码可编辑**
右侧代码区可直接手动修改，修改后预览实时同步更新

**🎨 高质量样式**
内置设计规范约束 + shadcn/ui 组件库，生成组件默认深色主题、专业视觉

**🔧 错误自动修复**
预览崩溃时自动捕获错误，一键触发 AI 修复

**📋 一键导出**
复制代码或下载 `.tsx` 文件，直接用于你的项目

**🕐 历史记录**
生成历史自动保存到本地，随时回溯之前的组件

---

## 技术栈

| 技术          | 用途                                 |
| ------------- | ------------------------------------ |
| Next.js 15    | 框架，App Router + API Routes        |
| Vercel AI SDK | Streaming 流式输出，useChat 多轮对话 |
| Claude API    | 大模型，组件代码生成                 |
| Sandpack      | 浏览器内代码沙箱，实时预览           |
| shadcn/ui     | 预置组件库，提升生成质量             |
| TypeScript    | 类型安全                             |
| Tailwind CSS  | 样式                                 |

---

## 本地运行

**1. 克隆项目**

```bash
git clone https://github.com/vaezc/ai-components.git
cd ai-components
```

**2. 安装依赖**

```bash
npm install
```

**3. 配置环境变量**

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```
ANTHROPIC_API_KEY=your_api_key_here
```

> 去 [console.anthropic.com](https://console.anthropic.com) 申请 API Key，有免费额度

**4. 启动开发服务器**

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

---

## 使用示例

以下是一些效果不错的提示词：

```
做一个带搜索功能的用户列表，每个用户显示头像、姓名和邮箱
```

```
做一个番茄钟计时器，支持开始、暂停、重置，显示当前轮次
```

```
做一个数据统计 Dashboard，包含四个指标卡片和一个趋势图表
```

```
做一个定价方案对比卡片，三个方案，突出显示推荐方案
```

生成后可以继续修改：

```
把背景改成深蓝色，按钮用渐变色
```

```
加一个空状态提示，当列表为空时显示插画和引导文字
```

---

## 架构说明

```
用户输入
  ↓
useChat（前端）
  ↓
POST /api/generate（Next.js Route Handler）
  ↓
Vercel AI SDK streamText → Claude API
  ↓
ReadableStream → HTTP chunked response
  ↓
前端实时拼接 → 代码提取 → Sandpack updateFile
  ↓
浏览器内编译渲染 → 实时预览
```

**关键设计决策：**

- 用 `useChat` 而非 `useCompletion`，支持多轮对话上下文
- System Prompt 注入设计规范和可用组件声明，保证生成质量
- Sandpack 沙箱隔离，安全运行 AI 生成的代码
- 错误捕获后自动 `append` 修复消息，无需用户手动干预

---

## 路线图

- [ ] 支持导出为完整 Next.js 项目
- [ ] 支持上传截图/设计稿生成组件
- [ ] 多变体生成（同时生成 3 个风格供选择）
- [ ] 用户账号 + 云端历史记录同步
- [ ] 支持更多组件库（MUI、Chakra UI）

---

## License

MIT
