// File: app/recent-chats/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@lib/constants'
import { motion } from 'framer-motion'

type ChatEntry = {
  id: string
  title: string
  createdAt: string
  updatedAt?: string
  messageCount?: number
  lastMessage?: string
}

export default function RecentChatsPage() {
  const [chats, setChats] = useState<ChatEntry[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeThreadId, setActiveThreadId] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('growfly_jwt')
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }

        console.log('🔍 Fetching chats from:', `${API_BASE_URL}/api/chats`)
        
        const response = await fetch(`${API_BASE_URL}/api/chats`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        })

        console.log('📡 Response status:', response.status)
        
        if (!response.ok) {
          if (response.status === 404) {
            // No chats found - that's okay
            setChats([])
            setLoading(false)
            return
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('📦 Received data:', data)
        
        const formattedChats = (Array.isArray(data) ? data : [])
          .map((chat: ChatEntry) => ({
            ...chat,
            title: chat.title || 'Untitled Chat',
          }))
          .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())

        setChats(formattedChats)
        setActiveThreadId(localStorage.getItem('growfly_last_thread_id') || '')
        setError(null)
      } catch (err) {
        console.error('❌ Error fetching chats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load chats')
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [])

  const handleRename = async (id: string) => {
    try {
      const token = localStorage.getItem('growfly_jwt')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/chat/rename/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editedTitle }),
      })

      if (!response.ok) {
        throw new Error('Failed to rename chat')
      }

      setChats(prev => prev.map(c => (c.id === id ? { ...c, title: editedTitle } : c)))
      setEditingId(null)
    } catch (err) {
      console.error('❌ Error renaming chat:', err)
      alert('Failed to rename chat. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Delete this chat permanently?')
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('growfly_jwt')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/chats/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete chat')
      }

      setChats(prev => prev.filter(c => c.id !== id))
      
      // Clear from localStorage if it was the active thread
      if (activeThreadId === id) {
        localStorage.removeItem('growfly_last_thread_id')
        setActiveThreadId('')
      }
    } catch (err) {
      console.error('❌ Error deleting chat:', err)
      alert('Failed to delete chat. Please try again.')
    }
  }

  const handleChatClick = (chatId: string) => {
    localStorage.setItem('growfly_last_thread_id', chatId)
    router.push(`/dashboard?threadId=${chatId}`)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 text-center text-textPrimary">Recent Chats</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-muted-foreground">Loading chats...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 text-center text-textPrimary">Recent Chats</h1>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Failed to load chats</div>
          <div className="text-sm text-muted-foreground mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-textPrimary">Recent Chats</h1>

      {chats.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No recent chats found.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Start New Chat
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map(chat => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex justify-between items-center p-4 rounded-xl shadow border-l-4 ${
                chat.id === activeThreadId
                  ? 'bg-blue-50 dark:bg-[#2a3a58] border-blue-500'
                  : 'bg-white dark:bg-[#1f2937] border-transparent'
              }`}
            >
              <div
                className="cursor-pointer flex-1"
                onClick={() => handleChatClick(chat.id)}
              >
                {editingId === chat.id ? (
                  <input
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                    onBlur={() => handleRename(chat.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRename(chat.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                    className="text-lg font-semibold w-full bg-transparent border-b focus:outline-none focus:border-blue-500 text-textPrimary"
                  />
                ) : (
                  <>
                    <p className="text-lg font-semibold text-textPrimary hover:underline">{chat.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(chat.updatedAt || chat.createdAt).toLocaleString()}</span>
                      {chat.messageCount && (
                        <>
                          <span>•</span>
                          <span>{chat.messageCount} messages</span>
                        </>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {chat.lastMessage}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-4 items-center ml-4">
                {editingId === chat.id ? (
                  <>
                    <button
                      onClick={() => handleRename(chat.id)}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingId(chat.id)
                        setEditedTitle(chat.title)
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Rename
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(chat.id)
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}