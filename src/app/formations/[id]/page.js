import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getFormation(id) {
  const { data, error } = await supabase
    .from('formations')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export default async function FormationDetailPage({ params }) {
  const formation = await getFormation(params.id)

  if (!formation) notFound()

  const {
    titre, description, prix, duree, mode,
    categorie, niveau, formateur, nb_apprenants, programme
  } = formation

  const categorieLabel = categorie === 'developpement_web' ? 'Développement web' : 'Bureautique'

  const modeColors = {
    en_ligne:   { bg:'#dbeafe', color:'#1d4ed8' },
    presentiel: { bg:'#fef9c3', color:'#854d0e' },
    hybride:    { bg:'#f3e8ff', color:'#7e22ce' },
  }
  const modeColor = modeColors[mode] || { bg:'#f0fdf4', color:'#15803d' }

  const niveauLabel = {
    debutant:      'Débutant',
    intermediaire: 'Intermédiaire',
    avance:        'Avancé',
    tous:          'Tous niveaux',
  }[niveau] || niveau

  return (
    <div>
      {/* EN-TÊTE */}
      <div style={{backgroundColor:'#f0fdf4', borderBottom:'1px solid #d1fae5', padding:'40px 24px'}}>
        <div style={{maxWidth:'1152px', margin:'0 auto'}}>

          {/* Fil d'Ariane */}
          <div style={{display:'flex', gap:'8px', alignItems:'center', fontSize:'13px', color:'#166534', marginBottom:'16px'}}>
            <Link href="/" style={{color:'#16a34a', textDecoration:'none'}}>Accueil</Link>
            <span>/</span>
            <Link href="/formations" style={{color:'#16a34a', textDecoration:'none'}}>Formations</Link>
            <span>/</span>
            <span>{titre}</span>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:'40px', alignItems:'start'}}>

            {/* Infos principales */}
            <div>
              <div style={{display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap'}}>
                <span style={{fontSize:'11px', fontWeight:'500', background:'#dcfce7', color:'#15803d', padding:'4px 10px', borderRadius:'20px'}}>
                  {categorieLabel}
                </span>
                <span style={{fontSize:'11px', fontWeight:'500', background:modeColor.bg, color:modeColor.color, padding:'4px 10px', borderRadius:'20px'}}>
                  {mode?.replace('_', ' ')}
                </span>
                <span style={{fontSize:'11px', fontWeight:'500', background:'#fef9c3', color:'#854d0e', padding:'4px 10px', borderRadius:'20px'}}>
                  {niveauLabel}
                </span>
              </div>

              <h1 style={{fontSize:'30px', fontWeight:'500', color:'#14532d', marginBottom:'12px', lineHeight:'1.3'}}>
                {titre}
              </h1>
              <p style={{fontSize:'15px', color:'#166534', lineHeight:'1.7', marginBottom:'20px'}}>
                {description}
              </p>

              {/* Méta infos */}
              <div style={{display:'flex', gap:'24px', flexWrap:'wrap'}}>
                {[
                  { label: 'Durée',      value: duree },
                  { label: 'Formateur',  value: formateur || 'CFPI' },
                  { label: 'Apprenants', value: (nb_apprenants || 0) + ' inscrits' },
                  { label: 'Niveau',     value: niveauLabel },
                ].map((m, i) => (
                  <div key={i}>
                    <div style={{fontSize:'11px', color:'#16a34a', fontWeight:'500', marginBottom:'2px'}}>{m.label}</div>
                    <div style={{fontSize:'14px', color:'#14532d', fontWeight:'500'}}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carte d'inscription */}
            <div style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'16px', padding:'24px', position:'sticky', top:'72px'}}>
              <div style={{fontSize:'28px', fontWeight:'500', color:'#16a34a', marginBottom:'4px'}}>
                {prix ? Number(prix).toLocaleString('fr-FR') + ' FCFA' : 'Gratuit'}
              </div>
              <p style={{fontSize:'12px', color:'#166534', marginBottom:'20px'}}>
                Accès complet · Certificat inclus
              </p>

              <Link href={`/checkout?formation=${formation.id}`}
                style={{display:'block', background:'#16a34a', color:'#fff', padding:'14px', borderRadius:'10px', fontSize:'14px', fontWeight:'500', textAlign:'center', textDecoration:'none', marginBottom:'10px'}}>
                S'inscrire maintenant
              </Link>
              <Link href="/contact"
                style={{display:'block', border:'1px solid #d1fae5', color:'#166534', padding:'12px', borderRadius:'10px', fontSize:'14px', textAlign:'center', textDecoration:'none'}}>
                Demander un devis entreprise
              </Link>

              <div style={{borderTop:'1px solid #d1fae5', marginTop:'20px', paddingTop:'16px'}}>
                {[
                  'Accès à vie au contenu',
                  'Support du formateur',
                  'Certificat de réussite',
                  'Ressources téléchargeables',
                ].map((item, i) => (
                  <div key={i} style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px', fontSize:'13px', color:'#166534'}}>
                    <div style={{width:'16px', height:'16px', borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
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

      {/* CONTENU PRINCIPAL */}
      <div style={{maxWidth:'1152px', margin:'0 auto', padding:'40px 24px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:'40px'}}>

          {/* Colonne gauche */}
          <div>

            {/* Programme */}
            <div style={{marginBottom:'40px'}}>
              <h2 style={{fontSize:'20px', fontWeight:'500', color:'#14532d', marginBottom:'20px'}}>
                Programme de la formation
              </h2>
              {programme && Array.isArray(programme) ? (
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                  {programme.map((p, i) => (
                    <div key={i} style={{display:'flex', gap:'16px', alignItems:'center', background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:'10px', padding:'14px 16px'}}>
                      <div style={{width:'32px', height:'32px', background:'#16a34a', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'500', color:'#fff', flexShrink:0}}>
                        {i + 1}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'13px', fontWeight:'500', color:'#14532d'}}>{p.titre}</div>
                        <div style={{fontSize:'11px', color:'#16a34a', marginTop:'2px'}}>{p.module}</div>
                      </div>
                      <div style={{fontSize:'12px', color:'#166534', background:'#dcfce7', padding:'3px 10px', borderRadius:'20px'}}>
                        {p.duree}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{color:'#166534', fontSize:'14px'}}>Programme en cours de mise à jour.</p>
              )}
            </div>

            {/* À qui s'adresse cette formation */}
            <div style={{marginBottom:'40px'}}>
              <h2 style={{fontSize:'20px', fontWeight:'500', color:'#14532d', marginBottom:'16px'}}>
                À qui s'adresse cette formation ?
              </h2>
              <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'12px'}}>
                {[
                  'Étudiants cherchant à acquérir des compétences pratiques',
                  'Professionnels souhaitant se reconvertir',
                  'Employés d\'entreprise en développement de compétences',
                  'Toute personne motivée à apprendre l\'informatique',
                ].map((item, i) => (
                  <div key={i} style={{display:'flex', gap:'10px', background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:'10px', padding:'14px'}}>
                    <div style={{width:'20px', height:'20px', borderRadius:'50%', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{fontSize:'13px', color:'#14532d', lineHeight:'1.5'}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formateur */}
            <div>
              <h2 style={{fontSize:'20px', fontWeight:'500', color:'#14532d', marginBottom:'16px'}}>
                Votre formateur
              </h2>
              <div style={{display:'flex', gap:'16px', alignItems:'center', background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:'12px', padding:'20px'}}>
                <div style={{width:'52px', height:'52px', borderRadius:'50%', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:'500', color:'#fff', flexShrink:0}}>
                  {formateur ? formateur.split(' ').map(w => w[0]).join('').slice(0, 2) : 'CF'}
                </div>
                <div>
                  <div style={{fontSize:'15px', fontWeight:'500', color:'#14532d'}}>{formateur || 'Équipe CFPI'}</div>
                  <div style={{fontSize:'13px', color:'#16a34a', marginTop:'2px'}}>Formateur certifié · CFPI</div>
                  <div style={{fontSize:'12px', color:'#166534', marginTop:'6px', lineHeight:'1.5'}}>
                    Expert avec plusieurs années d'expérience dans la formation professionnelle en informatique à Ouagadougou.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite — formations similaires */}
          <div>
            <h3 style={{fontSize:'16px', fontWeight:'500', color:'#14532d', marginBottom:'16px'}}>
              Vous pourriez aussi aimer
            </h3>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {[
                { titre:'JavaScript fondamentaux', prix:'35 000', duree:'6 semaines' },
                { titre:'React JS moderne',         prix:'50 000', duree:'8 semaines' },
                { titre:'Word & Excel avancé',      prix:'15 000', duree:'2 semaines' },
              ].map((f, i) => (
                <div key={i} style={{background:'#fff', border:'1px solid #d1fae5', borderRadius:'10px', padding:'14px', cursor:'pointer'}}>
                  <div style={{fontSize:'13px', fontWeight:'500', color:'#14532d', marginBottom:'6px'}}>{f.titre}</div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#166534'}}>
                    <span>{f.duree}</span>
                    <span style={{color:'#16a34a', fontWeight:'500'}}>{f.prix} FCFA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}