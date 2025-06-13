// src/components/SaveModal.tsx
'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export interface SaveModalProps {
  open: boolean
  onClose: () => void
  messageId: string
  onSaveResponse: (title: string, messageId: string) => Promise<any>
  onSaveToCollabZone: (title: string, messageId: string) => Promise<any>
}

export default function SaveModal({ 
  open, 
  onClose, 
  messageId, 
  onSaveResponse, 
  onSaveToCollabZone 
}: SaveModalProps) {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [saveType, setSaveType] = useState<'response' | 'collab'>('response')

  useEffect(() => {
    if (!open) {
      setTitle('')
      setSaveType('response')
    }
  }, [open])

  const handleSave = async () => {
    if (!title.trim()) return
    
    setIsLoading(true)
    try {
      if (saveType === 'response') {
        await onSaveResponse(title.trim(), messageId)
      } else {
        await onSaveToCollabZone(title.trim(), messageId)
      }
      onClose()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border border-border text-textPrimary">
        <DialogHeader>
          <DialogTitle>Save this response</DialogTitle>
          <DialogDescription>
            Choose where to save this response and give it a name.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Save to:</label>
            <div className="flex gap-2">
              <Button
                variant={saveType === 'response' ? 'default' : 'outline'}
                onClick={() => setSaveType('response')}
                className="flex-1"
              >
                📝 Saved Responses
              </Button>
              <Button
                variant={saveType === 'collab' ? 'default' : 'outline'}
                onClick={() => setSaveType('collab')}
                className="flex-1"
              >
                🤝 Collab Zone
              </Button>
            </div>
          </div>
          
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Instagram Growth Plan"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && title.trim()) {
                handleSave()
              }
            }}
          />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={!title.trim() || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}