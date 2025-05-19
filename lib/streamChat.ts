// lib/streamChat.ts
export default async function* streamChat(prompt: string, token: string) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: prompt }),
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

    let parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      if (!part.startsWith('data:')) continue
      const jsonStr = part.replace(/^data:\s*/, '')
      if (jsonStr === '[DONE]') return

      try {
        const parsed = JSON.parse(jsonStr)
        yield parsed
      } catch (err) {
        console.warn('Failed to parse chunk:', jsonStr)
      }
    }
  }
}
