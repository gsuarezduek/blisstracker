import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { useEffect, useState } from 'react'
import api from '../api/client'
import './situation-editor.css'

const COLORS = [
  '#111827', // negro
  '#ef4444', // rojo
  '#f97316', // naranja
  '#eab308', // amarillo
  '#22c55e', // verde
  '#3b82f6', // azul
  '#8b5cf6', // violeta
  '#ec4899', // rosa
  '#6b7280', // gris
]

function ToolBtn({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-2 py-1 text-xs rounded font-medium transition-colors select-none ${
        active
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }) {
  if (!editor) return null
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-600 flex-wrap bg-gray-50 dark:bg-gray-750 rounded-t-xl">
      <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrita">
        <strong>B</strong>
      </ToolBtn>
      <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursiva">
        <em>I</em>
      </ToolBtn>

      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

      <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título">
        H2
      </ToolBtn>
      <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Subtítulo">
        H3
      </ToolBtn>

      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

      <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista con viñetas">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M6 4.75A.75.75 0 016.75 4h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 4.75zM6 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 10zm0 5.25a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM2.5 5.5a1 1 0 100-2 1 1 0 000 2zm0 5.5a1 1 0 100-2 1 1 0 000 2zm0 5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </ToolBtn>
      <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M12 4.75A.75.75 0 0112.75 4h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 0112 4.75zm0 5.5A.75.75 0 0112.75 10h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 0112 10.25zm0 5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM2.68 4.51l.77-.27a.75.75 0 011.02.7v3.3a.75.75 0 01-1.5 0V5.64L2.5 5.72a.75.75 0 01-.5-1.41l.68-.24v.43zm-.44 7.22a.75.75 0 01.58-.72c.5-.11.88-.26 1.12-.44.13-.1.2-.2.23-.3a.75.75 0 011.46.25c-.07.43-.3.78-.62 1.04-.24.19-.52.33-.83.44v.41h1a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5h.21a3.06 3.06 0 01-.71-.5.75.75 0 01-.01-1.18zM2.81 15.75a.75.75 0 01.69-.75 2.7 2.7 0 001.15-.35.75.75 0 01.6 1.37 4.2 4.2 0 01-1.71.48.75.75 0 01-.73-.75z" clipRule="evenodd" />
        </svg>
      </ToolBtn>

      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Color swatches */}
      <div className="flex items-center gap-1">
        {COLORS.map(color => (
          <button
            key={color}
            type="button"
            title={color}
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(color).run() }}
            className="w-4 h-4 rounded-full border border-white dark:border-gray-700 shadow-sm hover:scale-125 transition-transform flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        ))}
        <button
          type="button"
          title="Color por defecto"
          onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetColor().run() }}
          className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 hover:scale-125 transition-transform text-[8px] flex items-center justify-center text-gray-500"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function ProjectSituation({ encodedProjectId, initialContent }) {
  const [content, setContent]   = useState(initialContent || '')
  const [editing, setEditing]   = useState(false)
  const [saving,  setSaving]    = useState(false)
  const [error,   setError]     = useState('')

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color],
    content: initialContent || '',
    editable: false,
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(editing)
    if (editing) setTimeout(() => editor.commands.focus('end'), 0)
  }, [editor, editing])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const html = editor.getHTML()
      await api.patch(`/projects/${encodedProjectId}/situation`, { situation: html })
      setContent(html)
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    editor.commands.setContent(content)
    setEditing(false)
    setError('')
  }

  const isEmpty = !content || content === '<p></p>'

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
          Situación de la Cuenta
        </p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            {isEmpty ? '+ Agregar' : 'Editar'}
          </button>
        )}
      </div>

      {/* Editor (solo visible al editar) */}
      {editing && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden mb-3">
          <Toolbar editor={editor} />
          <EditorContent
            editor={editor}
            className="situation-editor p-3 min-h-[120px] text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
          />
        </div>
      )}

      {/* Vista de solo lectura (visible cuando no edita) */}
      {!editing && !isEmpty && (
        <div
          className="situation-content text-sm text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {!editing && isEmpty && (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">Sin información todavía.</p>
      )}

      {/* Footer de edición */}
      {editing && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={handleCancel}
            className="text-sm px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Cancelar
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}
    </div>
  )
}
