import { baseApi } from "../../utils/apiBaseQuery";


export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: () => ({
        url: "/users/my-profile",
        method: "GET",
      }),
      providesTags: ["profile"],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/users/update-my-profile",
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["profile"],
    }),

    twoStepVerification: builder.mutation({
      query: () => ({
        url: "/users/two-step-varification-on-of",
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("PharmacyAdmin")}`,
        }
      }),
      invalidatesTags: ["profile"],
    }),

    resetPasswordProfile: builder.mutation({
      query: () => ({
        url: "/auth/change-password",
        method: "POST",
      }),
    }),
    invalidatesTags: ["profile"],
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useTwoStepVerificationMutation,
  useResetPasswordProfileMutation
} = profileApi;
