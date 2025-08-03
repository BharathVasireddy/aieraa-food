import toast from 'react-hot-toast';

// Error types for better handling
export interface ApiError {
  error: string;
  status?: string;
  details?: string;
}

// Network error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// API response error handling
export function handleApiResponse(response: Response, data: unknown): ApiError | null {
  if (!response.ok) {
    const errorData = data as { error?: string; status?: string; details?: string };
    const error: ApiError = {
      error: errorData.error || `Server error (${response.status})`,
      status: errorData.status,
      details: errorData.details
    };
    
    // Map specific error codes to user-friendly messages
    switch (response.status) {
      case 400:
        error.error = errorData.error || 'Invalid request. Please check your input.';
        break;
      case 401:
        error.error = 'Invalid email or password.';
        break;
      case 403:
        if (errorData.status === 'pending_approval') {
          error.error = 'Your account is pending approval from your university manager.';
        } else if (errorData.status === 'rejected') {
          error.error = 'Your account has been rejected. Please contact your university manager.';
        } else {
          error.error = 'Access denied.';
        }
        break;
      case 404:
        error.error = 'Resource not found.';
        break;
      case 409:
        error.error = errorData.error || 'This resource already exists.';
        break;
      case 500:
        error.error = 'Server error. Please try again later.';
        break;
      case 503:
        error.error = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        error.error = errorData.error || 'Something went wrong. Please try again.';
    }
    
    return error;
  }
  
  return null;
}

// Toast notifications with consistent styling
export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  
  error: (message: string) => {
    toast.error(message);
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

// Specific error handling for common scenarios
export const errorHandlers = {
  // Login errors
  login: (error: ApiError) => {
    if (error.status === 'pending_approval') {
      showToast.error('Your account needs approval. Check your email for updates.');
    } else if (error.status === 'rejected') {
      showToast.error('Account rejected. Contact your university manager.');
    } else {
      showToast.error(error.error);
    }
  },
  
  // Registration errors
  registration: (error: ApiError) => {
    if (error.error.includes('email already exists')) {
      showToast.error('An account with this email already exists. Try logging in instead.');
    } else if (error.error.includes('university')) {
      showToast.error('Invalid university selected. Please choose a valid university.');
    } else {
      showToast.error(error.error);
    }
  },
  
  // Network errors
  network: (error: unknown) => {
    const message = getErrorMessage(error);
    showToast.error(message);
  },
  
  // Cart errors
  cart: (error: ApiError) => {
    if (error.error.includes('not available')) {
      showToast.error('This item is currently not available.');
    } else if (error.error.includes('quantity')) {
      showToast.error('Invalid quantity selected.');
    } else {
      showToast.error('Unable to add item to cart. Please try again.');
    }
  },
};