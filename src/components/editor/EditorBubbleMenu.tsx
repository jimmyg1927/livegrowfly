'use client'

import React from 'react'
import { BubbleMenu, type Editor as TipTapEditor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'

interface Props {
  editor: TipTapEditor
}

export default function EditorBubbleMenu({ editor }: Props) {
  return (
    <BubbleMenu editor={editor} className="bg-background border rounded shadow p-2 flex gap-2 z-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'text-accent' : ''}
      >
        <Bold size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'text-accent' : ''}
      >
        <Italic size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'text-accent' : ''}
      >
        <UnderlineIcon size={18} />
      </button>

      <button
        onClick={() => {
          const url = window.prompt('Enter URL')
          if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          }
        }}
        className={editor.isActive('link') ? 'text-accent' : ''}
      >
        <Link size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'text-accent' : ''}
      >
        <AlignLeft size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'text-accent' : ''}
      >
        <AlignCenter size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'text-accent' : ''}
      >
        <AlignRight size={18} />
      </button>
    </BubbleMenu>
  )
}
