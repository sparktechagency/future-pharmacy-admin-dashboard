import { baseApi } from "../../utils/apiBaseQuery";


export const investorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllInvestors: builder.query({
      query: () => ({
        url: "/investors",
        method: "GET",
      }),
      providesTags: ["investors"],
    }),
  }),
});

// Export hooks
export const {
  useGetAllInvestorsQuery
} = investorApi;
