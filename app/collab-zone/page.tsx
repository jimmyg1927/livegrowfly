// file: src/app/collab-zone/page.tsx
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
  const [docs, setDocs] = useState<Doc[]>([])
  const [sharedDocs, setSharedDocs] = useState<Doc[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [titleEditId, setTitleEditId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [sharing, setSharing] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [showComments, setShowComments] = useState(true)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return router.push('/login')

    fetch(`${API_URL}/api/collab`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((all: Doc[]) => {
        setDocs(all)
        if (all.length) {
          setActiveId(all[0].id)
          setContent(all[0].content)
        }
      })

    fetch(`${API_URL}/api/collab/shared`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((allShared: Doc[]) => setSharedDocs(allShared))
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
        Authorization: `Bearer ${token}` },
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

  return (
    <div className="flex h-full bg-background text-textPrimary">
      <aside className="w-64 border-r border-border bg-card p-4 space-y-3 overflow-auto">
        <button onClick={handleNew} className="flex items-center gap-1 px-3 py-2 bg-accent text-white rounded hover:brightness-110 transition">
          <FiPlus /> New Doc
        </button>
        <div className="font-bold text-lg">Your Docs</div>
        {docs.map(doc => (
          <div
            key={doc.id}
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
              doc.id === activeId ? 'bg-accent/20' : 'hover:bg-muted'
            }`}
            onClick={() => setActiveId(doc.id)}
          >
            {titleEditId === doc.id ? (
              <input
                type="text"
                className="flex-1 mr-2 px-1 py-1 text-sm rounded border border-muted bg-background text-textPrimary"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onBlur={() => handleRename(doc.id)}
                autoFocus
              />
            ) : (
              <>
                <span className="flex-1">{doc.title}</span>
                <div className="flex gap-1">
                  <FiEdit3 className="cursor-pointer" onClick={() => { setTitleEditId(doc.id); setNewTitle(doc.title) }} />
                  <FiTrash2 className="cursor-pointer text-red-600" />
                </div>
              </>
            )}
          </div>
        ))}

        <div className="font-bold text-lg pt-4">Shared with You</div>
        {sharedDocs.map(doc => (
          <div
            key={doc.id}
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
              doc.id === activeId ? 'bg-accent/20' : 'hover:bg-muted'
            }`}
            onClick={() => setActiveId(doc.id)}
          >
            <span>{doc.title}</span>
            <button className="ml-2 text-accent hover:underline">
              <FiDownload />
            </button>
          </div>
        ))}
      </aside>

      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Collab Zone</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowComments(!showComments)} className="px-3 py-2 rounded bg-muted hover:bg-muted/70">
              {showComments ? 'Hide Comments' : 'Show Comments'}
            </button>
            <button onClick={confirmShare} className="flex items-center gap-1 px-4 py-2 bg-accent text-white rounded hover:brightness-110 transition">
              <FiMail /> Share
            </button>
            <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              <FiSave /> Save
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded ${
            statusMsg.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}>
            {statusMsg.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="border border-border rounded-lg bg-card p-2 min-h-[60vh] overflow-y-auto">
          <Editor content={content} setContent={setContent} />
        </div>
      </main>
    </div>
  )
}
