// File: lib/streamChat.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

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
  onError?: (error: { type: 'rate_limit' | 'network' | 'other', message: string }) => void
}

export default async function streamChat({
  prompt,
  threadId,
  token,
  onStream,
  onComplete,
  onError,
}: StreamChatOptions) {
  if (!token) {
    console.error('Missing auth token in streamChat')
    onError?.({ type: 'other', message: 'Missing authentication token' })
    return
  }

  try {
    console.log('🚀 StreamChat: Making request to /api/ai/chat', { prompt: prompt.substring(0, 50), threadId })
    
    const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
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

    console.log('🚀 StreamChat: Response status:', res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('🚀 StreamChat: HTTP error:', errorText)
      
      // Handle specific error types
      if (res.status === 403) {
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error === 'Prompt limit reached.') {
            onError?.({ 
              type: 'rate_limit', 
              message: `You've reached your daily limit of ${errorData.promptLimit} prompts. Upgrade your plan to continue.` 
            })
            return
          }
        } catch (e) {
          // If we can't parse the error, fall through to generic handling
        }
      }
      
      onError?.({ 
        type: 'network', 
        message: `Request failed with status ${res.status}. Please try again.` 
      })
      return
    }

    if (!res.body) {
      onError?.({ type: 'network', message: 'No response stream received' })
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    console.log('🚀 StreamChat: Starting to read stream...')

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
            console.error('Failed to parse streamed chunk:', err, 'Raw data:', json)
          }
        }
      }
    }

    console.log('🚀 StreamChat: Stream completed successfully')
    onComplete()
  } catch (err) {
    console.error('StreamChat error:', err)
    onError?.({ 
      type: 'network', 
      message: 'Connection failed. Please check your internet and try again.' 
    })
  }
}