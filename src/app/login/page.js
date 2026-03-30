'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      return setError('Email et mot de passe obligatoires.')
    }

    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    })

    if (authError) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    if (data.user) {
      router.push('/dashboard')
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
      <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'16px', padding:'36px', width:'100%', maxWidth:'400px'}}>

        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:'28px'}}>
          <div style={{width:'48px', height:'48px', background:'#16a34a', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'600', color:'#fff', margin:'0 auto 12px'}}>
            CF
          </div>
          <h1 style={{fontSize:'22px', fontWeight:'500', color:'#14532d', margin:'0 0 4px'}}>
            Connexion
          </h1>
          <p style={{fontSize:'13px', color:'#166534', margin:0}}>
            Accédez à votre espace apprenant
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'#dc2626', marginBottom:'16px'}}>
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'14px'}}>
            <label style={labelStyle}>Adresse email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="votre@email.com" style={inputStyle}/>
          </div>

          <div style={{marginBottom:'8px'}}>
            <label style={labelStyle}>Mot de passe</label>
            <input name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="Votre mot de passe" style={inputStyle}/>
          </div>

          <div style={{textAlign:'right', marginBottom:'24px'}}>
            <Link href="/forgot-password" style={{fontSize:'12px', color:'#16a34a', textDecoration:'none'}}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button type="submit" disabled={loading}
            style={{width:'100%', background: loading ? '#86efac' : '#16a34a', color:'#fff', border:'none', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:'500', cursor: loading ? 'not-allowed' : 'pointer'}}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{textAlign:'center', fontSize:'13px', color:'#166534', marginTop:'20px'}}>
          Pas encore de compte ?{' '}
          <Link href="/register" style={{color:'#16a34a', fontWeight:'500', textDecoration:'none'}}>
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  )
}