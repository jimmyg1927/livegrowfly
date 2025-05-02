// src/components/EditorBubbleMenu.tsx
'use client'

import React from 'react'
import { BubbleMenu, type Editor as TipTapEditor } from '@tiptap/react'
import { Bold, Italic, Underline as UnderlineIcon, Link, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

interface Props {
  editor: TipTapEditor
}

export default function EditorBubbleMenu({ editor }: Props) {
  return (
    <BubbleMenu editor={editor} className="bg-background border rounded shadow p-2 flex gap-2">
      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon size={18} />
      </button>
      <button
        onClick={() => {
          const url = window.prompt('Enter URL')
          if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }}
      >
        <Link size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight size={18} />
      </button>
    </BubbleMenu>
  )
}
