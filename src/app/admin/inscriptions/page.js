'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminInscriptions() {
  const [inscriptions, setInscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('') // Nouvel état pour la recherche

  useEffect(() => {
    loadInscriptions()
  }, [])

  async function loadInscriptions() {
    setLoading(true)
    const { data } = await supabase
      .from('inscriptions')
      .select('*, users(nom, prenom, email), formations(titre, prix)')
      .order('created_at', { ascending: false })
    
    setInscriptions(data || [])
    setLoading(false)
  }

  const validerAcces = async (id) => {
    const confirm = window.confirm("Voulez-vous valider ce paiement et activer l'accès ?");
    if (!confirm) return;

    const { error } = await supabase
      .from('inscriptions')
      .update({ statut: 'active' })
      .eq('id', id)

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Accès activé avec succès !");
      loadInscriptions();
    }
  }

  // LOGIQUE DE FILTRAGE
  const filteredInscriptions = inscriptions.filter((ins) => {
    const nomComplet = `${ins.users?.prenom} ${ins.users?.nom}`.toLowerCase();
    const email = ins.users?.email?.toLowerCase() || '';
    const recherche = searchTerm.toLowerCase();
    
    return nomComplet.includes(recherche) || email.includes(recherche);
  });

  if (loading) return <div style={{padding:'40px', color:'#166534', textAlign:'center'}}>Chargement des dossiers...</div>

  return (
    <div style={{padding:'32px', maxWidth:'1200px', margin:'0 auto'}}>
      <div style={{marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'15px'}}>
        <div>
          <h1 style={{fontSize:'22px', fontWeight:'600', color:'#14532d', margin:'0 0 4px'}}>
            Gestion des Inscriptions
          </h1>
          <p style={{fontSize:'13px', color:'#166534', margin:0}}>
            {filteredInscriptions.length} dossier(s) affiché(s)
          </p>
        </div>

        {/* BARRE DE RECHERCHE */}
        <div style={{position:'relative', width:'300px'}}>
          <input 
            type="text"
            placeholder="Rechercher un élève (nom ou email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #d1fae5',
              fontSize: '13px',
              outline: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={{position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', border:'none', background:'none', color:'#999', cursor:'pointer'}}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', overflow:'hidden', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.05)'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f0fdf4'}}>
              {['Apprenant', 'Formation', 'Référence OM', 'Statut', 'Date', 'Action'].map((h, i) => (
                <th key={i} style={{padding:'14px 16px', fontSize:'11px', fontWeight:'600', color:'#15803d', textAlign:'left', textTransform:'uppercase', letterSpacing:'.05em'}}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{padding:'40px', textAlign:'center', color:'#666', fontSize:'13px'}}>
                  {searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Aucune inscription pour le moment."}
                </td>
              </tr>
            ) : filteredInscriptions.map((ins) => (
              <tr key={ins.id} style={{borderTop:'1px solid #f0fdf4', transition:'background 0.2s'}} 
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fdfb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
                
                <td style={{padding:'12px 16px'}}>
                  <p style={{fontSize:'13px', fontWeight:'600', color:'#14532d', margin:'0 0 2px'}}>
                    {ins.users?.prenom} {ins.users?.nom}
                  </p>
                  <p style={{fontSize:'11px', color:'#666', margin:0}}>{ins.users?.email}</p>
                </td>

                <td style={{padding:'12px 16px'}}>
                  <p style={{fontSize:'13px', color:'#14532d', margin:0}}>{ins.formations?.titre}</p>
                  <p style={{fontSize:'11px', fontWeight:'600', color:'#16a34a', margin:0}}>
                    {ins.formations?.prix ? Number(ins.formations.prix).toLocaleString('fr-FR') + ' FCFA' : '-'}
                  </p>
                </td>

                <td style={{padding:'12px 16px'}}>
                  <code style={{fontSize:'12px', background:'#fef9c3', color:'#854d0e', padding:'4px 8px', borderRadius:'4px', fontWeight:'bold', border:'1px solid #fde68a'}}>
                    {ins.reference_paiement || 'N/A'}
                  </code>
                </td>

                <td style={{padding:'12px 16px'}}>
                  <span style={{
                    fontSize:'10px', 
                    fontWeight:'bold',
                    textTransform:'uppercase',
                    background: ins.statut === 'active' ? '#dcfce7' : '#fee2e2', 
                    color: ins.statut === 'active' ? '#15803d' : '#b91c1c', 
                    padding:'4px 10px', 
                    borderRadius:'20px'
                  }}>
                    {ins.statut === 'active' ? 'Validé' : 'En attente'}
                  </span>
                </td>

                <td style={{padding:'12px 16px', fontSize:'12px', color:'#666'}}>
                  {new Date(ins.created_at).toLocaleDateString('fr-FR')}
                </td>

                <td style={{padding:'12px 16px'}}>
                  {ins.statut !== 'active' ? (
                    <button 
                      onClick={() => validerAcces(ins.id)}
                      style={{
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
                      }}
                    >
                      Valider
                    </button>
                  ) : (
                    <span style={{fontSize:'11px', color:'#16a34a', fontWeight:'600'}}>✅ Activé</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}