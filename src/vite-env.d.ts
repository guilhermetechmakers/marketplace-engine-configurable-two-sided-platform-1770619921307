interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.css' {
  const url: string
  export default url
}

// Module declarations for packages that may not resolve or lack type declarations
declare module 'lucide-react'
declare module '@tanstack/react-query'
declare module 'recharts'
declare module 'sonner'
