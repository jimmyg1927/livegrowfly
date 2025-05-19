// FILE: lib/streamChat.ts

import { API_BASE_URL } from '@/lib/constants'

export default async function* streamChat(prompt: string, token: string, language: string = 'en-GB') {
  const res = await fetch(`${API_BASE_URL}/api/ai`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: prompt, language }), // ✅ Send language to backend
  })

  if (!res.ok || !res.body) {
    throw new Error('Stream request failed')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      if (!part.startsWith('data:')) continue

      const jsonStr = part.replace(/^data:\s*/, '')
      if (jsonStr === '[DONE]') return

      try {
        const parsed = JSON.parse(jsonStr)
        yield parsed
      } catch (err) {
        console.warn('❗ Failed to parse stream chunk:', jsonStr)
      }
    }
  }
}
