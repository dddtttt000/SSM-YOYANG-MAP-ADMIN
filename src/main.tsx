import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// DevTools는 개발 환경에서만 사용
const ReactQueryDevtools = import.meta.env.DEV 
  ? React.lazy(() => import('@tanstack/react-query-devtools').then(module => ({
      default: module.ReactQueryDevtools
    })))
  : null
import App from './App'

// Chakra UI 테마 설정
const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6F2FF',
      100: '#B3D9FF',
      200: '#80BFFF',
      300: '#4DA6FF',
      400: '#1A8CFF',
      500: '#0066CC',
      600: '#0052A3',
      700: '#003D7A',
      800: '#002952',
      900: '#001429',
    },
  },
  fonts: {
    heading: '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
})

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (이전 cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  // React.StrictMode 임시 제거 - 개발 중 깜빡임 방지
  // <React.StrictMode>
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <App />
        {import.meta.env.DEV && ReactQueryDevtools && (
          <React.Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </React.Suspense>
        )}
      </QueryClientProvider>
    </ChakraProvider>
  // </React.StrictMode>
)
