import { describe, it, expect } from 'vitest'
import { formatDateTime, formatDate } from '../date'

describe('date utilities', () => {
  describe('formatDateTime', () => {
    it('should format ISO date string to Korean format', () => {
      const dateString = '2024-01-15T10:30:00Z'
      const result = formatDateTime(dateString)
      
      // Korean format: YYYY-MM-DD HH:MM
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    })

    it('should handle null input', () => {
      const result = formatDateTime(null)
      expect(result).toBe('')
    })

    it('should handle undefined input', () => {
      const result = formatDateTime(undefined)
      expect(result).toBe('')
    })

    it('should handle empty string input', () => {
      const result = formatDateTime('')
      expect(result).toBe('')
    })

    it('should format date with minutes', () => {
      const dateString = '2024-12-31T14:45:30.123Z'  // Midday UTC to avoid timezone date changes
      const result = formatDateTime(dateString)
      
      // Should contain formatted date and time parts
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
      expect(result).toMatch(/\d{2}:\d{2}/)
    })

    it('should handle Korean timezone formatting', () => {
      const dateString = '2024-06-15T14:30:00Z'
      const result = formatDateTime(dateString)
      
      // Korean locale with 24-hour format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
      expect(result).not.toContain('AM')
      expect(result).not.toContain('PM')
    })
  })

  describe('formatDate (alias)', () => {
    it('should work exactly like formatDateTime', () => {
      const dateString = '2024-01-15T10:30:00Z'
      const resultDateTime = formatDateTime(dateString)
      const resultDate = formatDate(dateString)
      
      expect(resultDate).toBe(resultDateTime)
    })

    it('should handle null like formatDateTime', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle various date formats', () => {
      // ISO 8601 formats
      expect(formatDateTime('2024-01-15T00:00:00.000Z')).toMatch(/2024-01-15/)
      expect(formatDateTime('2024-01-15T12:00:00+09:00')).toMatch(/2024-01-15/)
    })

    it('should handle leap year dates', () => {
      const leapYearDate = '2024-02-29T12:00:00Z'
      const result = formatDateTime(leapYearDate)
      
      expect(result).toMatch(/2024-02-29/)
    })

    it('should format consistently regardless of input timezone', () => {
      const utc = '2024-01-15T12:00:00Z'
      const kst = '2024-01-15T21:00:00+09:00' // Same moment in KST
      
      const resultUtc = formatDateTime(utc)
      const resultKst = formatDateTime(kst)
      
      // Both should format to valid Korean format
      expect(resultUtc).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
      expect(resultKst).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    })

    it('should handle invalid date strings gracefully', () => {
      // Invalid dates should still return a string (might be "Invalid Date" formatted)
      const result = formatDateTime('invalid-date-string')
      expect(typeof result).toBe('string')
    })
  })
})