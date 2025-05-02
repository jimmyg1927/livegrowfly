'use client'

import React, { useEffect, useState } from 'react'
import Editor from '@/components/Editor'
import { FiPlus, FiShare2, FiTrash, FiEdit2 } from 'react-icons/fi'

interface Doc {
  id: string
  title: string
  content: string
}

export default function CollabZonePage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  const activeDoc = docs.find((doc) => doc.id === activeDocId)

  // 🔄 Load all docs
  useEffect(() => {
    if (!token) return
    fetch('/api/collab', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setDocs(data)
        if (data.length > 0) setActiveDocId(data[0].id)
      })
      .catch(() => {
        setDocs([])
      })
  }, [token])

  // ➕ Create doc
  const handleCreate = async () => {
    const res = await fetch('/api/collab', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: `Untitled Doc ${docs.length + 1}`,
        content: '',
      }),
    })

    const data = await res.json()
    setDocs((prev) => [data, ...prev])
    setActiveDocId(data.id)
  }

  // 💾 Save edits
  const handleContentChange = async (content: string) => {
    setDocs((prev) =>
      prev.map((doc) =>
        doc.id === activeDocId ? { ...doc, content } : doc
      )
    )
    await fetch(`/api/collab/${activeDocId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: activeDoc?.title || 'Untitled Document',
        content,
      }),
    })
  }

  // 🧠 Rename doc
  const handleUpdateTitle = async (id: string, newTitle: string) => {
    setEditingTitleId(null)
    setDocs((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, title: newTitle } : doc
      )
    )
    await fetch(`/api/collab/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: newTitle,
        content: docs.find((d) => d.id === id)?.content || '',
      }),
    })
  }

  // ❌ Delete doc
  const handleDelete = async (id: string) => {
    await fetch(`/api/collab/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const remaining = docs.filter((doc) => doc.id !== id)
    setDocs(remaining)
    if (activeDocId === id && remaining.length > 0) {
      setActiveDocId(remaining[0].id)
    } else if (remaining.length === 0) {
      handleCreate()
    }
  }

  return (
    <div className="flex h-full bg-background text-textPrimary">
      {/* Sidebar */}
      <div className="w-60 border-r border-muted bg-card p-4 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">📄 Your Docs</h2>
          <button
            onClick={handleCreate}
            className="p-1 text-sm bg-accent text-white rounded hover:bg-accent/80 transition"
          >
            <FiPlus size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center justify-between text-sm px-2 py-1 rounded cursor-pointer ${
                doc.id === activeDocId ? 'bg-muted text-white' : 'hover:bg-muted/50'
              }`}
              onClick={() => setActiveDocId(doc.id)}
            >
              {editingTitleId === doc.id ? (
                <input
                  value={doc.title}
                  autoFocus
                  onBlur={() => setEditingTitleId(null)}
                  onChange={(e) => handleUpdateTitle(doc.id, e.target.value)}
                  className="bg-transparent border-b border-muted focus:outline-none text-sm w-full"
                />
              ) : (
                <span>{doc.title}</span>
              )}
              <div className="flex gap-1">
                <button
                  className="text-xs p-1 hover:text-accent"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTitleId(doc.id)
                  }}
                >
                  <FiEdit2 size={12} />
                </button>
                <button
                  className="text-xs p-1 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(doc.id)
                  }}
                >
                  <FiTrash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            {activeDoc?.title || 'Untitled Document'}
          </h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 transition">
            <FiShare2 />
            Share (coming soon)
          </button>
        </div>
        <Editor content={activeDoc?.content || ''} onChange={handleContentChange} />
      </div>
    </div>
  )
}
