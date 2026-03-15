# 任务：AI 组件生成器

## 项目定位

输入自然语言描述 → 流式输出 React 组件代码 → 实时预览渲染结果。

目标效果：用户输入「做一个带搜索功能的用户列表」，右侧实时出现生成的代码和渲染好的组件预览。

线上地址部署至 Vercel，GitHub 开源。

---

## 初始化项目

```bash
npx create-next-app@latest ai-component-gen --typescript --tailwind --app
cd ai-component-gen
npm install ai @ai-sdk/anthropic @codesandbox/sandpack-react
```

---

## 技术选型说明

- **Vercel AI SDK** — 处理 LLM 调用和 Streaming，封装了 `streamText`、`useChat` 等核心能力
- **Claude API（claude-sonnet-4-5）** — 代码生成质量好，对 React 组件理解准确
- **Sandpack** — CodeSandbox 开源的浏览器内代码沙箱，支持实时预览 React 组件，无需后端

---

## 文件结构

```
ai-component-gen/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # 主页面
│   └── api/
│       └── generate/
│           └── route.ts      # Streaming API 路由
├── components/
│   ├── PromptInput.tsx       # 左侧输入区
│   ├── CodePreview.tsx       # 右侧代码 + 预览区
│   └── StreamingText.tsx     # 流式文字输出组件
└── lib/
    └── prompts.ts            # System prompt 管理
```

---

## 第一步：API 路由（Streaming）

`app/api/generate/route.ts`

```ts
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { COMPONENT_SYSTEM_PROMPT } from '@/lib/prompts'

export const maxDuration = 60

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    system: COMPONENT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return result.toDataStreamResponse()
}
```

---

## 第二步：System Prompt

`lib/prompts.ts`

```ts
export const COMPONENT_SYSTEM_PROMPT = `
你是一个专业的 React 组件生成器。

用户会用自然语言描述他们想要的组件，你需要生成一个完整的 React 函数组件。

规则：
1. 只输出代码，不要输出任何解释文字
2. 使用 Tailwind CSS 写样式，不要写 CSS-in-JS 或 style 属性
3. 组件必须是默认导出：export default function Component()
4. 组件名统一用 Component
5. 可以使用 React hooks（useState、useEffect 等）
6. 不要引入任何外部依赖，只用 React 内置功能和 Tailwind
7. 代码要完整可运行，不要有省略号或 TODO

示例输出格式：
\`\`\`tsx
import { useState } from 'react'

export default function Component() {
  return (
    <div className="p-4">
      ...
    </div>
  )
}
\`\`\`
`
```

---

## 第三步：主页面布局

`app/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useCompletion } from 'ai/react'
import PromptInput from '@/components/PromptInput'
import CodePreview from '@/components/CodePreview'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code')

  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion({ api: '/api/generate' })

  // 从 completion 中提取代码块
  const extractCode = (text: string) => {
    const match = text.match(/```(?:tsx|jsx|ts|js)?\n([\s\S]*?)```/)
    return match ? match[1].trim() : text.trim()
  }

  const code = extractCode(completion)

  return (
    <main className="h-screen flex flex-col bg-gray-950 text-white">
      {/* 顶部 Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <h1 className="text-lg font-semibold">AI Component Generator</h1>
        <span className="text-sm text-gray-500 ml-2">描述你想要的组件，AI 帮你生成</span>
      </header>

      {/* 主体：左右分栏 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：输入区 */}
        <div className="w-2/5 border-r border-gray-800 flex flex-col">
          <PromptInput
            input={input}
            isLoading={isLoading}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </div>

        {/* 右侧：代码 + 预览 */}
        <div className="flex-1 flex flex-col">
          {/* Tab 切换 */}
          <div className="border-b border-gray-800 flex">
            {(['code', 'preview'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'code' ? '代码' : '预览'}
              </button>
            ))}
          </div>

          <CodePreview
            code={code}
            isLoading={isLoading}
            activeTab={activeTab}
          />
        </div>
      </div>
    </main>
  )
}
```

---

## 第四步：输入区组件

`components/PromptInput.tsx`

```tsx
'use client'

import { EXAMPLE_PROMPTS } from '@/lib/prompts'

