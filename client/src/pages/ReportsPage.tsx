import { useEffect, useState } from 'react'
import { getMonthlyReport, MonthlyReport } from '../api/reports'
import { format } from 'date-fns'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const COLORS = ['#C8852A', '#6B6560', '#F5F0E8', '#1A2E1E', '#2A2825']

export default function ReportsPage() {
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadReport()
  }, [month, year])

  const loadReport = async () => {
    setLoading(true)
    try {
      const data = await getMonthlyReport(month, year)
      setReport(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy')

  return (
    <div className="space-y-8">
      {/* Month Selector */}
      <div className="flex items-center gap-4">
        <button onClick={prevMonth} className="text-gw-muted hover:text-gw-parchment transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-4xl italic text-gw-parchment">{monthLabel}</h1>
        <button onClick={nextMonth} className="text-gw-muted hover:text-gw-parchment transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gw-amber font-mono text-sm">Loading...</div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gw-card border border-gw-border border-l-2 border-l-gw-amber rounded-lg p-5">
              <p className="text-gw-muted text-xs uppercase tracking-wider font-mono mb-3">Total Hours</p>
              <p className="font-mono text-2xl font-medium text-gw-parchment">{report?.totalHours.toFixed(1)}h</p>
            </div>
            <div className="bg-gw-card border border-gw-border border-l-2 border-l-gw-amber rounded-lg p-5">
              <p className="text-gw-muted text-xs uppercase tracking-wider font-mono mb-3">Total Spent</p>
              <p className="font-mono text-2xl font-medium text-gw-amber">
                ${report?.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-gw-card border border-gw-border border-l-2 border-l-gw-amber rounded-lg p-5">
              <p className="text-gw-muted text-xs uppercase tracking-wider font-mono mb-3">Entries</p>
              <p className="font-mono text-2xl font-medium text-gw-parchment">{report?.entriesCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Work by Category */}
            <div className="bg-gw-card border border-gw-border rounded-lg p-6">
              <h2 className="text-gw-parchment font-sans font-medium mb-4">Work by Category</h2>
              {report?.byCategory.length === 0 ? (
                <p className="text-gw-muted font-mono text-sm">No entries this month.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={report?.byCategory} dataKey="hours" nameKey="category" cx="50%" cy="50%" outerRadius={70}>
                        {report?.byCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1C1A17', border: '1px solid #2A2825', borderRadius: 6, color: '#F5F0E8', fontSize: 12 }}
                        formatter={(val: any) => [`${val}h`, 'Hours']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {report?.byCategory.map((cat, i) => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-gw-parchment text-sm">{cat.category}</span>
                        </div>
                        <span className="text-gw-muted font-mono text-xs">{cat.hours}h ({cat.count} entries)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Expenses by Category */}
            <div className="bg-gw-card border border-gw-border rounded-lg p-6">
              <h2 className="text-gw-parchment font-sans font-medium mb-4">Expenses by Category</h2>
              {report?.expensesByCategory.length === 0 ? (
                <p className="text-gw-muted font-mono text-sm">No expenses this month.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={report?.expensesByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={70}>
                        {report?.expensesByCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1C1A17', border: '1px solid #2A2825', borderRadius: 6, color: '#F5F0E8', fontSize: 12 }}
                        formatter={(val: any) => [`$${val.toFixed(2)}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {report?.expensesByCategory.map((cat, i) => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-gw-parchment text-sm">{cat.category}</span>
                        </div>
                        <span className="text-gw-amber font-mono text-xs">${cat.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Work Log */}
          <div className="bg-gw-card border border-gw-border rounded-lg p-6">
            <h2 className="text-gw-parchment font-sans font-medium mb-4">Work Log</h2>
            {report?.entries.length === 0 ? (
              <p className="text-gw-muted font-mono text-sm">No entries this month.</p>
            ) : (
              <div className="space-y-2">
                {report?.entries.map((entry: any) => (
                  <div key={entry.id} className="flex items-center gap-4 py-2 border-b border-gw-border/50">
                    <span className="text-gw-amber font-mono text-xs w-16 shrink-0">
                      {format(new Date(entry.entryDate), 'MMM d')}
                    </span>
                    <span className="text-gw-parchment text-sm flex-1">{entry.title}</span>
                    <span className="text-gw-muted font-mono text-xs">{entry.durationHours}h</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense Log */}
          <div className="bg-gw-card border border-gw-border rounded-lg p-6">
            <h2 className="text-gw-parchment font-sans font-medium mb-4">Expense Log</h2>
            {report?.expenses.length === 0 ? (
              <p className="text-gw-muted font-mono text-sm">No expenses this month.</p>
            ) : (
              <div className="space-y-2">
                {report?.expenses.map((expense: any) => (
                  <div key={expense.id} className="flex items-center gap-4 py-2 border-b border-gw-border/50">
                    <span className="text-gw-amber font-mono text-xs w-16 shrink-0">
                      {format(new Date(expense.expenseDate), 'MMM d')}
                    </span>
                    <span className="text-gw-parchment text-sm flex-1">{expense.description}</span>
                    <span className="text-gw-amber font-mono text-xs">${expense.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}