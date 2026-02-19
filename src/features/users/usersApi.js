import { baseApi } from "../../utils/apiBaseQuery";


export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: (page) => ({
        url: `/users/all-users?page=${page}`,
        method: "GET",
      }),
      providesTags: ["users"],
    }),

    updateBlockAndUnblock: builder.mutation({
      query: (id) => ({
        url: `/users/blocked/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["users"],
    }),

    viewUserDetails: builder.query({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: ["users"],
    }),
  }),
});


export const {
  useGetAllUsersQuery,
  useUpdateBlockAndUnblockMutation,
  useViewUserDetailsQuery
} = usersApi;
