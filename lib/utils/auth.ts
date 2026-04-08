import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const key = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function validateCredentials(username: string, password: string) {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  return username === adminUsername && password === adminPassword;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  if (!session?.value) return null;
  return await decrypt(session.value);
}

export async function isAdmin() {
  const session = await getSession();
  return session?.admin === true;
}
