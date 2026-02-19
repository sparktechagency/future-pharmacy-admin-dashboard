import { baseApi } from "../../utils/apiBaseQuery";


export const refillTransferScheduleRequiestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSchedule: builder.query({
      query: (page) => ({
        url: `/refill-transfer-schedule-request?requiestType=schedule&page=${page}`,
        method: "GET",
      }),
      providesTags: ["refillTransferScheduleRequiest"],
    }),

    getAllTransfer: builder.query({
      query: (page) => ({
        url: `/refill-transfer-schedule-request?requiestType=transfer&page=${page}`,
        method: "GET",
      }),
      providesTags: ["refillTransferScheduleRequiest"],
    }),

    getAllrefill: builder.query({
      query: (page) => ({
        url: `/refill-transfer-schedule-request?requiestType=refill&page=${page}`,
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
