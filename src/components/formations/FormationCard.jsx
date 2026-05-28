'use client'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function FormationCard({ formation }) {
  const router = useRouter()
  const { id, titre, description, prix, duree, mode, categorie, niveau } = formation
  const [loading, setLoading] = useState(false)

  const categorieLabel = categorie === 'developpement_web'
    ? 'Développement web'
    : 'Bureautique'

  const modeColor = {
    en_ligne:   { bg: '#dbeafe', color: '#1d4ed8' },
    presentiel: { bg: '#fef9c3', color: '#854d0e' },
    hybride:    { bg: '#f3e8ff', color: '#7e22ce' },
  }[mode] || { bg: '#f0fdf4', color: '#15803d' }

  const handleInscription = async () => {
    setLoading(true)

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      alert("Vous devez être connecté pour vous inscrire.")
      router.push('/login')
      setLoading(false)
      return
    }

    const prixFormate = prix ? Number(prix).toLocaleString('fr-FR') + ' FCFA' : 'Gratuit'
    const reference = prompt(`Pour valider votre inscription à "${titre}", envoyez ${prixFormate} par Orange Money au +226 XX XX XX XX.\n\nEntrez ici la RÉFÉRENCE de la transaction (ex: PP2603...) :`);

    if (!reference) {
      alert("L'inscription a été annulée. La référence est obligatoire.");
      setLoading(false)
      return;
    }

    const { error } = await supabase.from('inscriptions').insert([
      { 
        user_id: user.id, 
        formation_id: id, 
        statut: 'en_attente',
        reference_paiement: reference,
        mode_paiement: 'Orange Money'
      }
    ])

    setLoading(false)

    if (!error) {
      alert("Référence enregistrée ! L'administration du CFPI va valider votre accès sous peu.");
      router.push('/dashboard');
    } else {
      alert("Erreur lors de l'enregistrement : " + error.message);
    }
  }

  return (
    <div style={{border:'1px solid #d1fae5', borderRadius:'12px', overflow:'hidden', backgroundColor:'#fff'}}>
      <Link href={`/formations/${id}`} style={{textDecoration:'none', display:'block'}}>
        <div style={{backgroundColor:'#f0fdf4', padding:'16px', cursor:'pointer'}}>
          <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px'}}>
            <span style={{fontSize:'10px', fontWeight:'500', background:'#dcfce7', color:'#15803d', padding:'3px 8px', borderRadius:'20px'}}>
              {categorieLabel}
            </span>
            <span style={{fontSize:'10px', fontWeight:'500', background:modeColor.bg, color:modeColor.color, padding:'3px 8px', borderRadius:'20px'}}>
              {mode?.replace('_', ' ')}
            </span>
            {niveau && (
              <span style={{fontSize:'10px', fontWeight:'500', background:'#e0f2fe', color:'#0369a1', padding:'3px 8px', borderRadius:'20px'}}>
                {niveau}
              </span>
            )}
          </div>
          <h3 style={{fontWeight:'500', color:'#14532d', fontSize:'14px', margin:0}}>
            {titre}
          </h3>
        </div>
      </Link>

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

        <div style={{display:'flex', gap:'8px'}}>
          <Link href={`/formations/${id}`}
            style={{flex:1, border:'1px solid #d1fae5', color:'#166534', borderRadius:'8px', padding:'9px', fontSize:'12px', textAlign:'center', textDecoration:'none', display:'block'}}>
            Voir détails
          </Link>
          <button
            type="button"
            onClick={(e) => {
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
