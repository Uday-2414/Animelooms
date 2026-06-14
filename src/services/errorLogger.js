import { trackError } from './analyticsService'

export const logError = (error, context = '') => {
  const message = error?.message || String(error)

  if (import.meta.env.DEV) {
    console.error('[ErrorLogger]', context, error)
  }

  trackError(message, context)
}

export const logApiError = (error, service, endpoint = '') => {
  const message = error?.message || String(error)

  if (import.meta.env.DEV) {
    console.error('[ErrorLogger][API]', service, endpoint, error)
  }

  trackError(message, `[API] ${service} ${endpoint}`)
}

export default {
  logError,
  logApiError,
}
