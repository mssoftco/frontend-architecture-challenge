import { createNodeConfig } from '@platform/eslint-config/node'

export default createNodeConfig({
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['@platform/auth', '@platform/auth/*', '@platform/http', '@platform/ui', '@platform/ui/*'],
          message: 'The API owns security and must not depend on frontend packages.',
        },
      ],
    },
  ],
})
