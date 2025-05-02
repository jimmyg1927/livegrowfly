'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SavedItem {
  id: string
  title: string
  content: string
  createdAt: string
}

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [search, setSearch] = useState('')
  const router = useRouter()

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    fetch('/api/saved', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setSaved(data))
      .catch(() => alert('Failed to load saved responses'))
      .finally(() => setLoading(false))
  }, [token])

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/saved/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (res.ok) {
      setSaved((prev) => prev.filter((item) => item.id !== id))
    } else {
      alert('Failed to delete')
    }
  }

  const handleRename = async (id: string) => {
    const res = await fetch(`/api/saved/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: editedTitle }),
    })

    if (res.ok) {
      setSaved((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, title: editedTitle } : item
        )
      )
      setEditingId(null)
    } else {
      alert('Failed to rename')
    }
  }

  const filtered = saved.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 bg-background text-textPrimary">
      <h1 className="text-2xl font-bold">📁 Saved Responses</h1>

      <input
        type="text"
        placeholder="Search saved titles…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 border rounded bg-card border-muted"
      />

      {loading ? (
        <p>Loading saved responses…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No saved responses found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-muted rounded-xl p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                {editingId === item.id ? (
                  <input
                    className="mb-2 w-full px-3 py-1 rounded border border-muted"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={() => handleRename(item.id)}
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-lg font-semibold cursor-pointer hover:underline"
                    onClick={() => {
                      setEditingId(item.id)
                      setEditedTitle(item.title)
                    }}
                  >
                    {item.title}
                  </h2>
                )}

                <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                  {item.content.slice(0, 200)}…
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(item.id)
                    setEditedTitle(item.title)
                  }}
                  className="text-sm px-3 py-1 rounded bg-accent text-white hover:bg-accent/80 transition"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
