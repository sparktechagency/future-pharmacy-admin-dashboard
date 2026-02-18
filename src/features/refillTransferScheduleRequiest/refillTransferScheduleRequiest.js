import { baseApi } from "../../utils/apiBaseQuery";


export const refillTransferScheduleRequiestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSchedule: builder.query({
      query: () => ({
        url: `/refill-transfer-schedule-request?requiestType=schedule`,
        method: "GET",
      }),
      providesTags: ["refillTransferScheduleRequiest"],
    }),

    getAllTransfer: builder.query({
      query: () => ({
        url: `/refill-transfer-schedule-request?requiestType=transfer`,
        method: "GET",
      }),
      providesTags: ["refillTransferScheduleRequiest"],
    }),

    getAllrefill: builder.query({
      query: () => ({
        url: `/refill-transfer-schedule-request?requiestType=refill`,
        method: "GET",
      }),
      providesTags: ["refillTransferScheduleRequiest"],
    }),

  }),
});


export const {
  useGetAllScheduleQuery,
  useGetAllTransferQuery,
  useGetAllrefillQuery
} = refillTransferScheduleRequiestApi;
