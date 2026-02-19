import { baseApi } from "../../utils/apiBaseQuery";


export const IndependentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllIndependentPharmacy: builder.query({
      query: (page) => ({
        url: `/review-pharmacies?page=${page}`,
        method: "GET",
      }),
      providesTags: ["independentPharmacy"],
    }),
  }),
  overrideExisting: true
});

// Export hooks
export const {
  useGetAllIndependentPharmacyQuery
} = IndependentApi;
