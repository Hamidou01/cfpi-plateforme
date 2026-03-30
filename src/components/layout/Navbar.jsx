'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // 1. Vérification initiale de la session (version légère)
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    }
    checkUser()

    // 2. Écouteur de changement d'état (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      
      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  // Fonction pour récupérer le rôle et le prénom depuis ta table 'users'
  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('prenom, nom, role')
        .eq('id', userId)
        .single()
      
      if (!error && data) {
        setProfile(data)
      }
    } catch (err) {
      console.error("Erreur profil Navbar:", err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
    router.refresh() // Crucial pour informer le Middleware que la session est vide
  }

  return (
    <nav style={{backgroundColor:'#14532d', position:'sticky', top:0, zIndex:50, borderBottom:'1px solid #166534'}}>
      <div style={{maxWidth:'1152px', margin:'0 auto', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>

        {/* Logo */}
        <Link href="/" style={{display:'flex', alignItems:'center', gap:'12px', textDecoration:'none'}}>
          <div style={{width:'32px', height:'32px', background:'#4ade80', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'600', color:'#14532d'}}>
            CF
          </div>
          <div>
            <span style={{color:'#fff', fontWeight:'500', fontSize:'14px'}}>CFPI</span>
            <span style={{color:'#86efac', fontSize:'10px', display:'block', lineHeight:'1', marginTop:'1px'}}>Centre de Formation</span>
          </div>
        </Link>

        {/* Liens desktop */}
        <div style={{display:'flex', alignItems:'center', gap:'24px'}}>
          <Link href="/formations" style={{color:'#bbf7d0', fontSize:'13px', textDecoration:'none'}}>Formations</Link>
          <Link href="/dashboard"  style={{color:'#bbf7d0', fontSize:'13px', textDecoration:'none'}}>E-learning</Link>
          
          {/* LIEN ADMIN CONDITIONNEL - Apparaît si le rôle est 'admin' */}
          {profile?.role === 'admin' && (
            <Link href="/admin" style={{
              color:'#fef08a', 
              fontSize:'12px', 
              fontWeight:'bold', 
              textDecoration:'none', 
              background:'#ffffff15', 
              padding:'4px 10px', 
              borderRadius:'6px',
              border:'1px solid #fef08a40'
            }}>
              ⚙️ ADMINISTRATION
            </Link>
          )}
        </div>

        {/* Zone Utilisateur / Boutons */}
        <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
          {user ? (
            <>
              <div style={{display:'flex', alignItems:'center', gap:'8px', borderRight:'1px solid #ffffff20', paddingRight:'12px'}}>
                <div style={{width:'24px', height:'24px', borderRadius:'50%', background:'#4ade80', color:'#14532d', fontSize:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>
                  {profile?.prenom?.[0] || user.email?.[0].toUpperCase()}
                </div>
                <div style={{display:'flex', flexDirection:'column'}}>
                  <span style={{color:'#fff', fontSize:'12px', fontWeight:'500', lineHeight:'1'}}>
                    {profile?.prenom || 'Élève'}
                  </span>
                  {profile?.role === 'admin' && <span style={{fontSize:'8px', color:'#fef08a', fontWeight:'bold'}}>ADMIN</span>}
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                style={{background:'none', border:'none', color:'#fca5a5', fontSize:'12px', cursor:'pointer', fontWeight:'500'}}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{color:'#bbf7d0', fontSize:'13px', textDecoration:'none'}}>Connexion</Link>
              <Link href="/register" style={{background:'#4ade80', color:'#14532d', padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:'500', textDecoration:'none'}}>
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}