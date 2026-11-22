import { useGetPublicConfigQuery } from "@/features/app-config/api/app-config.api";

/**
 * Whether this installation is the one-company edition (no subscription,
 * plans or billing). While the setting is still loading — or if it cannot be
 * read — `isSingleCompany` is `false`, and `isReady` tells callers whether the
 * answer is final. UI that must not flash a screen that will disappear (the
 * billing menu) waits for `isReady`.
 */
export function useSingleCompanyMode() {
  const { data, isSuccess } = useGetPublicConfigQuery();
  return {
    isSingleCompany: data?.singleCompanyMode ?? false,
    isReady: isSuccess,
  };
}
