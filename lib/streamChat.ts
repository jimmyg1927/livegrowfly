// File: lib/streamChat.ts
import { API_BASE_URL } from './constants'

type StreamedChunk = {
  type: 'partial' | 'complete'
  content?: string
  followUps?: string[]
  responseId?: string
}

interface StreamChatOptions {
  prompt: string
  threadId?: string
  token: string
  onStream: (chunk: StreamedChunk) => void
  onComplete: () => void
}

export default async function streamChat({
  prompt,
  threadId,
  token,
  onStream,
  onComplete,
}: StreamChatOptions) {
  if (!token) {
    console.error('Missing auth token in streamChat')
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {  // Your backend route
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        message: prompt,
        threadId 
      }),
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    if (!res.body) throw new Error('No response stream')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''

      for (const part of parts) {
        if (part.startsWith('data: ')) {
          const json = part.replace('data: ', '')
          if (json === '[DONE]') continue
          try {
            const parsed: StreamedChunk = JSON.parse(json)
            onStream(parsed)
          } catch (err) {
            console.error('Failed to parse streamed chunk:', err)
          }
        }
      }
    }

    onComplete()
  } catch (err) {
    console.error('StreamChat error:', err)
    onStream({ type: 'partial', content: '❌ Failed to get response. Please try again.' })
    onComplete()
  }
}