import React from 'react'

export const metadata = {
  title: 'Growfly — Sign Up',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-300">
      {children}
    </div>
  )
}
