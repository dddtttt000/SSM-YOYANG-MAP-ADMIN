/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite plugin for build-time console removal
const consoleRemovalPlugin = () => {
  return {
    name: 'console-removal',
    transform(code: string, id: string) {
      if (process.env.NODE_ENV === 'production' && !id.includes('node_modules')) {
        // Remove logger imports and calls completely in production
        return code
          .replace(/import\s+.*?from\s+['"`]@\/utils\/logger['"`];?\s*/g, '')
          .replace(/logger\.(log|info|warn|error|debug)\([^)]*\);?\s*/g, '')
          .replace(/console\.(log|info|warn|error|debug)\([^)]*\);?\s*/g, '')
      }
      return code
    }
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Add console removal plugin for production builds
    ...(mode === 'production' ? [consoleRemovalPlugin()] : [])
  ],
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
          'react-vendor': ['react', 'react-dom'],
          'chakra-ui': ['@chakra-ui/react', '@chakra-ui/icons'],
          'query': ['@tanstack/react-query'],
          'router': ['react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console statements in production
        drop_console: true,
        drop_debugger: true,
        // Remove logger calls specifically
        pure_funcs: ['logger.log', 'logger.info', 'logger.warn', 'logger.error', 'logger.debug']
      }
    }
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
}))