'use client'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function FormationCard({ formation }) {
  const router = useRouter()
  const { id, titre, description, prix, duree, mode, categorie } = formation
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const categorieLabel = categorie === 'developpement_web'
    ? 'Développement web'
    : 'Bureautique'

  const modeColor = {
    en_ligne:   { bg: '#dbeafe', color: '#1d4ed8' },
    presentiel: { bg: '#fef9c3', color: '#854d0e' },
    hybride:    { bg: '#f3e8ff', color: '#7e22ce' },
  }[mode] || { bg: '#f0fdf4', color: '#15803d' }

  async function handleInscription() {
    console.log('bouton cliqué formation:', id)
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: existe } = await supabase
      .from('inscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('formation_id', id)
      .single()

    if (existe) {
      setLoading(false)
      router.push(`/cours/${id}`)
      return
    }

    setLoading(false)
    router.push(`/checkout?formation=${id}`)
  }

  return (
    <div style={{border:'1px solid #d1fae5', borderRadius:'12px', overflow:'hidden', backgroundColor:'#fff'}}>

      {/* En-tête — cliquable vers détail */}
      <Link href={`/formations/${id}`} style={{textDecoration:'none', display:'block'}}>
        <div style={{backgroundColor:'#f0fdf4', padding:'16px', cursor:'pointer'}}>
          <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px'}}>
            <span style={{fontSize:'10px', fontWeight:'500', background:'#dcfce7', color:'#15803d', padding:'3px 8px', borderRadius:'20px'}}>
              {categorieLabel}
            </span>
            <span style={{fontSize:'10px', fontWeight:'500', background:modeColor.bg, color:modeColor.color, padding:'3px 8px', borderRadius:'20px'}}>
              {mode?.replace('_', ' ')}
            </span>
          </div>
          <h3 style={{fontWeight:'500', color:'#14532d', fontSize:'14px', margin:0}}>
            {titre}
          </h3>
        </div>
      </Link>

      {/* Corps — PAS dans un Link */}
      <div style={{padding:'14px 16px'}}>
        <p style={{fontSize:'12px', color:'#166534', lineHeight:'1.6', marginBottom:'12px'}}>
          {description}
        </p>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
          <span style={{fontSize:'15px', fontWeight:'500', color:'#16a34a'}}>
            {prix ? Number(prix).toLocaleString('fr-FR') + ' FCFA' : 'Gratuit'}
          </span>
          <span style={{fontSize:'11px', color:'#166534'}}>
            {duree}
          </span>
        </div>

        {message && (
          <div style={{background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#dc2626', marginBottom:'10px', textAlign:'center'}}>
            {message}
          </div>
        )}

        {/* Boutons — complètement séparés du Link */}
        <div style={{display:'flex', gap:'8px'}}>
          <Link
            href={`/formations/${id}`}
            style={{flex:1, border:'1px solid #d1fae5', color:'#166534', borderRadius:'8px', padding:'9px', fontSize:'12px', textAlign:'center', textDecoration:'none', display:'block'}}>
            Voir détails
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleInscription()
            }}
            disabled={loading}
            style={{flex:1, background: loading ? '#86efac' : '#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'9px', fontSize:'12px', fontWeight:'500', cursor: loading ? 'not-allowed' : 'pointer'}}>
            {loading ? 'En cours...' : "S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  )
}