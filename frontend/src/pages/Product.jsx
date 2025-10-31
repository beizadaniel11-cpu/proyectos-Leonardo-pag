// frontend/src/pages/Product.jsx (REDISEÑADO con tema "Retro SNKRS")

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useCart } from '../context/CartContext'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true); 
  
  // --- Lógica de Carrito (con valores por defecto para evitar crash) ---
  const { 
    addToCart = () => {} 
  } = useCart()

  useEffect(() => {
    setLoading(true); 
    async function load() {
      // --- Lógica de Carga (CON CORRECCIÓN DE BUG) ---
      // La consulta SQL fue corregida de 'images' a 'image_url' en Home,
      // pero aquí solo necesitamos el 'id'
      const { data, error } = await supabase
        .from('products')
        .select(`
          *, 
          categories ( name ) 
        `)
        .eq('id', id)
        .single() 
        
      if (error) {
        console.error("Error cargando producto:", error);
        setProduct(null); 
      } else {
        setProduct(data);
      }
      setLoading(false); 
    }
    if (id) load()
  }, [id])

  // --- Renderizado Condicional ---
  if (loading) {
    return <div className="text-center p-10 font-sans text-text-dark/70">Cargando producto...</div>
  }
  
  if (!product) {
    // CAMBIO: Color de error a 'primary' (rojo)
    return <div className="text-center p-10 text-primary font-bold font-display text-2xl">Error: Producto no encontrado.</div>
  }

  // --- Función para Añadir al Carrito ---
  const handleAddToCart = () => {
    addToCart(product);
    alert(`${product.name} añadido al carrito!`); // Feedback
  }

  // =============================================
  // --- JSX con Diseño (REDISEÑO RETRO) ---
  // =============================================
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Grid principal: 1 columna en móvil, 2 en pantallas medianas+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* Columna Izquierda: Imagen */}
        {/* CAMBIO: Esquinas cuadradas y borde neón 'accent' */}
        <div className="aspect-square bg-black rounded-none overflow-hidden border-4 border-accent"> 
          
          {/* ================================== */}
          {/* === ¡AQUÍ ESTÁ LA CORRECCIÓN! === */}
          {/* ================================== */}
          {product.image_url ? ( // <--- USANDO image_url
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-text-dark/70 font-sans">
              Imagen no disponible
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalles y Compra */}
        {/* CAMBIO: Fondo 'surface' (gris oscuro), texto 'text-dark' (blanco) */}
        <div className="flex flex-col h-full p-8 bg-surface rounded-none"> 
          
          {/* Categoría (si existe) */}
          {/* CAMBIO: Color 'accent' neón */}
          {product.categories?.name && (
            <span className="text-sm text-accent mb-2 uppercase tracking-widest font-sans font-bold">{product.categories.name}</span>
          )}
          
          {/* Nombre del Producto */}
          {/* CAMBIO: Fuente 'display', color 'text-dark' */}
          <h1 className='text-5xl lg:text-6xl font-display text-text-dark mb-3 uppercase'>{product.name}</h1>
          
          {/* Precio */}
          {/* CAMBIO: Color 'secondary' (naranja) */}
          <p className='text-4xl font-bold text-secondary mb-5'>${product.price}</p>
          
          {/* Descripción */}
          {/* CAMBIO: Fuente 'sans' (Roboto Mono), color 'text-dark/80' */}
          <div className="text-base text-text-dark/80 mb-6 font-sans space-y-4">
            <p>{product.description || "Descripción no disponible."}</p>
          </div>
          
          {/* Stock y Botón (usamos mt-auto para empujar al fondo) */}
          <div className="mt-auto pt-6 border-t border-gray-600"> 
            <p className='text-sm text-text-dark/70 mb-4 font-sans'>Disponibles: {product.stock > 0 ? product.stock : 'Agotado'}</p>
            
            {/* CAMBIO: Botón rojo 'primary', cuadrado y con sombra neón */}
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className='w-full px-8 py-3 bg-primary text-text-light font-display text-xl tracking-wider rounded-none shadow-lg hover:shadow-neon-primary transition-all duration-300 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed'
            >
              {product.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  )
}