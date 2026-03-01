'use client'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  username: string
  email: string
  role: string
}

export function useAuth() {
  const router = useRouter()

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  const getUser = (): User | null => {
    if (typeof window === 'undefined') return null
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  }

  const isLoggedIn = (): boolean => {
    const token = getToken()
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return { getToken, getUser, isLoggedIn, logout }
}
