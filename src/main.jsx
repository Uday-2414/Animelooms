import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { initAnalytics } from './services/analyticsService'
import SEOProvider from './components/seo/SEOProvider.jsx'

initAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SEOProvider>
        <App />
      </SEOProvider>
    </AuthProvider>
  </StrictMode>,
)
