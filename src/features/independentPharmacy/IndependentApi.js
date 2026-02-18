import { baseApi } from "../../utils/apiBaseQuery";


export const IndependentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllIndependentPharmacy: builder.query({
      query: () => ({
        url: "/review-pharmacies",
        method: "GET",
      }),
      providesTags: ["independentPharmacy"],
    }),
  }),
});

// Export hooks
export const {
  useGetAllIndependentPharmacyQuery
} = IndependentApi;
