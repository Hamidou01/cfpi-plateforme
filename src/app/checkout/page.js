'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Fonction de temporisation propre compatible async/await
const delay = (ms) => new Promise(res => setTimeout(res, ms));

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
    setMessage('Initialisation de la transaction...')

    const transactionId = 'CFPI-' + Date.now()

    // 1. Enregistrement initial du paiement en attente
    const { error: errInsert } = await supabase.from('paiements').insert({
      user_id:        user.id,
      formation_id:   formation.id,
      montant:        formation.prix,
      statut:         'en_attente',
      transaction_id: transactionId,
    })

    if (errInsert) {
      alert("Erreur de paiement : " + errInsert.message)
      setPaying(false)
      return
    }

    // Simulation du délai de traitement bancaire (2 secondes)
    await delay(2000)

    // 2. Mise à jour du statut du paiement
    await supabase
      .from('paiements')
      .update({ statut: 'confirme' })
      .eq('transaction_id', transactionId)

    // 3. Vérification de l'inscription existante
    const { data: insExiste } = await supabase
      .from('inscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('formation_id', formation.id)
      .maybeSingle() // Évite de lever une exception si vide

    // 4. Inscription définitive de l'étudiant
    if (!insExiste) {
      await supabase.from('inscriptions').insert({
        user_id:      user.id,
        formation_id: formation.id,
        statut:       'valide', // Passe à valide automatiquement pour la simulation
        reference_paiement: transactionId,
        mode_paiement: methode === 'mobile_money' ? 'Mobile Money' : 'Carte Bancaire'
      })
    }

    setMessage('Paiement confirmé ! Redirection vers votre tableau de bord...')
    setPaying(false)
    
    await delay(1500)
    router.push('/dashboard')
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
                { id:'mobile_money', label:'Mobile Money', desc:'Orange Money · Moov Money' },
                { id:'carte',        label:'Carte bancaire', desc:'Visa · Mastercard' },
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

          </div>

          {/* RÉCAPITULATIF COMMANDE */}
          <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'16px', padding:'24px', position:'sticky', top:'40px'}}>
            <h2 style={{fontSize:'15px', fontWeight:'600', color:'#14532d', margin:'0 0 16px'}}>Résumé de la commande</h2>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px', fontSize:'14px', color:'#166534'}}>
              <span>{formation?.titre || 'Formation'}</span>
              <span style={{fontWeight:'500'}}>{formation?.prix ? Number(formation.prix).toLocaleString('fr-FR') + ' FCFA' : '0'}</span>
            </div>
            <div style={{borderTop:'1px solid #f0fdf4', marginTop:'16px', paddingTop:'16px', display:'flex', justifyContent:'space-between', fontSize:'16px', fontWeight:'600', color:'#14532d'}}>
              <span>Total</span>
