import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '')

  // 환경별 설정
  const isProduction = mode === 'production'

  return {
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
    // 환경별 설정
    define: {
      __APP_ENV__: JSON.stringify(mode),
      __IS_PRODUCTION__: JSON.stringify(isProduction),
    },
    // 프로덕션 환경에서만 적용되는 설정
    ...(isProduction && {
      build: {
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              ui: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
            },
          },
        },
      },
    }),
  }
})
