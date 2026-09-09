import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const globalState = globalThis as typeof globalThis & { mederSessionSecret?: Buffer };
const secret = globalState.mederSessionSecret ??= randomBytes(32);
const COOKIE = 'meder_session';
function signature(value: string) { return createHmac('sha256', secret).update(value).digest('hex'); }

export function session(request: Request): string | undefined {
  const cookies = request.headers.get('cookie')?.split(';').map(value => value.trim()).filter(value => value.startsWith(`${COOKIE}=`)) ?? [];
  if (cookies.length !== 1) return undefined;
  const token = cookies[0].slice(COOKIE.length + 1);
  if (!/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token)) return undefined;
  const [nonce, mac] = token.split('.');
  return timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(signature(nonce), 'hex')) ? token : undefined;
}

export function issueSession() {
  const nonce = randomBytes(32).toString('hex');
  return `${nonce}.${signature(nonce)}`;
}

export function sessionCookie(token: string, secure: boolean) {
  return `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=900${secure ? '; Secure' : ''}`;
}
