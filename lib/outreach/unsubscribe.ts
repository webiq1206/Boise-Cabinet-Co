type UnsubscribeOptions = {
  businessName: string;
  siteUrl: string;
  suppress: (token: string) => Promise<boolean>;
};

const headers = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
};
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]!);

// Existing lead and prospect tokens are opaque UUIDs. Bound input before any DB work.
function tokenFrom(request: Request): string | null {
  const values = new URL(request.url).searchParams.getAll("token");
  return values.length === 1 && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(values[0])
    ? values[0] : null;
}

async function requestForm(request: Request): Promise<FormData> {
  const type = request.headers.get("content-type") || "";
  if (!/^(application\/x-www-form-urlencoded|multipart\/form-data)(?:;|$)/i.test(type)) {
    throw new Error("Unsupported form");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing form");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 16384) throw new Error("Form too large");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return new Response(body, { headers: { "Content-Type": type } }).formData();
}

export function createUnsubscribeHandlers(options: UnsubscribeOptions) {
  function page(title: string, message: string, status: number, token?: string) {
    const action = token ? `/api/outreach/unsubscribe?token=${encodeURIComponent(token)}` : "";
    return new Response(`<!doctype html><html lang="en"><head>
      <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Unsubscribe | ${escapeHtml(options.businessName)}</title>
      <style>body{font:400 17px/1.65 system-ui,sans-serif;background:#1c1f1e;color:#f7f5f3;margin:0;padding:24px}main{box-sizing:border-box;max-width:560px;margin:60px auto;padding:32px;background:#262b29;border:1px solid #39403d;border-radius:8px}h1{font-size:28px;line-height:1.3}a{color:#a9d4d4}button{font:inherit;cursor:pointer;padding:12px 20px;border:0;border-radius:5px;background:#a9d4d4;color:#1c1f1e}button:focus-visible,a:focus-visible{outline:3px solid white;outline-offset:4px}</style>
      </head><body><main><p>${escapeHtml(options.businessName)}</p><h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>${token ? `<form method="post" action="${action}">
      <input type="hidden" name="List-Unsubscribe" value="One-Click">
      <input type="hidden" name="source" value="manual">
      <button type="submit">Unsubscribe</button></form>` : ""}
      <p><a href="${escapeHtml(options.siteUrl)}">Return to our website</a></p></main></body></html>`, {
      status, headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return {
    // Link previews, security scanners, and prefetches must never change preferences.
    async GET(request: Request) {
      const token = tokenFrom(request);
      return token
        ? page("Unsubscribe from outreach emails", "Select Unsubscribe to stop receiving outreach emails from us.", 200, token)
        : page("Link not recognized", "Use the unsubscribe link in your email, or reply and ask us to remove you.", 400);
    },
    async POST(request: Request) {
      const token = tokenFrom(request);
      let form: FormData;
      try { form = await requestForm(request); }
      catch { return Response.json({ success: false }, { status: 400, headers }); }
      if (!token || form.getAll("List-Unsubscribe").length !== 1 || form.get("List-Unsubscribe") !== "One-Click") {
        return Response.json({ success: false }, { status: 400, headers });
      }
      const manual = form.get("source") === "manual";
      try {
        const ok = await options.suppress(token);
        if (manual) return ok
          ? page("You are unsubscribed", "You will not receive any further outreach emails from us.", 200)
          : page("Link not recognized", "Use the unsubscribe link in your email, or reply and ask us to remove you.", 404);
        return Response.json({ success: ok }, { status: ok ? 200 : 404, headers });
      } catch {
        // A temporary storage failure must stay retryable, never acknowledge success.
        return manual
          ? page("Please try again", "We could not save your preference. Try again, or reply to the email and ask us to remove you.", 503, token)
          : Response.json({ success: false }, { status: 503, headers: { ...headers, "Retry-After": "60" } });
      }
    },
  };
}
