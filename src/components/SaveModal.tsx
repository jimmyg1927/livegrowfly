'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface SaveModalProps {
  open: boolean
  onClose: () => void
  onSave: (title: string) => void
}

export default function SaveModal({ open, onClose, onSave }: SaveModalProps) {
  const [title, setTitle] = useState('')

  const handleSave = () => {
    if (!title.trim()) return
    onSave(title.trim())
    setTitle('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Name this saved response</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="e.g. Marketing Plan April"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2"
        />
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
