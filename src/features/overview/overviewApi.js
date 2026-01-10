import { baseApi } from "../../utils/apiBaseQuery";


export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    dashboardTopCard: builder.query({
      query: () => ({
        url: "/payment/overview",
        method: "GET",
      }),
    }),

    reveniewResio: builder.query({
      query: (year) => ({
        url: `/payment/all-earning-rasio?year=${year}`,
        method: "GET",
      }),
    }),


    allUsers: builder.query({
      query: () => ({
        url: `/users/all-users`,
        method: "GET",
      }),
    }),

    singleUser: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
    }),
  }),
});

// Export hooks
export const {
  useDashboardTopCardQuery,
  useReveniewResioQuery,
  useAllUsersQuery,
  useSingleUserQuery
} = authApi;
