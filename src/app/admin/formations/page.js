'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminFormations() {
  const [formations, setFormations] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [editForm,   setEditForm]   = useState(null)
  const [form,       setForm]       = useState({ titre:'', description:'', prix:'', duree:'', mode:'en_ligne', categorie:'developpement_web', niveau:'debutant' })
  const [saving,     setSaving]     = useState(false)
  const [message,    setMessage]    = useState('')

  useEffect(() => { loadFormations() }, [])

  async function loadFormations() {
    const { data } = await supabase
      .from('formations')
      .select('*, inscriptions(count)')
      .order('created_at', { ascending: false })
    setFormations(data || [])
    setLoading(false)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function openAdd() {
    setEditForm(null)
    setForm({ titre:'', description:'', prix:'', duree:'', mode:'en_ligne', categorie:'developpement_web', niveau:'debutant' })
    setShowForm(true)
  }

  function openEdit(f) {
    setEditForm(f)
    setForm({ titre:f.titre, description:f.description || '', prix:f.prix || '', duree:f.duree || '', mode:f.mode || 'en_ligne', categorie:f.categorie || 'developpement_web', niveau:f.niveau || 'debutant' })
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const payload = { ...form, prix: Number(form.prix) }

    if (editForm) {
      await supabase.from('formations').update(payload).eq('id', editForm.id)
      setMessage('Formation modifiée !')
    } else {
      await supabase.from('formations').insert(payload)
      setMessage('Formation ajoutée !')
    }

    setSaving(false)
    setShowForm(false)
    setEditForm(null)
    loadFormations()
    setTimeout(() => setMessage(''), 3000)
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette formation ?')) return
    await supabase.from('formations').delete().eq('id', id)
    loadFormations()
  }

  const inputStyle = { width:'100%', padding:'9px 12px', border:'1px solid #d1fae5', borderRadius:'8px', fontSize:'13px', color:'#14532d', background:'#fff', outline:'none', marginTop:'4px' }
  const labelStyle = { fontSize:'12px', fontWeight:'500', color:'#14532d', display:'block', marginBottom:'2px' }

  if (loading) return <div style={{padding:'40px', color:'#166534'}}>Chargement...</div>

  return (
    <div style={{padding:'32px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <div>
          <h1 style={{fontSize:'22px', fontWeight:'500', color:'#14532d', margin:'0 0 4px'}}>
            Gestion des formations
          </h1>
          <p style={{fontSize:'13px', color:'#166534', margin:0}}>
            {formations.length} formations au total
          </p>
        </div>
        <button onClick={openAdd}
          style={{background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'10px 20px', fontSize:'13px', fontWeight:'500', cursor:'pointer'}}>
          + Nouvelle formation
        </button>
      </div>

      {message && (
        <div style={{background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:'8px', padding:'10px 16px', fontSize:'13px', color:'#16a34a', marginBottom:'16px'}}>
          {message}
        </div>
      )}

      {/* FORMULAIRE */}
      {showForm && (
        <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', padding:'24px', marginBottom:'24px'}}>
          <h2 style={{fontSize:'16px', fontWeight:'500', color:'#14532d', margin:'0 0 20px'}}>
            {editForm ? 'Modifier la formation' : 'Nouvelle formation'}
          </h2>
          <form onSubmit={handleSave}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px'}}>
              <div>
                <label style={labelStyle}>Titre</label>
                <input name="titre" value={form.titre} onChange={handleChange} required style={inputStyle} placeholder="Titre de la formation"/>
              </div>
              <div>
                <label style={labelStyle}>Prix (FCFA)</label>
                <input name="prix" type="number" value={form.prix} onChange={handleChange} required style={inputStyle} placeholder="25000"/>
              </div>
              <div>
                <label style={labelStyle}>Durée</label>
                <input name="duree" value={form.duree} onChange={handleChange} style={inputStyle} placeholder="4 semaines"/>
              </div>
              <div>
                <label style={labelStyle}>Mode</label>
                <select name="mode" value={form.mode} onChange={handleChange} style={inputStyle}>
                  <option value="en_ligne">En ligne</option>
                  <option value="presentiel">Présentiel</option>
                  <option value="hybride">Hybride</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Catégorie</label>
                <select name="categorie" value={form.categorie} onChange={handleChange} style={inputStyle}>
                  <option value="developpement_web">Développement web</option>
                  <option value="bureautique">Bureautique</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Niveau</label>
                <select name="niveau" value={form.niveau} onChange={handleChange} style={inputStyle}>
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="avance">Avancé</option>
                  <option value="tous">Tous niveaux</option>
                </select>
              </div>
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                style={{...inputStyle, resize:'vertical'}} placeholder="Description de la formation"/>
            </div>
            <div style={{display:'flex', gap:'10px'}}>
              <button type="submit" disabled={saving}
                style={{background: saving ? '#86efac' : '#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'10px 20px', fontSize:'13px', fontWeight:'500', cursor: saving ? 'not-allowed' : 'pointer'}}>
                {saving ? 'Enregistrement...' : editForm ? 'Modifier' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{background:'transparent', border:'1px solid #d1fae5', borderRadius:'8px', padding:'10px 20px', fontSize:'13px', color:'#166534', cursor:'pointer'}}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTE FORMATIONS */}
      <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', overflow:'hidden'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f0fdf4'}}>
              {['Titre', 'Catégorie', 'Mode', 'Prix', 'Niveau', 'Actions'].map((h, i) => (
                <th key={i} style={{padding:'10px 16px', fontSize:'11px', fontWeight:'500', color:'#15803d', textAlign:'left', textTransform:'uppercase', letterSpacing:'.05em'}}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {formations.map((f, i) => (
              <tr key={f.id} style={{borderTop:'1px solid #f0fdf4'}}>
                <td style={{padding:'12px 16px', fontSize:'13px', fontWeight:'500', color:'#14532d'}}>
                  {f.titre}
                </td>
                <td style={{padding:'12px 16px'}}>
                  <span style={{fontSize:'11px', background:'#dcfce7', color:'#15803d', padding:'3px 8px', borderRadius:'20px'}}>
                    {f.categorie === 'developpement_web' ? 'Dev web' : 'Bureautique'}
                  </span>
                </td>
                <td style={{padding:'12px 16px', fontSize:'13px', color:'#166534'}}>
                  {f.mode?.replace('_', ' ')}
                </td>
                <td style={{padding:'12px 16px', fontSize:'13px', fontWeight:'500', color:'#16a34a'}}>
                  {Number(f.prix).toLocaleString('fr-FR')} FCFA
                </td>
                <td style={{padding:'12px 16px', fontSize:'13px', color:'#166534'}}>
                  {f.niveau}
                </td>
                <td style={{padding:'12px 16px'}}>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button onClick={() => openEdit(f)}
                      style={{background:'#dbeafe', color:'#1d4ed8', border:'none', borderRadius:'6px', padding:'5px 12px', fontSize:'12px', cursor:'pointer'}}>
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(f.id)}
                      style={{background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'6px', padding:'5px 12px', fontSize:'12px', cursor:'pointer'}}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}