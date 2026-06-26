import { LLMS_TXT } from '@/shared/llmsTxt';

// Served as a route (not a static public/ file) so it is reliably retrievable
// in the standalone production deploy, where static public/ files are not served.
export const dynamic = 'force-static';

export function GET() {
  return new Response(LLMS_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
