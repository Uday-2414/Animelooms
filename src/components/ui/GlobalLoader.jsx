import { Sparkles } from 'lucide-react'

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/95 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full scale-150 animate-pulse" />
          <div className="h-16 w-16 bg-surface-card border border-brand/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] relative z-10 animate-bounce">
            <span className="text-3xl font-black text-white font-logo">A</span>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-spin-slow" />
          </div>
        </div>
        
        <div className="space-y-3 text-center">
          <h2 className="text-xl font-bold text-white tracking-wide font-logo flex items-center gap-2">
            Loading AnimeLoom <span className="flex space-x-1"><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span><span className="animate-bounce delay-300">.</span></span>
          </h2>
          <div className="w-48 h-1.5 bg-surface-chrome rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full w-full animate-progress-indeterminate" />
          </div>
        </div>
      </div>
    </div>
  )
}
