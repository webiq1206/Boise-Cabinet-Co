import { NextRequest, NextResponse } from "next/server";
import { getSession, getOidcConfig, getRedirectUri, upsertUserFromClaims } from "@/lib/auth";
import * as client from "openid-client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const config = await getOidcConfig();

    const hostname = request.headers.get("host") || request.nextUrl.host;
    const redirectUri = getRedirectUri(hostname, request.url);

    if (!session.codeVerifier || !session.state) {
      console.error("Missing code verifier or state in session");
      return NextResponse.redirect(new URL("/api/login", request.url));
    }

    const currentUrl = new URL(request.url);
    
    const tokens = await client.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: session.codeVerifier,
      expectedState: session.state,
    });

    const claims = tokens.claims();

    session.userId = claims?.sub as string;
    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token;
    session.expiresAt = claims?.exp as number;
    session.claims = {
      sub: claims?.sub as string,
      email: claims?.email as string,
      first_name: claims?.first_name as string,
      last_name: claims?.last_name as string,
      profile_image_url: claims?.profile_image_url as string,
    };

    delete session.codeVerifier;
    delete session.state;

    await session.save();

    await upsertUserFromClaims(session.claims);

    return NextResponse.redirect(new URL("/api/post-login", request.url));
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(new URL("/api/login", request.url));
  }
}
