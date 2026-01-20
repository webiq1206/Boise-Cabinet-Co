import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Enable gzip compression for all responses (improves page load performance)
app.use(compression());

// Parse cookies (needed for auth returnTo persistence across OAuth)
app.use(cookieParser());

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Serve static files from public directory (robots.txt, sitemap.xml, llms.txt, etc.)
  app.use(express.static("public"));

  // 301 redirect old URLs - specific mappings first, then catch-all
  const { specificLegacyRedirects } = await import("./legacyRedirects.js");
  const { legacyUrlRedirect } = await import("./redirects.js");
  app.use(specificLegacyRedirects); // Specific service/city mappings
  app.use(legacyUrlRedirect); // Catch-all for unmapped URLs

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.HOST || "0.0.0.0";
  server.listen({
    port,
    host,
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Start automated daily lead price reduction cron job
    const { scheduleDailyPriceReduction } = await import("./cron.js");
    scheduleDailyPriceReduction();
    log("Cron job: Daily lead price reduction scheduled");
    
    // Start automated auto-decline of pending leads (runs every hour)
    const { scheduleAutoDecline } = await import("./cron.js");
    scheduleAutoDecline();
    log("Cron job: Auto-decline of pending leads scheduled (runs every hour)");
    
    // Start admin daily digest (runs daily at 9 AM)
    const { scheduleAdminDailyDigest } = await import("./cron.js");
    scheduleAdminDailyDigest();
    log("Cron job: Admin daily digest scheduled (runs daily at 9 AM)");
    
    // Start admin reminders (runs every 6 hours)
    const { scheduleAdminReminders } = await import("./cron.js");
    scheduleAdminReminders();
    log("Cron job: Admin reminders scheduled (runs every 6 hours)");
  });
})();
