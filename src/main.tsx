import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Service worker voor offline gebruik (alleen in productie)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('./sw.js')
  })
}

// Vraag persistente opslag aan zodat de historie niet opgeruimd wordt
// bij opslagkrapte (wordt voor geïnstalleerde PWA's stilzwijgend toegekend)
if (navigator.storage?.persist) {
  void navigator.storage.persist()
}

// Start altijd bovenaan; voorkom dat de browser een oude scrollpositie herstelt
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)
