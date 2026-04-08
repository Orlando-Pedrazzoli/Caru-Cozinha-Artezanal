import { NextResponse } from 'next/server';
import {
  encrypt,
  validateCredentials,
  getSessionCookieOptions,
} from '@/lib/utils/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const isValid = await validateCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Credenciais invalidas' },
        { status: 401 },
      );
    }

    const session = await encrypt({ user: username, admin: true });
    const response = NextResponse.json({ success: true });

    response.cookies.set('session', session, getSessionCookieOptions());

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 },
    );
  }
}
