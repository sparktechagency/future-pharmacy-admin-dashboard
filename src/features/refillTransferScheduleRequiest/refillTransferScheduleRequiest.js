import { baseApi } from "../../utils/apiBaseQuery";


export const refillTransferScheduleRequiestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSchedule: builder.query({
      query: () => ({
        url: `/refill-transfer-schedule-request?requiestType=schedule`,
        method: "GET",
      }),
    }),

    getAllTransfer: builder.query({
      query: () => ({
        url: `/refill-transfer-schedule-request?requiestType=transfer`,
        method: "GET",
      }),
    }),

    getAllrefill: builder.query({
      query: () => ({
        url: `/refill-transfer-schedule-request?requiestType=refill`,
        method: "GET",
      }),
    }),

  }),
});


export const {
  useGetAllScheduleQuery,
  useGetAllTransferQuery,
  useGetAllrefillQuery
} = refillTransferScheduleRequiestApi;
