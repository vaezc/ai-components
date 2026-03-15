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
