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
  Download,
} from 'lucide-react'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

interface Props {
  content: string
  setContent: (html: string) => void
}

export default function Editor({ content, setContent }: Props) {
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
      className={`p-1 rounded hover:bg-muted transition ${active ? 'bg-accent/40' : ''}`}
    >
      {child}
    </button>
  )

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
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-card rounded-t">
        {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), <Bold size={16} />)}
        {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), <Italic size={16} />)}
        {btn(() => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), <Under size={16} />)}
        {btn(() => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'), <Strikethrough size={16} />)}
        {btn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }), <span className="font-semibold">H1</span>)}
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), <span className="font-semibold">H2</span>)}
        {btn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), <List size={16} />)}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), <ListOrdered size={16} />)}
        {btn(() => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), <Quote size={16} />)}
        {btn(() => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'), <Code size={16} />)}
        {btn(() => {
          const url = prompt('Enter URL')
          if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }, editor.isActive('link'), <LinkIcon size={16} />)}
        {btn(() => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }), <AlignLeft size={16} />)}
        {btn(() => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }), <AlignCenter size={16} />)}
        {btn(() => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }), <AlignRight size={16} />)}
        {btn(() => editor.chain().focus().setTextAlign('justify').run(), editor.isActive({ textAlign: 'justify' }), <AlignJustify size={16} />)}
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="editor-output min-h-[50vh] p-4 overflow-auto bg-background text-textPrimary rounded-b"
      />

      {/* Export buttons */}
      <div className="mt-4 flex gap-4">
        <button onClick={handleExportPDF} className="flex items-center gap-1 px-4 py-2 bg-accent text-white rounded hover:brightness-110 transition">
          <Download size={16} /> Export as PDF
        </button>
        <button onClick={handleExportDocx} className="flex items-center gap-1 px-4 py-2 bg-accent text-white rounded hover:brightness-110 transition">
          <Download size={16} /> Export as Word
        </button>
      </div>
    </div>
  )
}
