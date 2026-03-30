import { supabase } from '@/lib/supabase'
import CatalogueClient from '@/components/formations/CatalogueClient'

async function getFormations() {
  const { data, error } = await supabase
    .from('formations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur Supabase:', error)
    return []
  }
  return data || []
}

export default async function FormationsPage() {
  const formations = await getFormations()

  return (
    <div>
      <div style={{backgroundColor:'#f0fdf4', borderBottom:'1px solid #d1fae5', padding:'32px 24px'}}>
        <div style={{maxWidth:'1152px', margin:'0 auto'}}>
          <h1 style={{fontSize:'28px', fontWeight:'500', color:'#14532d', marginBottom:'6px'}}>
            Nos formations
          </h1>
          <p style={{fontSize:'14px', color:'#166534'}}>
            {formations.length} formations disponibles · Bureautique & Développement web · En ligne, Présentiel, Hybride
          </p>
        </div>
      </div>

      <div style={{maxWidth:'1152px', margin:'0 auto', padding:'32px 24px'}}>
        <CatalogueClient formations={formations} />
      </div>
    </div>
  )
}