/// <reference types="vite/client" />

// Allow importing .yaml files as raw strings via ?raw suffix
declare module '*.yaml?raw' {
  const content: string
  export default content
}

declare module '*.yaml' {
  const content: Record<string, unknown>
  export default content
}
