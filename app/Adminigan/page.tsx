'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@lib/store'
import { ADMIN_EMAILS } from '@lib/auth'
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

const isAdmin = (email: string | undefined | null) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export default function AdminiganPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    if (!user || !isAdmin(user?.email)) {
      router.push('/dashboard')
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/analytics', {
          headers: { 'x-user-email': user?.email || '' },
        })
        const json = await res.json()
        if (res.ok) setData(json)
      } catch (err) {
        console.error('Error loading admin data:', err)
      }
    }

    fetchData()
  }, [user])

  if (!isAdmin(user?.email)) return null

  return (
    <div className="p-6 md:p-10 space-y-10 text-foreground">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">PURSUIT OF EXCELLENCE...</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          Elite admin cockpit for Growfly. Track, grow, refine. Only visible to trusted commanders.
        </p>
      </header>

      {data ? (
        <>
          {/* Primary Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="New Users (30d)" value={data.users.length} />
            <StatCard label="Saved Responses" value={data.savedCount} />
            <StatCard label="Collab Docs" value={data.collabCount} />
            <StatCard label="Feedback Submitted" value={data.feedbackCount} />
          </div>

          {/* Stripe Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Total Revenue (est)" value={`£${data.revenue.totalRevenue}`} />
            <StatCard label="MRR (Personal)" value={`£${data.revenue.mrr.personal.toFixed(2)}`} />
            <StatCard label="MRR (Business)" value={`£${data.revenue.mrr.business.toFixed(2)}`} />
          </div>
          <StatCard label="New Paid Users (This Month)" value={data.revenue.newPaidThisMonth} />

          {/* Weekly Growth Line Chart */}
          <div className="bg-card p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Weekly Growth</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.weeklyStats}>
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
            <div className="bg-card p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Subscription Breakdown</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {data.subscriptionBreakdown.map((item) => (
                  <li key={item.subscriptionType}>
                    <span className="capitalize font-medium text-foreground">
                      {item.subscriptionType}
                    </span>{' '}
                    – {item._count}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">XP Level Distribution</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.xpLevels}>
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
          <div className="bg-card p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Top Users</h2>
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="text-left">Name</th>
                  <th>Email</th>
                  <th>Prompts Used</th>
                  <th>Total XP</th>
                </tr>
              </thead>
              <tbody>
                {data.topUsers.map((u) => (
                  <tr key={u.email} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{u.name || 'Unnamed'}</td>
                    <td>{u.email}</td>
                    <td>{u.promptsUsed}</td>
                    <td>{u.totalXP}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground text-right">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </p>
        </>
      ) : (
        <p className="text-center text-muted-foreground mt-10">Loading admin insights…</p>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4 bg-card rounded-xl border shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}
