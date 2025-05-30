'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FiPlus, FiTrash2, FiEdit3, FiSave, FiMail,
  FiCheckCircle, FiAlertCircle, FiDownload, FiLink, FiFileText, FiUsers
} from 'react-icons/fi'
import Editor from '@/components/editor/Editor'
import { formatDistanceToNow } from 'date-fns'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Doc {
  id: string
  title: string
  content: string
  updatedAt: string
}

export default function CollabZonePage() {
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([])
  const [sharedDocs, setSharedDocs] = useState<Doc[]>([])
  const [activeDoc, setActiveDoc] = useState<Doc | null>(null)
  const [titleEditId, setTitleEditId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [shareEmail, setShareEmail] = useState('')
  const [showComments, setShowComments] = useState(true)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('growfly_jwt')
    if (!token) return router.push('/login')

    fetch(`${API_URL}/api/collab`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((all: any) => {
        if (Array.isArray(all)) {
          setDocs(all)
          if (!activeDoc && all.length) setActiveDoc(all[0])
        }
      })

    fetch(`${API_URL}/api/collab/shared`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((shared: any) => {
        if (Array.isArray(shared)) setSharedDocs(shared)
      })
  }, [])

  useEffect(() => {
    if (statusMsg?.type === 'success') {
      const timer = setTimeout(() => setStatusMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [statusMsg])

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
    setDocs(prev => [created, ...prev])
    setActiveDoc(created)
  }

  const handleSave = async () => {
    if (!activeDoc) return
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${API_URL}/api/collab/${activeDoc.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        content: activeDoc.content,
        title: activeDoc.title,
      }),
    })
    const updated = await res.json()
    setDocs(prev => prev.map(doc => doc.id === updated.id ? updated : doc))
    setActiveDoc(updated)
    setStatusMsg({ type: 'success', text: 'Saved!' })
  }

  const handleRename = async (id: string) => {
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${API_URL}/api/collab/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: newTitle }),
    })
    const updated = await res.json()
    setDocs(prev => prev.map(doc => doc.id === id ? updated : doc))
    if (activeDoc?.id === id) setActiveDoc(updated)
    setTitleEditId(null)
    setStatusMsg({ type: 'success', text: 'Renamed!' })
  }

  const confirmDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    const token = localStorage.getItem('growfly_jwt')!
    await fetch(`${API_URL}/api/collab/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setDocs(prev => prev.filter(doc => doc.id !== id))
    if (activeDoc?.id === id) setActiveDoc(null)
    setStatusMsg({ type: 'success', text: 'Deleted.' })
  }

  const shareByEmail = async () => {
    if (!activeDoc || !shareEmail.includes('@')) {
      return setStatusMsg({ type: 'error', text: 'Enter a valid email.' })
    }

    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${API_URL}/api/collab/${activeDoc.id}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email: shareEmail }),
    })

    if (res.ok) {
      setStatusMsg({ type: 'success', text: 'Shared & link copied!' })
    } else {
      const { error } = await res.json().catch(() => ({}))
      setStatusMsg({ type: 'error', text: error || 'Share failed.' })
    }
  }

  const copyLink = () => {
    if (!activeDoc) return
    const url = `${window.location.origin}/collab-zone?doc=${activeDoc.id}`
    navigator.clipboard.writeText(url)
    setStatusMsg({ type: 'success', text: 'Link copied!' })
  }

  return (
    <div className="flex h-screen bg-background text-textPrimary overflow-hidden">
      <aside className="w-60 border-r border-border bg-card p-4 space-y-4 overflow-y-auto text-sm">
        <button
          onClick={handleNew}
          className="w-full flex items-center gap-1 px-3 py-2 bg-accent text-textPrimary rounded hover:brightness-110 transition text-xs"
        >
          <FiPlus /> New Doc
        </button>

        <div className="font-bold text-xs mt-4 mb-1 flex items-center gap-2"><FiFileText size={14}/> Your Docs</div>
        {docs.map(doc => (
          <div
            key={doc.id}
            className={`flex flex-col px-2 py-1 rounded cursor-pointer ${
              doc.id === activeDoc?.id ? 'bg-accent/20' : 'hover:bg-muted'
            }`}
          >
            {titleEditId === doc.id ? (
              <div className="flex items-center gap-1">
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border rounded"
                />
                <button
                  onClick={() => handleRename(doc.id)}
                  className="text-green-600 text-xs"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center text-xs">
                <span
                  className="truncate flex-1"
                  title={doc.title}
                  onClick={() => setActiveDoc(doc)}
                >
                  {doc.title}
                </span>
                <span className="flex gap-1 ml-2">
                  <FiEdit3 size={12} onClick={() => { setTitleEditId(doc.id); setNewTitle(doc.title) }} className="cursor-pointer" />
                  <FiTrash2 size={12} onClick={() => confirmDelete(doc.id)} className="cursor-pointer text-red-600" />
                </span>
              </div>
            )}
          </div>
        ))}

        <div className="font-bold text-xs mt-4 mb-1 flex items-center gap-2"><FiUsers size={14}/> Shared with You</div>
        {sharedDocs.map(doc => (
          <div
            key={doc.id}
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
              doc.id === activeDoc?.id ? 'bg-accent/20' : 'hover:bg-muted'
            }`}
            onClick={() => setActiveDoc(doc)}
          >
            <span className="truncate text-xs">{doc.title}</span>
            <FiDownload size={12} />
          </div>
        ))}
      </aside>

      <main className="flex-1 p-6 space-y-4 overflow-auto">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-2">
          <h1 className="text-xl font-semibold">Collab Zone</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="email"
              placeholder="email to share with"
              value={shareEmail}
              onChange={e => setShareEmail(e.target.value)}
              title="Invite someone to collaborate"
              className="px-2 py-1 border border-border rounded text-sm"
            />
            <button onClick={shareByEmail} title="Send invite via email" className="px-3 py-2 bg-accent text-textPrimary rounded text-sm">
              <FiMail size={14} className="inline mr-1" /> Share
            </button>
            <button onClick={copyLink} title="Copy doc link" className="px-3 py-2 bg-muted rounded text-sm">
              <FiLink size={14} className="inline mr-1" /> Copy Link
            </button>
            <button onClick={handleSave} title="Save document" className="px-3 py-2 bg-green-600 text-textPrimary rounded text-sm">
              <FiSave size={14} className="inline mr-1" /> Save
            </button>
            <button onClick={() => setShowComments(!showComments)} title="Toggle comment visibility" className="px-3 py-2 bg-muted rounded text-sm">
              {showComments ? 'Hide Comments' : 'Show Comments'}
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

        <div className="border border-border rounded-lg bg-card p-4 min-h-[60vh] overflow-y-auto">
          {activeDoc ? (
            <Editor
              key={activeDoc.id}
              content={activeDoc.content}
              setContent={(html: string) => setActiveDoc({ ...activeDoc, content: html })}
              docId={activeDoc.id}
              showComments={showComments}
            />
          ) : (
            <p className="text-muted-foreground p-10 text-sm text-center">
              📝 Select or create a document to begin editing.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
