import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtlMs = 7 * 24 * 60 * 60 * 1000; // 1 week
  const sessionTtlSeconds = 7 * 24 * 60 * 60;
  const isProd = process.env.NODE_ENV === "production";
  const secret =
    process.env.SESSION_SECRET ?? (!isProd ? "dev-session-secret" : undefined);

  if (!secret) {
    throw new Error("SESSION_SECRET must be set in production.");
  }

  // Use Postgres-backed sessions when DB is configured; otherwise fall back to in-memory sessions (dev only).
  const pgStore = connectPg(session);
  const sessionStore = process.env.DATABASE_URL
    ? new pgStore({
        conString: process.env.DATABASE_URL,
        // Avoid a hard failure if the `sessions` table hasn't been created yet.
        // This is a common cause of 500s during login flows (session write/read).
        createTableIfMissing: true,
        // connect-pg-simple expects TTL in seconds (cookie maxAge remains in ms).
        ttl: sessionTtlSeconds,
        tableName: "sessions",
      })
    : undefined;

  return session({
    secret,
    ...(sessionStore ? { store: sessionStore } : {}),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: sessionTtlMs,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // If Replit OIDC is not configured, allow the app to run in local dev
  // (paired with the `/api/auth/test-login` route).
  if (!process.env.REPL_ID) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("REPL_ID must be set in production.");
    }
    console.warn("[auth] REPL_ID not set; skipping OIDC auth setup (dev mode).");
    return;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  app.get("/api/login", (req, res, next) => {
    // Store returnTo if provided (used for admin login flow)
    const returnTo = req.query.returnTo as string | undefined;
    console.log("[auth] /api/login called with returnTo:", returnTo);
    if (returnTo && typeof returnTo === "string" && returnTo.startsWith("/")) {
      // Store in both session and cookie for reliability
      (req.session as any).returnTo = returnTo;
      // Set a cookie that persists across OAuth redirects
      res.cookie("auth_returnTo", returnTo, { 
        httpOnly: true, 
        maxAge: 60000, // 1 minute
        sameSite: "lax"
      });
    }
    
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      // Route users based on their role after login.
      // Subcontractors should land in their portal and not on the marketing site.
      successReturnToOrRedirect: "/api/post-login",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  // Post-login router: choose destination based on role.
  // This runs after the session is established by `/api/callback`.
  app.get("/api/post-login", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) return res.redirect("/");

      const dbUser = await storage.getUser(userId);
      console.log("[auth] post-login for user:", userId, "role:", dbUser?.role);

      // Check both session and cookie for returnTo (cookie is more reliable across OAuth)
      const returnToFromSession = (req as any).session?.returnTo;
      const returnToFromCookie = req.cookies?.auth_returnTo;
      const returnToRaw = returnToFromSession || returnToFromCookie;
      console.log("[auth] post-login returnTo - session:", returnToFromSession, "cookie:", returnToFromCookie);
      
      // Clear returnTo from session
      if ((req as any).session?.returnTo) {
        delete (req as any).session.returnTo;
      }
      // Clear the cookie
      res.clearCookie("auth_returnTo");
      
      const safeReturnTo =
        typeof returnToRaw === "string" && returnToRaw.startsWith("/")
          ? returnToRaw
          : null;

      // Special handling for admin login flow:
      // If user came from /admin but isn't an admin, redirect back to /admin
      // where they'll see the "not authorized" message
      if (safeReturnTo?.startsWith("/admin") && dbUser?.role !== "admin") {
        console.log("[auth] Non-admin user tried admin login, redirecting to /admin");
        return res.redirect("/admin");
      }

      if (dbUser?.role === "subcontractor") {
        console.log("[auth] Redirecting subcontractor to portal");
        return res.redirect("/subcontractor/portal");
      }
      if (dbUser?.role === "admin") {
        console.log("[auth] Redirecting admin to dashboard");
        return res.redirect(safeReturnTo ?? "/admin/dashboard");
      }

      console.log("[auth] Default redirect for role:", dbUser?.role);
      return res.redirect(safeReturnTo ?? "/");
    } catch (error) {
      console.error("[auth] post-login redirect failed:", error);
      return res.redirect("/");
    }
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // DEV: allow session-based auth created via `/api/auth/test-login`
  if (process.env.NODE_ENV === "development") {
    const devUserId =
      user?.claims?.sub ?? (req as any).session?.passport?.user?.claims?.sub;
    if (devUserId) {
      return next();
    }
  }

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user as any;
    // Support dev sessions created via `/api/auth/test-login` (session may exist without `req.user` populated).
    let userId: string | undefined = user?.claims?.sub;
    if (process.env.NODE_ENV === "development" && !userId) {
      userId = (req as any).session?.passport?.user?.claims?.sub;
    }
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(userId);
    
    if (!dbUser) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!allowedRoles.includes(dbUser.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};