interface Props {
  input: string
  isLoading: boolean
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function PromptInput({ input, isLoading, onChange, onSubmit }: Props) {
  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-2">描述你的组件</h2>
        <textarea
          value={input}
          onChange={onChange}
          placeholder="例如：做一个带搜索功能的用户列表，每个用户显示头像、姓名和邮箱..."
          className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm
                     text-white placeholder-gray-600 resize-none focus:outline-none
                     focus:border-blue-500 transition-colors"
        />
      </div>

      <button
        onClick={onSubmit as any}
        disabled={isLoading || !input.trim()}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700
                   disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
      >
        {isLoading ? '生成中...' : '生成组件'}
      </button>

      {/* 示例提示词 */}
      <div>
        <p className="text-xs text-gray-600 mb-2">示例</p>
        <div className="flex flex-col gap-2">
          {EXAMPLE_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => onChange({ target: { value: p } } as any)}
              className="text-left text-xs text-gray-500 hover:text-gray-300
                         bg-gray-900 hover:bg-gray-800 rounded px-3 py-2 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

在 `lib/prompts.ts` 补充示例提示词：

```ts
export const EXAMPLE_PROMPTS = [
  '做一个带搜索功能的用户列表，每个用户显示头像、姓名和邮箱',
  '做一个番茄钟计时器，支持开始、暂停、重置',
  '做一个拖拽排序的 Todo 列表',
  '做一个价格对比卡片组，展示三个定价方案',
  '做一个带图表的数据统计 Dashboard',
]
```

---

## 第五步：代码预览组件

`components/CodePreview.tsx`

```tsx
'use client'

import { SandpackProvider, SandpackCodeEditor, SandpackPreview } from '@codesandbox/sandpack-react'
import { atomDark } from '@codesandbox/sandpack-themes'

interface Props {
  code: string
  isLoading: boolean
  activeTab: 'code' | 'preview'
}

const SANDPACK_WRAPPER = (code: string) => `
import { createRoot } from 'react-dom/client'
${code}
createRoot(document.getElementById('root')).render(<Component />)
`

export default function CodePreview({ code, isLoading, activeTab }: Props) {
  if (!code && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        生成的组件将在这里展示
      </div>
    )
  }

  if (isLoading && !code) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      {activeTab === 'code' ? (
        // 代码展示：直接展示 streaming 原始文本
        <pre className="h-full overflow-auto p-4 text-sm text-gray-300 font-mono bg-gray-900">
          {code}
          {isLoading && <span className="animate-pulse">▋</span>}
        </pre>
      ) : (
        // 预览：Sandpack 沙箱渲染
        code && !isLoading ? (
          <SandpackProvider
            theme={atomDark}
            template="react"
            files={{
              '/App.js': SANDPACK_WRAPPER(code),
            }}
            options={{ externalResources: ['https://cdn.tailwindcss.com'] }}
          >
            <SandpackPreview style={{ height: '100%' }} showNavigator={false} />
          </SandpackProvider>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm p-4">
            生成完成后切换到预览查看效果
          </div>
        )
      )}
    </div>
  )
}
```

---

## 第六步：环境变量

`.env.local`

```
ANTHROPIC_API_KEY=your_api_key_here
```

Vercel 部署时在 Environment Variables 里配置同名变量。

---

## 注意事项

- `useCompletion` 适合单次补全场景（不是多轮对话），比 `useChat` 更简单
- Sandpack 预览需要等生成完成再渲染，生成中只展示代码 streaming
- Tailwind CDN 通过 `externalResources` 注入沙箱，这样生成的组件可以直接用 Tailwind 类名
- Claude API Key 只在服务端用（route.ts），不要暴露到客户端
- 代码提取用正则匹配 ` ``` ` 代码块，system prompt 里已强制要求 Claude 输出标准格式

---

## 完成标准

- [ ] 输入描述后点击生成，代码区实时流式输出
- [ ] 流式输出时有光标动画（▋）
- [ ] 生成完成后切换到预览 Tab，Sandpack 正确渲染组件
- [ ] 左侧示例提示词点击后自动填入输入框
- [ ] 部署至 Vercel，线上可访问
- [ ] GitHub README 附上截图和使用说明
