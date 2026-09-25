import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export function createNodeConfig(rules = {}) {
  return defineConfig([
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
      rules,
    },
  ])
}
