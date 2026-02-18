import { baseApi } from "../../utils/apiBaseQuery";


export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    dashboardTopCard: builder.query({
      query: () => ({
        url: "/payment/overview",
        method: "GET",
      }),
      providesTags: ["overview"],
    }),

    reveniewResio: builder.query({
      query: (year) => ({
        url: `/payment/all-earning-rasio?year=${year}`,
        method: "GET",
      }),
      providesTags: ["overview"],
    }),


    allUsers: builder.query({
      query: () => ({
        url: `/users/all-users`,
        method: "GET",
      }),
      providesTags: ["overview"],
    }),

    singleUser: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: ["overview"],
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
