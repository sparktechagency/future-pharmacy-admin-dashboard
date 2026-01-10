import { baseApi } from "../../utils/apiBaseQuery";


export const deliveryZoneApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAlldeliveryZone: builder.query({
      query: () => ({
        url: "/delivery-zone",
        method: "GET",
      }),
      providesTags: ["zone"],
    }),

    createdeliveryZone: builder.mutation({
      query: (data) => ({
        url: "/delivery-zone/create",
        method: "POST",
        body: data,
      }),
      providesTags: ["zone"],
    }),

    deletedeliveryZone: builder.mutation({
      query: (id) => ({
        url: `/delivery-zone/${id}`,
        method: "DELETE",
      }),
      providesTags: ["zone"],
    }),

  }),
});

// Export hooks
export const {
  useGetAlldeliveryZoneQuery,
  useCreatedeliveryZoneMutation,
  useDeletedeliveryZoneMutation
} = deliveryZoneApi;
