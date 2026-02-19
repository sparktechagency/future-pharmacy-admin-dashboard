import { baseApi } from "../../utils/apiBaseQuery";


export const prescriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPrescription: builder.query({
      query: (page) => ({
        url: `/prescription-order?page=${page}`,
        method: "GET",
      }),
      providesTags: ["prescription"],
    }),

  }),
});

// Export hooks
export const {
  useGetAllPrescriptionQuery
} = prescriptionApi;
