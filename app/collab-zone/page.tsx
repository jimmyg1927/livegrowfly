'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FiPlus, FiTrash2, FiEdit3, FiSave, FiMail,
  FiCheckCircle, FiAlertCircle, FiDownload, FiLink
} from 'react-icons/fi'
import Editor from '@/components/editor/Editor'

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
          if (all.length) setActiveDoc(all[0])
        }
      })

    fetch(`${API_URL}/api/collab/shared`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((allShared: any) => {
        if (Array.isArray(allShared)) {
          setSharedDocs(allShared)
        }
      })
  }, [router])

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
    setActiveDoc(created)
  }

  const handleSave = async () => {
    if (!activeDoc) return
    const token = localStorage.getItem('growfly_jwt')!
    const res = await fetch(`${API_URL}/api/collab/${activeDoc.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: activeDoc.content, title: activeDoc.title }),
    })
    if (res.ok) {
      const updated = await res.json()
      setDocs(d => d.map(doc => doc.id === updated.id ? updated : doc))
      setActiveDoc(updated)
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
      const updated = await res.json()
      setDocs(d => d.map(doc => doc.id === id ? updated : doc))
      if (activeDoc?.id === id) setActiveDoc(updated)
      setTitleEditId(null)
      setStatusMsg({ type: 'success', text: 'Renamed!' })
    } else {
      setStatusMsg({ type: 'error', text: 'Rename failed.' })
    }
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
        Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: shareEmail }),
    })
    if (res.ok) {
      setStatusMsg({ type: 'success', text: 'Shared via email!' })
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
    <div className="flex h-full bg-background text-textPrimary">
      <aside className="w-52 border-r border-border bg-card p-3 space-y-3 overflow-auto text-sm">
        <button onClick={handleNew} className="w-full flex items-center gap-1 px-2 py-2 bg-accent text-white rounded hover:brightness-110 transition text-xs">
          <FiPlus /> New Doc
        </button>

        <div className="font-bold text-sm">Your Docs</div>
        {docs.map(doc => (
          <div
            key={doc.id}
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
              doc.id === activeDoc?.id ? 'bg-accent/20' : 'hover:bg-muted'
            }`}
            onClick={() => setActiveDoc(doc)}
          >
            {titleEditId === doc.id ? (
              <input
                type="text"
                className="flex-1 mr-2 px-1 py-1 text-xs rounded border border-muted bg-background text-textPrimary"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onBlur={() => handleRename(doc.id)}
                autoFocus
              />
            ) : (
              <>
                <span className="flex-1 truncate text-xs">{doc.title}</span>
                <div className="flex gap-1">
                  <FiEdit3 className="cursor-pointer" onClick={() => { setTitleEditId(doc.id); setNewTitle(doc.title) }} size={12} />
                  <FiTrash2 className="cursor-pointer text-red-600" size={12} />
                </div>
              </>
            )}
          </div>
        ))}

        <div className="font-bold text-sm pt-2">Shared with You</div>
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

      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Collab Zone</h1>
          <div className="flex gap-2 items-center">
            <input
              type="email"
              placeholder="email to share with"
              value={shareEmail}
              onChange={e => setShareEmail(e.target.value)}
              className="px-2 py-1 border border-border rounded text-sm"
            />
            <button onClick={shareByEmail} className="px-3 py-2 bg-accent text-white rounded text-sm">
              <FiMail size={14} className="inline mr-1" /> Share
            </button>
            <button onClick={copyLink} className="px-3 py-2 bg-muted text-sm rounded hover:bg-muted/80">
              <FiLink size={14} className="inline mr-1" /> Copy Link
            </button>
            <button onClick={handleSave} className="px-3 py-2 bg-green-600 text-white rounded text-sm">
              <FiSave size={14} className="inline mr-1" /> Save
            </button>
            <button onClick={() => setShowComments(!showComments)} className="px-3 py-2 bg-muted rounded text-sm">
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

        <div className="border border-border rounded-lg bg-card p-2 min-h-[60vh] overflow-y-auto">
          {activeDoc && (
            <Editor
              content={activeDoc.content}
              setContent={(html: string) => setActiveDoc({ ...activeDoc, content: html })}
              docId={activeDoc.id}
              showComments={showComments}
            />
          )}
        </div>
      </main>
    </div>
  )
}
