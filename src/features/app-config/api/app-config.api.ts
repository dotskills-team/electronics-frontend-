import { baseApi } from "@/store/api/base-api";

export interface PublicAppConfig {
  /** True when this installation belongs to ONE company (no plans, billing or extra companies). */
  singleCompanyMode: boolean;
}

/**
 * `GET /config/public` — public, secret-free runtime configuration. Read at
 * runtime (not baked in at build time), so switching the backend's
 * `SINGLE_COMPANY_MODE` needs no frontend rebuild.
 */
export const appConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicConfig: builder.query<PublicAppConfig, void>({
      query: () => "/config/public",
      transformResponse: (response: { data: PublicAppConfig }) => response.data,
    }),
  }),
});

export const { useGetPublicConfigQuery } = appConfigApi;
