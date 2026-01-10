import { baseApi } from "../../utils/apiBaseQuery";


export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPayment: builder.query({
      query: () => ({
        url: "/payment",
        method: "GET",
      }),
    }),
    getSinglePayment: builder.query({
      query: (id) => ({
        url: `/payment/${id}`,
        method: "GET",
      }),
    }),

  }),
});

export const {
  useGetAllPaymentQuery,
  useGetSinglePaymentQuery
} = paymentApi;
