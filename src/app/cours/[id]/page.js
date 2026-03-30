'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function CoursPage() {
  const router = useRouter()
  const { id } = useParams()
  const [user,        setUser]        = useState(null)
  const [formation,   setFormation]   = useState(null)
  const [cours,       setCours]       = useState([])
  const [coursActif,  setCoursActif]  = useState(null)
  const [inscription, setInscription] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [message,     setMessage]     = useState('')

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: form } = await supabase
        .from('formations')
        .select('*')
        .eq('id', id)
        .single()
      setFormation(form)

      const { data: coursList } = await supabase
        .from('cours')
        .select('*')
        .eq('formation_id', id)
        .order('ordre', { ascending: true })
      setCours(coursList || [])
      if (coursList?.length > 0) setCoursActif(coursList[0])

      const { data: ins } = await supabase
        .from('inscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('formation_id', id)

      if (ins && ins.length > 0) {
        setInscription(ins[0])
      }

      setLoading(false)
    }
    loadData()
  }, [id])

  async function marquerTermine() {
    if (!inscription || !coursActif) return
    setSaving(true)

    const coursIndex     = cours.findIndex(c => c.id === coursActif.id)
    const nbCours        = cours.length
    const newProgression = Math.round(((coursIndex + 1) / nbCours) * 100)

    await supabase
      .from('inscriptions')
      .update({ progression: newProgression })
      .eq('id', inscription.id)

    setInscription({ ...inscription, progression: newProgression })

    if (newProgression >= 100) {
      const { data: certExiste } = await supabase
        .from('certificats')
        .select('id')
        .eq('user_id', user.id)
        .eq('formation_id', id)
        .single()

      if (!certExiste) {
        await supabase.from('certificats').insert({
          user_id:      user.id,
          formation_id: id,
        })
        setMessage('Félicitations ! Vous avez obtenu votre certificat !')
      }
    } else {
      const next = cours[coursIndex + 1]
      if (next) {
        setCoursActif(next)
        setMessage('Cours terminé ! Passage au suivant.')
      }
    }

    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <div style={{minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{textAlign:'center'}}>
          <div style={{width:'40px', height:'40px', border:'3px solid #d1fae5', borderTop:'3px solid #16a34a', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px'}}/>
          <p style={{color:'#166534', fontSize:'14px'}}>Chargement du cours...</p>
        </div>
      </div>
    )
  }

  if (!inscription) {
    return (
      <div style={{minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px'}}>
        <p style={{color:'#14532d', fontSize:'16px', fontWeight:'500'}}>
          Vous n'êtes pas inscrit à cette formation.
        </p>
        <Link href={`/formations/${id}`}
          style={{background:'#16a34a', color:'#fff', padding:'10px 20px', borderRadius:'8px', fontSize:'14px', textDecoration:'none'}}>
          S'inscrire maintenant
        </Link>
      </div>
    )
  }

  const progression = inscription?.progression || 0

  return (
    <div style={{backgroundColor:'#f8fffe', minHeight:'100vh'}}>
      <div style={{maxWidth:'1200px', margin:'0 auto', padding:'24px'}}>

        {/* FIL D'ARIANE */}
        <div style={{display:'flex', gap:'8px', alignItems:'center', fontSize:'13px', color:'#166534', marginBottom:'20px'}}>
          <Link href="/dashboard" style={{color:'#16a34a', textDecoration:'none'}}>Dashboard</Link>
          <span>/</span>
          <Link href="/formations" style={{color:'#16a34a', textDecoration:'none'}}>Formations</Link>
          <span>/</span>
          <span>{formation?.titre}</span>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'280px 1fr', gap:'20px', alignItems:'flex-start'}}>

          {/* SIDEBAR */}
          <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', overflow:'hidden', position:'sticky', top:'72px'}}>
            <div style={{background:'#f0fdf4', padding:'14px 16px', borderBottom:'1px solid #d1fae5'}}>
              <h3 style={{fontSize:'14px', fontWeight:'500', color:'#14532d', margin:'0 0 8px'}}>
                {formation?.titre}
              </h3>
              <div style={{background:'#d1fae5', borderRadius:'4px', height:'5px'}}>
                <div style={{background:'#16a34a', borderRadius:'4px', height:'5px', width:`${progression}%`, transition:'width .4s'}}/>
              </div>
              <p style={{fontSize:'11px', color:'#16a34a', margin:'4px 0 0'}}>
                {progression}% complété
              </p>
            </div>

            <div style={{padding:'8px 0'}}>
              {cours.map((c, i) => {
                const coursIndex = cours.findIndex(cc => cc.id === coursActif?.id)
                const estTermine = i < coursIndex || progression >= 100
                const estActif   = c.id === coursActif?.id

                return (
                  <div key={c.id} onClick={() => setCoursActif(c)}
                    style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px 16px', cursor:'pointer', background: estActif ? '#f0fdf4' : 'transparent', borderLeft: estActif ? '3px solid #16a34a' : '3px solid transparent'}}>
                    <div style={{width:'22px', height:'22px', borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'500', background: estTermine ? '#16a34a' : estActif ? '#dcfce7' : '#f0fdf4', color: estTermine ? '#fff' : estActif ? '#15803d' : '#166534', border:`1px solid ${estTermine ? '#16a34a' : '#d1fae5'}`}}>
                      {estTermine ? '✓' : i + 1}
                    </div>
                    <div style={{flex:1}}>
                      <p style={{fontSize:'12px', fontWeight: estActif ? '500' : '400', color: estActif ? '#14532d' : '#166534', margin:'0 0 2px', lineHeight:'1.3'}}>
                        {c.titre}
                      </p>
                      <p style={{fontSize:'10px', color:'#16a34a', margin:0}}>{c.duree}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CONTENU PRINCIPAL */}
          <div>
            {message && (
              <div style={{background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:'10px', padding:'12px 16px', fontSize:'13px', color:'#16a34a', marginBottom:'16px', fontWeight:'500'}}>
                {message}
              </div>
            )}

            {/* LECTEUR VIDÉO */}
            <div style={{background:'#000', borderRadius:'12px', overflow:'hidden', marginBottom:'16px', aspectRatio:'16/9'}}>
              {coursActif?.video_url ? (
                <iframe
                  src={coursActif.video_url}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{display:'block'}}
                />
              ) : (
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#fff', fontSize:'14px'}}>
                  Vidéo non disponible
                </div>
              )}
            </div>

            {/* INFOS COURS */}
            <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', padding:'20px', marginBottom:'16px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                <div>
                  <h2 style={{fontSize:'18px', fontWeight:'500', color:'#14532d', margin:'0 0 4px'}}>
                    {coursActif?.titre}
                  </h2>
                  <span style={{fontSize:'12px', color:'#16a34a'}}>
                    Durée : {coursActif?.duree}
                  </span>
                </div>
                <button onClick={marquerTermine} disabled={saving}
                  style={{background: saving ? '#86efac' : '#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'10px 20px', fontSize:'13px', fontWeight:'500', cursor: saving ? 'not-allowed' : 'pointer', flexShrink:0}}>
                  {saving ? 'Enregistrement...' : '✓ Marquer comme terminé'}
                </button>
              </div>
              <p style={{fontSize:'13px', color:'#166534', lineHeight:'1.7', margin:0}}>
                {coursActif?.description}
              </p>
            </div>

            {/* NAVIGATION */}
            <div style={{display:'flex', gap:'12px'}}>
              <button
                onClick={() => { const i = cours.findIndex(c => c.id === coursActif?.id); if (i > 0) setCoursActif(cours[i - 1]) }}
                disabled={cours.findIndex(c => c.id === coursActif?.id) === 0}
                style={{flex:1, background:'#fff', border:'1px solid #d1fae5', borderRadius:'8px', padding:'10px', fontSize:'13px', color:'#166534', cursor:'pointer', opacity: cours.findIndex(c => c.id === coursActif?.id) === 0 ? 0.4 : 1}}>
                ← Cours précédent
              </button>
              <button
                onClick={() => { const i = cours.findIndex(c => c.id === coursActif?.id); if (i < cours.length - 1) setCoursActif(cours[i + 1]) }}
                disabled={cours.findIndex(c => c.id === coursActif?.id) === cours.length - 1}
                style={{flex:1, background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'10px', fontSize:'13px', fontWeight:'500', cursor:'pointer', opacity: cours.findIndex(c => c.id === coursActif?.id) === cours.length - 1 ? 0.4 : 1}}>
                Cours suivant →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}