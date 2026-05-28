'use client'
import { useState, useEffect } from 'react'
import FormationFilter from './FormationFilter'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CatalogueClient({ formations }) {
  const router = useRouter()
  const [filtered, setFiltered] = useState(formations || [])
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    if (formations) {
      setFiltered(formations)
    }
  }, [formations])

  function handleFilter({ search, categorie, mode, niveau }) {
    let result = [...formations]

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
    if (niveau && niveau !== 'tous') {
      result = result.filter(f => f.niveau?.toLowerCase() === niveau.toLowerCase())
    }

    setFiltered(result)
  }

  // Logique d'inscription sécurisée et isolée
  const handleInscription = async (formation) => {
    setLoadingId(formation.id)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      alert("Vous devez être connecté pour vous inscrire.")
      router.push('/login')
      setLoadingId(null)
      return
    }

    const prixFormate = formation.prix ? Number(formation.prix).toLocaleString('fr-FR') + ' FCFA' : 'Gratuit'
    const reference = prompt(`Pour valider votre inscription à "${formation.titre}", envoyez ${prixFormate} par Orange Money au +226 XX XX XX XX.\n\nEntrez ici la RÉFÉRENCE de la transaction (ex: PP2603...) :`);

    if (!reference) {
      alert("L'inscription a été annulée. La référence est obligatoire.");
      setLoadingId(null)
      return;
    }

    const { error } = await supabase.from('inscriptions').insert([
      { 
        user_id: user.id, 
        formation_id: formation.id, 
        statut: 'en_attente',
        reference_paiement: reference,
        mode_paiement: 'Orange Money'
      }
    ])

    setLoadingId(null)

    if (!error) {
      alert("Référence enregistrée ! L'administration du CFPI va valider votre accès sous peu.");
      router.push('/dashboard');
    } else {
      alert("Erreur lors de l'enregistrement : " + error.message);
    }
  }

  return (
    <div style={{display:'flex', gap:'24px', alignItems:'flex-start'}}>
      <FormationFilter onFilter={handleFilter} />

      <div style={{flex:1}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
          <span style={{fontSize:'13px', color:'#166534', fontWeight:'500'}}>
            {filtered.length} formation{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          {filtered.length > 0 ? (
            filtered.map(f => {
              const modeColor = {
                en_ligne:   { bg: '#dbeafe', color: '#1d4ed8' },
                presentiel: { bg: '#fef9c3', color: '#854d0e' },
                hybride:    { bg: '#f3e8ff', color: '#7e22ce' },
              }[f.mode] || { bg: '#f0fdf4', color: '#15803d' }

              return (
                <div key={f.id} style={{border:'1px solid #d1fae5', borderRadius:'12px', backgroundColor:'#fff', display:'flex', flexDirection:'column', overflow:'hidden'}}>
                  {/* En-tête coloré de la carte */}
                  <div style={{backgroundColor:'#f0fdf4', padding:'16px', borderBottom:'1px solid #e6fbf0'}}>
                    <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px'}}>
                      <span style={{fontSize:'10px', fontWeight:'500', background:'#dcfce7', color:'#15803d', padding:'3px 8px', borderRadius:'20px'}}>
                        {f.categorie === 'developpement_web' ? 'Développement web' : 'Bureautique'}
                      </span>
                      <span style={{fontSize:'10px', fontWeight:'500', background:modeColor.bg, color:modeColor.color, padding:'3px 8px', borderRadius:'20px'}}>
                        {f.mode ? f.mode.replace('_', ' ') : 'en ligne'}
                      </span>
                      {f.niveau && (
                        <span style={{fontSize:'10px', fontWeight:'500', background:'#e0f2fe', color:'#0369a1', padding:'3px 8px', borderRadius:'20px', textTransform:'capitalize'}}>
                          {f.niveau}
                        </span>
                      )}
                    </div>
                    <h3 style={{fontWeight:'600', color:'#14532d', fontSize:'16px', margin:0}}>
                      {f.titre}
                    </h3>
                  </div>

                  {/* Corps de la carte */}
                  <div style={{padding:'16px'}}>
                    <p style={{fontSize:'13px', color:'#166534', lineHeight:'1.6', margin:'0 0 16px 0'}}>
                      {f.description}
                    </p>
                    
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', borderTop:'1px dashed #f0fdf4', paddingTop:'12px'}}>
                      <span style={{fontSize:'16px', fontWeight:'600', color:'#16a34a'}}>
                        {f.prix ? Number(f.prix).toLocaleString('fr-FR') + ' FCFA' : 'Gratuit'}
                      </span>
                      <span style={{fontSize:'12px', color:'#666', fontWeight:'500'}}>
                        ⏱️ {f.duree || 'Durée non spécifiée'}
                      </span>
                    </div>

                    {/* Actions simplifiées et sécurisées sans conflits HTML */}
                    <div style={{display:'flex', gap:'12px'}}>
                      <button
                        type="button"
                        onClick={() => router.push(`/formations/${f.id}`)}
                        style={{flex:1, border:'1px solid #16a34a', color:'#16a34a', background:'none', borderRadius:'8px', padding:'10px', fontSize:'13px', fontWeight:'500', cursor:'pointer', textAlign:'center'}}>
                        Voir détails
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleInscription(f)}
                        disabled={loadingId === f.id}
                        style={{flex:1, background: loadingId === f.id ? '#86efac' : '#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'10px', fontSize:'13px', fontWeight:'500', cursor: loadingId === f.id ? 'not-allowed' : 'pointer'}}>
                        {loadingId === f.id ? 'Traitement...' : "S'inscrire"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{textAlign:'center', padding:'60px 20px', color:'#166534', border:'1px dashed #d1fae5', borderRadius:'12px'}}>
              <p style={{fontSize:'15px', marginBottom:'8px'}}>Aucune formation trouvée</p>
              <p style={{fontSize:'13px'}}>Essaie d'autres filtres ou mots-clés.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
