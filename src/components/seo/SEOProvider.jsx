import { HelmetProvider } from 'react-helmet-async'

export default function SEOProvider({ children }) {
  return <HelmetProvider>{children}</HelmetProvider>
}
