import { baseApi } from "../../utils/apiBaseQuery";


export const otherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOtherBussiness: builder.query({
      query: () => ({
        url: "/other-business",
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
