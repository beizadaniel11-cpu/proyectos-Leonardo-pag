// frontend/src/pages/Home.jsx (REDISEÑADO + BUG DE SINTAXIS CORREGIDO)

import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  // --- Lógica de Carga (CON CORRECCIÓN DE BUG) ---
  useEffect(() => {
    loadCategories()
    loadProducts()
  }, []) 

  useEffect(() => {
    const timerId = setTimeout(() => {
      loadProducts()
    }, 300) 

    return () => {
      clearTimeout(timerId)
    }
  }, [searchTerm, selectedCategoryId])

  async function loadCategories() { 
    const { data, error } = await supabase.from('categories').select('id, name')
    if (error) console.error("Error cargando categorías:", error)
    else setCategories(data || [])
  }
  
  // --- FUNCIÓN loadProducts (CORREGIDA) ---
  async function loadProducts() { 
    setLoading(true)
    let query = supabase.from('products').select('*').eq('is_active', true).limit(20)

    // ==========================================
    // === ¡AQUÍ ESTÁ LA CORRECCIÓN DEL BUG! ===
    // ==========================================
    if (searchTerm) {
      // 1. Creamos el string del filtro (¡AHORA SÍ CON BACKTICKS!)
      const filterString = `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`;
      // 2. Pasamos la variable a la función .or()
      query = query.or(filterString);
    }
    // ==========================================
    // === FIN DE LA CORRECCIÓN ===
    // ==========================================
    
    if (selectedCategoryId) {
      query = query.eq('category_id', selectedCategoryId)
    }
    
    const { data, error } = await query
    
    if (error) { 
      setProducts([]); 
      console.error("Error loading products:", error) 
      // alert("Error cargando productos: " + error.message); // Opcional
    }
    else { 
      setProducts(data || []) 
    }
    setLoading(false)
  }
  // --- Fin Lógica de Carga ---

  return (
    // El fondo 'bg-background' (oscuro) se aplica desde styles.css
    <div className="min-h-screen"> 
      
      {/* === HERO / BANNER (REDISEÑO RETRO) === */}
      <section 
        className="relative text-white py-32 md:py-48 flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=1920&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <div className="relative z-10 text-center max-w-4xl px-4">
          
          <h1 className="text-5xl md:text-8xl font-display mb-4 leading-tight uppercase" 
              style={{ textShadow: '0 0 10px #F94144, 0 0 20px #F94144' }}>
            Retro es el Futuro
          </h1>
          
          <p className="text-lg md:text-xl mb-8 opacity-90 font-sans tracking-wide">
            Encuentra los tenis y la ropa que definieron una era.
          </p>
          
        </div>
      </section>
      {/* === FIN DEL NUEVO HERO === */}


      {/* === SECCIÓN DE PRODUCTOS (MODIFICADA) === */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        
        <h1 className='text-4xl font-display mb-8 text-text-dark text-center uppercase tracking-wider'>Nuestros Productos</h1>

        {/* --- FILTROS (Diseño "underline" oscuro) --- */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          
          <div className="relative md:col-span-2 w-full">
            <FiSearch className="absolute left-0 bottom-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar tenis, chamarras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border-b-2 border-gray-600 focus:outline-none focus:border-accent bg-transparent text-text-dark"
            />
          </div>
          
          <div className="relative w-full">
            <label className="text-sm font-sans text-text-dark/70">Filtrar por Categoría:</label>
            <select 
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full p-3 border-b-2 border-gray-600 focus:outline-none focus:ring-0 focus:border-accent bg-transparent text-text-dark"
            >
              <option value="">Todas las Categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
        </div>
        {/* --- FIN DE FILTROS REDISEÑADOS --- */}


        {/* --- Contenedor de Productos --- */}
        {loading ? (
          <div className="text-center p-6 text-gray-500 font-sans">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center p-6 text-gray-500 font-sans">
            {searchTerm || selectedCategoryId
              ? "No se encontraron productos para tus filtros."
              : "No hay productos disponibles."}
          </div>
        ) : (
          
          // --- ¡REDISEÑO DE TARJETAS RETRO! ---
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {products.map(p => (
              <article key={p.id} className='rounded-none overflow-hidden bg-surface border-4 border-accent shadow-lg flex flex-col group'>
                
                <Link to={`/product/${p.id}`} className='block aspect-square bg-black overflow-hidden'>
                  {p.image_url ? ( // <--- Lógica de imagen corregida
                    <img 
                      src={p.image_url} 
                      alt={p.name} 
                      className='w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110'
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm font-sans">Sin imagen</div>
                  )}
                </Link>

                <div className='p-4 flex flex-col flex-grow'>
                  
                  <p className='font-bold text-xl text-secondary mb-1'>${p.price}</p>
                  
                  <h2 className='text-2xl text-text-dark mb-2 truncate font-display group-hover:text-accent transition-colors'>
                    {p.name}
                  </h2>
                  
                  {p.description && (
                    <p className='text-sm text-text-dark/70 mb-4 line-clamp-2 flex-grow font-sans'>{p.description}</p>
                  )}
                  
                  <Link 
                    to={`/product/${p.id}`} 
                    className='mt-auto block w-full text-center px-4 py-2 bg-primary text-text-light font-display text-lg tracking-wider rounded-none shadow hover:shadow-neon-primary transition-all'
                  >
                    Ver Detalles
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}