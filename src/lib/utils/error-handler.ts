import { toast } from 'sonner';

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000 } = options;
  let lastError: Error | null = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry for 4xx errors except 429 (Too Many Requests)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      if (i < maxRetries) {
        // Exponential backoff
        const backoff = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }

  throw lastError;
}

export function handleError(error: unknown, context?: string) {
  console.error(context || 'Error:', error);
  
  let errorMessage = 'An unexpected error occurred';
  let description = 'Please try again later.';

  if (error instanceof ApiError) {
    errorMessage = error.message;
    if (error.details?.errors) {
      description = Object.values(error.details.errors).flat().join('\n');
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  toast.error(errorMessage, {
    description,
    duration: 5000,
    action: {
      label: 'Dismiss',
      onClick: () => {},
    },
  });

  return { error: errorMessage };
}

export function showSuccess(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 3000,
  });
}

export function showLoading(message: string) {
  return toast.loading(message);
}

export function updateLoadingToast(id: string, type: 'success' | 'error' | 'info', message: string, description?: string) {
  toast[type](message, {
    id,
    description,
    duration: type === 'error' ? 10000 : 5000,
  });
}
