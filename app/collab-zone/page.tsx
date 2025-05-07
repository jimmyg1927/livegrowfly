'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiSave,
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
} from 'react-icons/fi'
import Editor from '@/components/editor/Editor'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Doc {
  id: string
  title: string
  content: string
}

export default function CollabZonePage() {
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([]) // Your docs
  const [sharedDocs, setSharedDocs] = useState<Doc[]>([]) // Docs shared with you
  const [activeId, setActiveId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [titleEditId, setTitleEditId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [sharing, setSharing] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Fetch documents and shared docs
  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return router.push('/login')
    
    // Fetch created docs
    fetch(`${API_URL}/api/collab`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((all: Doc[]) => {
        setDocs(all)
        if (all.length) {
          setActiveId(all[0].id)
          setContent(all[0].content)
        }
      })
      .catch(() => setDocs([]))

    // Fetch docs shared with user
    fetch(`${API_URL}/api/collab/shared`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((allShared: Doc[]) => {
        setSharedDocs(allShared)
      })
      .catch(() => setSharedDocs([]))
  }, [router])

  useEffect(() => {
    if (!activeId) return
    const doc = [...docs, ...sharedDocs].find(d => d.id === activeId)
    if (doc) setContent(doc.content)
  }, [activeId, docs, sharedDocs])

  const handleNew = async () => {
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${API_URL}/api/collab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'Untitled', content: '' }),
    })
    const created = await res.json()
    setDocs(d => [created, ...d])
    setActiveId(created.id)
    setContent('')
  }

  const handleSave = async () => {
    if (!activeId) return alert('Select a document first')
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${API_URL}/api/collab/${activeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, title: docs.find(d => d.id === activeId)?.title }),
    })
    if (res.ok) {
      setDocs(d => d.map(doc => doc.id === activeId ? { ...doc, content } : doc))
      setStatusMsg({ type: 'success', text: 'Saved!' })
    } else {
      setStatusMsg({ type: 'error', text: 'Save failed.' })
    }
  }

  const handleRename = async (id: string) => {
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${API_URL}/api/collab/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTitle }),
    })
    if (res.ok) {
      setDocs(d => d.map(doc => doc.id === id ? { ...doc, title: newTitle } : doc))
      setTitleEditId(null)
      setStatusMsg({ type: 'success', text: 'Renamed!' })
    } else {
      setStatusMsg({ type: 'error', text: 'Rename failed.' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${API_URL}/api/collab/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const remaining = docs.filter(d => d.id !== id)
      setDocs(remaining)
      if (activeId === id) {
        if (remaining.length) {
          setActiveId(remaining[0].id)
          setContent(remaining[0].content)
        } else {
          setActiveId(null)
          setContent('')
        }
      }
    } else {
      setStatusMsg({ type: 'error', text: 'Delete failed.' })
    }
  }

  const startShare = () => {
    setSharing(true)
    setShareEmail('')
    setStatusMsg(null)
  }

  const confirmShare = async () => {
    if (!activeId || !shareEmail.includes('@')) {
      return setStatusMsg({ type: 'error', text: 'Enter a valid email.' })
    }
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${API_URL}/api/collab/${activeId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: shareEmail }),
    })
    if (res.ok) {
      const url = `${window.location.origin}/collab-zone?doc=${activeId}`
      navigator.clipboard.writeText(url)
      setStatusMsg({ type: 'success', text: 'Shared & link copied!' })
    } else {
      const { error } = await res.json().catch(() => ({}))
      setStatusMsg({ type: 'error', text: error || 'Share failed.' })
    }
  }

  const handleDownload = (id: string) => {
    // This would ideally trigger a backend API route that converts the document to PDF or Word
    window.open(`${API_URL}/api/collab/${id}/download`, '_blank');
  }

  return (
    <div className="flex h-full">
      <aside className="w-64 border-r bg-background p-4 space-y-3 overflow-auto">
        <button onClick={handleNew} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded">
          <FiPlus /> New Doc
        </button>
        {/* Sidebar for owned documents */}
        <div className="font-bold text-lg">Your Docs</div>
        {docs.map(doc => (
          <div
            key={doc.id}
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${doc.id === activeId ? 'bg-accent/20' : 'hover:bg-muted'}`}
            onClick={() => setActiveId(doc.id)}
          >
            <span>{doc.title}</span>
            <div className="flex gap-1">
              <FiEdit3 className="cursor-pointer" onClick={() => { setTitleEditId(doc.id); setNewTitle(doc.title) }} />
              <FiTrash2 className="cursor-pointer text-red-600" onClick={() => handleDelete(doc.id)} />
            </div>
          </div>
        ))}
        {/* Sidebar for shared documents */}
        <div className="font-bold text-lg">Shared with You</div>
        {sharedDocs.map(doc => (
          <div
            key={doc.id}
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${doc.id === activeId ? 'bg-accent/20' : 'hover:bg-muted'}`}
            onClick={() => setActiveId(doc.id)}
          >
            <span>{doc.title}</span>
            <button onClick={() => handleDownload(doc.id)} className="ml-2 text-blue-500">
              <FiDownload /> Download
            </button>
          </div>
        ))}
      </aside>

      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Collab Zone</h1>
          <button onClick={startShare} className="flex items-center gap-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
            <FiMail /> Share This Doc
          </button>
        </div>
        <p className="text-gray-400 text-sm">
          Share and collaborate on Growfly responses. Edit, comment, and download as needed.
        </p>

        {sharing && (
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={shareEmail}
              placeholder="Enter colleague’s email"
              onChange={e => setShareEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button onClick={confirmShare} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-1">
              <FiCheckCircle /> Send
            </button>
          </div>
        )}

        {statusMsg && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded ${statusMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {statusMsg.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <Editor content={content} setContent={setContent} />
        </div>

        <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
          <FiSave /> Save
        </button>
      </main>
    </div>
  )
}
