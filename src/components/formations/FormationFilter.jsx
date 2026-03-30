'use client'
import { useState } from 'react'

export default function FormationFilter({ onFilter }) {
  const [search, setSearch]       = useState('')
  const [categorie, setCategorie] = useState('tous')
  const [mode, setMode]           = useState('tous')
  const [niveau, setNiveau]       = useState('tous')

  function handleChange(newVals) {
    const vals = { search, categorie, mode, niveau, ...newVals }
    onFilter(vals)
  }

  const labelStyle = {fontSize:'11px', fontWeight:'500', color:'#15803d', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'8px', display:'block'}
  const selectStyle = {width:'100%', padding:'8px 10px', border:'1px solid #d1fae5', borderRadius:'8px', fontSize:'13px', color:'#14532d', background:'#fff', cursor:'pointer', outline:'none'}

  return (
    <aside style={{width:'220px', flexShrink:0, background:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', padding:'20px', alignSelf:'flex-start', position:'sticky', top:'72px'}}>

      {/* Recherche */}
      <div style={{marginBottom:'20px'}}>
        <span style={labelStyle}>Recherche</span>
        <input
          type="text"
          placeholder="Mot-clé..."
          value={search}
          onChange={e => { setSearch(e.target.value); handleChange({ search: e.target.value }) }}
          style={{...selectStyle, padding:'8px 12px'}}
        />
      </div>

      {/* Catégorie */}
      <div style={{marginBottom:'20px'}}>
        <span style={labelStyle}>Catégorie</span>
        <select value={categorie} onChange={e => { setCategorie(e.target.value); handleChange({ categorie: e.target.value }) }} style={selectStyle}>
          <option value="tous">Toutes</option>
          <option value="developpement_web">Développement web</option>
          <option value="bureautique">Bureautique</option>
        </select>
      </div>

      {/* Mode */}
      <div style={{marginBottom:'20px'}}>
        <span style={labelStyle}>Mode</span>
        <select value={mode} onChange={e => { setMode(e.target.value); handleChange({ mode: e.target.value }) }} style={selectStyle}>
          <option value="tous">Tous</option>
          <option value="en_ligne">En ligne</option>
          <option value="presentiel">Présentiel</option>
          <option value="hybride">Hybride</option>
        </select>
      </div>

      {/* Niveau */}
      <div style={{marginBottom:'20px'}}>
        <span style={labelStyle}>Niveau</span>
        <select value={niveau} onChange={e => { setNiveau(e.target.value); handleChange({ niveau: e.target.value }) }} style={selectStyle}>
          <option value="tous">Tous</option>
          <option value="debutant">Débutant</option>
          <option value="intermediaire">Intermédiaire</option>
          <option value="avance">Avancé</option>
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          setSearch(''); setCategorie('tous'); setMode('tous'); setNiveau('tous')
          onFilter({ search:'', categorie:'tous', mode:'tous', niveau:'tous' })
        }}
        style={{width:'100%', background:'transparent', border:'1px solid #d1fae5', borderRadius:'8px', padding:'8px', fontSize:'13px', color:'#166534', cursor:'pointer'}}>
        Réinitialiser les filtres
      </button>
    </aside>
  )
}