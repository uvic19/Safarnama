import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useAuthStore } from './stores/authStore'

// Initialize Firebase auth listener once at the application entry point.
// This prevents duplicate onAuthStateChanged registrations when multiple
// components call useAuth().
useAuthStore.getState().initAuthListener();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

