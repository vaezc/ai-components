'use client'

import { useState } from 'react'
import { useCompletion } from '@ai-sdk/react'
import PromptInput from '@/components/PromptInput'
import CodePreview from '@/components/CodePreview'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code')

  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion({ api: '/api/generate', streamProtocol: 'text' })

  const extractCode = (text: string) => {
    const match = text.match(/```(?:tsx|jsx|ts|js)?\n([\s\S]*?)```/)
    return match ? match[1].trim() : text.trim()
  }

  const code = extractCode(completion)

  return (
    <main className="h-screen flex flex-col bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <h1 className="text-lg font-semibold">AI Component Generator</h1>
        <span className="text-sm text-gray-500 ml-2">描述你想要的组件，AI 帮你生成</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/5 border-r border-gray-800 flex flex-col">
          <PromptInput
            input={input}
            isLoading={isLoading}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="flex-1 flex flex-col">
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
