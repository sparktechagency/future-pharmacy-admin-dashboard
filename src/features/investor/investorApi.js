import { baseApi } from "../../utils/apiBaseQuery";


export const investorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllInvestors: builder.query({
      query: (page) => ({
        url: `/investors?page=${page}`,
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
