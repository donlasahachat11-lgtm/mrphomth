'use client'

import { supabase } from '../../lib/database'
import { getCurrentUser } from '../../lib/auth'
import { useEffect, useState } from 'react'
import { MainLayout } from '../../components/MainLayout'
import { FileExplorer } from '../../components/FileExplorer'
import { AISandbox } from '../../components/AISandbox'
import { ChatInterface } from '../../components/ChatInterface'
import { CombinedInterface } from '../../components/CombinedInterface'

export default function TestPage() {
  const [status, setStatus] = useState('Testing connection...')
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Test Supabase connection
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          throw authError
        }

        // Test 2: Test database connection
        const { data, error: dbError } = await supabase.from('user_profiles').select('id').limit(1)

        if (dbError) {
          throw dbError
        }

        // Test 3: Create test user if none exists
        if (!user) {
          const testEmail = 'test@example.com'
          const testPassword = 'testpassword123'

          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
          })

          if (signUpError && signUpError.code !== 'email_exists') {
            throw signUpError
          }

          // Get the user again
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          setUser(currentUser)
        } else {
          setUser(user)
        }

        setStatus('✅ All tests passed!')
      } catch (err: any) {
        setError(err.message || 'Unknown error')
        setStatus('❌ Test failed')
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

      {user && (
        <div style={{
          backgroundColor: '#efe',
          border: '1px solid #cfc',
          padding: '10px',
          marginBottom: '20px',
          color: '#060'
        }}>
          <strong>User:</strong> {user.email}
          <br />
          <strong>User ID:</strong> {user.id}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p><strong>Tests performed:</strong></p>
        <ul>
          <li>✅ Supabase client connection</li>
          <li>✅ Authentication system</li>
          <li>✅ Database table access</li>
          <li>✅ User creation (if needed)</li>
        </ul>
      </div>

      {/* UI Components Test Section */}
      <div style={{ marginTop: '40px', borderTop: '2px solid #333', paddingTop: '20px' }}>
        <h2>UI Components Test</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ border: '1px solid #444', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ddd' }}>File Explorer</h3>
            <div style={{ height: '200px', backgroundColor: '#2d2d2d' }}>
              <FileExplorer />
            </div>
          </div>

          <div style={{ border: '1px solid #444', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ddd' }}>AI Sandbox</h3>
            <div style={{ height: '200px', backgroundColor: '#2d2d2d' }}>
              <AISandbox sessionId="test-session" />
            </div>
          </div>

          <div style={{ border: '1px solid #444', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ddd' }}>Combined Interface</h3>
            <div style={{ height: '200px', backgroundColor: '#2d2d2d' }}>
              <CombinedInterface sessionId="test-session" />
            </div>
          </div>

          <div style={{ border: '1px solid #444', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ddd' }}>Chat Interface</h3>
            <div style={{ height: '200px', backgroundColor: '#2d2d2d' }}>
              <ChatInterface sessionId="test-session" />
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #444', padding: '15px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ddd' }}>Main Layout</h3>
          <div style={{ height: '400px', backgroundColor: '#1a1a1a' }}>
            <MainLayout>
              <div style={{ padding: '20px', backgroundColor: '#2d2d2d', height: '100%' }}>
                <h4 style={{ color: '#ddd', marginBottom: '10px' }}>Test Content Area</h4>
                <p style={{ color: '#aaa', fontSize: '14px' }}>
                  This is a test content area within the MainLayout component.
                  All UI components are working together in this integrated interface.
                </p>
              </div>
            </MainLayout>
          </div>
        </div>
      </div>
    </div>
  )
}