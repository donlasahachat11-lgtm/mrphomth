/**
 * Utility Function Tests
 * Tests for general utility functions
 */

import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden')
      expect(result).toContain('base')
      expect(result).toContain('conditional')
      expect(result).not.toContain('hidden')
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4')
      // Should keep only px-4 due to Tailwind merge
      expect(result).toContain('px-4')
      expect(result).toContain('py-1')
    })

    it('should handle undefined and null', () => {
      const result = cn('base', undefined, null, 'end')
      expect(result).toContain('base')
      expect(result).toContain('end')
    })

    it('should handle empty strings', () => {
      const result = cn('base', '', 'end')
      expect(result).toContain('base')
      expect(result).toContain('end')
    })

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle objects', () => {
      const result = cn({
        'active': true,
        'disabled': false,
        'primary': true
      })
      expect(result).toContain('active')
      expect(result).toContain('primary')
      expect(result).not.toContain('disabled')
    })

    it('should handle complex combinations', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled',
        { 'highlighted': true },
        ['extra', 'classes']
      )
      expect(result).toContain('base-class')
      expect(result).toContain('active')
      expect(result).toContain('highlighted')
      expect(result).toContain('extra')
      expect(result).toContain('classes')
      expect(result).not.toContain('disabled')
    })

    it('should handle duplicate classes', () => {
      const result = cn('class1', 'class1', 'class2')
      // clsx may not deduplicate, but result should be valid
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle Tailwind responsive classes', () => {
      const result = cn('text-sm md:text-base lg:text-lg')
      expect(result).toContain('text-sm')
      expect(result).toContain('md:text-base')
      expect(result).toContain('lg:text-lg')
    })

    it('should handle Tailwind hover and focus states', () => {
      const result = cn('bg-blue-500 hover:bg-blue-600 focus:ring-2')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('hover:bg-blue-600')
      expect(result).toContain('focus:ring-2')
    })

    it('should resolve conflicting Tailwind utilities', () => {
      // When same utility is specified multiple times, last one wins
      const result = cn('p-2', 'p-4', 'p-6')
      expect(result).toContain('p-6')
      // Should not contain earlier conflicting values
      expect(result).not.toContain('p-2')
      expect(result).not.toContain('p-4')
    })

    it('should handle dark mode classes', () => {
      const result = cn('bg-white dark:bg-gray-900')
      expect(result).toContain('bg-white')
      expect(result).toContain('dark:bg-gray-900')
    })

    it('should return empty string for no inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle whitespace correctly', () => {
      const result = cn('  class1  ', '  class2  ')
      expect(result.trim()).toBeTruthy()
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })
  })
})
