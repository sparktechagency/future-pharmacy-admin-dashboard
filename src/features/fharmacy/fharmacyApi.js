import { baseApi } from "../../utils/apiBaseQuery";


export const fharmacyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPharmacy: builder.query({
      query: () => ({
        url: "/pharmacies",
        method: "GET",
      }),
      providesTags: ["pharmacy"],
    }),

    getSinglePharmacy: builder.query({
      query: (id) => ({
        url: `/pharmacies/${id}`,
        method: "GET",
      }),
      providesTags: ["pharmacy"],
    }),


    createPharmacy: builder.mutation({
      query: (data) => ({
        url: "/pharmacies/create-pharmacie",
        method: "POST",
        body: data
      }),
      providesTags: ["pharmacy"],
    }),

    updatePharmacy: builder.mutation({
      query: ({ id, data }) => ({
        url: `/pharmacies/${id}`,
        method: "PATCH",
        body: data
      }),
      providesTags: ["pharmacy"],
    }),

    deletePharmacy: builder.mutation({
      query: (id) => ({
        url: `/pharmacies/${id}`,
        method: "DELETE",
      }),
      providesTags: ["pharmacy"],
    }),


  }),
});

// Export hooks
export const {
  useGetAllPharmacyQuery,
  useGetSinglePharmacyQuery,
  useCreatePharmacyMutation,
  useUpdatePharmacyMutation,
  useDeletePharmacyMutation
} = fharmacyApi;
