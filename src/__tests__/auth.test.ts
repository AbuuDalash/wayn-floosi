import { hashPassword, verifyPassword, generateToken, verifyToken } from '../lib/auth';

describe('Password hashing', () => {
  test('hashes a password', async () => {
    const hash = await hashPassword('MyP@ss123');
    expect(hash).not.toBe('MyP@ss123');
    expect(hash.startsWith('$2')).toBe(true);
  });

  test('verifies correct password', async () => {
    const hash = await hashPassword('correctPassword');
    expect(await verifyPassword('correctPassword', hash)).toBe(true);
  });

  test('rejects wrong password', async () => {
    const hash = await hashPassword('correctPassword');
    expect(await verifyPassword('wrongPassword', hash)).toBe(false);
  });

  test('timing-safe: wrong password takes similar time to correct one', async () => {
    const hash = await hashPassword('myPassword');
    const t1 = Date.now();
    await verifyPassword('myPassword', hash);
    const correct = Date.now() - t1;
    const t2 = Date.now();
    await verifyPassword('wrongPassword', hash);
    const wrong = Date.now() - t2;
    expect(Math.abs(correct - wrong)).toBeLessThan(200);
  });
});

describe('JWT tokens', () => {


  test('generates a token', () => {
    const token = generateToken('user_123', 'USER');
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  test('verifies a valid token', () => {
    const token = generateToken('user_123', 'USER');
    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe('user_123');
    expect(decoded?.role).toBe('USER');
  });

  test('rejects a tampered token', () => {
    const token = generateToken('user_123', 'USER');
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(verifyToken(tampered)).toBeNull();
  });

  test('rejects an expired token', () => {
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign({ userId: 'user_123', role: 'USER' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '-1s' });
    expect(verifyToken(expiredToken)).toBeNull();
  });
});
