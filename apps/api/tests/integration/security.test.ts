import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('Security Headers', () => {
  it('should have security headers', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
  });
});
