'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'

// ✅ Correct path based on your project structure
import EditorBubbleMenu from '../../components/EditorBubbleMenu'

interface Props {
  content: string
  setContent: (val: string) => void
}

export default function Editor({ content, setContent }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
  })

  return (
    <div className="w-full bg-background border border-border rounded-lg p-4 shadow-sm">
      {editor && <EditorBubbleMenu editor={editor} />}
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert min-h-[300px] max-w-none focus:outline-none"
      />
    </div>
  )
}
