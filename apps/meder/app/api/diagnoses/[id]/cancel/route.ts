import { cancelDiagnosis } from '../../../../../src/server/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return cancelDiagnosis(request, (await context.params).id);
}
