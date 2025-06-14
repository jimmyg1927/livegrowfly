// File: lib/streamChat.ts - FIXED VERSION with Better Error Handling

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

type StreamedChunk = {
  type: 'partial' | 'complete' | 'error'
  content?: string
  followUps?: string[]
  responseId?: string | null
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
  conversationHistory?: Array<{ role: string; content: string }>
  onStream: (chunk: StreamedChunk) => void
  onComplete: (result?: {
    followUps?: string[]
    responseId?: string | null
    processedFiles?: Array<{
      name: string
      type: string
      processed: boolean
      error?: string
    }>
  }) => void
  onError?: (error: unknown) => void
}

export default async function streamChat({
  prompt,
  threadId,
  token,
  files = [],
  conversationHistory = [],
  onStream,
  onComplete,
  onError,
}: StreamChatOptions) {
  console.log('🔍 streamChat called with:', {
    promptLength: prompt.length,
    fileCount: files.length,
    historyLength: conversationHistory.length,
    hasToken: !!token
  })

  const controller = new AbortController()
  
  try {
    // ✅ Enhanced validation
    if (!token) {
      throw new Error('No authentication token provided')
    }

    if (!prompt.trim() && files.length === 0) {
      throw new Error('Either message or files are required')
    }

    // ✅ Enhanced file validation
    for (const file of files) {
      if (!(file instanceof File)) {
        console.warn('⚠️ Invalid file object detected:', file)
        continue
      }
      
      // Check file size (25MB for documents, 10MB for images)
      const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 25 * 1024 * 1024
      if (file.size > maxSize) {
        const sizeMB = Math.round(maxSize / (1024 * 1024))
        throw new Error(`File "${file.name}" is too large (max ${sizeMB}MB for ${file.type.startsWith('image/') ? 'images' : 'documents'})`)
      }

      // ✅ NEW: Check for unsupported file types
      const supportedTypes = [
        'image/', 'application/pdf', 'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel', 'application/msword'
      ]
      
      const isSupported = supportedTypes.some(type => file.type.includes(type) || file.type.startsWith(type))
      if (!isSupported) {
        console.warn('⚠️ Unsupported file type:', file.type, 'for file:', file.name)
        throw new Error(`File type "${file.type}" is not supported. Please use images, PDF, Word, Excel, or text files.`)
      }
    }

    // ✅ Handle file uploads with FormData when files are present
    let body: FormData | string
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    }

    if (files && files.length > 0) {
      console.log('🔍 Preparing FormData with', files.length, 'files...')
      
      // Use FormData for file uploads
      const formData = new FormData()
      formData.append('message', prompt)
      if (threadId) formData.append('threadId', threadId)
      
      // Add conversation history to FormData
      if (conversationHistory.length > 0) {
        console.log('🔍 Adding conversation history to FormData:', conversationHistory.length, 'messages')
        formData.append('conversationHistory', JSON.stringify(conversationHistory))
      }
      
      // Add files to FormData
      let validFileCount = 0
      files.forEach((file, index) => {
        if (file instanceof File) {
          formData.append('files', file)
          validFileCount++
          console.log(`🔍 Added file ${index + 1}: ${file.name} (${file.size} bytes, ${file.type})`)
        } else if ((file as any).preview) {
          // Handle base64 images from file preview
          try {
            const fileWithPreview = file as any
            const blob = dataURLtoBlob(fileWithPreview.preview)
            const fileName = fileWithPreview.name || `image_${index}.jpg`
            formData.append('files', blob, fileName)
            validFileCount++
            console.log(`🔍 Added preview file ${index + 1}: ${fileName}`)
          } catch (conversionError) {
            console.error('❌ Failed to convert preview to blob:', conversionError)
          }
        }
      })
      
      console.log('🔍 Total valid files added:', validFileCount)
      body = formData
      // Don't set Content-Type header - let browser set it with boundary
    } else {
      console.log('🔍 Preparing JSON body (no files)...')
      
      // Use JSON for text-only requests
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify({
        message: prompt,
        threadId,
        conversationHistory,
      })
      
      console.log('🔍 JSON body prepared, conversation history:', conversationHistory.length, 'messages')
    }

    console.log('🔍 Sending request to:', `${API_BASE_URL}/api/ai/chat`)
    console.log('🔍 Request headers:', Object.keys(headers))

    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    })

    console.log('🔍 Response status:', response.status, response.statusText)
    console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorData: any = {}
      let errorMessage = ''
      
      try {
        const contentType = response.headers.get('content-type')
        console.log('🔍 Error response content-type:', contentType)
        
        if (contentType?.includes('application/json')) {
          errorData = await response.json()
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`
        } else {
          // ✅ FIXED: Better handling of HTML error responses (like 500 errors)
          const text = await response.text()
          console.log('🔍 Error response text (first 200 chars):', text.substring(0, 200))
          
          if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
            // This is an HTML error page, likely a 500 error
            if (response.status === 500) {
              if (files.length > 0) {
                errorMessage = `Server error while processing uploaded files. Please try with smaller files or different file types.`
              } else {
                errorMessage = `Server error occurred. Please try again in a moment.`
              }
            } else {
              errorMessage = `Server returned HTML error page (${response.status}). Please try again.`
            }
          } else {
            errorMessage = text || `HTTP ${response.status}: ${response.statusText}`
          }
          
          errorData = { error: errorMessage }
        }
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError)
        if (response.status === 500) {
          errorMessage = files.length > 0 
            ? 'Server error while processing files. Please try with different files or contact support.'
            : 'Server error occurred. Please try again or contact support.'
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        errorData = { error: errorMessage }
      }
      
      console.error('❌ HTTP Error:', response.status, errorData)
      
      // ✅ Enhanced error handling for different status codes
      if (response.status === 500) {
        onError?.({
          type: 'server_error',
          message: errorMessage,
          status: 500
        })
        return
      }
      
      if (response.status === 403 && errorMessage?.includes('limit')) {
        onError?.({
          type: 'rate_limit',
          message: errorMessage,
        })
        return
      }
      
      if (response.status === 400) {
        onError?.({
          type: 'validation_error',
          message: errorMessage || 'Invalid request',
        })
        return
      }
      
      if (response.status === 413) {
        onError?.({
          type: 'file_too_large',
          message: 'Files are too large. Please use smaller files (max 25MB for documents, 10MB for images).',
        })
        return
      }
      
      throw new Error(errorMessage)
    }

    if (!response.body) {
      throw new Error('No response body received')
    }

    console.log('✅ Starting to read response stream...')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let buffer = ''
    let followUps: string[] = []
    let responseId: string | null = null
    let processedFiles: Array<{
      name: string
      type: string
      processed: boolean
      error?: string
    }> = []

    // ✅ Process stream response
    let reading = true
    let chunkCount = 0
    
    while (reading) {
      try {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('✅ Stream reading complete. Total chunks:', chunkCount)
          reading = false
          break
        }

        chunkCount++
        buffer += decoder.decode(value, { stream: true })
        
        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              console.log('✅ Received stream completion signal')
              reading = false
              break
            }

            if (data.trim() === '') {
              continue // Skip empty data lines
            }

            try {
              const parsed = JSON.parse(data)
              console.log('🔍 Parsed chunk type:', parsed.type)

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
                responseId = parsed.responseId || null
                processedFiles = parsed.processedFiles || []
                
                console.log('✅ Received completion data:', {
                  followUpsCount: followUps.length,
                  responseId,
                  processedFilesCount: processedFiles.length
                })
                
                onStream({ 
                  type: 'complete',
                  content: '',
                  followUps,
                  responseId,
                  processedFiles
                })
              } else if (parsed.type === 'error') {
                console.error('❌ Stream error received:', parsed.content)
                onStream({
                  type: 'error',
                  content: parsed.content || 'An error occurred'
                })
              }
            } catch (parseError) {
              // ✅ FIXED: TypeScript-safe error handling
              console.warn('⚠️ Failed to parse chunk data:', data.substring(0, 100), parseError instanceof Error ? parseError.message : String(parseError))
              // Continue processing other chunks
            }
          } else if (line.startsWith('event: ')) {
            const event = line.slice(7)
            console.log('🔍 Stream event:', event)
          }
        }
      } catch (readError) {
        console.error('❌ Error reading stream chunk:', readError)
        if (readError instanceof Error && readError.name === 'AbortError') {
          console.log('⚠️ Stream aborted')
          return
        }
        // Continue reading if it's not an abort
      }
    }

    console.log('✅ Stream processing complete')

    onComplete({
      followUps,
      responseId,
      processedFiles
    })

  } catch (error: unknown) {
    console.error('❌ streamChat error:', error)
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('⚠️ Request aborted')
      return
    }

    // ✅ Enhanced error handling with more specific messages
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        onError?.({
          type: 'network_error',
          message: 'Network error - please check your connection and try again'
        })
      } else if (error.message.includes('limit') || error.message.includes('too large')) {
        onError?.({
          type: 'file_error',
          message: error.message
        })
      } else if (error.message.includes('unsupported') || error.message.includes('not supported')) {
        onError?.({
          type: 'file_type_error',
          message: error.message
        })
      } else if (error.message.includes('Server error') || error.message.includes('500')) {
        onError?.({
          type: 'server_error',
          message: files.length > 0 
            ? 'Server error while processing your files. Please try with different files or try again later.'
            : 'Server error occurred. Please try again in a moment.'
        })
      } else {
        onError?.(error)
      }
    } else {
      onError?.(new Error('An unexpected error occurred'))
    }
  }
}

// ✅ HELPER: Convert data URL to Blob for file uploads
function dataURLtoBlob(dataURL: string): Blob {
  try {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    
    return new Blob([u8arr], { type: mime })
  } catch (error) {
    console.error('❌ Failed to convert data URL to blob:', error)
    throw new Error('Invalid image data')
  }
}

// ✅ HELPER: Create File object from base64 preview
export function createFileFromPreview(preview: string, name: string, type: string): File {
  const blob = dataURLtoBlob(preview)
  return new File([blob], name, { type })
}