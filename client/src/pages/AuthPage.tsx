import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { login, register } from '../api/auth'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [propertyName, setPropertyName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let response
      if (isLogin) {
        response = await login(email, password)
      } else {
        response = await register(email, password, fullName, propertyName)
      }
      authLogin(response.token, response.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gw-bg flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gw-black flex-col items-center justify-center p-12 border-r border-gw-border">
        <div className="text-center">
          <h1 className="font-display text-5xl italic text-gw-parchment leading-tight mb-6">
            "A property well-kept is a life well-lived."
          </h1>
          <div className="w-16 h-px bg-gw-amber mx-auto" />
          <p className="mt-6 text-gw-muted font-mono text-sm tracking-widest uppercase">
            Groundwork
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-display text-3xl text-gw-parchment mb-2">
              {isLogin ? 'Welcome back' : 'Start your logbook'}
            </h2>
            <p className="text-gw-muted text-sm">
              {isLogin ? 'Sign in to your property journal' : 'Create your account to begin'}
            </p>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-transparent text-gw-parchment placeholder-gw-muted outline-none py-2 text-sm"
                    required
                  />
                </div>
                <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
                  <input
                    type="text"
                    placeholder="Property name (e.g. Rancho Solano)"
                    value={propertyName}
                    onChange={e => setPropertyName(e.target.value)}
                    className="w-full bg-transparent text-gw-parchment placeholder-gw-muted outline-none py-2 text-sm"
                  />
                </div>
              </>
            )}
            <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-transparent text-gw-parchment placeholder-gw-muted outline-none py-2 text-sm"
                required
              />
            </div>
            <div className="border-b border-gw-border pb-1 focus-within:border-gw-amber transition-colors">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent text-gw-parchment placeholder-gw-muted outline-none py-2 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gw-amber text-gw-black py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <p className="mt-6 text-center text-gw-muted text-sm">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gw-amber hover:underline"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}