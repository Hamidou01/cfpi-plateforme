import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Configuration des origines autorisées pour le développement */
  allowedDevOrigins: ['192.168.0.100', 'localhost:3000'],
  
  /* Tes autres options si nécessaire */
};

export default nextConfig;