'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@lib/constants'
import { motion } from 'framer-motion'

type ChatEntry = {
  id: string
  title: string
  createdAt: string
}

export default function RecentChatsPage() {
  const [chats, setChats] = useState<ChatEntry[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') || '' : ''

  useEffect(() => {
    if (!token) return
    fetch(`${API_BASE_URL}/api/chat/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const sorted = data
          .map((chat: ChatEntry) => ({
            ...chat,
            title: chat.title || 'Untitled Chat',
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setChats(sorted)
        setLoading(false)
      })
  }, [token])

  const handleRename = async (id: string) => {
    const newTitle = prompt('Enter a new title:')
    if (!newTitle) return
    await fetch(`${API_BASE_URL}/api/chat/rename/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTitle }),
    })
    setChats(prev => prev.map(c => (c.id === id ? { ...c, title: newTitle } : c)))
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Delete this chat permanently?')
    if (!confirmDelete) return
    await fetch(`${API_BASE_URL}/api/chat/history/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setChats(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-textPrimary">🕒 Recent Chats</h1>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading chats...</p>
      ) : chats.length === 0 ? (
        <p className="text-center text-muted-foreground">No recent chats found.</p>
      ) : (
        <div className="space-y-4">
          {chats.map(chat => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-between items-center p-4 rounded-xl bg-white dark:bg-[#1f2937] shadow"
            >
              <div className="cursor-pointer" onClick={() => router.push(`/dashboard?threadId=${chat.id}`)}>
                <p className="text-lg font-semibold text-textPrimary hover:underline">{chat.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(chat.createdAt).toLocaleString()}</p>
              </div>

              <div className="flex gap-4 items-center">
                <button
                  onClick={() => handleRename(chat.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(chat.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
