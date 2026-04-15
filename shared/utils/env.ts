/**
 * Check if running in a serverless environment where SQLite is not available
 */
export function isServerlessEnvironment(): boolean {
  return process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_VERSION !== undefined
}
