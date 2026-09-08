import { getDiagnosis } from '../../../../src/server/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return getDiagnosis(request, (await context.params).id);
}
