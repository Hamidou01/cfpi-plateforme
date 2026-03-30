'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', password: '', confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.nom || !form.prenom || !form.email || !form.password) {
      return setError('Tous les champs sont obligatoires.')
    }
    if (form.password !== form.confirm) {
      return setError('Les mots de passe ne correspondent pas.')
    }
    if (form.password.length < 6) {
      return setError('Le mot de passe doit contenir au moins 6 caractères.')
    }

    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: { nom: form.nom, prenom: form.prenom }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('users').insert({
        id:     data.user.id,
        email:  form.email,
        nom:    form.nom,
        prenom: form.prenom,
        role:   'apprenant',
      })
      setSuccess('Compte créé avec succès ! Redirection...')
      setTimeout(() => router.push('/dashboard'), 1500)
    }

    setLoading(false)
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
    <div style={{minHeight:'100vh', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px'}}>
      <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'16px', padding:'36px', width:'100%', maxWidth:'460px'}}>

        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:'28px'}}>
          <div style={{width:'48px', height:'48px', background:'#16a34a', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'600', color:'#fff', margin:'0 auto 12px'}}>
            CF
          </div>
          <h1 style={{fontSize:'22px', fontWeight:'500', color:'#14532d', margin:'0 0 4px'}}>
            Créer un compte
          </h1>
          <p style={{fontSize:'13px', color:'#166534', margin:0}}>
            Rejoignez le CFPI et commencez à apprendre
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div style={{background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'#dc2626', marginBottom:'16px'}}>
            {error}
          </div>
        )}
        {success && (
          <div style={{background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'#16a34a', marginBottom:'16px'}}>
            {success}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px'}}>
            <div>
              <label style={labelStyle}>Nom</label>
              <input name="nom" value={form.nom} onChange={handleChange}
                placeholder="Kaboré" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input name="prenom" value={form.prenom} onChange={handleChange}
                placeholder="Ibrahim" style={inputStyle}/>
            </div>
          </div>

          <div style={{marginBottom:'14px'}}>
            <label style={labelStyle}>Adresse email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="ibrahim@email.com" style={inputStyle}/>
          </div>

          <div style={{marginBottom:'14px'}}>
            <label style={labelStyle}>Mot de passe</label>
            <input name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="Minimum 6 caractères" style={inputStyle}/>
          </div>

          <div style={{marginBottom:'24px'}}>
            <label style={labelStyle}>Confirmer le mot de passe</label>
            <input name="confirm" type="password" value={form.confirm} onChange={handleChange}
              placeholder="Répétez le mot de passe" style={inputStyle}/>
          </div>

          <button type="submit" disabled={loading}
            style={{width:'100%', background: loading ? '#86efac' : '#16a34a', color:'#fff', border:'none', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:'500', cursor: loading ? 'not-allowed' : 'pointer'}}>
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{textAlign:'center', fontSize:'13px', color:'#166534', marginTop:'20px'}}>
          Déjà un compte ?{' '}
          <Link href="/login" style={{color:'#16a34a', fontWeight:'500', textDecoration:'none'}}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}