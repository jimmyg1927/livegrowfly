'use client'

import React, { useEffect, useState } from 'react'
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

import {
  Bold, Italic, Underline as Under, Strikethrough, List, ListOrdered, Quote, Code,
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Download, MessageCircleMore, Trash
} from 'lucide-react'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Props {
  content: string
  setContent: (html: string) => void
  docId: string | null
  showComments: boolean
}

interface Comment {
  id: string
  text: string
  from: number
  to: number
  resolved: boolean
}

export default function Editor({ content, setContent, docId, showComments }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [activeRange, setActiveRange] = useState<{ from: number; to: number } | null>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('growfly_jwt') : null

  const editor = useEditor({
    extensions: [
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
    onSelectionUpdate: ({ editor }) => {
      const { from, to, empty } = editor.state.selection
      if (!empty && from !== to) {
        setActiveRange({ from, to })
      } else {
        setActiveRange(null)
      }
    },
  })

  useEffect(() => {
    if (!docId || !token) return
    fetch(`${API_URL}/api/comments/${docId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setComments)
      .catch(() => setComments([]))
  }, [docId])

  const addComment = async () => {
    if (!editor || !docId || !activeRange || !newComment.trim()) return

    const res = await fetch(`${API_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        docId,
        text: newComment,
        from: activeRange.from,
        to: activeRange.to,
      }),
    })

    const created = await res.json()
    setComments(prev => [...prev, created])
    setNewComment('')
    setActiveRange(null)
  }

  const resolveComment = async (id: string) => {
    await fetch(`${API_URL}/api/comments/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
    setComments(prev => prev.map(c => (c.id === id ? { ...c, resolved: true } : c)))
  }

  const deleteComment = async (id: string) => {
    await fetch(`${API_URL}/api/comments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setComments(prev => prev.filter(c => c.id !== id))
  }

  const exportPDF = async () => {
    const editorEl = document.querySelector('.editor-output')
    if (!editorEl) return
    const canvas = await html2canvas(editorEl as HTMLElement)
    const img = canvas.toDataURL('image/png')
    const pdf = new jsPDF()
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('growfly-doc.pdf')
  }

  const exportDocx = () => {
    const html = document.querySelector('.editor-output')?.innerHTML || ''
    const blob = new Blob([html], { type: 'application/msword' })
    saveAs(blob, 'growfly-doc.doc')
  }

  const toolbarBtn = (action: () => void, active: boolean, icon: React.ReactNode) => (
    <button onClick={action} className={`p-1 rounded ${active ? 'bg-accent/40' : ''}`}>
      {icon}
    </button>
  )

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        {editor && (
          <div className="flex flex-wrap gap-1 p-2 border-b bg-card mb-2 rounded">
            {toolbarBtn(() => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), <Bold size={16} />)}
            {toolbarBtn(() => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), <Italic size={16} />)}
            {toolbarBtn(() => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), <Under size={16} />)}
            {toolbarBtn(() => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'), <Strikethrough size={16} />)}
            {toolbarBtn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }), <span className="font-semibold">H1</span>)}
            {toolbarBtn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), <span className="font-semibold">H2</span>)}
            {toolbarBtn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), <List size={16} />)}
            {toolbarBtn(() => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), <ListOrdered size={16} />)}
            {toolbarBtn(() => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), <Quote size={16} />)}
            {toolbarBtn(() => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'), <Code size={16} />)}
            {toolbarBtn(() => {
              const url = prompt('Enter URL')
              if (url) editor.chain().focus().setLink({ href: url }).run()
            }, editor.isActive('link'), <LinkIcon size={16} />)}
            {toolbarBtn(() => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }), <AlignLeft size={16} />)}
            {toolbarBtn(() => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }), <AlignCenter size={16} />)}
            {toolbarBtn(() => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }), <AlignRight size={16} />)}
            {toolbarBtn(() => editor.chain().focus().setTextAlign('justify').run(), editor.isActive({ textAlign: 'justify' }), <AlignJustify size={16} />)}
          </div>
        )}

        {!activeRange && (
          <p className="text-sm text-muted-foreground mt-2">
            💬 Select some text to add a comment.
          </p>
        )}

        {editor && (
          <EditorContent
            key={docId}
            editor={editor}
            className="editor-output min-h-[55vh] p-4 overflow-auto border rounded bg-background text-textPrimary"
          />
        )}

        {activeRange && (
          <div className="mt-3 bg-muted border rounded p-3">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="w-full p-2 rounded border text-sm mb-2"
              placeholder="Add comment on selection..."
            />
            <button
              onClick={addComment}
              className="px-3 py-1 text-sm bg-accent text-white rounded hover:brightness-110"
            >
              Comment
            </button>
          </div>
        )}

        <div className="mt-4 flex gap-4">
          <button onClick={exportPDF} className="flex items-center gap-1 px-4 py-2 bg-accent text-white rounded hover:brightness-110">
            <Download size={16} /> Export PDF
          </button>
          <button onClick={exportDocx} className="flex items-center gap-1 px-4 py-2 bg-accent text-white rounded hover:brightness-110">
            <Download size={16} /> Export Word
          </button>
        </div>
      </div>

      {showComments && (
        <aside className="w-80 pl-4 border-l space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-1">
            <MessageCircleMore size={18} /> Comments
          </h2>
          {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
          {comments.map(c => (
            <div key={c.id} className={`border rounded p-2 ${c.resolved ? 'opacity-60 line-through' : ''}`}>
              <p className="text-sm">{c.text}</p>
              <div className="flex gap-2 mt-2">
                {!c.resolved && (
                  <button onClick={() => resolveComment(c.id)} className="text-green-600 text-xs">Resolve</button>
                )}
                <button onClick={() => deleteComment(c.id)} className="text-red-600 text-xs">
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))}
        </aside>
      )}
    </div>
  )
}