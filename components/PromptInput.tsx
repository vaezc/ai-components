'use client'

import { useState, useEffect, useRef } from 'react'
import type { UIMessage } from 'ai'
import { EXAMPLE_PROMPTS } from '@/lib/prompts'
import type { HistoryItem } from '@/hooks/useHistory'

interface Props {
  messages: UIMessage[]
  input: string
  isLoading: boolean
  history: HistoryItem[]
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: () => void
  onRemoveHistory: (id: string) => void
  onRestoreHistory: (code: string) => void
}

function getTextContent(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('')
}

export default function PromptInput({
  messages, input, isLoading, history,
  onChange, onSubmit, onRemoveHistory, onRestoreHistory,
}: Props) {
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasMessages = messages.length > 0

  // Auto-scroll conversation to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Conversation history */}
      {hasMessages ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-0">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`text-sm px-3 py-2 rounded-lg ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white ml-4'
                  : 'bg-gray-800 text-gray-400 mr-4'
              }`}
            >
              {m.role === 'user' ? getTextContent(m) : '✓ 已更新组件'}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex-1 min-h-0" />
      )}

      {/* Input area */}
      <div className={`flex flex-col gap-3 p-4 shrink-0 ${hasMessages ? 'border-t border-gray-800' : ''}`}>
        {!hasMessages && (
          <h2 className="text-sm font-medium text-gray-400">描述你的组件</h2>
        )}
        <textarea
          value={input}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={hasMessages ? '继续修改，例如：把颜色改成蓝色...' : '例如：做一个带搜索功能的用户列表...'}
          rows={hasMessages ? 3 : 5}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm
                     text-white placeholder-gray-600 resize-none focus:outline-none
                     focus:border-blue-500 transition-colors"
        />
        <button
          onClick={onSubmit}
          disabled={isLoading || !input.trim()}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700
                     disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
        >
          {isLoading ? '生成中...' : hasMessages ? '继续修改' : '生成组件'}
        </button>

        {!hasMessages && (
          <div>
            <p className="text-xs text-gray-600 mb-2">示例</p>
            <div className="flex flex-col gap-1.5">
              {EXAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => onChange({ target: { value: p } } as React.ChangeEvent<HTMLTextAreaElement>)}
                  className="text-left text-xs text-gray-500 hover:text-gray-300
                             bg-gray-900 hover:bg-gray-800 rounded px-3 py-2 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History panel */}
      {history.length > 0 && (
        <div className="border-t border-gray-800 shrink-0">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-2.5 text-xs text-gray-500 hover:text-gray-300
                       flex items-center justify-between transition-colors"
          >
            <span>历史记录 ({history.length})</span>
            <span>{showHistory ? '▲' : '▼'}</span>
          </button>
          {showHistory && (
            <div className="max-h-48 overflow-y-auto">
              {history.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-900 group cursor-pointer"
                  onClick={() => onRestoreHistory(item.code)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate">{item.prompt}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveHistory(item.id) }}
                    className="text-gray-700 hover:text-red-400 text-xs ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
