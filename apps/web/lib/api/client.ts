/**
 * API Client Configuration
 * Base fetcher and utilities for SWR hooks
 */

export { API_URL } from '@/lib/config'
import { API_URL } from '@/lib/config'

// Type-safe fetcher for SWR
export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const info = await res.json().catch(() => null)
    const message =
      info?.message ?? info?.error ?? `Request failed (${res.status} ${res.statusText})`
    const error = new Error(message)
    ;(error as Error & { info?: unknown; status?: number; url?: string }).info = info
    ;(error as Error & { info?: unknown; status?: number; url?: string }).status = res.status
    ;(error as Error & { info?: unknown; status?: number; url?: string }).url = url
    throw error
  }

  return res.json()
}

// Fetcher with credentials (for authenticated requests)
export async function authFetcher<T>(url: string): Promise<T> {
  return fetcher<T>(url, { credentials: 'include' })
}

// POST request helper
export async function post<TBody, TResponse>(
  url: string,
  body: TBody
): Promise<TResponse> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })

  if (!res.ok) {
    const info = await res.json().catch(() => null)
    const message =
      info?.message ?? info?.error ?? `POST request failed (${res.status} ${res.statusText})`
    const error = new Error(message)
    ;(error as Error & { info?: unknown; status?: number; url?: string }).info = info
    ;(error as Error & { info?: unknown; status?: number; url?: string }).status = res.status
    ;(error as Error & { info?: unknown; status?: number; url?: string }).url = url
    throw error
  }

  return res.json()
}

// DELETE request helper
export async function del<TResponse = void>(url: string): Promise<TResponse> {
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    const info = await res.json().catch(() => null)
    const message =
      info?.message ?? info?.error ?? `DELETE request failed (${res.status} ${res.statusText})`
    const error = new Error(message)
    ;(error as Error & { info?: unknown; status?: number; url?: string }).info = info
    ;(error as Error & { info?: unknown; status?: number; url?: string }).status = res.status
    ;(error as Error & { info?: unknown; status?: number; url?: string }).url = url
    throw error
  }

  // Return empty object for void responses
  const text = await res.text()
  return text ? JSON.parse(text) : ({} as TResponse)
}

// Build API URL with query params
export function apiUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(path, API_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

// WebSocket URL builder
export function wsUrl(path: string): string {
  return `${API_URL.replace('http', 'ws')}${path}`
}
