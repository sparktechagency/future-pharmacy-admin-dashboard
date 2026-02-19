import { baseApi } from "../../utils/apiBaseQuery";


export const otherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOtherBussiness: builder.query({
      query: (page) => ({
        url: `/other-business?page=${page}`,
        method: "GET",
      }),
      providesTags: ["otherBusiness"],
    }),
  }),
});

// Export hooks
export const {
  useGetAllOtherBussinessQuery
} = otherApi;
