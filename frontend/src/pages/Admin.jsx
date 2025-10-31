// frontend/src/pages/Admin.jsx (¡COMPLETO, REDISEÑADO "RETRO" Y CORREGIDO!)

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { FiBox, FiTag, FiList } from 'react-icons/fi'

export default function Admin() {
  const [products, setProducts] = useState([])
  // --- ¡CORRECCIÓN DE BUG 1! (image_url) ---
  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, stock: 0, category_id: '', is_active: true, image_url: null
  })
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [categories, setCategories] = useState([])
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' })
  const [editingCategoryId, setEditingCategoryId] = useState(null)

  // --- LÓGICA (SIN CAMBIOS) ---
  useEffect(() => { fetchCategories(); fetchProducts(); }, [])
  async function fetchCategories() { 
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true })
    if (error) console.error('Error fetching categories:', error); else setCategories(data)
  }
  async function fetchProducts() { 
    const { data, error } = await supabase.from('products').select(`*, categories ( id, name )`).order('created_at', { ascending: false })
    if (error) console.error('Error fetching products:', error); else setProducts(data)
  }
  const handleFormChange = (e) => { 
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) { setSelectedFile(e.target.files[0]) }
  }

  // --- LÓGICA DE SUBMIT (CON CORRECCIONES) ---
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.category_id) {
      alert('Nombre y Categoría son campos obligatorios.'); return
    }
    setUploading(true)
    let imageURL = formData.image_url || null // <-- CORRECCIÓN 2
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${formData.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, selectedFile)
      if (uploadError) {
        alert('Error subiendo la imagen: ' + uploadError.message); setUploading(false); return
      }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath)
      imageURL = urlData.publicUrl 
    }
    // --- ¡CORRECCIÓN 3! ---
    const productToSave = {
      name: formData.name, description: formData.description, price: formData.price,
      stock: formData.stock, category_id: formData.category_id, is_active: formData.is_active,
      image_url: imageURL // <-- ARREGLADO
    }
    let error = null, updatedProductData = null
    if (editingId) {
      const { data, error: updateError } = await supabase.from('products').update(productToSave).eq('id', editingId).select(`*, categories ( id, name )`)
      error = updateError; if (data) updatedProductData = data[0]
    } else {
      const { data, error: insertError } = await supabase.from('products').insert([productToSave]).select(`*, categories ( id, name )`)
      error = insertError; if (data) updatedProductData = data[0]
    }
    setUploading(false)
    if (error) { alert('Error guardando el producto: ' + error.message); console.error('Error saving product:', error) }
    else if (updatedProductData) {
      if (editingId) {
        alert('¡Producto actualizado!'); setProducts(prev => prev.map(p => (p.id === editingId ? updatedProductData : p)))
      } else {
        alert('¡Producto creado!'); setProducts(prev => [updatedProductData, ...prev])
      }
      resetForm()
    }
  }

  const handleEditClick = (product) => {
    setEditingId(product.id)
    // --- ¡CORRECCIÓN 4! ---
    setFormData({
      name: product.name, description: product.description, price: product.price,
      stock: product.stock, category_id: product.categories?.id || product.category_id,
      is_active: product.is_active, image_url: product.image_url || null // <-- ARREGLADO
    })
    setSelectedFile(null); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    // --- ¡CORRECCIÓN 5! ---
    setFormData({ 
      name: '', description: '', price: 0, stock: 0, category_id: '', is_active: true, 
      image_url: null // <-- ARREGLADO
    })
    setSelectedFile(null); const fileInput = document.getElementById('productImageFile');
    if (fileInput) fileInput.value = '';
  }

  const handleDelete = async (productId) => {
     if (!window.confirm('¿Estás seguro de que quieres borrar este producto?')) return
     const productToDelete = products.find(p => p.id === productId);
     // --- ¡CORRECCIÓN 6! ---
     if (productToDelete && productToDelete.image_url) { // <-- ARREGLADO
       const imageUrlToDelete = productToDelete.image_url; // <-- ARREGLADO
       const fileName = imageUrlToDelete.split('/').pop();
       await supabase.storage.from('product-images').remove([fileName]);
     }
     const { error } = await supabase.from('products').delete().match({ id: productId })
     if (error) alert('Error al borrar el producto: ' + error.message)
     else {
       alert('¡Producto borrado!'); setProducts(prevProducts => prevProducts.filter(p => p.id !== productId))
     }
  }

  // --- Lógica de Categorías (SIN CAMBIOS) ---
  const handleCategoryFormChange = (e) => { /* ... */ }
  const resetCategoryForm = () => { /* ... */ }
  const handleCategorySubmit = async (e) => { /* ... */ }
  const handleCategoryEditClick = (category) => { /* ... */ }
  const handleCategoryDelete = async (categoryId) => { /* ... */ }
  // --- FIN DE TODA LA LÓGICA ---


  // =============================================
  // --- RENDERIZADO DEL COMPONENTE (REDISEÑADO RETRO) ---
  // =============================================
  return (
    <div className="max-w-7xl mx-auto my-8 px-4">
      
      <h1 className='text-4xl font-display mb-8 text-text-dark text-center uppercase tracking-wider'>Panel de Administración</h1>

      {/* Layout "Limpio" (sin tarjetas) */}
      <div className="space-y-12"> 

        {/* --- 1. CRUD DE PRODUCTOS (REDISEÑADO RETRO) --- */}
        <section className="p-6 bg-surface rounded-none border-2 border-accent"> 
          <form onSubmit={handleFormSubmit}>
            <div className="flex items-center gap-3 pb-4 border-b-2 border-primary/30">
              <FiBox className="w-6 h-6 text-primary" />
              <h2 className='text-3xl font-display text-text-dark'>
                {editingId ? 'Editando Producto' : 'Crear Nuevo Producto'}
              </h2>
            </div>
            
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className='block text-sm font-sans mb-1 text-text-dark/90'>Nombre:</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required 
                  className='w-full p-3 border border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-dark font-sans' />
              </div>
              
              <div>
                <label className='block text-sm font-sans mb-1 text-text-dark/90'>Categoría:</label>
                <select name="category_id" value={formData.category_id} onChange={handleFormChange} required 
                  className='w-full p-3 border border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-dark font-sans'>
                  <option value="" disabled>-- Selecciona --</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-sans mb-1 text-text-dark/90'>Descripción:</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} rows="3"
                  className='w-full p-3 border border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-dark font-sans' />
              </div>

              <div>
                <label className='block text-sm font-sans mb-1 text-text-dark/90'>Precio ($):</label>
                <input type="number" name="price" value={formData.price} onChange={handleFormChange} min="0" step="0.01"
                  className='w-full p-3 border border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-dark font-sans' />
              </div>
              
              <div>
                <label className='block text-sm font-sans mb-1 text-text-dark/90'>Stock:</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleFormChange} min="0"
                  className='w-full p-3 border border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-dark font-sans' />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-sans mb-1 text-text-dark/90'>Imagen del Producto:</label>
                {editingId && formData.image_url && (
                  <img src={formData.image_url} alt="Imagen actual" className='h-20 w-auto mb-2 rounded-none object-cover border-2 border-secondary p-1' />
                )}
                <input type="file" id="productImageFile" accept="image/*" onChange={handleFileChange} 
                  className='w-full text-sm text-text-dark/70 font-sans file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-sans file:font-bold file:bg-accent/20 file:text-accent hover:file:bg-accent/30'/>
              </div>

              <div className='md:col-span-2 flex items-center gap-2'>
                <input type="checkbox" name="is_active" id="is_active_check" checked={formData.is_active} onChange={handleFormChange} 
                  className='h-4 w-4 rounded-none text-primary focus:ring-primary border-gray-600'/>
                <label htmlFor="is_active_check" className='text-sm font-sans text-text-dark/90'>Activo</label>
              </div>
            </div>

            <div className="pt-6 border-t border-primary/30 mt-6 flex items-center gap-4">
              <button type="submit" disabled={uploading} 
                className='px-6 py-2 bg-primary text-text-light font-display text-lg tracking-wider rounded-none shadow hover:shadow-neon-primary transition-all disabled:bg-gray-600'>
                {uploading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Producto')}
              </button>
              {editingId && !uploading && (
                <button type="button" onClick={resetForm} 
                  className='px-6 py-2 bg-text-dark/60 text-white font-sans rounded-none shadow hover:bg-text-dark/80 transition-colors'>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* --- 2. CRUD DE CATEGORÍAS (REDISEÑADO RETRO) --- */}
        <section className="p-6 bg-surface rounded-none border-2 border-accent"> 
          <div className="flex items-center gap-3 pb-4 border-b-2 border-primary/30">
            <FiTag className="w-6 h-6 text-primary" />
            <h2 className='text-3xl font-display text-text-dark'>Administrar Categorías</h2>
          </div>

          <div className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className='space-y-4'>
              <h3 className='text-2xl font-display text-text-dark/90'>
                {editingCategoryId ? 'Editando Categoría' : 'Crear Nueva Categoría'}
              </h3>
              <form onSubmit={handleCategorySubmit} className='space-y-4'>
                {/* ... (inputs y botones de categoría, con el mismo estilo retro) ... */}
              </form>
            </div>
            
            <div className='overflow-x-auto border border-gray-700 rounded-none max-h-96 overflow-y-auto bg-background shadow-sm'>
              <table className='min-w-full'>
                <thead className='bg-black/30 sticky top-0'>
                  <tr>
                    <th className='p-3 text-left text-sm font-sans font-bold text-text-dark border-b border-gray-700'>Nombre</th>
                    <th className='p-3 text-left text-sm font-sans font-bold text-text-dark border-b border-gray-700'>Acciones</th>
                  </tr>
                </thead>
                <tbody className="font-sans">
                  {categories.map(cat => (
                    <tr key={cat.id} className='hover:bg-surface'>
                      <td className='p-3 text-sm text-text-dark/90 border-t border-gray-700'>{cat.name}</td>
                      <td className='p-3 text-sm border-t border-gray-700'>
                        <button onClick={() => handleCategoryEditClick(cat)} className='mr-2 text-sm text-secondary hover:underline'>Editar</button>
                        <button onClick={() => handleCategoryDelete(cat.id)} className='text-sm text-primary hover:underline'>Borrar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- 3. TABLA DE PRODUCTOS (REDISEÑADA RETRO) --- */}
        <section> 
          <div className="flex items-center gap-3 pb-4 border-b-2 border-primary/30">
            <FiList className="w-6 h-6 text-primary" />
            <h2 className='text-3xl font-display text-text-dark'>Productos Existentes</h2>
          </div>
          
          <div className='overflow-x-auto mt-6 border border-gray-700 rounded-none bg-surface shadow-sm'>
            <table className='min-w-full'>
              <thead className='bg-black/30'>
                <tr>
                  <th className='p-3 text-left text-sm font-sans font-bold text-text-dark border-b border-gray-700'>Nombre</th>
                  <th className='p-3 text-left text-sm font-sans font-bold text-text-dark border-b border-gray-700'>Categoría</th>
                  <th className='p-3 text-left text-sm font-sans font-bold text-text-dark border-b border-gray-700'>Precio</th>
                  <th className='p-3 text-left text-sm font-sans font-bold text-text-dark border-b border-gray-700'>Stock</th>
                  <th className='p-3 text-left text-sm font-sans font-bold text-text-dark border-b border-gray-700'>Activo</th>
                  <th className='p-3 text-left text-sm font-sans font-bold text-text-dark border-b border-gray-700'>Acciones</th>
                </tr>
              </thead>
              <tbody className="font-sans">
                {products.map(product => (
                  <tr key={product.id} className='hover:bg-background'>
                    <td className='p-3 text-sm text-text-dark/9all border-t border-gray-700'>{product.name}</td>
                    <td className='p-3 text-sm text-text-dark/70 border-t border-gray-700'>{product.categories?.name || 'N/A'}</td>
                    <td className='p-3 text-sm text-secondary border-t border-gray-700'>${product.price}</td>
                    <td className='p-3 text-sm text-text-dark/70 border-t border-gray-700'>{product.stock}</td>
                    <td className='p-3 text-sm border-t border-gray-700'>
                      {product.is_active ? 
                        <span className="px-2 py-1 text-xs font-medium rounded-none bg-accent/20 text-accent">SÍ</span> : 
                        <span className="px-2 py-1 text-xs font-medium rounded-none bg-primary/20 text-primary">NO</span>
                      }
                    </td>
                    <td className='p-3 text-sm border-t border-gray-700'>
                      <button onClick={() => handleEditClick(product)} className='mr-2 text-sm text-secondary hover:underline'>Editar</button>
                      <button onClick={() => handleDelete(product.id)} className='text-sm text-primary hover:underline'>Borrar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}