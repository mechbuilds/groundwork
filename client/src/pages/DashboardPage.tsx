import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDashboardStats, DashboardStats } from '../api/reports'
import { format } from 'date-fns'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Wrench, DollarSign, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const chartData = stats?.last30DaysExpenses.reduce((acc: any[], expense) => {
    const date = format(new Date(expense.expenseDate), 'MMM d')
    const existing = acc.find((d: any) => d.date === date)
    if (existing) existing.amount += expense.amount
    else acc.push({ date, amount: expense.amount })
    return acc
  }, []) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gw-amber font-mono text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl text-gw-parchment">
          {user?.propertyName}
        </h1>
        <p className="text-gw-muted font-mono text-sm mt-1">
          {format(new Date(), 'EEEE, MMMM d yyyy')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Entries This Month"
          value={stats?.thisMonth.entriesCount.toString() || '0'}
          icon={<Calendar size={16} />}
        />
        <StatCard
          label="Hours Logged"
          value={stats?.thisMonth.totalHours > 0 ? `${stats?.thisMonth.totalHours.toFixed(1)}h` : '—'}
          icon={<Wrench size={16} />}
        />
        <StatCard
          label="Spent This Month"
          value={`$${(stats?.thisMonth.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={16} />}
          amber
        />
      </div>

      {/* Spending Chart */}
      <div className="bg-gw-card border border-gw-border rounded-lg p-6">
        <h2 className="text-gw-parchment font-sans font-medium mb-4">
          Spending — Last 90 Days
        </h2>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8852A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#C8852A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: '#6B6560', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1C1A17',
                  border: '1px solid #2A2825',
                  borderRadius: 6,
                  color: '#F5F0E8',
                  fontSize: 12
                }}
                formatter={(val: any) => [`$${val.toFixed(2)}`, 'Amount']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#C8852A"
                strokeWidth={1.5}
                fill="url(#amberGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : chartData.length === 1 ? (
          <div className="space-y-3">
            {chartData.map((item: any) => (
              <div key={item.date} className="flex items-center justify-between py-2 border-b border-gw-border/50">
                <span className="text-gw-muted font-mono text-xs">{item.date}</span>
                <span className="text-gw-amber font-mono text-sm">${item.amount.toFixed(2)}</span>
              </div>
            ))}
            <p className="text-gw-muted text-xs font-mono pt-2">
              Add more expenses to see the spending chart.
            </p>
          </div>
        ) : (
          <p className="text-gw-muted font-mono text-sm py-8 text-center">
            No expenses recorded yet.
          </p>
        )}
      </div>

      {/* Recent Entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gw-parchment font-sans font-medium">Recent Entries</h2>
          <button
            onClick={() => navigate('/journal')}
            className="text-gw-amber text-sm font-mono hover:underline"
          >
            View all
          </button>
        </div>
        {!stats?.recentEntries.length ? (
          <div className="bg-gw-card border border-gw-border rounded-lg p-12 text-center">
            <p className="font-display italic text-gw-muted">
              No entries yet. Start logging your work.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats?.recentEntries.map((entry: any) => (
              <div
                key={entry.id}
                onClick={() => navigate('/journal')}
                className="bg-gw-card border border-gw-border rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:border-gw-amber/40 transition-colors"
              >
                <div className="text-gw-amber font-mono text-sm w-20 shrink-0">
                  {format(new Date(entry.entryDate), 'MMM d')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gw-parchment text-sm font-medium truncate">{entry.title}</p>
                  <p className="text-gw-muted text-xs mt-0.5">{entry.category}</p>
                </div>
                <div className="text-gw-muted font-mono text-xs shrink-0">
                  {entry.durationHours > 0 ? `${entry.durationHours}h` : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  amber,
}: {
  label: string
  value: string
  icon: React.ReactNode
  amber?: boolean
}) {
  return (
    <div className="bg-gw-card border border-gw-border border-l-2 border-l-gw-amber rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gw-muted text-xs uppercase tracking-wider font-mono">{label}</span>
        <span className="text-gw-muted">{icon}</span>
      </div>
      <p className={`font-mono text-2xl font-medium ${amber ? 'text-gw-amber' : 'text-gw-parchment'}`}>
        {value}
      </p>
    </div>
  )
}