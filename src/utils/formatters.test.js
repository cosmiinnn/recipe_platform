import { describe, it, expect } from 'vitest';
import { formatTime, isStrongPassword } from './formatters';

describe('Utility Functions', () => {

  // time formatting test
  it('should format minutes correctly', () => {
    expect(formatTime(30)).toBe('30 mins');
    expect(formatTime(60)).toBe('1h');
    expect(formatTime(90)).toBe('1h 30m');
    expect(formatTime(0)).toBe('0 mins');
  });

  // password validation test
  it('should validate password length', () => {
    expect(isStrongPassword('123')).toBe(false); // too short
    expect(isStrongPassword('123456')).toBe(true); // just right
    expect(isStrongPassword('superpassword')).toBe(true); // longer
  });

});