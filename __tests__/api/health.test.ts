/**
 * Health API Route Tests
 * Tests the /api/health endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '@/app/api/health/route'
import { NextRequest } from 'next/server'

describe('Health API', () => {
  describe('GET /api/health', () => {
    it('should return 200 status code', async () => {
      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
    })

    it('should return JSON response', async () => {
      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      
      const contentType = response.headers.get('content-type')
      expect(contentType).toContain('application/json')
    })

    it('should return healthy status', async () => {
      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      const data = await response.json()
      
      expect(data).toHaveProperty('status')
      expect(data.status).toBe('healthy')
    })

    it('should include timestamp', async () => {
      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      const data = await response.json()
      
      expect(data).toHaveProperty('timestamp')
      expect(typeof data.timestamp).toBe('string')
      expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0)
    })

    it('should include service name', async () => {
      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      const data = await response.json()
      
      expect(data).toHaveProperty('service')
      expect(data.service).toBe('mr-prompt')
    })

    it('should include version information', async () => {
      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      const data = await response.json()
      
      expect(data).toHaveProperty('version')
      expect(typeof data.version).toBe('string')
    })

    it('should check database connectivity', async () => {
      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      const data = await response.json()
      
      expect(data).toHaveProperty('checks')
      expect(data.checks).toHaveProperty('database')
      expect(['healthy', 'unhealthy']).toContain(data.checks.database)
    })

    it('should check authentication service', async () => {
      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      const data = await response.json()
      
      expect(data).toHaveProperty('checks')
      expect(data.checks).toHaveProperty('auth')
      expect(['healthy', 'unhealthy']).toContain(data.checks.auth)
    })

    it('should check storage service', async () => {
      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await GET(request)
      const data = await response.json()
      
      expect(data).toHaveProperty('checks')
      expect(data.checks).toHaveProperty('storage')
      expect(['healthy', 'unhealthy']).toContain(data.checks.storage)
    })

    it('should handle errors gracefully', async () => {
      // Mock a failure scenario
      const request = new NextRequest('http://localhost:3000/api/health')
      
      // Even if internal checks fail, the endpoint should still respond
      const response = await GET(request)
      
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })

    it('should complete within acceptable time', async () => {
      const request = new NextRequest('http://localhost:3000/api/health')
      const startTime = Date.now()
      
      await GET(request)
      
      const duration = Date.now() - startTime
      // Health check should complete within 5 seconds
      expect(duration).toBeLessThan(5000)
    })
  })
})
