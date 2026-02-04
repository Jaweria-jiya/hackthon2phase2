/**
 * API client utility for making authenticated requests to the backend.
 *
 * Automatically attaches JWT token from localStorage to all requests.
 * Handles 401 errors by redirecting to login page.
 */

export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get token from localStorage (only in browser)
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Attach Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Make request
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  )

  // Handle 401 Unauthorized - redirect to signin (only in browser)
  if (response.status === 401 && typeof window !== 'undefined') {
    // Clear stored auth data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')

    // Redirect to signin
    window.location.href = '/signin?expired=true'
    throw new Error('Unauthorized - redirecting to signin')
  }

  return response
}
