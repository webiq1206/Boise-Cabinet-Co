import { Resend } from 'resend';

let connectionSettings: any;
let warnedNoEmailConfig = false;

async function getCredentials() {
  // First, check if RESEND_API_KEY is provided as an environment variable/secret
  if (process.env.RESEND_API_KEY) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: 'hello@lawncarekuna.com'
    };
  }

  // Fall back to Replit connector if no secret is provided
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected. Please add RESEND_API_KEY to your secrets or connect the Resend integration.');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email || 'hello@lawncarekuna.com'
  };
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableResendClient() {
  try {
    const { apiKey, fromEmail } = await getCredentials();
    return {
      client: new Resend(apiKey),
      fromEmail
    };
  } catch (error) {
    // In non-production, treat missing Resend/Replit connector credentials as a no-op so QA/dev isn't blocked.
    // In production, still fail loudly so misconfiguration doesn't go unnoticed.
    if (process.env.NODE_ENV !== "production") {
      if (!warnedNoEmailConfig) {
        warnedNoEmailConfig = true;
        console.warn("[email] Resend not configured; outgoing emails will be skipped in this environment.");
      }

      const noopClient = {
        __noop: true,
        emails: {
          // Mirror Resend API shape used across the codebase.
          send: async () => ({ id: "noop", skipped: true }),
        },
      } as any;

      return {
        client: noopClient,
        fromEmail: "hello@lawncarekuna.com",
      };
    }

    throw error;
  }
}
