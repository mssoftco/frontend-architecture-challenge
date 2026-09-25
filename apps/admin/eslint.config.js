import { createNextConfig } from '@platform/eslint-config/next'

export default createNextConfig({
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['@/features/*/*', '@/features/*/*/**'],
          message: 'Import a feature only from its public index.',
        },
      ],
    },
  ],
})
