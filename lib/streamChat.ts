// File: lib/streamChat.ts

export type StreamedChunk = {
  role: 'user' | 'assistant'
  content: string
  followUps?: string[]
}

const fallbackFollowUps = [
  'Can you explain that in more detail?',
  'How can I apply this to my business?',
]

type StreamChatProps = {
  prompt: string
  token: string
  onStream: (chunk: StreamedChunk) => void
  onComplete?: (full: string) => void
  threadId?: string
  imageUrl?: string
  systemInstructions?: string
}

export default async function streamChat({
  prompt,
  token,
  onStream,
  onComplete,
  threadId,
  imageUrl,
  systemInstructions,
}: StreamChatProps) {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt,
      threadId,
      imageUrl,
      systemInstructions,
    }),
  })

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim()
      if (!line.startsWith('data:')) continue

      const json = line.replace(/^data:\s*/, '')
      if (!json || json === '[DONE]') continue

      try {
        const parsed = JSON.parse(json)
        const role = parsed.role || 'assistant'
        const content = parsed.content || ''
        const followUps = parsed.followUps || fallbackFollowUps

        fullText += content

        onStream({ role, content, followUps })
      } catch (err) {
        console.warn('Stream parse error:', err)
      }
    }

    buffer = lines[lines.length - 1]
  }

  if (onComplete) onComplete(fullText)
}
