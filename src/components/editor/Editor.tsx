'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import LinkExtension from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Heading from '@tiptap/extension-heading'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import History from '@tiptap/extension-history'
import {
  Bold,
  Italic,
  Underline as Under,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react'

interface Props {
  content: string
  setContent: (html: string) => void
}

export default function Editor({ content, setContent }: Props) {
  const editor = useEditor({
    extensions: [
      History,
      StarterKit.configure({ heading: false }),
      Underline,
      LinkExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Heading.configure({ levels: [1, 2] }),
      ListItem,
      BulletList,
      OrderedList,
      Blockquote,
      CodeBlock,
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
  })

  if (!editor) return null

  const btn = (
    action: () => void,
    active: boolean,
    child: React.ReactNode
  ) => (
    <button
      type="button"
      onClick={action}
      className={`p-1 rounded ${active ? 'bg-accent/40' : ''}`}
    >
      {child}
    </button>
  )

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-card">
        {btn(
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive('bold'),
          <Bold size={16} />
        )}
        {btn(
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive('italic'),
          <Italic size={16} />
        )}
        {btn(
          () => editor.chain().focus().toggleUnderline().run(),
          editor.isActive('underline'),
          <Under size={16} />
        )}
        {btn(
          () => editor.chain().focus().toggleStrike().run(),
          editor.isActive('strike'),
          <Strikethrough size={16} />
        )}
        {btn(
          () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          editor.isActive('heading', { level: 1 }),
          <span className="font-semibold">H1</span>
        )}
        {btn(
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          editor.isActive('heading', { level: 2 }),
          <span className="font-semibold">H2</span>
        )}
        {btn(
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive('bulletList'),
          <List size={16} />
        )}
        {btn(
          () => editor.chain().focus().toggleOrderedList().run(),
          editor.isActive('orderedList'),
          <ListOrdered size={16} />
        )}
        {btn(
          () => editor.chain().focus().toggleBlockquote().run(),
          editor.isActive('blockquote'),
          <Quote size={16} />
        )}
        {btn(
          () => editor.chain().focus().toggleCodeBlock().run(),
          editor.isActive('codeBlock'),
          <Code size={16} />
        )}
        {btn(
          () => {
            const url = prompt('Enter URL')
            if (url)
              editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: url })
                .run()
          },
          editor.isActive('link'),
          <LinkIcon size={16} />
        )}
        {btn(
          () => editor.chain().focus().setTextAlign('left').run(),
          editor.isActive({ textAlign: 'left' }),
          <AlignLeft size={16} />
        )}
        {btn(
          () => editor.chain().focus().setTextAlign('center').run(),
          editor.isActive({ textAlign: 'center' }),
          <AlignCenter size={16} />
        )}
        {btn(
          () => editor.chain().focus().setTextAlign('right').run(),
          editor.isActive({ textAlign: 'right' }),
          <AlignRight size={16} />
        )}
        {btn(
          () => editor.chain().focus().setTextAlign('justify').run(),
          editor.isActive({ textAlign: 'justify' }),
          <AlignJustify size={16} />
        )}
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="min-h-[300px] p-4 overflow-auto"
      />
    </div>
  )
}
