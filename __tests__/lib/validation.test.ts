/**
 * Validation Utility Tests
 * Tests all validation and sanitization functions
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  validateProjectName,
  validatePrompt,
  validateEmail,
  validateUrl,
  validateUUID,
  sanitizeSql,
  validateFilePath,
  validateJson,
  escapeHtml,
  validateWorkflowRequest
} from '@/lib/security/validation'

describe('Validation Utilities', () => {
  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeString('<script>alert("xss")</script>')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    })

    it('should remove javascript: protocol', () => {
      const result = sanitizeString('javascript:alert("xss")')
      expect(result).not.toContain('javascript:')
    })

    it('should remove event handlers', () => {
      const result = sanitizeString('onclick=alert("xss")')
      expect(result).not.toContain('onclick=')
    })

    it('should trim whitespace', () => {
      const result = sanitizeString('  hello world  ')
      expect(result).toBe('hello world')
    })

    it('should handle empty strings', () => {
      const result = sanitizeString('')
      expect(result).toBe('')
    })
  })

  describe('validateProjectName', () => {
    it('should accept valid project names', () => {
      const result = validateProjectName('my-project')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept lowercase letters', () => {
      const result = validateProjectName('myproject')
      expect(result.valid).toBe(true)
    })

    it('should accept numbers', () => {
      const result = validateProjectName('project123')
      expect(result.valid).toBe(true)
    })

    it('should accept hyphens', () => {
      const result = validateProjectName('my-awesome-project')
      expect(result.valid).toBe(true)
    })

    it('should reject empty names', () => {
      const result = validateProjectName('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('required')
    })

    it('should reject names longer than 50 characters', () => {
      const result = validateProjectName('a'.repeat(51))
      expect(result.valid).toBe(false)
      expect(result.error).toContain('less than 50')
    })

    it('should reject uppercase letters', () => {
      const result = validateProjectName('MyProject')
      expect(result.valid).toBe(false)
    })

    it('should reject special characters', () => {
      const result = validateProjectName('my_project')
      expect(result.valid).toBe(false)
    })

    it('should reject names starting with hyphen', () => {
      const result = validateProjectName('-myproject')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('cannot start')
    })

    it('should reject names ending with hyphen', () => {
      const result = validateProjectName('myproject-')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('start or end')
    })
  })

  describe('validatePrompt', () => {
    it('should accept valid prompts', () => {
      const result = validatePrompt('Create a blog application')
      expect(result.valid).toBe(true)
    })

    it('should reject empty prompts', () => {
      const result = validatePrompt('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('required')
    })

    it('should reject whitespace-only prompts', () => {
      const result = validatePrompt('   ')
      expect(result.valid).toBe(false)
    })

    it('should reject prompts shorter than 10 characters', () => {
      const result = validatePrompt('short')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('at least 10')
    })

    it('should reject prompts longer than 5000 characters', () => {
      const result = validatePrompt('a'.repeat(5001))
      expect(result.valid).toBe(false)
      expect(result.error).toContain('less than 5000')
    })

    it('should accept prompts at minimum length', () => {
      const result = validatePrompt('a'.repeat(10))
      expect(result.valid).toBe(true)
    })

    it('should accept prompts at maximum length', () => {
      const result = validatePrompt('a'.repeat(5000))
      expect(result.valid).toBe(true)
    })
  })

  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      const result = validateEmail('user@example.com')
      expect(result.valid).toBe(true)
    })

    it('should accept emails with subdomains', () => {
      const result = validateEmail('user@mail.example.com')
      expect(result.valid).toBe(true)
    })

    it('should accept emails with plus signs', () => {
      const result = validateEmail('user+tag@example.com')
      expect(result.valid).toBe(true)
    })

    it('should reject emails without @', () => {
      const result = validateEmail('userexample.com')
      expect(result.valid).toBe(false)
    })

    it('should reject emails without domain', () => {
      const result = validateEmail('user@')
      expect(result.valid).toBe(false)
    })

    it('should reject emails without TLD', () => {
      const result = validateEmail('user@example')
      expect(result.valid).toBe(false)
    })

    it('should reject empty emails', () => {
      const result = validateEmail('')
      expect(result.valid).toBe(false)
    })
  })

  describe('validateUrl', () => {
    it('should accept valid HTTP URLs', () => {
      const result = validateUrl('http://example.com')
      expect(result.valid).toBe(true)
    })

    it('should accept valid HTTPS URLs', () => {
      const result = validateUrl('https://example.com')
      expect(result.valid).toBe(true)
    })

    it('should accept URLs with paths', () => {
      const result = validateUrl('https://example.com/path/to/page')
      expect(result.valid).toBe(true)
    })

    it('should accept URLs with query parameters', () => {
      const result = validateUrl('https://example.com?param=value')
      expect(result.valid).toBe(true)
    })

    it('should reject javascript: protocol', () => {
      const result = validateUrl('javascript:alert("xss")')
      expect(result.valid).toBe(false)
    })

    it('should reject file: protocol', () => {
      const result = validateUrl('file:///etc/passwd')
      expect(result.valid).toBe(false)
    })

    it('should reject invalid URLs', () => {
      const result = validateUrl('not a url')
      expect(result.valid).toBe(false)
    })
  })

  describe('validateUUID', () => {
    it('should accept valid UUIDs', () => {
      const result = validateUUID('123e4567-e89b-12d3-a456-426614174000')
      expect(result.valid).toBe(true)
    })

    it('should accept UUIDs with uppercase letters', () => {
      const result = validateUUID('123E4567-E89B-12D3-A456-426614174000')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid UUID format', () => {
      const result = validateUUID('invalid-uuid')
      expect(result.valid).toBe(false)
    })

    it('should reject UUIDs without hyphens', () => {
      const result = validateUUID('123e4567e89b12d3a456426614174000')
      expect(result.valid).toBe(false)
    })

    it('should reject empty UUIDs', () => {
      const result = validateUUID('')
      expect(result.valid).toBe(false)
    })
  })

  describe('sanitizeSql', () => {
    it('should remove single quotes', () => {
      const result = sanitizeSql("'; DROP TABLE users; --")
      expect(result).not.toContain("'")
    })

    it('should remove double quotes', () => {
      const result = sanitizeSql('"; DROP TABLE users; --')
      expect(result).not.toContain('"')
    })

    it('should remove semicolons', () => {
      const result = sanitizeSql('SELECT * FROM users;')
      expect(result).not.toContain(';')
    })

    it('should remove SQL comments', () => {
      const result = sanitizeSql('SELECT * FROM users -- comment')
      expect(result).not.toContain('--')
    })

    it('should remove block comments', () => {
      const result = sanitizeSql('SELECT * /* comment */ FROM users')
      expect(result).not.toContain('/*')
      expect(result).not.toContain('*/')
    })
  })

  describe('validateFilePath', () => {
    it('should accept valid relative paths', () => {
      const result = validateFilePath('path/to/file.txt')
      expect(result.valid).toBe(true)
    })

    it('should reject directory traversal with ..', () => {
      const result = validateFilePath('../../../etc/passwd')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('directory traversal')
    })

    it('should reject paths with tilde', () => {
      const result = validateFilePath('~/file.txt')
      expect(result.valid).toBe(false)
    })

    it('should reject absolute paths starting with /', () => {
      const result = validateFilePath('/etc/passwd')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Absolute paths')
    })

    it('should reject Windows absolute paths', () => {
      const result = validateFilePath('C:/Windows/System32')
      expect(result.valid).toBe(false)
    })
  })

  describe('validateJson', () => {
    it('should accept valid JSON', () => {
      const result = validateJson('{"key": "value"}')
      expect(result.valid).toBe(true)
      expect(result.data).toEqual({ key: 'value' })
    })

    it('should accept JSON arrays', () => {
      const result = validateJson('[1, 2, 3]')
      expect(result.valid).toBe(true)
      expect(result.data).toEqual([1, 2, 3])
    })

    it('should reject invalid JSON', () => {
      const result = validateJson('{invalid json}')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid JSON')
    })

    it('should reject empty strings', () => {
      const result = validateJson('')
      expect(result.valid).toBe(false)
    })
  })

  describe('escapeHtml', () => {
    it('should escape ampersands', () => {
      const result = escapeHtml('Tom & Jerry')
      expect(result).toBe('Tom &amp; Jerry')
    })

    it('should escape less than signs', () => {
      const result = escapeHtml('5 < 10')
      expect(result).toBe('5 &lt; 10')
    })

    it('should escape greater than signs', () => {
      const result = escapeHtml('10 > 5')
      expect(result).toBe('10 &gt; 5')
    })

    it('should escape double quotes', () => {
      const result = escapeHtml('Say "hello"')
      expect(result).toBe('Say &quot;hello&quot;')
    })

    it('should escape single quotes', () => {
      const result = escapeHtml("It's working")
      expect(result).toBe('It&#039;s working')
    })

    it('should escape HTML tags', () => {
      const result = escapeHtml('<script>alert("xss")</script>')
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    })
  })

  describe('validateWorkflowRequest', () => {
    it('should accept valid workflow requests', () => {
      const result = validateWorkflowRequest({
        projectName: 'my-project',
        prompt: 'Create a blog application',
        userId: 'user-123'
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject requests without project name', () => {
      const result = validateWorkflowRequest({
        prompt: 'Create a blog',
        userId: 'user-123'
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Project name is required')
    })

    it('should reject requests without prompt', () => {
      const result = validateWorkflowRequest({
        projectName: 'my-project',
        userId: 'user-123'
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Prompt is required')
    })

    it('should reject requests without user ID', () => {
      const result = validateWorkflowRequest({
        projectName: 'my-project',
        prompt: 'Create a blog'
      })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('User ID is required')
    })

    it('should collect multiple errors', () => {
      const result = validateWorkflowRequest({})
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })

    it('should validate project name format', () => {
      const result = validateWorkflowRequest({
        projectName: 'Invalid Name',
        prompt: 'Create a blog',
        userId: 'user-123'
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('lowercase'))).toBe(true)
    })

    it('should validate prompt length', () => {
      const result = validateWorkflowRequest({
        projectName: 'my-project',
        prompt: 'short',
        userId: 'user-123'
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('at least 10'))).toBe(true)
    })
  })
})
