import { baseApi } from "@/store/api/base-api";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";
import type { PosStockItem, PosStockSummary, PosTopSellingItem } from "@/types/pos-insights";

export interface PosLocationArgs {
  companyId: string;
  locationId: string;
}

export interface ListPosStockArgs extends PosLocationArgs {
  lowOnly?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListPosTopSellingArgs extends PosLocationArgs {
  dateFrom: string;
  dateTo: string;
  limit?: number;
}

/**
 * POS-side stock and best-seller views (`companies/:companyId/pos/*`). These
 * use their own Cashier-safe endpoints rather than the Reports ones, which a
 * Cashier is not allowed to call. Tags mirror `dashboard.api.ts`: a sale,
 * purchase receive/return or stock adjustment changes these numbers, and
 * those mutations already invalidate "Dashboard"/"Sale", so the badges and
 * lists refresh by themselves — no new invalidation wiring anywhere else.
 */
export const posInsightsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosStockSummary: builder.query<PosStockSummary, PosLocationArgs>({
      query: ({ companyId, locationId }) => ({
        url: `/companies/${companyId}/pos/stock-summary`,
        params: { locationId },
      }),
      transformResponse: (response: { data: PosStockSummary }) => response.data,
      providesTags: ["Dashboard", "Sale", "CompanyScoped"],
    }),

    listPosStock: builder.query<ListResult<PosStockItem>, ListPosStockArgs>({
      query: ({ companyId, locationId, lowOnly, search, page, limit }) => ({
        url: `/companies/${companyId}/pos/stock`,
        params: { locationId, lowOnly: lowOnly || undefined, search: search || undefined, page, limit },
      }),
      transformResponse: (response: {
        data: PosStockItem[];
        pagination: NonNullable<ListResult<PosStockItem>["meta"]>;
      }) => normalizeItemsEnvelope({ items: response.data, meta: response.pagination }),
      providesTags: ["Dashboard", "Sale", "CompanyScoped"],
    }),

    listPosTopSelling: builder.query<PosTopSellingItem[], ListPosTopSellingArgs>({
      query: ({ companyId, locationId, dateFrom, dateTo, limit }) => ({
        url: `/companies/${companyId}/pos/top-selling`,
        params: { locationId, dateFrom, dateTo, limit },
      }),
      transformResponse: (response: { data: PosTopSellingItem[] }) => response.data,
      providesTags: ["Dashboard", "Sale", "CompanyScoped"],
    }),
  }),
});

export const { useGetPosStockSummaryQuery, useListPosStockQuery, useListPosTopSellingQuery } = posInsightsApi;
