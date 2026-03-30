import Link from 'next/link'

export default function FormationCard({ formation }) {
  const { id, titre, description, prix, duree, mode, categorie } = formation

  const categorieLabel = categorie === 'developpement_web' ? 'Développement web' : 'Bureautique'

  const modeColor = {
    en_ligne:    { bg: '#dbeafe', color: '#1d4ed8' },
    presentiel:  { bg: '#fef9c3', color: '#854d0e' },
    hybride:     { bg: '#f3e8ff', color: '#7e22ce' },
  }[mode] || { bg: '#f0fdf4', color: '#15803d' }

  return (
    <Link href={`/formations/${id}`} style={{textDecoration:'none', display:'block'}}>
      <div style={{border:'1px solid #d1fae5', borderRadius:'12px', overflow:'hidden', backgroundColor:'#fff', cursor:'pointer', transition:'border-color .2s'}}>

        {/* En-tête carte */}
        <div style={{backgroundColor:'#f0fdf4', padding:'16px'}}>
          <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px'}}>
            <span style={{fontSize:'10px', fontWeight:'500', background:'#dcfce7', color:'#15803d', padding:'3px 8px', borderRadius:'20px'}}>
              {categorieLabel}
            </span>
            <span style={{fontSize:'10px', fontWeight:'500', background:modeColor.bg, color:modeColor.color, padding:'3px 8px', borderRadius:'20px'}}>
              {mode?.replace('_', ' ')}
            </span>
          </div>
          <h3 style={{fontWeight:'500', color:'#14532d', fontSize:'14px', margin:0}}>{titre}</h3>
        </div>

        {/* Corps carte */}
        <div style={{padding:'14px 16px'}}>
          <p style={{fontSize:'12px', color:'#166534', lineHeight:'1.6', marginBottom:'12px'}}>
            {description}
          </p>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{fontSize:'15px', fontWeight:'500', color:'#16a34a'}}>
              {prix ? Number(prix).toLocaleString('fr-FR') + ' FCFA' : 'Gratuit'}
            </span>
            <span style={{fontSize:'11px', color:'#166534'}}>
              {duree}
            </span>
          </div>
          <button style={{marginTop:'12px', width:'100%', background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'9px', fontSize:'13px', fontWeight:'500', cursor:'pointer'}}>
            S'inscrire
          </button>
        </div>
      </div>
    </Link>
  )
}