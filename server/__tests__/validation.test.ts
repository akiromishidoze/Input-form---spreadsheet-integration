import { describe, it, expect } from 'vitest';
import { validateEntry, sanitize, sanitizeObject } from '../validation';

describe('sanitize', () => {
  it('strips HTML tags', () => {
    expect(sanitize('<script>alert("xss")</script>hello')).toBe('alert("xss")hello');
  });

  it('returns non-string values unchanged', () => {
    expect(sanitize(123)).toBe(123);
    expect(sanitize(null)).toBe(null);
    expect(sanitize({ a: 1 })).toEqual({ a: 1 });
  });
});

describe('sanitizeObject', () => {
  it('sanitizes all string values', () => {
    const result = sanitizeObject({ name: '<b>Alice</b>', bio: '<p>Hello</p>' });
    expect(result).toEqual({ name: 'Alice', bio: 'Hello' });
  });
});

describe('validateEntry', () => {
  it('passes valid entry', () => {
    const errs = validateEntry({ form: 'test', data: { name: 'Alice' } });
    expect(errs).toHaveLength(0);
  });

  it('rejects missing form', () => {
    const errs = validateEntry({ data: {} });
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0].field).toBe('form');
  });

  it('rejects non-object data', () => {
    const errs = validateEntry({ form: 'test', data: 'string' });
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0].field).toBe('data');
  });

  it('rejects invalid submitted date', () => {
    const errs = validateEntry({ form: 'test', data: {}, submitted: 'not-a-date' });
    expect(errs.length).toBeGreaterThan(0);
    expect(errs[0].field).toBe('submitted');
  });
});
