import React from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import FeedbackForm from '@/components/FeedbackForm'

export default function FeedbackPage() {
  return (
    <div className="flex h-screen bg-background text-textPrimary">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header name="Growfly User" /> {/* ✅ Fix: added name prop */}
        <main className="flex-1 overflow-y-auto p-6">
          <FeedbackForm onCreated={() => {}} />
        </main>
      </div>
    </div>
  )
}
