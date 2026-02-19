import { baseApi } from "../../utils/apiBaseQuery";


export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPayment: builder.query({
      query: (page) => ({
        url: `/payment?page=${page}`,
        method: "GET",
      }),
      providesTags: ["payment"],
    }),
    getSinglePayment: builder.query({
      query: (id) => ({
        url: `/payment/${id}`,
        method: "GET",
      }),
      providesTags: ["payment"],
    }),

  }),
});

export const {
  useGetAllPaymentQuery,
  useGetSinglePaymentQuery
} = paymentApi;
