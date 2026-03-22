import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function SettingsPage() {
  const { user, login, token } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [propertyName, setPropertyName] = useState(user?.propertyName || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const res = await api.put('/auth/profile', { fullName, propertyName })
      login(token!, res.data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="font-display text-4xl text-gw-parchment">Settings</h1>

      <div className="bg-gw-card border border-gw-border rounded-lg p-6">
        <h2 className="text-gw-parchment font-sans font-medium mb-6">Profile</h2>

        {success && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded text-green-400 text-sm">
            Settings saved successfully.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-gw-muted text-xs uppercase tracking-wider font-mono block mb-2">
              Full Name
            </label>
            <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-transparent text-gw-parchment outline-none py-2 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-gw-muted text-xs uppercase tracking-wider font-mono block mb-2">
              Property Name
            </label>
            <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
              <input
                type="text"
                value={propertyName}
                onChange={e => setPropertyName(e.target.value)}
                className="w-full bg-transparent text-gw-parchment outline-none py-2 text-sm"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gw-amber text-gw-black px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 rounded"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-gw-card border border-gw-border rounded-lg p-6">
        <h2 className="text-gw-parchment font-sans font-medium mb-2">Account</h2>
        <p className="text-gw-muted text-sm font-mono mb-1">{user?.email}</p>
        <p className="text-gw-muted text-xs">Member since account creation</p>
      </div>
    </div>
  )
}