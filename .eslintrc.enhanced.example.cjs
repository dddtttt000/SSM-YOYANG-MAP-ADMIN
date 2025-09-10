module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', '**/*.d.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react-refresh', '@typescript-eslint', 'react-hooks'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // TypeScript 관련 규칙
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off',
    
    // Enhanced Console 규칙 - logger 사용 강제
    'no-console': 'error', // 더 강력한 제한
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['console'],
            message: 'Use logger from @/utils/logger instead of console'
          }
        ]
      }
    ],
    
    // React 관련 규칙
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // 코드 품질 규칙
    'no-unused-vars': 'off',
    'prefer-const': 'warn',
    'no-var': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  
  // Environment-specific overrides
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      rules: {
        // 테스트 파일에서는 console 사용 허용
        'no-console': 'off',
      },
    },
    {
      files: ['src/scripts/**/*', 'vite.config.ts'],
      rules: {
        // 빌드/스크립트 파일에서는 console 사용 허용
        'no-console': 'off',
      },
    },
  ],
}