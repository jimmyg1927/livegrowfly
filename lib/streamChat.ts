// File: lib/streamChat.ts

export type StreamedChunk = {
  content?: string
  followUps?: string[]
}

interface StreamChatArgs {
  prompt: string
  token: string
  onStream?: (chunk: StreamedChunk) => void
  onComplete?: (full: string, followUps: string[]) => void
}

const streamChat = async ({ prompt, token, onStream, onComplete }: StreamChatArgs) => {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: (() => {
      const form = new FormData()
      form.append('message', prompt)
      return form
    })(),
  })

  if (!res.ok || !res.body) throw new Error('Failed to connect to stream')

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')

  let full = ''
  let followUps: string[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(Boolean)

    for (const line of lines) {
      if (line === 'data: [DONE]') continue
      if (!line.startsWith('data: ')) continue

      const json = JSON.parse(line.replace('data: ', ''))

      if (json.type === 'partial') {
        const content = json.content
        full += content
        onStream?.({ content })
      } else if (json.type === 'complete') {
        followUps = json.followUps || []
        onStream?.({ followUps })
        onComplete?.(full, followUps)
      }
    }
  }
}

export default streamChat
