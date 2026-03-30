'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ formations: 0, apprenants: 0, inscriptions: 0, revenus: 0 })
  const [loading, setLoading] = useState(true)
  const [inscriptionsRecentes, setInscriptionsRecentes] = useState([])

  useEffect(() => {
    async function loadStats() {
      // On récupère les données en parallèle pour plus de rapidité
      const [
        { count: formationsCount },
        { count: apprenantsCount },
        { count: inscriptionsCount },
        { data: inscriptionsData }, // On récupère les inscriptions pour les revenus et les récentes
      ] = await Promise.all([
        supabase.from('formations').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('inscriptions').select('*', { count: 'exact', head: true }),
        supabase.from('inscriptions').select('*, users(nom, prenom, email), formations(titre, prix)').order('created_at', { ascending: false })
      ])

      // Calcul des revenus : On somme le prix des formations pour toutes les inscriptions validées ('active')
      const revenusCalcules = inscriptionsData
        ?.filter(ins => ins.statut === 'active')
        .reduce((acc, ins) => acc + (Number(ins.formations?.prix) || 0), 0) || 0

      setStats({ 
        formations: formationsCount || 0, 
        apprenants: apprenantsCount || 0, 
        inscriptions: inscriptionsCount || 0, 
        revenus: revenusCalcules 
      })

      // On prend les 5 dernières pour l'affichage du tableau
      setInscriptionsRecentes(inscriptionsData?.slice(0, 5) || [])
      setLoading(false)
    }
    loadStats()
  }, [])

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#166534' }}>Chargement de l'administration...</div>

  const statCards = [
    { label: 'Formations', value: stats.formations, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Apprenants', value: stats.apprenants, color: '#1d4ed8', bg: '#dbeafe' },
    { label: 'Inscriptions', value: stats.inscriptions, color: '#7e22ce', bg: '#f3e8ff' },
    { label: 'Revenus', value: Number(stats.revenus).toLocaleString('fr-FR') + ' FCFA', color: '#854d0e', bg: '#fef9c3' },
  ]

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#14532d', margin: '0 0 4px' }}>Tableau de bord</h1>
        <p style={{ fontSize: '13px', color: '#166534', margin: 0 }}>Vue d'ensemble du CFPI</p>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '32px' }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: '12px', padding: '18px' }}>
            <p style={{ fontSize: '12px', color: s.color, margin: '0 0 6px', fontWeight: '500' }}>{s.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '600', color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* RACCOURCIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '32px' }}>
        {[
          { href: '/admin/formations', label: '+ Ajouter une formation', color: '#16a34a' },
          { href: '/admin/apprenants', label: 'Voir les apprenants', color: '#1d4ed8' },
          { href: '/admin/inscriptions', label: 'Gérer les paiements', color: '#7e22ce' },
        ].map((r, i) => (
          <Link key={i} href={r.href}
            style={{ display: 'block', background: '#fff', border: `1px solid ${r.color}20`, borderRadius: '10px', padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '500', color: r.color, textDecoration: 'none' }}>
            {r.label}
          </Link>
        ))}
      </div>

      {/* INSCRIPTIONS RÉCENTES */}
      <div style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #d1fae5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: '#14532d', margin: 0 }}>Inscriptions récentes</h2>
          <Link href="/admin/inscriptions" style={{ fontSize: '12px', color: '#16a34a', textDecoration: 'none' }}>Voir tout →</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0fdf4' }}>
              {['Apprenant', 'Formation', 'Paiement (Réf)', 'Statut'].map((h, i) => (
                <th key={i} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: '500', color: '#15803d', textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inscriptionsRecentes.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#166534' }}>Aucune inscription pour le moment</td></tr>
            ) : inscriptionsRecentes.map((ins) => (
              <tr key={ins.id} style={{ borderTop: '1px solid #f0fdf4' }}>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                  <strong>{ins.users?.prenom} {ins.users?.nom}</strong>
                  <div style={{ fontSize: '11px', color: '#166534' }}>{ins.users?.email}</div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>{ins.formations?.titre}</td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#e53e3e', fontWeight: '500' }}>
                   {ins.reference_paiement || '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
                    background: ins.statut === 'active' ? '#dcfce7' : '#fef9c3',
                    color: ins.statut === 'active' ? '#166534' : '#854d0e'
                  }}>
                    {ins.statut === 'active' ? 'VALIDÉ' : 'EN ATTENTE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}