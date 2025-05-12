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

import EditorBubbleMenu from './EditorBubbleMenu'
import { Download, MessageCircleMore, Trash } from 'lucide-react'
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
        Authorization: `Bearer ${token}`,
      },
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

  const handleExportPDF = async () => {
    const editorElement = document.querySelector('.editor-output')
    if (!editorElement) return

    const canvas = await html2canvas(editorElement as HTMLElement)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('growfly-doc.pdf')
  }

  const handleExportDocx = () => {
    const content = document.querySelector('.editor-output')?.innerHTML
    if (!content) return
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${content}</body></html>`,
      ],
      { type: 'application/msword' }
    )
    saveAs(blob, 'growfly-doc.doc')
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 relative">
        {editor && <EditorBubbleMenu editor={editor} />}

        <EditorContent
          editor={editor}
          className="editor-output min-h-[50vh] p-4 overflow-auto bg-background text-textPrimary border rounded"
        />

        {activeRange && (
          <div className="absolute top-2 right-2 z-10 bg-white dark:bg-card shadow p-3 rounded w-72 border space-y-2">
            <textarea
              className="w-full border rounded p-2 text-sm bg-background text-textPrimary"
              placeholder="Add comment on selection"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button
              onClick={addComment}
              className="px-3 py-1 text-sm bg-accent text-white rounded hover:brightness-110"
            >
              Add Comment
            </button>
          </div>
        )}

        <div className="mt-4 flex gap-4">
          <button onClick={handleExportPDF} className="flex items-center gap-1 px-4 py-2 bg-accent text-white rounded hover:brightness-110 transition">
            <Download size={16} /> Export PDF
          </button>
          <button onClick={handleExportDocx} className="flex items-center gap-1 px-4 py-2 bg-accent text-white rounded hover:brightness-110 transition">
            <Download size={16} /> Export Word
          </button>
        </div>
      </div>

      {showComments && (
        <aside className="w-80 border-l pl-4 space-y-3">
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
