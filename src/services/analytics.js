import ReactGA from 'react-ga4'

const MEASUREMENT_ID = 'G-RC6FN6KXW8'

export const initAnalytics = () => {
  ReactGA.initialize(MEASUREMENT_ID)
}

export const trackPageView = (path) => {
  ReactGA.send({
    hitType: 'pageview',
    page: path,
  })
}