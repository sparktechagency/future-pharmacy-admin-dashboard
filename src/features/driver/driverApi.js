import { baseApi } from "../../utils/apiBaseQuery";


export const driverApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllDriver: builder.query({
      query: () => ({
        url: "/driver",
        method: "GET",
      }),
      providesTags: ["Driver"],
    }),


    
    getSingleDriver: builder.query({
      query: (id) => ({
        url: `/driver/${id}`,
        method: "GET",
      }),
      providesTags: ["Driver"],
    }),

  }),
});

// Export hooks
export const {
  useGetAllDriverQuery,
  useGetSingleDriverQuery
} = driverApi;
