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
