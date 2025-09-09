/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 라이브러리 분리
          'react-vendor': ['react', 'react-dom'],
          'chakra-ui': ['@chakra-ui/react', '@chakra-ui/icons'],
          'query': ['@tanstack/react-query'],
          'router': ['react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          // Firebase는 자동 분리로 처리
        },
      },
    },
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000,
    // 소스맵 제거 (프로덕션)
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'src/scripts/',
        '**/*.test.*',
        '**/*.spec.*',
      ],
    },
  },
})
