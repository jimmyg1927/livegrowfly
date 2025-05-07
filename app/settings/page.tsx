'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../src/components/Header'

interface UserProfile {
  name?: string
  email: string
  linkedIn?: string
  jobTitle?: string
  industry?: string
  narrative?: string
  subscriptionType?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [form, setForm] = useState({
    name: '',
    linkedIn: '',
    jobTitle: '',
    industry: '',
    narrative: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('growfly_jwt')
    if (!storedToken) {
      router.push('/login')
    } else {
      setToken(storedToken)
    }
  }, [router])

  useEffect(() => {
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((data) => {
        setUser(data)
        setForm({
          name: data.name || '',
          linkedIn: data.linkedIn || '',
          jobTitle: data.jobTitle || '',
          industry: data.industry || '',
          narrative: data.narrative || '',
        })
        setLoading(false)
      })
      .catch(() => router.push('/login'))
  }, [token, router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || res.statusText)
      }
      alert('Profile updated!')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-gray-500">Loading settings…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background text-textPrimary rounded-2xl p-6">
      <Header />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Your Settings</h1>
        <Link
          href="/plans"
          className="text-sm text-accent hover:underline bg-muted px-3 py-1 rounded"
        >
          Change Plan
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            value={user.email}
            readOnly
            disabled
            className="w-full px-4 py-2 rounded border border-muted bg-muted text-muted-foreground"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Plan</label>
          <input
            value={user.subscriptionType || 'free'}
            readOnly
            disabled
            className="w-full px-4 py-2 rounded border border-muted bg-muted text-muted-foreground capitalize"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-card bg-background"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">LinkedIn URL</label>
          <input
            name="linkedIn"
            type="url"
            value={form.linkedIn}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-card bg-background"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Job Title</label>
          <input
            name="jobTitle"
            value={form.jobTitle}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-card bg-background"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Industry</label>
          <input
            name="industry"
            value={form.industry}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-card bg-background"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">About You</label>
          <textarea
            name="narrative"
            rows={4}
            value={form.narrative}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded border border-card bg-background"
          />
        </div>

        <button
          type="submit"
          className="bg-accent text-white px-6 py-2 rounded hover:bg-accent/90 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}
