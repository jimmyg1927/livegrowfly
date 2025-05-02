// File: src/components/editor/Editor.tsx
'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'

// ← Relative import from the same folder
import EditorBubbleMenu from './EditorBubbleMenu'

interface Props {
  content: string
  setContent: (val: string) => void
  onChange?: (val: string) => void
}

export default function Editor({ content, setContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate({ editor }) {
      const html = editor.getHTML()
      setContent(html)
      onChange?.(html)
    },
  })

  if (!editor) return null

  return (
    <div className="relative">
      <EditorBubbleMenu editor={editor} />
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert min-h-[200px] bg-background border border-card rounded-lg p-4"
      />
    </div>
  )
}
