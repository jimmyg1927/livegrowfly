'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@lib/store'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

const ADMIN_EMAILS = ['teddy@growfly.io', 'jimmy@growfly.io']

const isAdmin = (email: string | undefined | null) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

type AnalyticsData = {
  users: any[]
  feedbackCount: number
  savedCount: number
  collabCount: number
  subscriptionBreakdown: { subscriptionType: string; _count: number }[]
  weeklyStats: { week: string; newUsers: number; promptsUsed: number }[]
  xpLevels: { level: string; count: number }[]
  topUsers: { name: string; email: string; promptsUsed: number; totalXP: number }[]
  revenue: {
    totalRevenue: string
    mrr: { personal: number; business: number }
    newPaidThisMonth: number
  }
  timestamp: string
}

type ContactMessage = {
  id: string
  name: string | null
  email: string
  company: string | null
  message: string
  createdAt: string
}

export default function AdminiganPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [messages, setMessages] = useState<ContactMessage[]>([])

  useEffect(() => {
    if (!user || !isAdmin(user?.email)) {
      router.push('/dashboard')
      return
    }

    const fetchData = async () => {
      try {
        const [aRes, cRes] = await Promise.all([
          fetch('/api/admin/analytics', {
            headers: { 'x-user-email': user?.email || '' },
          }),
          fetch('/api/contact'),
        ])
        const analyticsData = await aRes.json()
        const contactData = await cRes.json()
        setAnalytics(analyticsData)
        setMessages(contactData)
      } catch (err) {
        console.error('Error loading admin data:', err)
      }
    }

    fetchData()
  }, [user])

  if (!user || !isAdmin(user?.email)) {
    return <p className="text-center mt-20 text-textPrimary">Checking access…</p>
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#030712] to-[#1e3a8a] text-textPrimary px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-12">

        <div className="text-center">
          <h1 className="text-4xl font-bold">👨‍✈️ Growfly Command Center</h1>
          <p className="text-blue-200 text-sm mt-2 max-w-2xl mx-auto">
            Review performance, feedback, and high-value leads in real-time.
          </p>
        </div>

        {analytics ? (
          <>
            {/* Primary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="New Users (30d)" value={analytics.users.length} />
              <StatCard label="Saved Responses" value={analytics.savedCount} />
              <StatCard label="Collab Docs" value={analytics.collabCount} />
              <StatCard label="Feedback Submitted" value={analytics.feedbackCount} />
            </div>

            {/* Stripe Revenue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Total Revenue (est)" value={`£${analytics.revenue.totalRevenue}`} />
              <StatCard label="MRR (Personal)" value={`£${analytics.revenue.mrr.personal.toFixed(2)}`} />
              <StatCard label="MRR (Business)" value={`£${analytics.revenue.mrr.business.toFixed(2)}`} />
            </div>
            <StatCard label="New Paid Users (This Month)" value={analytics.revenue.newPaidThisMonth} />

            {/* Weekly Growth Line Chart */}
            <div className="bg-white text-textPrimary rounded-2xl shadow p-6 border">
              <h2 className="text-lg font-semibold mb-4 text-[#1992FF]">📊 Weekly Growth</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" name="New Users" />
                  <Line type="monotone" dataKey="promptsUsed" stroke="#10b981" name="Prompts Used" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white text-textPrimary rounded-2xl shadow p-6 border">
                <h2 className="text-lg font-semibold mb-4 text-[#1992FF]">📦 Subscription Breakdown</h2>
                <ul className="space-y-2 text-sm">
                  {analytics.subscriptionBreakdown.map((item) => (
                    <li key={item.subscriptionType}>
                      <span className="capitalize font-medium">{item.subscriptionType}</span>{' '}
                      – {item._count}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white text-textPrimary rounded-2xl shadow p-6 border">
                <h2 className="text-lg font-semibold mb-4 text-[#1992FF]">📈 XP Level Distribution</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.xpLevels}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-white text-textPrimary rounded-2xl shadow p-6 border">
              <h2 className="text-lg font-semibold mb-4 text-[#1992FF]">🏆 Top Users</h2>
              <table className="w-full text-sm">
                <thead className="text-gray-600">
                  <tr>
                    <th className="text-left">Name</th>
                    <th>Email</th>
                    <th>Prompts Used</th>
                    <th>Total XP</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topUsers.map((u) => (
                    <tr key={u.email} className="border-t border-gray-200">
                      <td className="py-2 font-medium">{u.name || 'Unnamed'}</td>
                      <td>{u.email}</td>
                      <td>{u.promptsUsed}</td>
                      <td>{u.totalXP}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Contact Messages */}
            <div className="bg-white text-textPrimary rounded-2xl shadow p-6 border">
              <h2 className="text-lg font-semibold mb-4 text-[#1992FF]">📩 Contact Form Submissions</h2>
              {messages.length === 0 ? (
                <p className="text-gray-500 text-sm">No contact form messages yet.</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white transition"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-bold text-[#1992FF]">{m.name || 'No name provided'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(m.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Email:</span> {m.email}
                      </p>
                      {m.company && (
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Company:</span> {m.company}
                        </p>
                      )}
                      <p className="text-sm mt-2 whitespace-pre-wrap">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-blue-200 text-right">
              Last updated: {new Date(analytics.timestamp).toLocaleString()}
            </p>
          </>
        ) : (
          <p className="text-center text-textPrimary mt-10">Loading admin data…</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4 bg-white text-textPrimary rounded-xl border shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
