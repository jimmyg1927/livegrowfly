// File: lib/streamChat.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

type StreamedChunk = {
  type: 'partial' | 'complete'
  content?: string
  followUps?: string[]
  responseId?: string | null // ✅ FIXED: Allow null
  processedFiles?: Array<{
    name: string
    type: string
    processed: boolean
    error?: string
  }>
}

interface StreamChatOptions {
  prompt: string
  threadId?: string
  token: string
  files?: File[]
  onStream: (chunk: StreamedChunk) => void
  onComplete: (result?: {
    followUps?: string[]
    responseId?: string | null // ✅ FIXED: Allow null
    processedFiles?: Array<{
      name: string
      type: string
      processed: boolean
      error?: string
    }>
  }) => void
  onError?: (error: unknown) => void // ✅ FIXED: Use unknown instead of any
}

export default async function streamChat({
  prompt,
  threadId,
  token,
  files = [],
  onStream,
  onComplete,
  onError,
}: StreamChatOptions) {
  const controller = new AbortController() // ✅ FIXED: const instead of let
  
  try {
    // ✅ ENHANCED: Handle file uploads with FormData when files are present
    let body: FormData | string
    const headers: Record<string, string> = { // ✅ FIXED: const instead of let
      'Authorization': `Bearer ${token}`,
    }

    if (files && files.length > 0) {
      // Use FormData for file uploads
      const formData = new FormData()
      formData.append('message', prompt)
      if (threadId) formData.append('threadId', threadId)
      
      // Add files to FormData
      files.forEach((file, index) => {
        if (file instanceof File) {
          formData.append('files', file)
        } else if ((file as unknown as { preview?: string }).preview) { // ✅ FIXED: Better typing
          // Handle base64 images from file preview
          const fileWithPreview = file as unknown as { preview: string; name?: string }
          const blob = dataURLtoBlob(fileWithPreview.preview)
          const fileName = fileWithPreview.name || `image_${index}.jpg`
          formData.append('files', blob, fileName)
        }
      })
      
      body = formData
      // Don't set Content-Type header - let browser set it with boundary
    } else {
      // Use JSON for text-only requests
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify({
        message: prompt,
        threadId,
      })
    }

    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      if (response.status === 403 && errorData.error?.includes('limit')) {
        onError?.({
          type: 'rate_limit',
          message: errorData.error,
        })
        return
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let buffer = ''
    let followUps: string[] = []
    let responseId: string | null = null // ✅ FIXED: Allow null
    let processedFiles: Array<{
      name: string
      type: string
      processed: boolean
      error?: string
    }> = []

    // ✅ FIXED: Use proper loop condition instead of while(true)
    let reading = true
    while (reading) {
      const { done, value } = await reader.read()
      
      if (done) {
        reading = false
        break
      }

      buffer += decoder.decode(value, { stream: true })
      
      // Process complete lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          if (data === '[DONE]') {
            reading = false
            break
          }

          try {
            const parsed = JSON.parse(data)

            if (parsed.type === 'partial' && parsed.content) {
              onStream({ 
                type: 'partial',
                content: parsed.content,
                followUps,
                responseId,
                processedFiles
              })
            } else if (parsed.type === 'complete') {
              followUps = parsed.followUps || []
              responseId = parsed.responseId || null // ✅ FIXED: Handle null properly
              processedFiles = parsed.processedFiles || []
              
              onStream({ 
                type: 'complete',
                content: '',
                followUps,
                responseId,
                processedFiles
              })
            }
          } catch (parseError) {
            // Silently continue on parse errors
          }
        }
      }
    }

    onComplete({
      followUps,
      responseId,
      processedFiles
    })

  } catch (error: unknown) { // ✅ FIXED: Use unknown instead of any
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }

    onError?.(error)
  }
}

// ✅ HELPER: Convert data URL to Blob for file uploads
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

// ✅ HELPER: Create File object from base64 preview
export function createFileFromPreview(preview: string, name: string, type: string): File {
  const blob = dataURLtoBlob(preview)
  return new File([blob], name, { type })
}