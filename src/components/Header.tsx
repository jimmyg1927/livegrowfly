'use client'

import React from 'react'
import { FaUserCircle } from 'react-icons/fa'
import ThemeToggle from './ThemeToggle'

type HeaderProps = {
  name: string
}

export default function Header({ name }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="text-lg font-semibold text-textPrimary">
        Welcome, {name}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <FaUserCircle className="text-2xl text-textSecondary" />
      </div>
    </header>
  )
}
