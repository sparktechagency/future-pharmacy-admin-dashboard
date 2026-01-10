import { baseApi } from "../../utils/apiBaseQuery";


export const prescriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPrescription: builder.query({
      query: () => ({
        url: "/prescription-order",
        method: "GET",
      }),
    }),



  }),
});

// Export hooks
export const {
  useGetAllPrescriptionQuery
} = prescriptionApi;
