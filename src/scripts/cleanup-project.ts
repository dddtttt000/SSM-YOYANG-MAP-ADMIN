#!/usr/bin/env tsx

/**
 * 프로젝트 정리 스크립트
 * 불필요한 파일들을 안전하게 제거
 */

/* eslint-disable no-console */

import { unlink, rmdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const PROJECT_ROOT = process.cwd()

// 삭제할 파일 목록
const FILES_TO_DELETE = [
  // 과다한 개발 문서
  'DEVELOPMENT_PROMPT.md',
  'DEVELOPMENT_TASKS.md', 
  'PROJECT_STATUS.md',
  'README_ADMIN_USER_FIX.md',
  'README_LOGIN_SETUP.md',
  'SYSTEM_DESIGN.md',
  
  // 예제 파일
  '.eslintrc.enhanced.example.cjs',
  'vite.config.enhanced.example.ts',
  
  // 임시 스크립트들 (마이그레이션 완료 후)
  'src/scripts/check-migrated-accounts.ts',
  'src/scripts/check-rls.ts',
  'src/scripts/execute-rls-activation.ts', 
  'src/scripts/handle-test-accounts.ts',
  'src/scripts/test-rls-security.ts',
]

// 삭제할 디렉토리 목록 (빌드 아티팩트)
const DIRS_TO_DELETE = [
  'coverage',
  'dist',
  '.vite',
  'deps', // 사용되지 않는 것으로 보임
]

async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = join(PROJECT_ROOT, filePath)
    if (existsSync(fullPath)) {
      await unlink(fullPath)
      console.log(`✅ 삭제 완료: ${filePath}`)
      return true
    } else {
      console.log(`⏭️ 파일 없음: ${filePath}`)
      return false
    }
  } catch (error) {
    console.error(`❌ 삭제 실패: ${filePath}`, error)
    return false
  }
}

async function deleteDirectory(dirPath: string): Promise<boolean> {
  try {
    const fullPath = join(PROJECT_ROOT, dirPath)
    if (existsSync(fullPath)) {
      await rmdir(fullPath, { recursive: true })
      console.log(`✅ 디렉토리 삭제 완료: ${dirPath}`)
      return true
    } else {
      console.log(`⏭️ 디렉토리 없음: ${dirPath}`)
      return false
    }
  } catch (error) {
    console.error(`❌ 디렉토리 삭제 실패: ${dirPath}`, error)
    return false
  }
}

async function cleanupProject() {
  console.log('🧹 프로젝트 정리 시작...\n')

  let deletedFiles = 0
  let deletedDirs = 0

  // 파일 삭제
  console.log('📄 불필요한 파일 삭제 중...')
  for (const file of FILES_TO_DELETE) {
    if (await deleteFile(file)) {
      deletedFiles++
    }
  }

  // 디렉토리 삭제
  console.log('\n📁 불필요한 디렉토리 삭제 중...')
  for (const dir of DIRS_TO_DELETE) {
    if (await deleteDirectory(dir)) {
      deletedDirs++
    }
  }

  console.log('\n📊 정리 완료:')
  console.log(`  삭제된 파일: ${deletedFiles}/${FILES_TO_DELETE.length}`)
  console.log(`  삭제된 디렉토리: ${deletedDirs}/${DIRS_TO_DELETE.length}`)

  if (deletedFiles > 0 || deletedDirs > 0) {
    console.log('\n✨ 프로젝트가 더 깔끔해졌습니다!')
    console.log('\n🔄 권장 후속 작업:')
    console.log('  1. git add . && git commit -m "chore: 불필요한 파일 정리"')
    console.log('  2. .gitignore 업데이트 (빌드 아티팩트 무시)')
  } else {
    console.log('\n💫 이미 깔끔한 프로젝트입니다!')
  }
}

async function dryRun() {
  console.log('🔍 정리 시뮬레이션 (실제 삭제 없음)...\n')

  console.log('📄 삭제 예정 파일:')
  FILES_TO_DELETE.forEach(file => {
    const fullPath = join(PROJECT_ROOT, file)
    const exists = existsSync(fullPath)
    console.log(`  ${exists ? '✅' : '⏭️ '} ${file}`)
  })

  console.log('\n📁 삭제 예정 디렉토리:')
  DIRS_TO_DELETE.forEach(dir => {
    const fullPath = join(PROJECT_ROOT, dir)
    const exists = existsSync(fullPath)
    console.log(`  ${exists ? '✅' : '⏭️ '} ${dir}`)
  })

  console.log('\n💡 실제 정리를 원한다면:')
  console.log('  npx tsx src/scripts/cleanup-project.ts run')
}

async function main() {
  const command = process.argv[2]

  try {
    switch (command) {
      case 'run':
        await cleanupProject()
        break
      case 'dry-run':
      default:
        await dryRun()
        break
    }
  } catch (error) {
    console.error('❌ 정리 중 오류 발생:', error)
    process.exit(1)
  }
}

// 스크립트 직접 실행
main()