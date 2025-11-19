/**
 * Feature flags and configuration
 */

export const config = {
  /**
   * Enable AI-powered quote calculations site-wide
   * When disabled, falls back to basic estimation
   * Set via VITE_ENABLE_AI_QUOTES environment variable
   */
  enableAiQuotes: import.meta.env.VITE_ENABLE_AI_QUOTES !== 'false',
} as const;
