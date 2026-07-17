import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from './env';

export interface AdminTokenPayload {
  sub: string; // user id
  email: string;
  role: 'admin';
}

/**
 * Verifies email/password for the single configured admin — entirely
 * server-side. The email must match ADMIN_EMAIL and the password must match the
 * bcrypt ADMIN_PASSWORD_HASH. No external auth service is involved.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<{ id: string; email: string } | null> {
  if (!env.adminEmail || !env.adminPasswordHash) return null;
  if (email.trim().toLowerCase() !== env.adminEmail.trim().toLowerCase()) return null;

  const ok = await bcrypt.compare(password, env.adminPasswordHash);
  if (!ok) return null;

  return { id: 'admin', email: env.adminEmail };
}

export function issueToken(user: { id: string; email: string }): string {
  const payload: AdminTokenPayload = { sub: user.id, email: user.email, role: 'admin' };
  return jwt.sign(payload, env.adminJwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): AdminTokenPayload {
  return jwt.verify(token, env.adminJwtSecret) as AdminTokenPayload;
}
