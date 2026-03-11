import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// ── Enforce Light Mode ──────────────────────────────────────
// Remove any persisted dark class from a previous theme toggle.
document.documentElement.classList.remove('dark');
localStorage.removeItem('theme');
// ───────────────────────────────────────────────────────────

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
