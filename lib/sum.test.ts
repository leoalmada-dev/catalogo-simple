import { describe, it, expect } from 'vitest';
import { sum } from './sum';

describe('sum', () => {
  it('adds numbers', () => {
    expect(sum(2, 2)).toBe(4);
  });
});