import { baseApi } from "../../utils/apiBaseQuery";


export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotification: builder.query({
      query: ({ page, limit }) => ({
        url: `/notification/admin-all?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),

    singleReadNotification: builder.mutation({
      query: (id) => ({
        url: `/notification/read/${id}`,
        method: "PATCH",
      }),
    }),

    allReadNotification: builder.mutation({
      query: () => ({
        url: `/notification/all-read`,
        method: "POST",
      }),
    }),

    allDeleteNotification: builder.mutation({
      query: () => ({
        url: `/notification/admin`,
        method: "DELETE",
      }),
    }),

    singleDeleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notification/admin/${id}`,
        method: "DELETE",
      }),
    }),

  }),
});

// Export hooks
export const {
  useGetAllNotificationQuery,
  useSingleReadNotificationMutation,
  useAllReadNotificationMutation,
  useAllDeleteNotificationMutation,
  useSingleDeleteNotificationMutation
} = notificationApi;
