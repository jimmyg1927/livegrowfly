'use client'

import React, { useEffect, useState } from 'react'

interface SavedResponse {
  id: string
  title: string
  content: string
}

export default function SavedPage() {
  const [responses, setResponses] = useState<SavedResponse[]>([])
  const [search, setSearch] = useState('')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const jwt = localStorage.getItem('growfly_jwt')
    if (!jwt) return
    setToken(jwt)

    fetch('/api/saved', {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((r) => r.json())
      .then((data) => setResponses(data))
      .catch(() => setResponses([]))
  }, [])

  const updateTitle = async (id: string, newTitle: string) => {
    if (!token) return
    await fetch(`/api/saved/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTitle }),
    })

    setResponses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, title: newTitle } : r))
    )
  }

  const filtered = responses.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-foreground">Saved Responses</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search saved responses…"
        className="w-full border border-border bg-background text-textPrimary rounded-lg px-4 py-2 text-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved responses found.</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-muted p-4 rounded-xl border border-border shadow-sm">
              <input
                type="text"
                defaultValue={r.title}
                onBlur={(e) => updateTitle(r.id, e.target.value)}
                className="w-full text-sm font-medium mb-2 bg-transparent text-foreground focus:outline-none"
              />
              <pre className="text-sm whitespace-pre-wrap text-foreground">{r.content}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
