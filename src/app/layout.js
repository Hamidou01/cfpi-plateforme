import { Inter } from 'next/font/google'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "CFPI — Centre de Formation et de Promotion de l'Informatique",
  description: 'Formations en bureautique et développement web à Ouagadougou',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${inter.className}`} style={{display:'flex', flexDirection:'column', minHeight:'100vh', backgroundColor:'#f8fafc'}}>
        <Navbar />
        <main style={{flex:1}}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}