import React from 'react'
import { AlertOctagon, RefreshCw, Home } from 'lucide-react'
import { logError } from '../services/errorLogger'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    logError(error, `ErrorBoundary: ${errorInfo?.componentStack || ''}`)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-base text-white flex items-center justify-center px-6 py-12 font-ui">
          <div className="max-w-md w-full text-center space-y-6 bg-surface-card border border-white/5 p-8 rounded-2xl shadow-glow">
            <div className="inline-flex p-4 bg-brand/10 text-brand rounded-full border border-brand/20">
              <AlertOctagon className="h-10 w-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-white tracking-wide">
                Something went wrong
              </h1>
              <p className="text-sm text-gray-400">
                We encountered an unexpected issue. Please try again.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="text-left text-xs bg-surface-chrome p-3.5 rounded-xl border border-white/5 text-red-200 font-mono break-words max-h-40 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.reset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand/95 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(192,57,43,0.3)] active:scale-95 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-chrome border border-white/10 hover:border-white/20 hover:bg-white/5 text-white text-sm font-semibold rounded-lg transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <Home className="h-4 w-4" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

