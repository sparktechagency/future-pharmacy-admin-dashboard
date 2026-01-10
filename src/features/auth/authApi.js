import { baseApi } from "../../utils/apiBaseQuery";


export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    forgotEmail: builder.mutation({
      query: (forgotEmail) => ({
        url: "/auth/forgot-password-otp",
        method: "POST",
        body: forgotEmail,
      }),
    }),

    forgotEmailOTPCheck: builder.mutation({
      query: ({ otp, token }) => ({
        url: "/auth/forgot-password-otp-match",
        method: "PATCH",
        headers: {
          token: token,
          "Content-Type": "application/json"
        },
        body: { otp },  // <-- must be an object
      }),
    }),

    resendPassword: builder.mutation({
      query: (token) => ({
        url: "/otp/resend-otp",
        method: "PATCH",
        headers: {
          token: token,
          "Content-Type": "application/json"
        },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ token, newPassword, confirmPassword }) => ({
        url: "/auth/forgot-password-reset",
        method: "PATCH",
        headers: {
          token: `${token}`,
          "Content-Type": "application/json"
        },
        body: {
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        },
      }),
    }),

  }),
});

// Export hooks
export const {
  useLoginMutation,
  useForgotEmailMutation,
  useForgotEmailOTPCheckMutation,
  useResetPasswordMutation,
  useResendPasswordMutation
} = authApi;
