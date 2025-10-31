// frontend/src/pages/Cart.jsx (REDISEÑADO con tema "Retro SNKRS")

import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi'
import { supabase } from '../supabaseClient' 

export default function Cart() {
  
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Solución al crash (valores por defecto)
  const { 
    cartItems = [], 
    clearCart = () => {}, 
    updateItemQuantity = () => {}, 
    removeFromCart = () => {} 
  } = useCart()
  
  const total = cartItems.reduce((acc, item) => {
    return acc + (item.price * item.quantity)
  }, 0)

  // ======================================================
  // === FUNCIÓN handleCheckout (LÓGICA DE PEDIDO DEMO) ===
  // ======================================================
  const handleCheckout = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("Debes iniciar sesión para completar el pedido.")
      navigate('/auth')
      setLoading(false)
      return
    }
    
    try {
      // 1. Crear la orden principal
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'Pendiente'
        })
        .select()
        .single() 

      if (orderError) throw orderError
      if (!orderData) throw new Error("No se pudo crear la orden.")

      // 2. Preparar los 'order_items'
      const itemsToInsert = cartItems.map(item => ({
        order_id: orderData.id, 
        product_id: item.id,
        quantity: item.quantity,
        price_at_order: item.price 
      }))

      // 3. Insertar todos los items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert)
      
      if (itemsError) throw itemsError

      // 4. Actualizar el stock
      const stockUpdatePromises = cartItems.map(item =>
        supabase.rpc('decrement_product_stock', {
          product_id_to_update: item.id,
          quantity_to_subtract: item.quantity
        })
      );
      await Promise.all(stockUpdatePromises);
      
      // 5. ¡Éxito!
      alert("¡Pedido realizado con éxito!")
      clearCart() 
      navigate('/orders') 

    } catch (error) {
      console.error("Error al crear el pedido:", error)
      alert("Hubo un error al procesar tu pedido: " + error.message)
    } finally {
      setLoading(false)
    }
  }
  // ======================================================
  // === FIN DE LA FUNCIÓN ===
  // ======================================================
  
  // --- VISTA DE CARRITO VACÍO (REDISEÑADA) ---
  if (cartItems.length === 0) {
    return (
      <div className='max-w-2xl mx-auto my-12 text-center p-8 bg-surface rounded-none border-2 border-accent shadow-neon-accent'>
        <h1 className='text-3xl font-display text-text-dark mb-4 uppercase'>Tu carrito está vacío</h1>
        <p className="text-text-dark/70 mb-6 font-sans">No has agregado ningún sneaker a tu colección.</p>
        <Link 
          to="/" 
          className='inline-block px-6 py-3 bg-primary text-text-light font-display tracking-wider rounded-none shadow hover:shadow-neon-primary transition-all'
        >
          Ver Productos
        </Link>
      </div>
    )
  }

  // --- VISTA PRINCIPAL DEL CARRITO (REDISEÑADA) ---
  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      <h1 className="text-4xl font-display mb-6 text-text-dark uppercase tracking-wider">Tu Carrito</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* === COLUMNA IZQUIERDA: ITEMS === */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {cartItems.map(item => (
            // Tarjeta de item (oscura, cuadrada)
            <div key={item.id} className="flex flex-col md:flex-row items-center space-x-4 p-4 bg-surface rounded-none border border-gray-700">
              
              <img 
                src={item.image_url ? item.image_url : 'https://via.placeholder.com/100'} 
                alt={item.name} 
                className="w-full md:w-24 h-24 object-cover rounded-none mb-4 md:mb-0 border-2 border-accent" 
              />
              
              <div className="flex-grow text-center md:text-left">
                <Link to={`/product/${item.id}`} className="font-display text-xl text-text-dark hover:text-primary transition-colors">
                  {item.name}
                </Link>
                <p className="text-sm text-text-dark/70 font-sans">${item.price.toFixed(2)} c/u</p>
              </div>
              
              <div className="flex items-center space-x-2 border border-gray-600 rounded-none p-1 my-4 md:my-0">
                <button 
                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-1 hover:bg-black/20 disabled:opacity-50"
                >
                  <FiMinus className="w-4 h-4 text-text-dark" />
                </button>
                <span className="w-8 text-center font-sans font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-black/20"
                >
                  <FiPlus className="w-4 h-4 text-text-dark" />
                </button>
              </div>
              
              <span className="font-bold text-lg w-24 text-right text-secondary">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-primary hover:text-opacity-70 p-2 rounded-full"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* === COLUMNA DERECHA: RESUMEN === */}
        <div className="lg:col-span-1 bg-surface border-4 border-accent rounded-none p-6 h-fit sticky top-28 shadow-neon-accent">
          <h2 className="text-2xl font-display mb-4 border-b border-gray-600 pb-2 text-text-dark uppercase">Resumen de Compra</h2>
          
          <div className="flex justify-between mb-2 text-text-dark/80 font-sans">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4 text-text-dark/80 font-sans">
            <span>Envío</span>
            <span className='font-medium text-accent'>Gratis</span>
          </div>
          
          <div className="border-t border-gray-600 my-4"></div>
          
          <div className="flex justify-between text-lg font-bold text-text-dark mt-2 font-sans">
            <span>Total</span>
            <span className="text-2xl text-secondary">${total.toFixed(2)}</span>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-6 px-6 py-3 bg-primary text-text-light font-display text-lg tracking-wider rounded-none shadow hover:shadow-neon-primary transition-colors disabled:bg-gray-600"
          >
            {loading ? 'Procesando...' : 'Finalizar Pedido'}
          </button>
          
          <button
            onClick={clearCart}
            className="w-full mt-3 text-sm text-text-dark/50 hover:text-primary font-sans hover:underline"
          >
            Vaciar Carrito
          </button>
        </div>
        
      </div>
    </div>
  )
}