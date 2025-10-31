// frontend/src/pages/Profile.jsx (REDISEÑADO con tema "Retro SNKRS")

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { FiUser, FiLock } from 'react-icons/fi' 

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  
  const [formData, setFormData] = useState({ full_name: '', phone: '' })
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // --- LÓGICA (SIN CAMBIOS) ---
  useEffect(() => { fetchUserProfile() }, [])

  async function fetchUserProfile() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data: profileData, error } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
      if (profileData) { setFormData({ full_name: profileData.full_name || '', phone: profileData.phone || '' }) }
      if (error) { console.error("Error cargando el perfil:", error.message) }
    }
    setLoading(false)
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.from('profiles').update({ full_name: formData.full_name, phone: formData.phone }).eq('id', user.id)
    if (error) { alert('Error al actualizar el perfil: ' + error.message) }
    else { alert('¡Perfil actualizado con éxito!') }
    setLoading(false)
  }
  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) { alert('La contraseña debe tener al menos 6 caracteres.'); return }
    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { alert('Error al actualizar la contraseña: ' + error.message) }
    else { alert('¡Contraseña actualizada con éxito!'); setNewPassword('') }
    setPasswordLoading(false)
  }
  // --- FIN LÓGICA ---

  if (loading && !user) { return <div className='p-4 text-center font-sans'>Cargando perfil...</div> }
  if (!user) { return <div className='p-4 text-center font-sans'>Debes iniciar sesión para ver tu perfil.</div> }

  // =============================================
  // --- RENDERIZADO (NUEVO DISEÑO "RETRO") ---
  // =============================================
  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      
      <h1 className="text-4xl font-display mb-2 text-text-dark uppercase tracking-wider">Mi Perfil</h1>
      <p className='mb-8 text-text-dark/70 font-sans'>Email: {user.email} (no se puede cambiar)</p>

      <div className="space-y-12">

        {/* === Sección 1: Información Personal === */}
        <section className="p-6 bg-surface rounded-none border-2 border-accent">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 pb-4 border-b-2 border-primary/30">
              <FiUser className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-display text-text-dark">Información Personal</h2>
            </div>
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor='full_name' className='block text-sm font-sans mb-1 text-text-dark/90'>Nombre Completo:</label>
                <input
                  type='text' id='full_name' name='full_name'
                  value={formData.full_name} onChange={handleInputChange}
                  placeholder="Ej. Juan Pérez"
                  className='w-full p-3 border border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-dark font-sans'
                />
              </div>
              <div>
                <label htmlFor='phone' className='block text-sm font-sans mb-1 text-text-dark/90'>Teléfono:</label>
                <input
                  type='tel' id='phone' name='phone'
                  value={formData.phone} onChange={handleInputChange}
                  placeholder="Ej. 55 1234 5678"
                  className='w-full p-3 border border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-dark font-sans'
                />
              </div>
            </div>
            <div className="pt-6 border-t border-primary/30 mt-6 text-right">
              <button 
                type='submit' 
                disabled={loading}
                className='px-6 py-2 bg-primary text-text-light font-display text-lg tracking-wider rounded-none shadow hover:shadow-neon-primary transition-all disabled:bg-gray-600'
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </section>

        {/* === Sección 2: Cambiar Contraseña === */}
        <section className="p-6 bg-surface rounded-none border-2 border-accent">
          <form onSubmit={handlePasswordUpdate}>
            <div className="flex items-center gap-3 pb-4 border-b-2 border-primary/30">
              <FiLock className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-display text-text-dark">Seguridad y Contraseña</h2>
            </div>
            <div className="pt-6 space-y-4 max-w-md">
              <div>
                <label htmlFor='newPassword' className='block text-sm font-sans mb-1 text-text-dark/90'>Nueva Contraseña:</label>
                <input
                  type='password' id='newPassword' name='newPassword'
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className='w-full p-3 border border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-dark font-sans'
                />
                <p className="text-xs text-text-dark/70 mt-2 font-sans">La contraseña debe tener al menos 6 caracteres.</p>
              </div>
            </div>
            <div className="pt-6 border-t border-primary/30 mt-6 text-right max-w-md">
              <button 
                type='submit' 
                disabled={passwordLoading}
                className='px-6 py-2 bg-secondary text-text-light font-display text-lg tracking-wider rounded-none shadow hover:shadow-lg transition-all disabled:bg-gray-600'
              >
                {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </form>
        </section>
        
      </div>
    </div>
  )
}