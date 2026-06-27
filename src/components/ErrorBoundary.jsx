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
          <div className="min-h-screen bg-background-base text-white flex flex-col items-center justify-center px-6 py-12 font-ui relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-lg w-full text-center space-y-8 bg-gradient-to-b from-surface-chrome/40 to-surface-card/40 border border-white/5 p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 backdrop-blur-md animate-fade-in">
              <div className="relative inline-flex group">
                <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full scale-150 animate-pulse" />
                <div className="p-5 bg-surface-card text-brand rounded-3xl border border-brand/30 shadow-[0_0_30px_rgba(192,57,43,0.3)] relative z-10">
                  <AlertOctagon className="h-12 w-12" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl font-extrabold text-white tracking-tight font-ui">
                  Temporal Anomaly Detected
                </h1>
                <p className="text-base text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Our servers experienced an unexpected disruption. Don't worry, your anime progress is safe.
                </p>
              </div>

              {this.state.error?.message && (
                <div className="text-left text-xs bg-black/40 p-4 rounded-2xl border border-white/5 text-red-300 font-mono break-words max-h-32 overflow-y-auto hide-scrollbar shadow-inner">
                  <span className="text-gray-500 block mb-1">Error Trace:</span>
                  {this.state.error.message}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
                <button
                  onClick={this.reset}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand hover:bg-brand/90 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(192,57,43,0.2)] focus-ring hover-lift active-press"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Connection
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-surface-chrome border border-white/10 hover:border-white/20 hover:bg-white/5 text-white text-sm font-bold rounded-xl transition-all focus-ring hover-lift active-press"
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

