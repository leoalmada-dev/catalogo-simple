// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  // Ignorar artefactos de build y reportes
  globalIgnores([
    '.next/**',
    'coverage/**',
    'out/**',
    'build/**',
    'node_modules/**',
    'next-env.d.ts',
  ]),

  // Reglas de Next optimizadas para Core Web Vitals
  ...nextVitals,

  // Reglas/soporte para TypeScript en Next
  ...nextTs,
])
