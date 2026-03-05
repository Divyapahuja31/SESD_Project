/**
 * Validates required environment variables at startup.
 * Throws immediately if any are missing — fail fast, not silently.
 */
export function validateEnv(): void {
  const required = ["DATABASE_URL", "JWT_SECRET"] as const;

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `[Startup] Missing required environment variables: ${missing.join(", ")}`
    );
  }

  console.log("[Startup] Environment variables validated ✓");
}
