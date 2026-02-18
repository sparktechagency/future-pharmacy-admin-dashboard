import { baseApi } from "../../utils/apiBaseQuery";


export const CMSApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createCMS: builder.mutation({
      query: (data) => ({
        url: '/setting',
        method: 'PATCH',
        body: Object.fromEntries(
          Object.entries(data).filter(([, value]) => value !== undefined && value !== null)
        ),
      }),
      invalidatesTags: ["cms"],
    }),


    getCMS: builder.query({
      query: () => ({
        url: '/setting',
        method: 'GET',
      }),
      providesTags: ["cms"],
    }),

  }),
});

// Export hooks
export const {

  useCreateCMSMutation,
  useGetCMSQuery

} = CMSApi;
