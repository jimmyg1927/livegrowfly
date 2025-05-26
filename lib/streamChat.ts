// lib/streamChat.ts

export interface StreamedChunk {
  type: 'partial' | 'complete'
  content?: string
  followUps?: string[]
  responseId?: string
}

/**
 * Connect to the /api/streamChat endpoint and stream AI responses.
 * 
 * @param message The user message to send
 * @param token   The JWT token for authentication (in Authorization header)
 * @param onChunk Callback for each streamed partial chunk
 * @param onDone  Callback for when streaming completes
 */
export default async function streamChat(
  message: string,
  token: string,
  onChunk: (data: StreamedChunk) => void,
  onDone: () => void
) {
  const res = await fetch('/api/streamChat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  })

  if (!res.ok || !res.body) {
    throw new Error(`Stream failed: ${res.statusText}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      if (part.startsWith('event: done')) {
        onDone()
        return
      }
      if (part.startsWith('data: ')) {
        try {
          const json = JSON.parse(part.replace('data: ', '')) as StreamedChunk
          onChunk(json)
        } catch (err) {
          console.error('Invalid JSON chunk:', part)
        }
      }
    }
  }

  onDone()
}
