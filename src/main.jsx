import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

if (typeof window !== 'undefined' && API_BASE_URL) {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    if (typeof input === 'string') {
      input = input.replace('http://localhost:5000', API_BASE_URL);
      return originalFetch(input, init);
    }

    if (input instanceof Request) {
      const rewrittenUrl = input.url.replace('http://localhost:5000', API_BASE_URL);
      const rewrittenRequest = new Request(rewrittenUrl, input);
      return originalFetch(rewrittenRequest, init);
    }

    return originalFetch(input, init);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
