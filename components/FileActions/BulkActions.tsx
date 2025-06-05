// File: components/FileActions/BulkActions.tsx

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaFileExport, FaFileExcel, FaFilePdf, FaDownload, FaSpinner } from 'react-icons/fa'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glowfly-api-production.up.railway.app'

interface BulkActionsProps {
  selectedMessages: string[]
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
  }>
  onClear: () => void
}

const BulkActions: React.FC<BulkActionsProps> = ({ selectedMessages, messages, onClear }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getSelectedContent = () => {
    return selectedMessages
      .map(id => messages.find(msg => msg.id === id))
      .filter(msg => msg && msg.role === 'assistant')
      .map(msg => msg!.content)
      .join('\n\n---\n\n')
  }

  const exportToFormat = async (format: 'excel' | 'pdf' | 'txt') => {
    if (selectedMessages.length === 0) {
      setError('Please select at least one response to export')
      setTimeout(() => setError(null), 3000)
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      const content = getSelectedContent()
      const title = `Growfly Export - ${new Date().toLocaleDateString()}`

      let endpoint = ''
      let requestBody: any = { content, title }

      switch (format) {
        case 'excel':
          endpoint = '/api/file-generation/excel'
          requestBody.type = 'auto'
          break
        case 'pdf':
          endpoint = '/api/file-generation/pdf'
          requestBody.includeMetadata = true
          break
        case 'txt':
          // Handle text export locally
          const blob = new Blob([content], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          setIsExporting(false)
          onClear()
          return
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      // Handle file download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || `export.${format}`
        : `growfly-export-${Date.now()}.${format}`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      onClear() // Clear selection after successful export

    } catch (error: any) {
      console.error('Export failed:', error)
      setError(`Export failed: ${error.message}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsExporting(false)
    }
  }

  const copyToClipboard = async () => {
    if (selectedMessages.length === 0) {
      setError('Please select at least one response to copy')
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      const content = getSelectedContent()
      await navigator.clipboard.writeText(content)
      setError('✅ Copied to clipboard!')
      setTimeout(() => setError(null), 2000)
      onClear()
    } catch (error) {
      setError('Failed to copy to clipboard')
      setTimeout(() => setError(null), 3000)
    }
  }

  if (selectedMessages.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 p-4 z-40"
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedMessages.length} response{selectedMessages.length > 1 ? 's' : ''} selected
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => exportToFormat('excel')}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isExporting ? <FaSpinner className="animate-spin" /> : <FaFileExcel />}
            Excel
          </button>

          <button
            onClick={() => exportToFormat('pdf')}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isExporting ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
            PDF
          </button>

          <button
            onClick={() => exportToFormat('txt')}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isExporting ? <FaSpinner className="animate-spin" /> : <FaFileExport />}
            Text
          </button>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            📋 Copy
          </button>

          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            ✕ Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </motion.div>
  )
}

export default BulkActions