import { useEffect, useState } from 'react'
import { getEntries, deleteEntry, createEntry, updateEntry, LogEntry } from '../api/entries'
import { format, parseISO } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'

export default function JournalPage() {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null)
  const [editEntry, setEditEntry] = useState<LogEntry | null>(null)

  useEffect(() => { loadEntries() }, [])

  const loadEntries = async () => {
    try {
      const data = await getEntries()
      setEntries(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this entry?')) return
    try {
      await deleteEntry(id)
      setEntries(entries.filter(en => en.id !== id))
      if (selectedEntry?.id === id) setSelectedEntry(null)
    } catch (err) { console.error(err) }
  }

  const grouped = entries.reduce((acc: Record<string, LogEntry[]>, entry) => {
    const key = format(parseISO(entry.entryDate), 'MMMM yyyy')
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gw-amber font-mono text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-gw-parchment">Journal</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gw-amber text-gw-black px-4 py-2 text-sm font-medium hover:opacity-90 rounded">
          <Plus size={16} /> New Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="bg-gw-card border border-gw-border rounded-lg p-16 text-center">
          <p className="font-display italic text-gw-muted">Nothing here yet. Start logging your work.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([month, monthEntries]) => (
          <div key={month}>
            <div className="mb-4">
              <h2 className="font-display text-4xl italic text-gw-parchment">{month}</h2>
              <hr className="border-gw-border mt-2" />
            </div>
            <div className="space-y-2">
              {monthEntries.map(entry => (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="bg-gw-card border border-gw-border rounded-lg p-4 flex items-center gap-4 hover:border-gw-amber/40 transition-colors group cursor-pointer"
                >
                  <div className="text-gw-amber font-mono text-sm w-16 shrink-0">
                    {format(parseISO(entry.entryDate), 'MMM d')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gw-parchment text-sm font-medium truncate">{entry.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gw-border text-gw-muted">{entry.category}</span>
                      <span className="text-gw-muted text-xs font-mono">
                        {entry.durationHours > 0 ? `${entry.durationHours}h` : '—'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(entry.id, e)}
                    className="text-gw-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Entry Detail Drawer */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedEntry(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-gw-black border-l border-gw-border p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="text-gw-amber font-mono text-sm">
                {format(parseISO(selectedEntry.entryDate), 'MMMM d, yyyy')}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setEditEntry(selectedEntry); setSelectedEntry(null) }}
                  className="text-gw-amber text-xs font-mono hover:underline"
                >
                  Edit
                </button>
                <button onClick={() => setSelectedEntry(null)} className="text-gw-muted hover:text-gw-parchment">✕</button>
              </div>
            </div>
            <h2 className="font-display text-3xl text-gw-parchment mb-2">{selectedEntry.title}</h2>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gw-border text-gw-muted">{selectedEntry.category}</span>
              <span className="text-gw-muted text-xs font-mono">
                {selectedEntry.durationHours > 0 ? `${selectedEntry.durationHours}h` : '—'}
              </span>
            </div>
            <p className="text-gw-parchment text-sm leading-relaxed whitespace-pre-wrap">
              {selectedEntry.description || 'No description provided.'}
            </p>
          </div>
        </div>
      )}

      {/* New Entry Form Drawer */}
      {showForm && (
        <EntryForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadEntries() }}
        />
      )}

      {/* Edit Entry Form Drawer */}
      {editEntry && (
        <EntryForm
          entry={editEntry}
          onClose={() => setEditEntry(null)}
          onSaved={() => { setEditEntry(null); loadEntries() }}
        />
      )}
    </div>
  )
}

function EntryForm({ onClose, onSaved, entry }: { onClose: () => void; onSaved: () => void; entry?: LogEntry }) {
  const [title, setTitle] = useState(entry?.title || '')
  const [description, setDescription] = useState(entry?.description || '')
  const [category, setCategory] = useState(entry?.category || 'General')
  const [durationHours, setDurationHours] = useState(entry?.durationHours?.toString() || '')
  const [entryDate, setEntryDate] = useState(
    entry?.entryDate ? format(parseISO(entry.entryDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('durationHours', durationHours)
      formData.append('entryDate', entryDate)
      if (entry) {
        await updateEntry(entry.id, formData)
      } else {
        await createEntry(formData)
      }
      onSaved()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gw-black border-l border-gw-border p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-gw-parchment">
            {entry ? 'Edit Entry' : 'New Entry'}
          </h3>
          <button onClick={onClose} className="text-gw-muted hover:text-gw-parchment">✕</button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
            <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} className="w-full bg-transparent text-gw-parchment outline-none py-2 text-sm font-mono" required />
          </div>
          <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-transparent text-gw-parchment placeholder-gw-muted outline-none py-2 text-sm" required />
          </div>
          <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-transparent text-gw-parchment outline-none py-2 text-sm">
              {['General','Maintenance','Landscaping','Repairs','Garden','Orchard','Electrical','Plumbing'].map(c => (
                <option key={c} value={c} className="bg-gw-black">{c}</option>
              ))}
            </select>
          </div>
          <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
            <input type="number" placeholder="Duration (hours)" value={durationHours} onChange={e => setDurationHours(e.target.value)} step="0.5" min="0" className="w-full bg-transparent text-gw-parchment placeholder-gw-muted outline-none py-2 text-sm font-mono" />
          </div>
          <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
            <textarea placeholder="What did you do today?" value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full bg-transparent text-gw-parchment placeholder-gw-muted outline-none py-2 text-sm resize-none" />
            <div className="text-right text-gw-muted font-mono text-xs mt-1">{description.length} chars</div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gw-amber text-gw-black py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 rounded">
            {loading ? 'Saving...' : entry ? 'Update Entry' : 'Save Entry'}
          </button>
        </form>
      </div>
    </div>
  )
}