'use client'
import { useState } from 'react'
import FormationCard from './FormationCard'
import FormationFilter from './FormationFilter'

export default function CatalogueClient({ formations }) {
  const [filtered, setFiltered] = useState(formations)

  function handleFilter({ search, categorie, mode, niveau }) {
    let result = formations

    if (search) {
      result = result.filter(f =>
        f.titre?.toLowerCase().includes(search.toLowerCase()) ||
        f.description?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (categorie !== 'tous') {
      result = result.filter(f => f.categorie === categorie)
    }
    if (mode !== 'tous') {
      result = result.filter(f => f.mode === mode)
    }
    if (niveau !== 'tous') {
      result = result.filter(f => f.niveau === niveau)
    }

    setFiltered(result)
  }

  return (
    <div style={{display:'flex', gap:'24px', alignItems:'flex-start'}}>
      <FormationFilter onFilter={handleFilter} />

      <div style={{flex:1}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
          <span style={{fontSize:'13px', color:'#166534'}}>
            {filtered.length} formation{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
          </span>
          <select style={{padding:'7px 12px', border:'1px solid #d1fae5', borderRadius:'8px', fontSize:'13px', color:'#14532d', background:'#fff', cursor:'pointer', outline:'none'}}>
            <option>Trier par : Popularité</option>
            <option>Prix croissant</option>
            <option>Prix décroissant</option>
          </select>
        </div>

        {filtered.length > 0 ? (
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'16px'}}>
            {filtered.map(f => (
              <FormationCard key={f.id} formation={f} />
            ))}
          </div>
        ) : (
          <div style={{textAlign:'center', padding:'60px 20px', color:'#166534', border:'1px dashed #d1fae5', borderRadius:'12px'}}>
            <p style={{fontSize:'15px', marginBottom:'8px'}}>Aucune formation trouvée</p>
            <p style={{fontSize:'13px'}}>Essaie d'autres filtres ou mots-clés.</p>
          </div>
        )}
      </div>
    </div>
  )
}