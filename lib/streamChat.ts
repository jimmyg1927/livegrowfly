// FILE: lib/streamChat.ts

export default async function* streamChat(prompt: string, token: string) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: prompt }),
  })

  const reader = res.body?.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { done, value } = await reader!.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      if (part.startsWith('data:')) {
        const json = part.replace('data: ', '')
        const parsed = JSON.parse(json)
        yield parsed
      }
    }
  }
}
