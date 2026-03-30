import Link from 'next/link'
import { supabase } from '@/lib/supabase'

async function getFormations() {
  const { data } = await supabase
    .from('formations')
    .select('*')
    .limit(3)
  return data || []
}

export default async function HomePage() {
  const formations = await getFormations()

  return (
    <>
      {/* HERO */}
      <section style={{backgroundColor:'#f0fdf4', borderBottom:'1px solid #d1fae5', padding:'64px 24px', textAlign:'center'}}>
        <span style={{display:'inline-block', background:'#dcfce7', color:'#15803d', fontSize:'12px', fontWeight:'500', padding:'6px 16px', borderRadius:'20px', marginBottom:'16px'}}>
          Centre de Formation à Ouagadougou
        </span>
        <h1 style={{fontSize:'36px', fontWeight:'500', color:'#14532d', marginBottom:'16px', lineHeight:'1.3'}}>
          Formez-vous aux métiers<br/>
          <span style={{color:'#16a34a'}}>de l'informatique</span>
        </h1>
        <p style={{color:'#166534', fontSize:'15px', maxWidth:'520px', margin:'0 auto 32px', lineHeight:'1.7'}}>
          Bureautique, développement web, en ligne ou en présentiel.
          Des formations adaptées à tous les niveaux pour booster votre carrière.
        </p>
        <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
          <Link href="/formations" style={{background:'#16a34a', color:'#fff', padding:'12px 24px', borderRadius:'8px', fontSize:'14px', fontWeight:'500', textDecoration:'none'}}>
            Voir les formations
          </Link>
          <Link href="/register" style={{border:'1.5px solid #16a34a', color:'#16a34a', padding:'12px 24px', borderRadius:'8px', fontSize:'14px', fontWeight:'500', textDecoration:'none'}}>
            S'inscrire gratuitement
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section style={{backgroundColor:'#fff', borderBottom:'1px solid #d1fae5'}}>
        <div style={{maxWidth:'1152px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4, 1fr)'}}>
          {[
            { n: '500+', l: 'Apprenants formés' },
            { n: '12',   l: 'Formations disponibles' },
            { n: '95%',  l: 'Taux de satisfaction' },
            { n: '5 ans',l: "D'expérience" },
          ].map((s, i) => (
            <div key={i} style={{textAlign:'center', padding:'24px 16px', borderRight: i < 3 ? '1px solid #d1fae5' : 'none'}}>
              <div style={{fontSize:'24px', fontWeight:'500', color:'#16a34a'}}>{s.n}</div>
              <div style={{fontSize:'12px', color:'#166534', marginTop:'4px'}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FORMATIONS */}
      <section style={{maxWidth:'1152px', margin:'0 auto', padding:'56px 24px'}}>
        <div style={{textAlign:'center', marginBottom:'40px'}}>
          <h2 style={{fontSize:'26px', fontWeight:'500', color:'#14532d', marginBottom:'8px'}}>
            Nos formations populaires
          </h2>
          <p style={{fontSize:'14px', color:'#166534'}}>
            Bureautique & Office · Développement web · En ligne & Présentiel
          </p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px'}}>
          {formations.length > 0 ? formations.map((f) => (
            <Link key={f.id} href={`/formations/${f.id}`} style={{textDecoration:'none', border:'1px solid #d1fae5', borderRadius:'12px', overflow:'hidden', backgroundColor:'#fff', display:'block'}}>
              <div style={{backgroundColor:'#f0fdf4', padding:'16px'}}>
                <span style={{fontSize:'11px', fontWeight:'500', background:'#dcfce7', color:'#15803d', padding:'4px 10px', borderRadius:'20px'}}>
                  {f.categorie === 'developpement_web' ? 'Développement web' : 'Bureautique'}
                </span>
                <h3 style={{fontWeight:'500', color:'#14532d', marginTop:'8px', fontSize:'14px'}}>{f.titre}</h3>
              </div>
              <div style={{padding:'16px'}}>
                <p style={{fontSize:'12px', color:'#166534', marginBottom:'12px', lineHeight:'1.6'}}>{f.description}</p>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span style={{color:'#16a34a', fontWeight:'500', fontSize:'15px'}}>
                    {f.prix ? Number(f.prix).toLocaleString('fr-FR') + ' FCFA' : 'Gratuit'}
                  </span>
                  <span style={{fontSize:'11px', background:'#f0fdf4', color:'#166534', padding:'3px 10px', borderRadius:'20px'}}>
                    {f.mode}
                  </span>
                </div>
              </div>
            </Link>
          )) : (
            <p style={{color:'#166534', gridColumn:'span 3', textAlign:'center'}}>
              Aucune formation disponible pour le moment.
            </p>
          )}
        </div>
        <div style={{textAlign:'center', marginTop:'32px'}}>
          <Link href="/formations" style={{border:'1.5px solid #16a34a', color:'#16a34a', padding:'12px 24px', borderRadius:'8px', fontSize:'14px', fontWeight:'500', textDecoration:'none'}}>
            Voir toutes les formations →
          </Link>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section style={{backgroundColor:'#f0fdf4', borderTop:'1px solid #d1fae5', padding:'56px 24px'}}>
        <div style={{maxWidth:'900px', margin:'0 auto'}}>
          <h2 style={{fontSize:'26px', fontWeight:'500', color:'#14532d', textAlign:'center', marginBottom:'32px'}}>
            Ce que disent nos apprenants
          </h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'20px'}}>
            {[
              { texte: "Le CFPI m'a permis de maîtriser Excel en 2 semaines. Les formateurs sont très pédagogues et disponibles.", nom: 'Koné Salimata', role: 'Employée de banque', initiales: 'KS' },
              { texte: "J'ai appris le développement web depuis zéro. Aujourd'hui je crée des sites pour des clients à Ouagadougou.", nom: 'Ouédraogo Tiéba', role: 'Freelance développeur', initiales: 'OT' },
            ].map((t, i) => (
              <div key={i} style={{backgroundColor:'#fff', border:'1px solid #d1fae5', borderRadius:'12px', padding:'20px'}}>
                <p style={{fontSize:'13px', color:'#166534', fontStyle:'italic', lineHeight:'1.7', marginBottom:'16px'}}>
                  "{t.texte}"
                </p>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'500', color:'#fff', flexShrink:0}}>
                    {t.initiales}
                  </div>
                  <div>
                    <div style={{fontSize:'13px', fontWeight:'500', color:'#14532d'}}>{t.nom}</div>
                    <div style={{fontSize:'12px', color:'#16a34a'}}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}