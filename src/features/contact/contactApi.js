import { baseApi } from "../../utils/apiBaseQuery";


export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllContact: builder.query({
      query: (page) => ({
        url: `/contact-us?page=${page}`,
        method: "GET",
      }),
      providesTags: ["Contact"],
    }),



    getSingleContact: builder.query({
      query: (id) => ({
        url: `/contact-us/${id}`,
        method: "GET",
      }),
      providesTags: ["Contact"],
    }),

  }),
});

// Export hooks
export const {
  useGetAllContactQuery,
  useGetSingleContactQuery
} = contactApi;
