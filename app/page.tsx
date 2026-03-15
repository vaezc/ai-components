'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import PromptInput from '@/components/PromptInput'
import CodePreview from '@/components/CodePreview'
import { useHistory } from '@/hooks/useHistory'

// Created once at module level — per rerender-lazy-state-init
const chatTransport = new DefaultChatTransport({ api: '/api/generate' })

function getTextContent(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('')
}

function extractCode(text: string): string {
  const match = text.match(/```(?:tsx|jsx|ts|js)?\n([\s\S]*?)```/)
  return match ? match[1].trim() : text.trim()
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code')
  const [historicalCode, setHistoricalCode] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const { history, save, remove } = useHistory()
  const prevIsLoadingRef = useRef(false)

  const { messages, sendMessage, status } = useChat({ transport: chatTransport })

  const isLoading = status === 'submitted' || status === 'streaming'

  // During loading: only show code if the NEW assistant message has started streaming.
  // When status is 'submitted' the last message is still the user's — show empty so
  // CodePreview renders the dots loader instead of the stale previous code.
  const currentAssistantMsg = isLoading
    ? (messages[messages.length - 1]?.role === 'assistant' ? messages[messages.length - 1] : null)
    : [...messages].reverse().find(m => m.role === 'assistant')

  const aiCode = currentAssistantMsg ? extractCode(getTextContent(currentAssistantMsg)) : ''
  const displayCode = historicalCode ?? aiCode

  // Save to history when generation completes (logic lives in effect, state change in handler)
  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading && aiCode) {
      const firstUserMsg = messages.find(m => m.role === 'user')
      if (firstUserMsg) save(getTextContent(firstUserMsg), aiCode)
    }
    prevIsLoadingRef.current = isLoading
  }, [isLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  // Logic lives in event handler per rerender-move-effect-to-event
  const handleSubmit = () => {
    if (!input.trim() || isLoading) return
    setActiveTab('code')      // always switch to code tab when a new generation starts
    setHistoricalCode(null)
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <main className="h-screen flex flex-col bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3 shrink-0">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <h1 className="text-lg font-semibold">AI Component Generator</h1>
        <span className="text-sm text-gray-500 ml-2">描述你想要的组件，AI 帮你生成</span>
      </header>

      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="w-2/5 border-r border-gray-800 flex flex-col min-h-0">
          <PromptInput
            messages={messages}
            input={input}
            isLoading={isLoading}
            history={history}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onRemoveHistory={remove}
            onRestoreHistory={setHistoricalCode}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="border-b border-gray-800 flex shrink-0">
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

          <div className="flex-1 min-h-0 overflow-hidden">
            <CodePreview
              code={displayCode}
              isLoading={isLoading}
              activeTab={activeTab}
              onSendMessage={(text) => sendMessage({ text })}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
