'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuth } from '@/lib/auth'

interface AuthProps {
  onLogin: (username: string) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const { login, register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const user = await login(loginData.email, loginData.password)
      onLogin(user.name)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const user = await register(registerData.email, registerData.password, registerData.name)
      onLogin(user.name)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to register')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-[350px] p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Welcome to Slack Clone</h2>
      <p className="text-gray-600 mb-6">Login or create an account to get started</p>
      
      <div className="flex gap-2 mb-6">
        <button 
          className={`flex-1 py-2 rounded ${!isRegister ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setIsRegister(false)}
        >
          Login
        </button>
        <button 
          className={`flex-1 py-2 rounded ${isRegister ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setIsRegister(true)}
        >
          Register
        </button>
      </div>

      {!isRegister ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            type="text"
            placeholder="Name"
            value={registerData.name}
            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Register'}
          </Button>
        </form>
      )}
    </div>
  )
}

