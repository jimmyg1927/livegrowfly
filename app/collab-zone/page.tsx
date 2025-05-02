'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Editor from '@/components/editor/Editor'
import { FiPlus, FiTrash2, FiEdit3, FiSave, FiLink } from 'react-icons/fi'

interface Doc {
  id: string
  title: string
  content: string
}

export default function CollabZonePage() {
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [titleEditId, setTitleEditId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')

  // Load all docs
  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return router.push('/login')

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collab`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((all: Doc[]) => {
        setDocs(all)
        if (all.length) {
          setActiveId(all[0].id)
          setContent(all[0].content)
        }
      })
      .catch(() => {
        // no docs yet
        setDocs([])
      })
  }, [router])

  // Switch active
  useEffect(() => {
    if (!activeId) return
    const doc = docs.find(d => d.id === activeId)
    if (doc) setContent(doc.content)
  }, [activeId, docs])

  // Create a brand new doc
  const handleNew = async () => {
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'Untitled', content: '' }),
    })
    const created: Doc = await res.json()
    setDocs(d => [created, ...d])
    setActiveId(created.id)
  }

  // Save current doc
  const handleSave = async () => {
    if (!activeId) return alert('No document selected')
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: activeId, content }),
    })
    if (res.ok) {
      setDocs(d =>
        d.map(doc => (doc.id === activeId ? { ...doc, content } : doc))
      )
      alert('Saved!')
    } else {
      alert('Save failed')
    }
  }

  // Rename title
  const handleRename = async (id: string) => {
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, title: newTitle }),
    })
    if (res.ok) {
      setDocs(d =>
        d.map(doc => (doc.id === id ? { ...doc, title: newTitle } : doc))
      )
      setTitleEditId(null)
    } else {
      alert('Rename failed')
    }
  }

  // Delete doc
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/collab/${id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    if (res.ok) {
      setDocs(d => d.filter(doc => doc.id !== id))
      if (activeId === id) {
        setActiveId(docs.length > 1 ? docs[1].id : null)
      }
    } else {
      alert('Failed to delete')
    }
  }

  // Copy share link
  const handleCopyLink = () => {
    if (!activeId) return
    const url = `${window.location.origin}/collab-zone?doc=${activeId}`
    navigator.clipboard.writeText(url)
    alert('Link copied!')
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-60 border-r bg-background p-4 space-y-2 overflow-auto">
        <button
          onClick={handleNew}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded"
        >
          <FiPlus /> New Doc
        </button>
        {docs.map(doc => (
          <div
            key={doc.id}
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
              doc.id === activeId
                ? 'bg-accent/20'
                : 'hover:bg-muted'
            }`}
            onClick={() => setActiveId(doc.id)}
          >
            {titleEditId === doc.id ? (
              <input
                className="w-full px-1 py-0.5 border rounded"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onBlur={() => handleRename(doc.id)}
                autoFocus
              />
            ) : (
              <span
                className="truncate"
                onDoubleClick={() => {
                  setTitleEditId(doc.id)
                  setNewTitle(doc.title)
                }}
              >
                {doc.title}
              </span>
            )}
            <div className="flex gap-1">
              <FiEdit3
                className="hover:text-accent cursor-pointer"
                onClick={() => {
                  setTitleEditId(doc.id)
                  setNewTitle(doc.title)
                }}
              />
              <FiTrash2
                className="hover:text-red-600 cursor-pointer"
                onClick={() => handleDelete(doc.id)}
              />
            </div>
          </div>
        ))}
      </aside>

      {/* Main editor area */}
      <main className="flex-1 p-6 space-y-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FiLink /> Collab Zone
        </h1>
        <p className="text-gray-400">
          Share and collaborate on Growfly responses.
        </p>

        <div className="border rounded-lg overflow-hidden">
          <Editor content={content} setContent={setContent} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            <FiSave /> Save
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            <FiLink /> Copy Link
          </button>
        </div>
      </main>
    </div>
  )
}
