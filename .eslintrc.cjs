module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', '**/*.d.ts', 'src/utils/logger.ts'],
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
    // TypeScript 관련 규칙 - 점진적 적용을 위해 warn으로 시작
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off',
    
    // Console 관련 규칙
    'no-console': 'warn',
    
    // React 관련 규칙
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // 일반적인 코드 품질 규칙
    'no-unused-vars': 'off', // TypeScript 버전으로 대체
    'prefer-const': 'warn',
    'no-var': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}