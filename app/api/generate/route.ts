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

  return result.toTextStreamResponse()
}
