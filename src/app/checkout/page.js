'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function CheckoutContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const formationId  = searchParams.get('formation')

  const [user,      setUser]      = useState(null)
  const [formation, setFormation] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [paying,    setPaying]    = useState(false)
  const [message,   setMessage]   = useState('')
  const [methode,   setMethode]   = useState('mobile_money')

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      if (formationId) {
        const { data } = await supabase
          .from('formations')
          .select('*')
          .eq('id', formationId)
          .single()
        setFormation(data)
      }
      setLoading(false)
    }
    loadData()
  }, [formationId])

  async function handlePaiement(e) {
    e.preventDefault()
    if (!formation || !user) return
    setPaying(true)
    setMessage('')

    const transactionId = 'CFPI-' + Date.now()

    await supabase.from('paiements').insert({
      user_id:        user.id,
      formation_id:   formation.id,
      montant:        formation.prix,
      statut:         'en_attente',
      transaction_id: transactionId,
    })

    setTimeout(async () => {
      await supabase
        .from('paiements')
        .update({ statut: 'confirme' })
        .eq('transaction_id', transactionId)

      const { data: insExiste } = await supabase
        .from('inscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('formation_id', formation.id)
        .single()

      if (!insExiste) {
        await supabase.from('inscriptions').insert({
          user_id:      user.id,
          formation_id: formation.id,
          progression:  0,
          statut:       'actif',
        })
      }

      setMessage('Paiement confirmé ! Redirection vers votre cours...')
      setPaying(false)
      setTimeout(() => router.push(`/cours/${formation.id}`), 1500)
    }, 2000)
  }

  if (loading) {
    return (
      <div style={{minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <p style={{color:'#166534'}}>Chargement...</p>
      </div>
    )
  }

  const inputStyle = {
    width:'100%', padding:'10px 14px', border:'1px solid #d1fae5',
    borderRadius:'8px', fontSize:'14px', color:'#14532d',
    background:'#fff', outline:'none', marginTop:'6px'
  }
  const labelStyle = {
    fontSize:'13px', fontWeight:'500', color:'#14532d', display:'block'
  }

  return (
    <div style={{minHeight:'100vh', background:'#f0fdf4', padding:'40px 24px'}}>
      <div style={{maxWidth:'900px', margin:'0 auto'}}>

        {/* FIL D'ARIANE */}
        <div style={{display:'flex', gap:'8px', fontSize:'13px', color:'#166534', marginBottom:'24px'}}>
          <Link href="/formations" style={{color:'#16a34a', textDecoration:'none'}}>Formations</Link>
          <span>/</span>
          <span>Paiement</span>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 340px', gap:'24px', alignItems:'flex-start'}}>

          {/* FORMULAIRE PAIEMENT */}
          <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'16px', padding:'28px'}}>
            <h1 style={{fontSize:'20px', fontWeight:'500', color:'#14532d', margin:'0 0 6px'}}>
              Finaliser votre inscription
            </h1>
            <p style={{fontSize:'13px', color:'#166534', margin:'0 0 24px'}}>
              Choisissez votre mode de paiement
            </p>

            {/* Message */}
            {message && (
              <div style={{background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:'8px', padding:'12px', fontSize:'13px', color:'#16a34a', marginBottom:'16px', fontWeight:'500'}}>
                {message}
              </div>
            )}

            {/* Méthodes de paiement */}
            <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'24px'}}>
              {[
                { id:'mobile_money', label:'Mobile Money', desc:'Orange Money · Moov Money', color:'#f97316' },
                { id:'carte',        label:'Carte bancaire', desc:'Visa · Mastercard',         color:'#1d4ed8' },
                { id:'virement',     label:'Virement bancaire', desc:'Paiement différé',        color:'#7e22ce' },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setMethode(m.id)}
                  style={{
                    display:'flex', alignItems:'center', gap:'14px',
                    padding:'14px 16px', border:`2px solid ${methode === m.id ? '#16a34a' : '#d1fae5'}`,
                    borderRadius:'10px', cursor:'pointer',
                    background: methode === m.id ? '#f0fdf4' : '#fff',
                  }}>
                  <div style={{width:'10px', height:'10px', borderRadius:'50%', border:`2px solid ${methode === m.id ? '#16a34a' : '#d1fae5'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    {methode === m.id && <div style={{width:'5px', height:'5px', borderRadius:'50%', background:'#16a34a'}}/>}
                  </div>
                  <div>
                    <p style={{fontSize:'14px', fontWeight:'500', color:'#14532d', margin:'0 0 2px'}}>{m.label}</p>
                    <p style={{fontSize:'12px', color:'#166534', margin:0}}>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulaire Mobile Money */}
            {methode === 'mobile_money' && (
              <form onSubmit={handlePaiement}>
                <div style={{marginBottom:'16px'}}>
                  <label style={labelStyle}>Numéro de téléphone</label>
                  <input type="tel" placeholder="07X XXX XXX" style={inputStyle} required/>
                </div>
                <div style={{marginBottom:'24px'}}>
                  <label style={labelStyle}>Opérateur</label>
                  <select style={{...inputStyle, marginTop:'6px'}}>
                    <option>Orange Money</option>
                    <option>Moov Money</option>
                  </select>
                </div>
                <button type="submit" disabled={paying}
                  style={{width:'100%', background: paying ? '#86efac' : '#16a34a', color:'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'14px', fontWeight:'500', cursor: paying ? 'not-allowed' : 'pointer'}}>
                  {paying ? 'Traitement en cours...' : `Payer ${formation?.prix ? Number(formation.prix).toLocaleString('fr-FR') + ' FCFA' : ''}`}
                </button>
              </form>
            )}

            {/* Formulaire Carte */}
            {methode === 'carte' && (
              <form onSubmit={handlePaiement}>
                <div style={{marginBottom:'14px'}}>
                  <label style={labelStyle}>Numéro de carte</label>
                  <input type="text" placeholder="1234 5678 9012 3456" style={inputStyle} required/>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px'}}>
                  <div>
                    <label style={labelStyle}>Expiration</label>
                    <input type="text" placeholder="MM/AA" style={inputStyle} required/>
                  </div>
                  <div>
                    <label style={labelStyle}>CVV</label>
                    <input type="text" placeholder="123" style={inputStyle} required/>
                  </div>
                </div>
                <button type="submit" disabled={paying}
                  style={{width:'100%', background: paying ? '#86efac' : '#16a34a', color:'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'14px', fontWeight:'500', cursor: paying ? 'not-allowed' : 'pointer'}}>
                  {paying ? 'Traitement en cours...' : `Payer ${formation?.prix ? Number(formation.prix).toLocaleString('fr-FR') + ' FCFA' : ''}`}
                </button>
              </form>
            )}

            {/* Virement */}
            {methode === 'virement' && (
              <div>
                <div style={{background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:'10px', padding:'16px', marginBottom:'20px'}}>
                  {[
                    { label:'Banque',  value:'Coris Bank International' },
                    { label:'IBAN',    value:'BF00 0000 0000 0000 0000' },
                    { label:'Motif',   value:`CFPI-${user?.email}` },
                    { label:'Montant', value: formation?.prix ? Number(formation.prix).toLocaleString('fr-FR') + ' FCFA' : '' },
                  ].map((r, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom: i < 3 ? '1px solid #d1fae5' : 'none', fontSize:'13px'}}>
                      <span style={{color:'#166534'}}>{r.label}</span>
                      <span style={{color:'#14532d', fontWeight:'500'}}>{r.value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handlePaiement} disabled={paying}
                  style={{width:'100%', background: paying ? '#86efac' : '#16a34a', color:'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'14px', fontWeight:'500', cursor: paying ? 'not-allowed' : 'pointer'}}>
                  {paying ? 'Traitement...' : 'Confirmer le virement'}
                </button>
              </div>
            )}
          </div>

          {/* RÉCAPITULATIF */}
          <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'16px', padding:'24px', position:'sticky', top:'72px'}}>
            <h3 style={{fontSize:'16px', fontWeight:'500', color:'#14532d', margin:'0 0 16px'}}>
              Récapitulatif
            </h3>

            {formation && (
              <>
                <div style={{background:'#f0fdf4', borderRadius:'10px', padding:'14px', marginBottom:'16px'}}>
                  <p style={{fontSize:'13px', fontWeight:'500', color:'#14532d', margin:'0 0 4px'}}>{formation.titre}</p>
                  <p style={{fontSize:'12px', color:'#166534', margin:0}}>{formation.duree} · {formation.mode?.replace('_', ' ')}</p>
                </div>

                <div style={{borderTop:'1px solid #d1fae5', paddingTop:'14px', marginBottom:'16px'}}>
                  {[
                    { label:'Sous-total', value: Number(formation.prix).toLocaleString('fr-FR') + ' FCFA' },
                    { label:'Frais',      value: '0 FCFA' },
                  ].map((r, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#166534', marginBottom:'8px'}}>
                      <span>{r.label}</span>
                      <span>{r.value}</span>
                    </div>
                  ))}
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'15px', fontWeight:'500', color:'#14532d', borderTop:'1px solid #d1fae5', paddingTop:'10px', marginTop:'4px'}}>
                    <span>Total</span>
                    <span style={{color:'#16a34a'}}>{Number(formation.prix).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </>
            )}

            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {[
                'Paiement 100% sécurisé',
                'Accès immédiat après paiement',
                'Certificat inclus',
                'Support disponible',
              ].map((item, i) => (
                <div key={i} style={{display:'flex', gap:'8px', alignItems:'center', fontSize:'12px', color:'#166534'}}>
                  <div style={{width:'14px', height:'14px', borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center'}}><p style={{color:'#166534'}}>Chargement...</p></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
