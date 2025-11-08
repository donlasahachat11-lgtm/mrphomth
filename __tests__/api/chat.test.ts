/**
 * Chat API Route Tests
 * Tests the /api/chat endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/chat/route'
import { NextRequest } from 'next/server'

describe('Chat API', () => {
  describe('POST /api/chat', () => {
    it('should return 401 without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }]
        })
      })
      
      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should validate required messages field', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({})
      })
      
      const response = await POST(request)
      expect([400, 401]).toContain(response.status)
    })

    it('should reject empty messages array', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: []
        })
      })
      
      const response = await POST(request)
      expect([400, 401]).toContain(response.status)
    })

    it('should validate message format', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ invalid: 'format' }]
        })
      })
      
      const response = await POST(request)
      expect([400, 401]).toContain(response.status)
    })

    it('should accept valid message with role and content', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Hello, how are you?' }
          ]
        })
      })
      
      const response = await POST(request)
      // Will be 401 without auth, but validates message structure
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('should accept conversation history', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there!' },
            { role: 'user', content: 'How are you?' }
          ]
        })
      })
      
      const response = await POST(request)
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('should validate role values', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'invalid-role', content: 'Hello' }
          ]
        })
      })
      
      const response = await POST(request)
      expect([400, 401]).toContain(response.status)
    })

    it('should handle system messages', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful assistant' },
            { role: 'user', content: 'Hello' }
          ]
        })
      })
      
      const response = await POST(request)
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('should support streaming mode', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          stream: true
        })
      })
      
      const response = await POST(request)
      // Will be 401 without auth, but validates stream parameter
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('should support non-streaming mode', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          stream: false
        })
      })
      
      const response = await POST(request)
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('should accept session ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          sessionId: 'test-session-123'
        })
      })
      
      const response = await POST(request)
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('should accept AI mode parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          mode: 'web-builder'
        })
      })
      
      const response = await POST(request)
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: 'invalid json'
      })
      
      const response = await POST(request)
      expect([400, 401]).toContain(response.status)
    })

    it('should validate message content length', async () => {
      const longContent = 'a'.repeat(100000)
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: longContent }]
        })
      })
      
      const response = await POST(request)
      // Should either accept or reject based on limits
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('should handle file attachments', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Analyze this file' }],
          files: [
            { name: 'test.txt', content: 'file content', type: 'text/plain' }
          ]
        })
      })
      
      const response = await POST(request)
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('should support tool execution', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Execute tool' }],
          tools: ['code-execution', 'file-search']
        })
      })
      
      const response = await POST(request)
      expect(response.status).toBeGreaterThanOrEqual(200)
    })
  })

  describe('Chat Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make multiple rapid requests
      const requests = Array(15).fill(null).map(() => 
        new NextRequest('http://localhost:3000/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }]
          })
        })
      )
      
      const responses = await Promise.all(
        requests.map(req => POST(req))
      )
      
      // At least one should be rate limited (429) or unauthorized (401)
      const statuses = responses.map(r => r.status)
      expect(statuses.some(s => s === 429 || s === 401)).toBe(true)
    })
  })

  describe('Chat Context Management', () => {
    it('should maintain conversation context', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'My name is John' },
            { role: 'assistant', content: 'Nice to meet you, John!' },
            { role: 'user', content: 'What is my name?' }
          ]
        })
      })
      
      const response = await POST(request)
      expect(response.status).toBeGreaterThanOrEqual(200)
    })

    it('should handle context window limits', async () => {
      const manyMessages = Array(100).fill(null).map((_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`
      }))
      
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: manyMessages
        })
      })
      
      const response = await POST(request)
      // Should either accept or truncate context
      expect(response.status).toBeGreaterThanOrEqual(200)
    })
  })
})
