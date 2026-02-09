'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { fetcher, apiUrl, post } from '../client'

interface DefaultRepoResponse {
  repoFullName: string | null
}

/**
 * Hook to fetch user's default repo
 */
export function useDefaultRepo(userId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<DefaultRepoResponse>(
    userId ? apiUrl('/accounts/github/default-repo', { userId }) : null,
    fetcher,
    {
      // Silently handle 404 (endpoint may not exist yet)
      onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
        if ((error as any).status === 404) return
        if (retryCount >= 2) return
        setTimeout(() => revalidate({ retryCount }), 3000)
      },
    },
  )

  return {
    defaultRepoFullName: data?.repoFullName ?? null,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

/**
 * Mutation hook to set user's default repo
 */
export function useSetDefaultRepo() {
  const { trigger, isMutating, error } = useSWRMutation(
    'set-default-repo',
    async (_key: string, { arg }: { arg: { userId: string; repoFullName: string } }) => {
      return post<{ userId: string; repoFullName: string }, DefaultRepoResponse>(
        apiUrl('/accounts/github/default-repo'),
        arg,
      )
    },
  )

  return {
    setDefaultRepo: trigger,
    isSetting: isMutating,
    error,
  }
}
