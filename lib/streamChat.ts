// File: lib/streamChat.ts
export type StreamedChunk = {
  content: string
  followUps?: string[]
}

type StreamChatParams = {
  prompt: string
  token: string
  onChunk: (chunk: StreamedChunk) => void
  onComplete: () => void
}

const streamChat = async ({ prompt, token, onChunk, onComplete }: StreamChatParams) => {
  const controller = new AbortController()
  const signal = controller.signal

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
    signal,
  })

  if (!response.body) throw new Error('No response body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  let followUps: string[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    fullText += chunk

    const parsed = parseChunk(chunk)
    if (parsed.content) {
      onChunk(parsed)
    }
    if (parsed.followUps?.length) {
      followUps = parsed.followUps
    }
  }

  onComplete()
}

function parseChunk(chunk: string): StreamedChunk {
  try {
    const data = JSON.parse(chunk)
    return {
      content: data.content || '',
      followUps: data.followUps || [],
    }
  } catch {
    return { content: chunk }
  }
}

export default streamChat
