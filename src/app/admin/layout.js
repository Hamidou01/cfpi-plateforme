'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('userData:', userData)

      if (userData?.role !== 'admin') {
        router.push('/')
        return
      }

      setLoading(false)
    }
    checkAdmin()
  }, [])

  if (loading) {
    return (
      <div style={{minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <p style={{color:'#166534'}}>Vérification des droits admin...</p>
      </div>
    )
  }

  const navLinks = [
    { href:'/admin',              label:'Dashboard'    },
    { href:'/admin/formations',   label:'Formations'   },
    { href:'/admin/apprenants',   label:'Apprenants'   },
    { href:'/admin/inscriptions', label:'Inscriptions' },
  ]

  return (
    <div style={{display:'flex', minHeight:'100vh'}}>
      <aside style={{width:'220px', background:'#14532d', padding:'24px 0', flexShrink:0}}>
        <div style={{padding:'0 20px 24px', borderBottom:'1px solid #166534'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <div style={{width:'32px', height:'32px', background:'#4ade80', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'600', color:'#14532d'}}>
              CF
            </div>
            <div>
              <p style={{color:'#fff', fontSize:'13px', fontWeight:'500', margin:0}}>CFPI Admin</p>
              <p style={{color:'#86efac', fontSize:'11px', margin:0}}>Administration</p>
            </div>
          </div>
        </div>

        <nav style={{padding:'16px 0'}}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              style={{display:'block', padding:'10px 20px', fontSize:'13px', textDecoration:'none', color: pathname === link.href ? '#4ade80' : '#bbf7d0', background: pathname === link.href ? '#166534' : 'transparent', borderLeft: pathname === link.href ? '3px solid #4ade80' : '3px solid transparent'}}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{padding:'16px 20px', borderTop:'1px solid #166534'}}>
          <Link href="/dashboard"
            style={{display:'block', fontSize:'13px', color:'#86efac', textDecoration:'none', marginBottom:'8px'}}>
            ← Espace apprenant
          </Link>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            style={{background:'transparent', border:'1px solid #166534', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#86efac', cursor:'pointer', width:'100%'}}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main style={{flex:1, background:'#f8fffe', overflowY:'auto'}}>
        {children}
      </main>
    </div>
  )
}