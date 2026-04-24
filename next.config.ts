import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['pdf2json', '@google-cloud/vertexai'],
}

export default nextConfig