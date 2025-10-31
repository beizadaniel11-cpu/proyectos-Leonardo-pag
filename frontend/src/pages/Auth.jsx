// frontend/src/pages/Auth.jsx (REDISEÑADO con tema "Retro SNKRS")

import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
// Importamos los iconos para los botones sociales
import { FaGoogle, FaGithub } from 'react-icons/fa'

export default function Auth() {
  const [mode, setMode] = useState('signIn') // 'signIn' o 'signUp'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false) 
  const navigate = useNavigate()

  // --- Lógica de signUp (SIN CAMBIOS) ---
  async function signUp() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        alert(error.message)
      } else {
        alert('Revisa tu correo para verificar la cuenta.')
        setMode('signIn')
      }
    } catch (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  // --- Lógica de signIn (SIN CAMBIOS) ---
  async function signIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  // --- Lógica de handleSubmit (SIN CAMBIOS) ---
  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'signIn') {
      signIn()
    } else {
      signUp()
    }
  }

  // --- Lógica de OAuth (SIN CAMBIOS) ---
  async function handleOAuth(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
    })
    if (error) {
      alert(error.message)
    }
  }

  // --- CAMBIO: Clases de Tailwind para las pestañas "Retro" ---
  const activeTabClass = 'w-1/2 py-3 font-display text-2xl text-center text-primary border-b-4 border-primary transition-colors'
  const inactiveTabClass = 'w-1/2 py-3 font-display text-2xl text-center text-text-dark/50 hover:text-primary transition-colors'

  return (
    // Contenedor principal (fondo oscuro desde styles.css)
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* ======================================= */}
      {/* === TARJETA DE LOGIN (REDISEÑO RETRO) === */}
      {/* ======================================= */}
      <div className="max-w-md w-full bg-surface shadow-2xl rounded-none overflow-hidden border-4 border-accent">
        
        {/* --- 1. Pestañas (Tabs) --- */}
        <div className="flex bg-black/20">
          <button
            onClick={() => setMode('signIn')}
            className={mode === 'signIn' ? activeTabClass : inactiveTabClass}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signUp')}
            className={mode === 'signUp' ? activeTabClass : inactiveTabClass}
          >
            Registro
          </button>
        </div>

        <div className="p-8">
          {/* --- 2. Formulario Principal --- */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-sans font-medium text-text-dark/70 mb-1">
                Email:
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-dark"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-sans font-medium text-text-dark/70 mb-1">
                Contraseña:
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-none shadow-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-dark"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-text-light font-display text-lg tracking-wider rounded-none shadow-md hover:shadow-neon-primary transition-all disabled:bg-gray-600 disabled:shadow-none"
            >
              {loading ? 'Cargando...' : (mode === 'signIn' ? 'Login' : 'Crear Cuenta')}
            </button>
          </form>

          {/* --- 3. Divisor "O continúa con" --- */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-text-dark/60 font-sans">O continúa con</span>
            </div>
          </div>

          {/* --- 4. Botones de Inicio de Sesión Social --- */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full flex justify-center items-center gap-3 py-3 border border-gray-600 rounded-none shadow-sm hover:bg-white hover:text-black transition-colors font-sans font-medium text-text-dark"
            >
              <FaGoogle className="w-5 h-5" />
              Ingresar con Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="w-full flex justify-center items-center gap-3 py-3 border border-gray-600 bg-gray-800 text-white rounded-none shadow-sm hover:bg-gray-700 transition-colors font-sans font-medium"
            >
              <FaGithub className="w-5 h-5" />
              Ingresar con GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}