// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css' // O index.css
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'

// --- LÍNEAS DE STRIPE ELIMINADAS ---
// Se quitaron las siguientes líneas porque desinstalamos Stripe:
//
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
// console.log("Clave Publicable de Stripe:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); 
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); 
//
// --- FIN DE LÍNEAS ELIMINADAS ---


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        
        {/* --- El "wrapper" <Elements> de Stripe fue eliminado --- */}
        <App />
        {/* ---------------------------------------------------- */}

      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)