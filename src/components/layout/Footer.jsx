import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{backgroundColor:'#14532d', color:'#bbf7d0', marginTop:'auto'}}>
      <div style={{maxWidth:'1152px', margin:'0 auto', padding:'40px 24px', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'32px'}}>

        <div>
          <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px'}}>
            <div style={{width:'32px', height:'32px', background:'#4ade80', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'600', color:'#14532d'}}>CF</div>
            <span style={{color:'#fff', fontWeight:'500'}}>CFPI</span>
          </div>
          <p style={{fontSize:'13px', lineHeight:'1.6'}}>
            Centre de Formation et de Promotion de l'Informatique.<br/>
            Ouagadougou, Burkina Faso.
          </p>
        </div>

        <div>
          <h4 style={{color:'#fff', fontWeight:'500', fontSize:'13px', marginBottom:'12px'}}>Formations</h4>
          <ul style={{listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:'8px', fontSize:'13px'}}>
            <li><Link href="/formations?cat=web" style={{color:'#bbf7d0', textDecoration:'none'}}>Développement web</Link></li>
            <li><Link href="/formations?cat=bureautique" style={{color:'#bbf7d0', textDecoration:'none'}}>Bureautique & Office</Link></li>
            <li><Link href="/formations" style={{color:'#bbf7d0', textDecoration:'none'}}>Toutes les formations</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{color:'#fff', fontWeight:'500', fontSize:'13px', marginBottom:'12px'}}>Contact</h4>
          <ul style={{listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:'8px', fontSize:'13px'}}>
            <li>contact@cfpi.bf</li>
            <li>+226 XX XX XX XX</li>
            <li>Ouagadougou, Burkina Faso</li>
          </ul>
        </div>
      </div>

      <div style={{borderTop:'1px solid #166534', padding:'16px', textAlign:'center', fontSize:'12px', color:'#4ade80'}}>
        © {new Date().getFullYear()} CFPI — Tous droits réservés
      </div>
    </footer>
  )
}