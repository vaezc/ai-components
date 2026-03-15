import { useState, useEffect } from 'react'

export interface HistoryItem {
  id: string
  prompt: string
  code: string
  createdAt: number
}

export function useHistory() {
  // Always start with [] so server and client initial render match (avoids hydration mismatch).
  // Load from localStorage after mount only.
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('component-history')
      if (saved) setHistory(JSON.parse(saved))
    } catch {}
  }, [])

  const save = (prompt: string, code: string) => {
    const item: HistoryItem = { id: Date.now().toString(), prompt, code, createdAt: Date.now() }
    const updated = [item, ...history].slice(0, 20)
    setHistory(updated)
    try { localStorage.setItem('component-history', JSON.stringify(updated)) } catch {}
  }

  const remove = (id: string) => {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    try { localStorage.setItem('component-history', JSON.stringify(updated)) } catch {}
  }

  return { history, save, remove }
}
