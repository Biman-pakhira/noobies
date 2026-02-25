import crypto from 'crypto';
import { promisify } from 'util';

const pbkdf2 = promisify(crypto.pbkdf2);
const SALT_LENGTH = 32;
const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha256';

/**
 * Hash a password using PBKDF2
 * @param password Plain text password
 * @returns Hashed password with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = await pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
  return `${ITERATIONS}$${salt}$${(derivedKey as Buffer).toString('hex')}`;
}

/**
 * Verify a password against a hash
 * @param password Plain text password
 * @param hash Hashed password from database
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [iterations, salt, key] = hash.split('$');
    const derivedKey = await pbkdf2(password, salt, parseInt(iterations, 10), KEY_LENGTH, DIGEST);
    return (derivedKey as Buffer).toString('hex') === key;
  } catch {
    return false;
  }
}
