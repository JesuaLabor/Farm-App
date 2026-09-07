import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply font size preference (normalized 16px standard SaaS scale)
const savedFontSize = localStorage.getItem('agriconnect_font_size');
if (savedFontSize === 'extra-large') {
  document.documentElement.style.fontSize = '20px';
} else if (savedFontSize === 'large') {
  document.documentElement.style.fontSize = '18px';
} else {
  document.documentElement.style.fontSize = '16px';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
