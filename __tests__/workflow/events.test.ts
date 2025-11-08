/**
 * Workflow Events Tests
 * Tests the workflow event emitter system
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { workflowEvents } from '@/lib/workflow/events'

describe('Workflow Events', () => {
  describe('Event Emission and Subscription', () => {
    it('should emit and receive progress events', async () => {
      const testWorkflowId = 'test-workflow-progress'
      
      const eventPromise = new Promise((resolve) => {
        const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
          unsubscribe()
          resolve(event)
        })
      })
      
      // Emit test event
      workflowEvents.emitProgress(testWorkflowId, {
        step: 1,
        totalSteps: 7,
        status: 'analyzing',
        message: 'Test message',
        progress: 14
      })
      
      const event: any = await eventPromise
      expect(event.workflowId).toBe(testWorkflowId)
      expect(event.type).toBe('progress')
      expect(event.data).toBeDefined()
      expect(event.data.step).toBe(1)
      expect(event.data.progress).toBe(14)
    })
    
    it('should emit and receive status events', async () => {
      const testWorkflowId = 'test-workflow-status'
      
      const eventPromise = new Promise((resolve) => {
        const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
          if (event.type === 'status') {
            unsubscribe()
            resolve(event)
          }
        })
      })
      
      workflowEvents.emitStatus(testWorkflowId, {
        status: 'analyzing',
        message: 'Test status'
      })
      
      const event: any = await eventPromise
      expect(event.type).toBe('status')
      expect(event.data.status).toBe('analyzing')
      expect(event.data.message).toBe('Test status')
    })
    
    it('should emit and receive error events', async () => {
      const testWorkflowId = 'test-workflow-error'
      
      const eventPromise = new Promise((resolve) => {
        const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
          if (event.type === 'error') {
            unsubscribe()
            resolve(event)
          }
        })
      })
      
      workflowEvents.emitError(testWorkflowId, {
        error: 'Test error',
        step: 3,
        recoverable: false
      })
      
      const event: any = await eventPromise
      expect(event.type).toBe('error')
      expect(event.data.error).toBe('Test error')
      expect(event.data.step).toBe(3)
      expect(event.data.recoverable).toBe(false)
    })
    
    it('should emit and receive complete events', async () => {
      const testWorkflowId = 'test-workflow-complete'
      
      const eventPromise = new Promise((resolve) => {
        const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
          if (event.type === 'complete') {
            unsubscribe()
            resolve(event)
          }
        })
      })
      
      workflowEvents.emitComplete(testWorkflowId, {
        success: true,
        results: { test: 'data' },
        duration: 1000
      })
      
      const event: any = await eventPromise
      expect(event.type).toBe('complete')
      expect(event.data.success).toBe(true)
      expect(event.data.duration).toBe(1000)
      expect(event.data.results).toEqual({ test: 'data' })
    })
  })

  describe('Multiple Subscribers', () => {
    it('should notify all subscribers', async () => {
      const testWorkflowId = 'test-workflow-multi'
      const receivedEvents: any[] = []
      
      const promise1 = new Promise((resolve) => {
        const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
          receivedEvents.push({ subscriber: 1, event })
          unsubscribe()
          resolve(true)
        })
      })
      
      const promise2 = new Promise((resolve) => {
        const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
          receivedEvents.push({ subscriber: 2, event })
          unsubscribe()
          resolve(true)
        })
      })
      
      workflowEvents.emitProgress(testWorkflowId, {
        step: 1,
        totalSteps: 7,
        status: 'testing',
        message: 'Multi-subscriber test',
        progress: 14
      })
      
      await Promise.all([promise1, promise2])
      
      expect(receivedEvents).toHaveLength(2)
      expect(receivedEvents[0].subscriber).toBe(1)
      expect(receivedEvents[1].subscriber).toBe(2)
    })
  })

  describe('Unsubscribe', () => {
    it('should not receive events after unsubscribe', async () => {
      const testWorkflowId = 'test-workflow-unsub'
      let eventCount = 0
      
      const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, () => {
        eventCount++
      })
      
      // Emit first event
      workflowEvents.emitProgress(testWorkflowId, {
        step: 1,
        totalSteps: 7,
        status: 'testing',
        message: 'First event',
        progress: 14
      })
      
      // Wait a bit for event processing
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Unsubscribe
      unsubscribe()
      
      // Emit second event (should not be received)
      workflowEvents.emitProgress(testWorkflowId, {
        step: 2,
        totalSteps: 7,
        status: 'testing',
        message: 'Second event',
        progress: 28
      })
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Should only have received the first event
      expect(eventCount).toBe(1)
    })
  })

  describe('Subscribe to All Events', () => {
    it('should receive events from all workflows', async () => {
      const receivedEvents: any[] = []
      
      const unsubscribe = workflowEvents.subscribeToAll((event) => {
        receivedEvents.push(event)
      })
      
      // Emit events from different workflows
      workflowEvents.emitProgress('workflow-1', {
        step: 1,
        totalSteps: 7,
        status: 'testing',
        message: 'Workflow 1',
        progress: 14
      })
      
      workflowEvents.emitProgress('workflow-2', {
        step: 1,
        totalSteps: 7,
        status: 'testing',
        message: 'Workflow 2',
        progress: 14
      })
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 10))
      
      unsubscribe()
      
      expect(receivedEvents.length).toBeGreaterThanOrEqual(2)
      expect(receivedEvents.some(e => e.workflowId === 'workflow-1')).toBe(true)
      expect(receivedEvents.some(e => e.workflowId === 'workflow-2')).toBe(true)
    })
  })

  describe('Event Data Validation', () => {
    it('should include workflow ID in all events', async () => {
      const testWorkflowId = 'test-workflow-validation'
      
      const eventPromise = new Promise((resolve) => {
        const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
          unsubscribe()
          resolve(event)
        })
      })
      
      workflowEvents.emitProgress(testWorkflowId, {
        step: 1,
        totalSteps: 7,
        status: 'testing',
        message: 'Validation test',
        progress: 14
      })
      
      const event: any = await eventPromise
      expect(event).toHaveProperty('workflowId')
      expect(event).toHaveProperty('type')
      expect(event).toHaveProperty('data')
      expect(event).toHaveProperty('timestamp')
    })

    it('should include timestamp in events', async () => {
      const testWorkflowId = 'test-workflow-timestamp'
      
      const eventPromise = new Promise((resolve) => {
        const unsubscribe = workflowEvents.subscribeToWorkflow(testWorkflowId, (event) => {
          unsubscribe()
          resolve(event)
        })
      })
      
      const beforeTime = Date.now()
      
      workflowEvents.emitProgress(testWorkflowId, {
        step: 1,
        totalSteps: 7,
        status: 'testing',
        message: 'Timestamp test',
        progress: 14
      })
      
      const event: any = await eventPromise
      const afterTime = Date.now()
      
      // Timestamp might be string or number
      const timestamp = typeof event.timestamp === 'string' 
        ? new Date(event.timestamp).getTime() 
        : event.timestamp
      
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(timestamp).toBeLessThanOrEqual(afterTime)
    })
  })
})
