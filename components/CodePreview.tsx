'use client'

import { useState, useEffect } from 'react'
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
  useErrorMessage,
  useSandpackNavigation,
  useSandpackPreviewProgress,
} from '@codesandbox/sandpack-react'
import { atomDark } from '@codesandbox/sandpack-themes'
import { SANDPACK_FILES } from '@/lib/sandpack-files'

interface Props {
  code: string
  isLoading: boolean
  activeTab: 'code' | 'preview'
  onSendMessage: (text: string) => void
}

const getProgressHint = (len: number) => {
  if (len === 0) return '正在理解需求...'
  if (len < 100) return '正在构思组件结构...'
  if (len < 300) return '正在编写组件逻辑...'
  if (len < 600) return '正在完善样式细节...'
  return '即将完成...'
}

// Syncs AI-generated code into the Sandpack sandbox
function CodeUpdater({ code }: { code: string }) {
  const { sandpack } = useSandpack()
  useEffect(() => {
    if (code) sandpack.updateFile('/App.tsx', code)
  }, [code])
  return null
}

// Toolbar with refresh button + loading overlay — must be inside SandpackProvider
function PreviewControls() {
  // useSandpackNavigation requires a clientId arg (pass undefined for default client)
  const { refresh } = useSandpackNavigation(undefined as unknown as string)
  // Returns string | null — non-null means Sandpack is still loading dependencies
  const loadingMessage = useSandpackPreviewProgress({})

  return (
    <>
      {/* Loading overlay while Sandpack installs dependencies */}
      {loadingMessage !== null && (
        <div className="absolute inset-0 bg-gray-950/90 flex flex-col items-center justify-center gap-3 z-10">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-blue-400 text-center px-4">{loadingMessage || '正在加载预览...'}</p>
        </div>
      )}

      {/* Refresh button — always visible */}
      <button
        onClick={refresh}
        title="刷新预览"
        className="absolute bottom-3 right-3 z-20 px-3 py-1.5 bg-gray-800/90 hover:bg-gray-700
                   rounded text-xs text-gray-400 hover:text-white transition-colors backdrop-blur-sm"
      >
        ↺ 刷新
      </button>
    </>
  )
}

// Shows error overlay and AI fix button inside Sandpack context
function PreviewErrorOverlay({ onFix }: { onFix: () => void }) {
  const error = useErrorMessage()
  if (!error) return null
  return (
    <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center gap-4 p-6 z-10">
      <p className="text-red-400 text-sm text-center font-mono max-w-md break-all">{error}</p>
      <button
        onClick={onFix}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
      >
        AI 自动修复
      </button>
    </div>
  )
}

function CopyDownloadButtons({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Component.tsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopy}
        className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors text-gray-300"
      >
        {copied ? '已复制 ✓' : '复制'}
      </button>
      <button
        onClick={handleDownload}
        className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded transition-colors text-gray-300"
      >
        下载
      </button>
    </div>
  )
}

export default function CodePreview({ code, isLoading, activeTab, onSendMessage }: Props) {
  if (!code && !isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
        生成的组件将在这里展示
      </div>
    )
  }

  if (isLoading && !code) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-xs text-blue-400">{getProgressHint(0)}</p>
      </div>
    )
  }

  // Streaming: show raw text with cursor
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-950/50 border-b border-blue-900/50 shrink-0">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-xs text-blue-400">{getProgressHint(code.length)}</span>
        </div>
        <pre className="flex-1 overflow-auto p-4 text-sm text-gray-300 font-mono bg-gray-900">
          {code}<span className="animate-pulse">▋</span>
        </pre>
      </div>
    )
  }

  // Done: Sandpack with editable editor + preview
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {activeTab === 'code' && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
          <span className="text-xs text-gray-500">App.tsx</span>
          <CopyDownloadButtons code={code} />
        </div>
      )}
      <SandpackProvider
        theme={atomDark}
        template="react-ts"
        files={{ '/App.tsx': code, ...SANDPACK_FILES }}
        customSetup={{
          dependencies: {
            'lucide-react': 'latest',
            '@radix-ui/react-slot': 'latest',
            'class-variance-authority': 'latest',
            'clsx': 'latest',
            'tailwind-merge': 'latest',
          },
        }}
        options={{ externalResources: ['https://cdn.tailwindcss.com'] }}
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
      >
        <CodeUpdater code={code} />
        {activeTab === 'code' ? (
          <SandpackCodeEditor
            showLineNumbers
            showReadOnly={false}
            style={{ flex: 1, overflow: 'auto' }}
          />
        ) : (
          <div style={{ flex: 1, position: 'relative' }}>
            <SandpackPreview
              showNavigator={false}
              showOpenInCodeSandbox={false}
              style={{ height: '100%' }}
            />
            <PreviewControls />
            <PreviewErrorOverlay onFix={() => onSendMessage('刚才生成的代码有错误，请修复后重新生成')} />
          </div>
        )}
      </SandpackProvider>
    </div>
  )
}
