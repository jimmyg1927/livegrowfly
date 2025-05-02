'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import EditorBubbleMenu from './EditorBubbleMenu'

interface Props {
  content: string
  setContent: (val: string) => void
  onChange?: (val: string) => void // Optional external change handler
}

export default function Editor({ content, setContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate({ editor }) {
      const newContent = editor.getHTML()
      setContent(newContent)
      if (onChange) onChange(newContent)
    },
  })

  return (
    <div className="border rounded-lg">
      {editor && <EditorBubbleMenu editor={editor} />}
      <EditorContent editor={editor} className="min-h-[200px] p-4 outline-none" />
    </div>
  )
}
