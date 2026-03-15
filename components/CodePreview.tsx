'use client'

import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react'
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
        <pre className="h-full overflow-auto p-4 text-sm text-gray-300 font-mono bg-gray-900">
          {code}
          {isLoading && <span className="animate-pulse">▋</span>}
        </pre>
      ) : (
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
