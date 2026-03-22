import { useEffect, useState } from 'react'
import { getExpenses, createExpense, updateExpense, deleteExpense, Expense } from '../api/expenses'
import { format, parseISO } from 'date-fns'
import { Plus, Trash2, Pencil } from 'lucide-react'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)

  useEffect(() => { loadExpenses() }, [])

  const loadExpenses = async () => {
    try {
      const data = await getExpenses()
      setExpenses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this expense?')) return
    try {
      await deleteExpense(id)
      setExpenses(expenses.filter(ex => ex.id !== id))
    } catch (err) { console.error(err) }
  }

  const totalThisMonth = expenses
    .filter(e => {
      const d = new Date(e.expenseDate)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, e) => sum + e.amount, 0)

  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gw-amber font-mono text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-gw-parchment">Expenses</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gw-amber text-gw-black px-4 py-2 text-sm font-medium hover:opacity-90 rounded"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gw-card border border-gw-border border-l-2 border-l-gw-amber rounded-lg p-5">
          <p className="text-gw-muted text-xs uppercase tracking-wider font-mono mb-3">This Month</p>
          <p className="font-mono text-2xl font-medium text-gw-amber">
            ${totalThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-gw-card border border-gw-border border-l-2 border-l-gw-amber rounded-lg p-5">
          <p className="text-gw-muted text-xs uppercase tracking-wider font-mono mb-3">All Time</p>
          <p className="font-mono text-2xl font-medium text-gw-parchment">
            ${totalAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="bg-gw-card border border-gw-border rounded-lg p-16 text-center">
          <p className="font-display italic text-gw-muted">No expenses yet. Start tracking your spending.</p>
        </div>
      ) : (
        <div className="bg-gw-card border border-gw-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 px-4 py-2 border-b border-gw-border">
            <span className="text-gw-muted text-xs uppercase tracking-wider font-mono">Date</span>
            <span className="text-gw-muted text-xs uppercase tracking-wider font-mono col-span-2">Description</span>
            <span className="text-gw-muted text-xs uppercase tracking-wider font-mono text-right">Amount</span>
          </div>
          {expenses.map(expense => (
            <div
              key={expense.id}
              className="grid grid-cols-4 px-4 py-3 border-b border-gw-border/50 hover:bg-gw-border/20 transition-colors group items-center"
            >
              <span className="text-gw-muted font-mono text-xs">
                {format(parseISO(expense.expenseDate), 'MMM d')}
              </span>
              <div className="col-span-2 min-w-0">
                <p className="text-gw-parchment text-sm truncate">{expense.description}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gw-border text-gw-muted">
                  {expense.category}
                </span>
              </div>
              <div className="flex items-center justify-end gap-3">
                <span className="text-gw-amber font-mono text-sm font-medium">
                  ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditExpense(expense) }}
                  className="text-gw-muted hover:text-gw-amber transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={(e) => handleDelete(expense.id, e)}
                  className="text-gw-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ExpenseForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadExpenses() }}
        />
      )}

      {editExpense && (
        <ExpenseForm
          expense={editExpense}
          onClose={() => setEditExpense(null)}
          onSaved={() => { setEditExpense(null); loadExpenses() }}
        />
      )}
    </div>
  )
}

function ExpenseForm({ onClose, onSaved, expense }: { onClose: () => void; onSaved: () => void; expense?: Expense }) {
  const [description, setDescription] = useState(expense?.description || '')
  const [amount, setAmount] = useState(expense?.amount?.toString() || '')
  const [category, setCategory] = useState(expense?.category || 'General')
  const [expenseDate, setExpenseDate] = useState(
    expense?.expenseDate ? format(parseISO(expense.expenseDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('description', description)
      formData.append('amount', amount)
      formData.append('category', category)
      formData.append('expenseDate', expenseDate)
      if (expense) {
        await updateExpense(expense.id, formData)
      } else {
        await createExpense(formData)
      }
      onSaved()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save expense')
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
            {expense ? 'Edit Expense' : 'Add Expense'}
          </h3>
          <button onClick={onClose} className="text-gw-muted hover:text-gw-parchment">✕</button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
            <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} className="w-full bg-transparent text-gw-parchment outline-none py-2 text-sm font-mono" required />
          </div>
          <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
            <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-transparent text-gw-parchment placeholder-gw-muted outline-none py-2 text-sm" required />
          </div>
          <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
            <input type="number" placeholder="Amount ($)" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" min="0" className="w-full bg-transparent text-gw-parchment placeholder-gw-muted outline-none py-2 text-sm font-mono" required />
          </div>
          <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-transparent text-gw-parchment outline-none py-2 text-sm">
              {['General','Materials','Tools','Labor','Repairs','Garden','Utilities','Other'].map(c => (
                <option key={c} value={c} className="bg-gw-black">{c}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gw-amber text-gw-black py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 rounded">
            {loading ? 'Saving...' : expense ? 'Update Expense' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}