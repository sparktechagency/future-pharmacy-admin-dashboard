import { baseApi } from "../../utils/apiBaseQuery";


export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotification: builder.query({
      query: ({ page, limit }) => ({
        url: `/notification/admin-all?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["notification"],
    }),

    deleteNotification: builder.mutation({
      query: (data) => ({
        url: `/notification/all-read-delete`,
        method: "POST",
        body: data, /* 
          {
            notification:"delete",
            notificationIds : ["675c4f5b3b6b6b6b6b6b6b6b", "675c4f5b3b6b6b6b6b6b6b6b"]
          }
        */
      }),
      invalidatesTags: ["notification"],
    }),

    readNotification: builder.mutation({
      query: (data) => ({
        url: `/notification/all-read-delete`,
        method: "POST",
        body: data,/* 
          {
            notification:"read",
            notificationIds : ["675c4f5b3b6b6b6b6b6b6b6b", "675c4f5b3b6b6b6b6b6b6b6b"]
          }
        */
      }),
      invalidatesTags: ["notification"],
    }),


    unreadNotification: builder.mutation({
      query: (data) => ({
        url: `/notification/all-read-delete`,
        method: "POST",
        body: data,/* 
          {
            notification:"unread",
            notificationIds : ["675c4f5b3b6b6b6b6b6b6b6b", "675c4f5b3b6b6b6b6b6b6b6b"]
          }
        */
      }),
      invalidatesTags: ["notification"],
    }),




  }),
});

// Export hooks
export const {
  useGetAllNotificationQuery,
  useDeleteNotificationMutation,
  useReadNotificationMutation,
  useUnreadNotificationMutation,
} = notificationApi;
