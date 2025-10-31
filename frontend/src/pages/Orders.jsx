// frontend/src/pages/Orders.jsx (REDISEÑADO con tema "Retro SNKRS")

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { FiList, FiArrowRight } from 'react-icons/fi' 

// Paleta de colores "Retro" para los estados
const statusClasses = {
  'Pendiente': 'bg-secondary/20 text-secondary', // Naranja
  'Completado': 'bg-accent/20 text-accent',     // Neón
  'Cancelado': 'bg-primary/20 text-primary',    // Rojo
};

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    
    // Consulta SQL corregida para tu schema
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, created_at, total_amount, status, 
        order_items (
          quantity, 
          price_at_order, 
          products ( name, image_url ) 
        )
      `) 
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      
    if (error) { 
      console.error('Error fetching orders:', error) 
      alert('Error al cargar tus órdenes: ' + error.message) 
    }
    else { setOrders(data || []) }
    setLoading(false)
  }

  if (loading) {
    return <div className='p-4 text-center text-text-dark/70 font-sans'>Cargando pedidos...</div>
  }

  // =============================================
  // --- RENDERIZADO (NUEVO DISEÑO "RETRO") ---
  // =============================================
  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      
      <div className="flex items-center gap-3 pb-4 border-b-2 border-accent/50 mb-8">
        <FiList className="w-6 h-6 text-accent" />
        <h1 className="text-4xl font-display text-text-dark uppercase tracking-wider">Mis Pedidos</h1>
      </div>

      {orders.length === 0 ? (
        <div className='text-center py-16 px-8 bg-surface rounded-none border-2 border-accent'>
          <h2 className='text-3xl font-display text-text-dark mb-4 uppercase'>Aún no tienes pedidos</h2>
          <p className="text-text-dark/80 mb-6 font-sans">Todos tus pedidos aparecerán aquí.</p>
          <Link 
            to="/" 
            className='inline-block px-6 py-3 bg-primary text-text-light font-display tracking-wider rounded-none shadow hover:shadow-neon-primary transition-all'
          >
            Ir a la Tienda
          </Link>
        </div>
      ) : (
        <div className='space-y-6'>
          {orders.map(order => {
            const shortId = order.id.split('-')[0].toUpperCase();
            
            return (
              <div key={order.id} className='bg-surface shadow-lg rounded-none overflow-hidden border-2 border-gray-700 hover:border-accent transition-colors group'>
                
                <div className='flex flex-col md:flex-row justify-between md:items-center p-4 border-b border-gray-700 gap-2'>
                  <div>
                    <h2 className='text-2xl font-display text-text-dark group-hover:text-accent transition-colors'>Pedido #{shortId}</h2>
                    <p className='text-sm text-text-dark/70 font-sans'>
                      Realizado el: {new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`py-1 px-3 rounded-none text-xs font-bold uppercase ${statusClasses[order.status] || 'bg-gray-700 text-gray-200'}`}>
                    {order.status}
                  </span>
                </div>

                <div className='p-6'>
                  <h3 className="text-md font-sans font-bold mb-4 text-text-dark/90 uppercase">Productos:</h3>
                  
                  <div className="flex space-x-4 overflow-x-auto pb-2">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="flex-shrink-0 w-20 text-center font-sans">
                        <div className="w-20 h-20 rounded-none bg-black overflow-hidden border border-gray-700">
                          {item.products && item.products.image_url ? (
                            <img 
                              src={item.products.image_url} 
                              alt={item.products.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">Sin imagen</div>
                          )}
                        </div>
                        <p className="text-xs text-text-dark/70 mt-1 truncate" title={item.products.name}>
                          {item.products.name}
                        </p>
                        <p className="text-xs font-medium text-text-dark">
                          (x{item.quantity})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='flex justify-between items-center p-4 bg-black/20 border-t border-gray-700'>
                  <span className='text-xl font-sans font-bold text-secondary'>
                    Total: ${order.total_amount ? order.total_amount.toFixed(2) : '0.00'}
                  </span>
                  <Link 
                    to={`/orders/${order.id}`} 
                    className='text-sm font-sans font-bold text-accent hover:text-primary flex items-center gap-1 transition-colors'
                  >
                    Ver Detalles
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}