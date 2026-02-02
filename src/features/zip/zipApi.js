import { baseApi } from "../../utils/apiBaseQuery";


export const deliveryZoneApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllZipCode: builder.query({
      query: () => ({
        url: "/coverage-zip-code",
        method: "GET",
      }),
      providesTags: ["zip"],
    }),

    getSingleZipCode: builder.query({
      query: (id) => ({
        url: `/coverage-zip-code/${id}`,
        method: "GET",
      }),
      providesTags: ["zip"],
    }),

    createZipCode: builder.mutation({
      query: (data) => ({
        url: "/coverage-zip-code/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["zip"],
    }),
    deleteZipCode: builder.mutation({
      query: (id) => ({
        url: `/coverage-zip-code/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["zip"],
    }),



  }),
});

// Export hooks
export const {
  useGetAllZipCodeQuery,
  useGetSingleZipCodeQuery,
  useCreateZipCodeMutation,
  useDeleteZipCodeMutation,
} = deliveryZoneApi;
