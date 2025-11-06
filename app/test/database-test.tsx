'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/database'

export default function DatabaseTest() {
  const [status, setStatus] = useState('Testing connection...')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test database connection
        const { data, error } = await supabase.from('user_profiles').select('id').limit(1)

        if (error) {
          throw error
        }

        setResult(data)
        setStatus('✅ Database connection successful!')
      } catch (err: any) {
        setError(err.message || 'Unknown error')
        setStatus('❌ Database connection failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Database Connection Test</h1>
      <div style={{ marginBottom: '20px' }}>
        <strong>Status:</strong> {status}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          padding: '10px',
          marginBottom: '20px',
          color: '#a00'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{
          backgroundColor: '#efe',
          border: '1px solid #cfc',
          padding: '10px',
          marginBottom: '20px',
          color: '#060'
        }}>
          <strong>Test Result:</strong> {JSON.stringify(result)}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p><strong>Test performed:</strong></p>
        <ul>
          <li>✅ Database table access test</li>
        </ul>
      </div>
    </div>
  )
}