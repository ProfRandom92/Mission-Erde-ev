/**
 * Retry utility for API calls with exponential backoff
 */

export interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries, delayMs, backoffMultiplier = 2, onRetry } = options;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt);
        onRetry?.(attempt + 1, lastError);
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('network') || message.includes('fetch')) return true;

  // Timeout errors
  if (message.includes('timeout')) return true;

  // Rate limiting (429)
  if (message.includes('429') || message.includes('rate limit')) return true;

  // Server errors (5xx)
  if (message.includes('500') || message.includes('502') || message.includes('503')) return true;

  return false;
}
