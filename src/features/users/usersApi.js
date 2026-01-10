import { baseApi } from "../../utils/apiBaseQuery";


export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => ({
        url: "/users/all-users",
        method: "GET",
      }),
    }),

    updateBlockAndUnblock: builder.mutation({
      query: (id) => ({
        url: `/users/blocked/${id}`,
        method: "PATCH",
      }),
    }),

    viewUserDetails: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
    }),

  }),
});


export const {
  useGetAllUsersQuery,
  useUpdateBlockAndUnblockMutation,
  useViewUserDetailsQuery
} = usersApi;
