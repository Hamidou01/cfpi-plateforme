'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminApprenants() {
  const [apprenants, setApprenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // États pour la fenêtre de détails (Modal)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userInscriptions, setUserInscriptions] = useState([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadApprenants()
  }, [])

  async function loadApprenants() {
    setLoading(true)
    // On récupère les users et on compte leurs inscriptions
    const { data, error } = await supabase
      .from('users')
      .select('*, inscriptions(count)')
      .order('created_at', { ascending: false })
    
    if (!error) setApprenants(data || [])
    setLoading(false)
  }

  // Fonction pour voir l'historique d'un élève
  async function voirDetails(user) {
    setSelectedUser(user)
    setShowModal(true)
    const { data } = await supabase
      .from('inscriptions')
      .select('*, formations(titre, prix)')
      .eq('user_id', user.id)
    
    setUserInscriptions(data || [])
  }

  // Fonction pour changer le rôle (ex: promouvoir un formateur)
  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'apprenant' : 'admin'
    if (!confirm(`Changer le rôle de cet utilisateur en ${newRole} ?`)) return

    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (!error) loadApprenants()
  }

  const filtered = apprenants.filter(a =>
    `${a.nom} ${a.prenom} ${a.email}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{padding:'40px', color:'#166634', textAlign:'center'}}>Chargement des profils...</div>

  return (
    <div style={{padding:'32px', maxWidth:'1200px', margin:'0 auto'}}>
      <div style={{marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1 style={{fontSize:'22px', fontWeight:'600', color:'#14532d', margin:'0 0 4px'}}>Gestion des apprenants</h1>
          <p style={{fontSize:'13px', color:'#166534', margin:0}}>{apprenants.length} utilisateurs enregistrés</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Rechercher par nom, prénom ou email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{width:'100%', maxWidth:'400px', padding:'12px 16px', border:'1px solid #d1fae5', borderRadius:'10px', fontSize:'13px', marginBottom:'25px', outline:'none', boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}
      />

      <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', overflow:'hidden', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.05)'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f0fdf4'}}>
              {['Apprenant', 'Rôle', 'Inscriptions', 'Date', 'Actions'].map((h, i) => (
                <th key={i} style={{padding:'14px 16px', fontSize:'11px', fontWeight:'600', color:'#15803d', textAlign:'left', textTransform:'uppercase', letterSpacing:'.05em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} style={{borderTop:'1px solid #f0fdf4'}}>
                <td style={{padding:'12px 16px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'600', color:'#fff'}}>
                      {(a.prenom?.[0] || '') + (a.nom?.[0] || '')}
                    </div>
                    <div>
                      <div style={{fontSize:'13px', fontWeight:'600', color:'#14532d'}}>{a.prenom} {a.nom}</div>
                      <div style={{fontSize:'11px', color:'#666'}}>{a.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'12px 16px'}}>
                   <button 
                    onClick={() => toggleRole(a.id, a.role)}
                    style={{fontSize:'10px', cursor:'pointer', border:'none', background: a.role === 'admin' ? '#fef9c3' : '#dcfce7', color: a.role === 'admin' ? '#854d0e' : '#15803d', padding:'4px 10px', borderRadius:'20px', fontWeight:'bold'}}
                   >
                    {a.role}
                   </button>
                </td>
                <td style={{padding:'12px 16px', fontSize:'13px', color:'#166534', textAlign:'center'}}>
                  <strong>{a.inscriptions?.[0]?.count || 0}</strong>
                </td>
                <td style={{padding:'12px 16px', fontSize:'12px', color:'#666'}}>
                  {new Date(a.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td style={{padding:'12px 16px'}}>
                  <button 
                    onClick={() => voirDetails(a)}
                    style={{padding:'6px 12px', borderRadius:'6px', border:'1px solid #16a34a', background:'none', color:'#16a34a', fontSize:'11px', fontWeight:'600', cursor:'pointer'}}
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE DÉTAILS */}
      {showModal && selectedUser && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <div style={{background:'#fff', padding:'30px', borderRadius:'16px', width:'90%', maxWidth:'500px', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'}}>
            <h2 style={{margin:'0 0 15px', color:'#14532d'}}>{selectedUser.prenom} {selectedUser.nom}</h2>
            <p style={{fontSize:'14px', color:'#666', marginBottom:'20px'}}>Historique des inscriptions :</p>
            
            <div style={{maxHeight:'300px', overflowY:'auto', marginBottom:'20px'}}>
              {userInscriptions.length === 0 ? <p style={{fontSize:'13px'}}>Aucun cours pour le moment.</p> : 
                userInscriptions.map(ins => (
                  <div key={ins.id} style={{padding:'10px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
                    <span style={{fontSize:'13px'}}>{ins.formations?.titre}</span>
                    <span style={{fontSize:'11px', fontWeight:'bold', color: ins.statut === 'active' ? '#16a34a' : '#854d0e'}}>
                      {ins.statut === 'active' ? 'PAYÉ' : 'ATTENTE'}
                    </span>
                  </div>
                ))
              }
            </div>
            
            <button 
              onClick={() => setShowModal(false)}
              style={{width:'100%', padding:'10px', background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}