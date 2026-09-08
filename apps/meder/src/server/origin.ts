import { SafeError } from './safety';

export function validateOrigin(request: Request, configured = process.env.MEDER_ALLOWED_ORIGIN, production = process.env.NODE_ENV === 'production'): URL {
  const supplied = request.headers.get('origin');
  const denied = () => { throw new SafeError('INVALID_ORIGIN', 403); };
  if (!supplied || request.headers.get('sec-fetch-site') === 'cross-site') return denied();
  let origin: URL;
  try { origin = new URL(supplied); } catch { return denied(); }
  if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== supplied) return denied();
  // A configured public origin is authoritative across TLS-terminating proxies.
  if (configured !== undefined) {
    if (supplied !== configured) return denied();
    return origin;
  }
  const internal = new URL(request.url);
  const host = request.headers.get('host') ?? internal.host;
  if (production || !['localhost', '127.0.0.1'].includes(origin.hostname)
    || origin.host !== host || origin.protocol !== internal.protocol) return denied();
  return origin;
}
