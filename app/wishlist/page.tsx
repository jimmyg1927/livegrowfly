'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThumbsUp, ThumbsDown, Plus, Lightbulb, TrendingUp, Users, Search, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE_URL } from '@lib/constants'

interface WishlistItem {
  id: string
  title: string
  subtitle?: string
  body: string
  positiveVotes: number
  negativeVotes: number
  userVote: 'none' | 'positive' | 'negative'
}

export default function WishlistPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', subtitle: '', body: '' })
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes')
  const [showForm, setShowForm] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  useEffect(() => {
    if (!token) router.push('/login')
  }, [token, router])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const data: WishlistItem[] = await res.json()
      data.sort((a, b) => b.positiveVotes - a.positiveVotes)
      setItems(data)
    } catch {
      alert('Failed to load wishlist.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchItems()
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { title, body } = form
    if (!title.trim() || !body.trim() || !token) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setForm({ title: '', subtitle: '', body: '' })
      setShowForm(false)
      setJustSubmitted(true)
      setTimeout(() => setJustSubmitted(false), 3000)
      fetchItems()
    } catch {
      alert('Failed to submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (id: string, vote: 'positive' | 'negative') => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vote }),
      })
      if (!res.ok) throw new Error()
      fetchItems()
    } catch {
      alert('Could not register vote.')
    }
  }

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.body.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'votes') {
      return b.positiveVotes - a.positiveVotes
    }
    return 0 // Would sort by date if we had timestamps
  })

  const getPopularityBadge = (votes: number) => {
    if (votes >= 10) return { label: 'Hot', color: 'bg-red-500' }
    if (votes >= 5) return { label: 'Popular', color: 'bg-orange-500' }
    if (votes >= 2) return { label: 'Rising', color: 'bg-blue-500' }
    return { label: 'New', color: 'bg-green-500' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🎯 Feature Wishlist
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Help shape the future of Growfly! Suggest features, vote on ideas, and see what&apos;s coming next.
            </p>
          </motion.div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {justSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-green-500 text-white p-4 rounded-xl text-center font-medium"
            >
              🎉 Your feature suggestion has been added! Thank you for helping improve Growfly.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search feature requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'votes' | 'recent')}
              className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="votes">Most Voted</option>
              <option value="recent">Most Recent</option>
            </select>
            
            <motion.button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Suggest Feature
            </motion.button>
          </div>
        </div>

        {/* Feature Suggestion Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Suggest a New Feature</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Feature Title *
                    </label>
                    <input
                      name="title"
                      placeholder="e.g., Real-time collaboration in documents"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subtitle (Optional)
                    </label>
                    <input
                      name="subtitle"
                      placeholder="Brief context or category"
                      value={form.subtitle}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      name="body"
                      placeholder="Describe your feature idea in detail. What problem does it solve? How would it work?"
                      value={form.body}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {submitting ? 'Adding...' : 'Add to Wishlist'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Ideas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {items.reduce((sum, item) => sum + item.positiveVotes, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Votes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {items.filter(item => item.positiveVotes >= 5).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Popular Ideas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-slate-600 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded mb-2 w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-full"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-slate-600 rounded-full"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-20 bg-gray-200 dark:bg-slate-600 rounded-full"></div>
                  <div className="h-8 w-20 bg-gray-200 dark:bg-slate-600 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
              <Lightbulb className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No features found' : 'No feature requests yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or browse all features.'
                : 'Be the first to suggest a feature that will improve Growfly for everyone!'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Suggest First Feature
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sortedItems.map((item, index) => {
              const badge = getPopularityBadge(item.positiveVotes)
              const totalVotes = item.positiveVotes + item.negativeVotes
              const positiveRatio = totalVotes > 0 ? (item.positiveVotes / totalVotes) * 100 : 0
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-lg group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      
                      {item.subtitle && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                          {item.subtitle}
                        </p>
                      )}
                      
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </div>

                  {/* Vote Progress Bar */}
                  {totalVotes > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Community Sentiment</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(positiveRatio)}% positive
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${positiveRatio}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => handleVote(item.id, 'positive')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                          item.userVote === 'positive'
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-slate-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{item.positiveVotes}</span>
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleVote(item.id, 'negative')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                          item.userVote === 'negative'
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>{item.negativeVotes}</span>
                      </motion.button>
                    </div>
                    
                    {totalVotes > 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}