import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Ajout de l'IP détectée par vos logs (172.20.160.1) et de localhost
  allowedDevOrigins: ['172.20.160.1', '192.168.0.102', 'localhost:3000'],
  
  // vos autres options de configuration...
}

export default nextConfig
