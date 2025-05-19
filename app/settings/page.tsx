'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/constants'

interface UserProfile {
  name?: string
  email: string
  linkedIn?: string
  jobTitle?: string
  industry?: string
  narrative?: string
  subscriptionType?: string
  stripeCustomerId?: string
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
    goals: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState('')

  useEffect(() => {
    const storedToken = localStorage.getItem('growfly_jwt')
    if (!storedToken) router.push('/login')
    else setToken(storedToken)
  }, [router])

  useEffect(() => {
    if (!token) return

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUser(data)
        setForm({
          ...form,
          name: data.name || '',
          linkedIn: data.linkedIn || '',
          jobTitle: data.jobTitle || '',
          industry: data.industry || '',
          narrative: data.narrative || '',
          goals: data.goals || '',
        })
        setLoading(false)
      })
      .catch(() => router.push('/login'))
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })

    if (name === 'password') {
      if (value.length < 8) setPasswordStrength('Weak')
      else if (/\d/.test(value) && /[!@#$%^&*]/.test(value)) setPasswordStrength('Strong')
      else setPasswordStrength('Moderate')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password && form.password !== form.confirmPassword) {
      alert("Passwords do not match.")
      return
    }

    const { confirmPassword, ...body } = form


    const requiredFields = [
      'name', 'jobTitle', 'industry', 'goals'
    ]
    const isComplete = requiredFields.every(field => form[field as keyof typeof form]?.trim())

    try {
      const res = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...body, hasCompletedOnboarding: isComplete }),
      })
      if (!res.ok) throw new Error('Failed to update')
      alert('✅ Profile updated!')
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`)
    }
  }

  const handleBillingPortal = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing-portal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      alert('Could not open billing portal.')
    }
  }

  if (loading || !user) {
    return <div className="text-textPrimary p-10 text-center">Loading your settings...</div>
  }

  return (
    <div className="bg-background text-textPrimary min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Settings</h1>
          <Link href="/dashboard" className="text-sm text-accent hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold">Email (read-only)</label>
            <input type="email" disabled value={user.email} className="w-full bg-muted text-muted-foreground rounded p-2 mt-1" />
          </div>

          <div>
            <label className="block text-sm font-semibold">Plan</label>
            <input type="text" disabled value={user.subscriptionType || 'Free'} className="w-full bg-muted text-muted-foreground rounded p-2 mt-1 capitalize" />
          </div>

          <div>
            <label className="block text-sm font-semibold">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full rounded p-2 bg-card border border-border" />
          </div>

          <div>
            <label className="block text-sm font-semibold">LinkedIn URL</label>
            <input name="linkedIn" value={form.linkedIn} onChange={handleChange} className="w-full rounded p-2 bg-card border border-border" />
          </div>

          <div>
            <label className="block text-sm font-semibold">Job Title</label>
            <input name="jobTitle" value={form.jobTitle} onChange={handleChange} className="w-full rounded p-2 bg-card border border-border" />
          </div>

          <div>
            <label className="block text-sm font-semibold">Industry</label>
            <input name="industry" value={form.industry} onChange={handleChange} className="w-full rounded p-2 bg-card border border-border" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold">About You</label>
            <textarea name="narrative" rows={3} value={form.narrative} onChange={handleChange} className="w-full rounded p-2 bg-card border border-border" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold">What do you aim to get from using Growfly?</label>
            <textarea
              name="goals"
              rows={3}
              placeholder="This allows us to improve our services and responses to our users"
              value={form.goals}
              onChange={handleChange}
              className="w-full rounded p-2 bg-card border border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">New Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded p-2 bg-card border border-border"
            />
            {form.password && <p className="text-xs mt-1 text-muted-foreground">Strength: {passwordStrength}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded p-2 bg-card border border-border"
            />
          </div>

          <div className="md:col-span-2 flex justify-between items-center mt-4">
            <button type="submit" className="bg-accent hover:brightness-110 px-6 py-2 rounded font-semibold text-white transition">
              Save Changes
            </button>
            <button type="button" onClick={handleBillingPortal} className="text-accent hover:underline text-sm">
              Manage Billing via Stripe
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
