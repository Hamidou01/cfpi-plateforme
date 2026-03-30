'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [inscriptions, setInscriptions] = useState([])
  const [certificats, setCertificats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      // FIX : Utilisation de getSession() au lieu de getUser() pour éviter le conflit de Lock
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) { 
        router.push('/login')
        return 
      }

      const currentUser = session.user
      setUser(currentUser)

      // Chargement parallèle des données pour plus de rapidité
      const [insResponse, certsResponse] = await Promise.all([
        supabase
          .from('inscriptions')
          .select('*, formations(*)')
          .eq('user_id', currentUser.id),
        supabase
          .from('certificats')
          .select('*, formations(*)')
          .eq('user_id', currentUser.id)
      ])

      setInscriptions(insResponse.data || [])
      setCertificats(certsResponse.data || [])
      setLoading(false)
    }
    
    loadData()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh() // Force le rafraîchissement pour vider les états
  }

  if (loading) {
    return (
      <div style={{minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:'40px', height:'40px', border:'3px solid #d1fae5', borderTop:'3px solid #16a34a', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px'}}></div>
          <p style={{color:'#166534', fontSize:'14px'}}>Chargement de votre espace...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // Calculs des initiales et du nom
  const prenom = user?.user_metadata?.prenom || ""
  const nom = user?.user_metadata?.nom || ""
  const nomComplet = prenom || nom ? `${prenom} ${nom}` : user?.email
  const initiales = (prenom[0] || "" + nom[0] || "").toUpperCase() || user?.email?.[0].toUpperCase() || "AP"
  
  const heuresTotal = inscriptions.reduce((acc, i) => acc + (i.progression || 0) / 10, 0)

  const stats = [
    { label: 'Formations inscrites', value: inscriptions.length },
    { label: 'Cours complétés',      value: inscriptions.filter(i => i.progression >= 100).length },
    { label: 'Certificats obtenus',  value: certificats.length },
    { label: 'Heures de formation',  value: Math.round(heuresTotal) + 'h' },
  ]

  return (
    <div style={{backgroundColor:'#f8fffe', minHeight:'100vh'}}>
      <div style={{maxWidth:'1152px', margin:'0 auto', padding:'32px 24px'}}>

        {/* EN-TÊTE */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
            <div style={{width:'52px', height:'52px', borderRadius:'50%', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'500', color:'#fff', flexShrink:0}}>
              {initiales}
            </div>
            <div>
              <h1 style={{fontSize:'20px', fontWeight:'500', color:'#14532d', margin:'0 0 2px'}}>
                Bonjour, {prenom || 'Apprenant'} !
              </h1>
              <p style={{fontSize:'13px', color:'#166534', margin:0}}>
                {user?.email}
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{background:'transparent', border:'1px solid #d1fae5', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', color:'#166534', cursor:'pointer'}}>
            Déconnexion
          </button>
        </div>

        {/* STATS */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'28px'}}>
          {stats.map((s, i) => (
            <div key={i} style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', padding:'16px'}}>
              <p style={{fontSize:'12px', color:'#166534', margin:'0 0 6px'}}>{s.label}</p>
              <p style={{fontSize:'26px', fontWeight:'500', color:'#16a34a', margin:0}}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* CONTENU PRINCIPAL */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:'20px'}}>

          {/* FORMATIONS EN COURS */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
              <h2 style={{fontSize:'17px', fontWeight:'500', color:'#14532d', margin:0}}>
                Mes formations en cours
              </h2>
              <Link href="/formations"
                style={{fontSize:'13px', color:'#16a34a', textDecoration:'none'}}>
                + S'inscrire à une formation
              </Link>
            </div>

            {inscriptions.length === 0 ? (
              <div style={{background:'#fff', border:'1px dashed #d1fae5', borderRadius:'12px', padding:'40px', textAlign:'center'}}>
                <p style={{color:'#166534', fontSize:'14px', marginBottom:'16px'}}>
                  Vous n'êtes inscrit à aucune formation pour le moment.
                </p>
                <Link href="/formations"
                  style={{background:'#16a34a', color:'#fff', padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:'500', textDecoration:'none'}}>
                  Voir les formations
                </Link>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {inscriptions.map((ins) => {
                  const f = ins.formations
                  const prog = ins.progression || 0
                  const statut = prog >= 100 ? 'Terminé' : prog > 0 ? 'En cours' : 'Non commencé'
                  const statutColor = prog >= 100
                    ? { bg:'#dcfce7', color:'#15803d' }
                    : prog > 0
                    ? { bg:'#dbeafe', color:'#1d4ed8' }
                    : { bg:'#fef9c3', color:'#854d0e' }

                  return (
                    <div key={ins.id} style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', padding:'18px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                        <div style={{flex:1}}>
                          <h3 style={{fontSize:'14px', fontWeight:'500', color:'#14532d', margin:'0 0 4px'}}>
                            {f?.titre || 'Formation'}
                          </h3>
                          <span style={{fontSize:'11px', color:'#166534'}}>
                            {f?.mode?.replace('_', ' ')} · {f?.duree}
                          </span>
                        </div>
                        <span style={{fontSize:'11px', fontWeight:'500', background:statutColor.bg, color:statutColor.color, padding:'3px 10px', borderRadius:'20px', flexShrink:0, marginLeft:'10px'}}>
                          {statut}
                        </span>
                      </div>

                      <div style={{background:'#f0fdf4', borderRadius:'4px', height:'6px', marginBottom:'6px'}}>
                        <div style={{background:'#16a34a', borderRadius:'4px', height:'6px', width:`${prog}%`, transition:'width .4s'}}/>
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#166534', marginBottom:'12px'}}>
                        <span>{prog}% complété</span>
                        <span>{f?.categorie === 'developpement_web' ? 'Développement web' : 'Bureautique'}</span>
                      </div>

                      <Link href={`/cours/${f?.id}`}
                        style={{display:'inline-block', background:'#f0fdf4', border:'1px solid #d1fae5', color:'#16a34a', padding:'7px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'500', textDecoration:'none'}}>
                        {prog > 0 ? 'Continuer →' : 'Commencer →'}
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* COLONNE DROITE */}
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>

            {/* CERTIFICATS */}
            <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', padding:'18px'}}>
              <h3 style={{fontSize:'15px', fontWeight:'500', color:'#14532d', margin:'0 0 14px'}}>
                Certificats obtenus
              </h3>
              {certificats.length === 0 ? (
                <div style={{textAlign:'center', padding:'20px 0'}}>
                  <div style={{width:'40px', height:'40px', background:'#f0fdf4', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5">
                      <path d="M12 15l-2 5L8 18l-5 2 2-5-1.5-1.5M12 15l2 5 2-3 5 2-2-5 1.5-1.5M12 15A6 6 0 1012 3a6 6 0 000 12z"/>
                    </svg>
                  </div>
                  <p style={{fontSize:'12px', color:'#166534'}}>
                    Terminez une formation pour obtenir votre certificat.
                  </p>
                </div>
              ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                  {certificats.map((c) => (
                    <div key={c.id} style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:'#f0fdf4', borderRadius:'8px'}}>
                      <div style={{width:'32px', height:'32px', background:'#dcfce7', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                          <path d="M12 15l-2 5L8 18l-5 2 2-5-1.5-1.5M12 15l2 5 2-3 5 2-2-5 1.5-1.5M12 15A6 6 0 1012 3a6 6 0 000 12z"/>
                        </svg>
                      </div>
                      <div>
                        <p style={{fontSize:'12px', fontWeight:'500', color:'#14532d', margin:'0 0 2px'}}>
                          {c.formations?.titre}
                        </p>
                        <p style={{fontSize:'11px', color:'#16a34a', margin:0}}>
                          Obtenu le {new Date(c.date_obtention).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* INFOS COMPTE */}
            <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', padding:'18px'}}>
              <h3 style={{fontSize:'15px', fontWeight:'500', color:'#14532d', margin:'0 0 14px'}}>
                Mon compte
              </h3>
              <div style={{display:'flex', flexDirection:'column', gap:'10px', fontSize:'13px'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <span style={{color:'#166534'}}>Nom complet</span>
                  <span style={{color:'#14532d', fontWeight:'500'}}>
                    {nomComplet}
                  </span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <span style={{color:'#166534'}}>Email</span>
                  <span style={{color:'#14532d', fontWeight:'500', fontSize:'12px'}}>
                    {user?.email}
                  </span>
                </div>
              </div>
              <Link href="/profil"
                style={{display:'block', marginTop:'14px', border:'1px solid #d1fae5', borderRadius:'8px', padding:'8px', fontSize:'13px', color:'#166534', textAlign:'center', textDecoration:'none'}}>
                Modifier mon profil
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}