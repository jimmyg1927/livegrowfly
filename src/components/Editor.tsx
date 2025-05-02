'use client'

import React from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { FiBold, FiItalic, FiUnderline, FiLink } from 'react-icons/fi'

interface RichEditorProps {
  content: string
  onChange: (newContent: string) => void
}

export default function Editor({ content, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div className="bg-card border border-muted rounded-xl">
      {/* Toolbar */}
      <div className="flex gap-2 p-2 border-b border-muted">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${editor.isActive('bold') ? 'text-accent' : 'text-gray-400'} hover:text-white`}
        >
          <FiBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${editor.isActive('italic') ? 'text-accent' : 'text-gray-400'} hover:text-white`}
        >
          <FiItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${editor.isActive('underline') ? 'text-accent' : 'text-gray-400'} hover:text-white`}
        >
          <FiUnderline />
        </button>
        <button
          onClick={() => {
            const url = prompt('Enter a URL')
            if (url) {
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          <FiLink />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="p-4 min-h-[300px] text-textPrimary" />
    </div>
  )
}
