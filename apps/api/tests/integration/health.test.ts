import { describe, expect, it } from 'vitest';

describe('health payload contract', () => {
  it('returns expected health object shape', () => {
    const payload = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: true,
    };

    expect(payload.status).toBe('ok');
    expect(typeof payload.timestamp).toBe('string');
    expect(payload.database).toBe(true);
  });
});
