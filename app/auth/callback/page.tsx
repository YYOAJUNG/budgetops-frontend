'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const sp = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = sp.get('token') || ''

    if (token) {
      localStorage.setItem('accessToken', token)
      router.replace('/') // 로그인 후 이동할 곳
    }
  }, [sp, router])

  return <div>로그인 처리 중...</div>
}

