import { describe, it, expect } from 'vitest';

function add(a: number, b: number) {
    return a + b;
}

describe('add', () => {
    it('adds two numbers', () => {
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
    });
}); 