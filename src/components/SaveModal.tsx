// src/components/SaveModal.tsx
'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export interface SaveModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (title: string) => Promise<void> // ✅ THIS LINE WAS MISSING
}

export default function SaveModal({ open, onClose, onConfirm }: SaveModalProps) {
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!open) setTitle('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border border-border text-textPrimary">
        <DialogHeader>
          <DialogTitle>Name this response</DialogTitle>
          <DialogDescription>Enter a name so you can find this saved response later.</DialogDescription>
        </DialogHeader>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Instagram Growth Plan"
        />
        <Button
          onClick={() => {
            if (title.trim()) onConfirm(title.trim())
          }}
          className="w-full"
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  )
}
