/**
 * Hash a password using PBKDF2
 * @param password Plain text password
 * @returns Hashed password with salt
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify a password against a hash
 * @param password Plain text password
 * @param hash Hashed password from database
 * @returns true if password matches, false otherwise
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
//# sourceMappingURL=password.d.ts.map