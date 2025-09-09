import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { logger } from '@/utils/logger'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

// Firebase 설정 확인
const hasFirebaseConfig = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId

if (!hasFirebaseConfig) {
  logger.error('🚨 Firebase 환경 변수가 설정되지 않았습니다!')
  logger.error('다음 환경 변수들을 .env.local 파일에 추가해주세요:')
  logger.error(`
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
  `)
  logger.error('Firebase Console에서 이 값들을 확인할 수 있습니다.')
} else {
  logger.log('✅ Firebase 설정 로드됨:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: !!firebaseConfig.apiKey,
    hasAppId: !!firebaseConfig.appId,
  })
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
  if (hasFirebaseConfig) {
    logger.log('✅ Firebase 초기화 성공')
  }
} catch (error) {
  logger.error('❌ Firebase 초기화 실패:', error)
  throw error
}

// Initialize Firestore
export const firestore = getFirestore(app)

// Connect to emulator in development
if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(firestore, 'localhost', 8080)
}

export default app