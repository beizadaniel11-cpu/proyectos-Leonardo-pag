// frontend/src/App.jsx (REDISEÑADO con tema "Retro SNKRS" + CORRECCIÓN DE RUTA ADMIN)

import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useCart } from './context/CartContext'

// Importamos los iconos (los dejamos por si los usamos en otras páginas)
import { 
  FiShoppingCart, 
  FiUser, 
  FiList, 
  FiShield, 
  FiLogIn, 
  FiLogOut 
} from 'react-icons/fi'

// Páginas
import Home from './pages/Home'
import Product from './pages/Product'
import Admin from './pages/Admin'
import Auth from './pages/Auth'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail' 
import Profile from './pages/Profile'
// PaymentSuccess y PaymentCancel ELIMINADOS

// ==========================================
// === ¡AQUÍ ESTÁ LA CORRECCIÓN! (Línea 35) ===
// ==========================================
// El "Guardia" de la ruta Admin ahora busca en 'user_metadata'
const AdminRoute = ({ session, children }) => {
  // ANTES: session?.user?.app_metadata?.role
  const isAdmin = session?.user?.user_metadata?.role === 'admin' 
  if (!session || !isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}

// El "Guardia" de Ruta normal (este está bien, solo revisa la sesión)
const ProtectedRoute = ({ session, children }) => {
  if (!session) {
    return <Navigate to="/auth" replace />
  }
  return children
}
// ==========================================
// === FIN DE LA CORRECCIÓN ===
// ==========================================

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const { 
    cartItems = [], 
  } = useCart()

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  // Lógica de Sesión (Sin cambios)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Lógica de Logout (Sin cambios)
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div className='p-4 text-center'>Cargando...</div>
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className='min-h-screen'>
      
      {/* === NAVBAR (REDISEÑO RETRO) === */}
      <nav className="w-full bg-black text-text-dark border-b-4 border-accent sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <Link to='/' className='text-3xl font-display text-text-dark hover:text-primary transition-colors'>
              RETRO SNKRS
            </Link>
            
            <div className="flex items-center space-x-5">

              {/* Este enlace YA ESTÁ CORREGIDO para leer 'user_metadata' */}
              {session?.user?.user_metadata?.role === 'admin' && (
                <Link to='/admin' className='font-sans text-sm hover:text-primary transition-colors'>
                  Admin
                </Link>
              )}

              {session && (
                <>
                  <Link to='/profile' className='font-sans text-sm hover:text-primary transition-colors'>
                    Perfil
                  </Link>
                  <Link to='/orders' className='font-sans text-sm hover:text-primary transition-colors'>
                    Pedidos
                  </Link>
                </>
              )}
              
              {session && <div className="w-px h-6 bg-gray-600"></div>}

              {session ? (
                <button 
                  onClick={handleLogout} 
                  className='font-sans text-sm text-secondary hover:text-primary transition-colors'
                >
                  Logout
                </button>
              ) : (
                <Link to='/auth' className='font-sans text-sm hover:text-primary transition-colors'>
                  Login
                </Link>
              )}

              <Link 
                to='/cart' 
                className='relative bg-primary text-text-light font-bold py-2 px-4 rounded-none uppercase text-sm tracking-widest hover:shadow-neon-primary transition-all'
              >
                <span>Carrito</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-text-light rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              
            </div>
          </div>
        </div>
      </nav>
      {/* === FIN DE NAVBAR REDISEÑADA === */}
      
      {/* === CONTENIDO PRINCIPAL (RUTAS) === */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          {/* Esta ruta ahora usa el 'AdminRoute' corregido */}
          <Route 
            path="/admin" 
            element={<AdminRoute session={session}><Admin /></AdminRoute>} 
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cart" element={<Cart />} />
          <Route 
            path="/orders" 
            element={<ProtectedRoute session={session}><Orders /></ProtectedRoute>} 
          />
          <Route 
            path="/orders/:id" 
            element={<ProtectedRoute session={session}><OrderDetail /></ProtectedRoute>} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute session={session}><Profile /></ProtectedRoute>} 
          />
        </Routes> 
      </main>
    </div>
  )
}