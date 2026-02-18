import { baseApi } from "../../utils/apiBaseQuery";

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBlog: builder.mutation({
      query: (data) => ({
        url: "/blog/create-blog",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["blog"],
    }),

    getAllBlogs: builder.query({
      query: () => ({
        url: "/blog",
        method: "GET",
      }),
      providesTags: ["blog"],
    }),

    blogLike: builder.mutation({
      query: (id) => ({
        url: `/blog/blog-likes/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["blog"],
    }),

    getSingleBlog: builder.query({
      query: (id) => ({
        url: `/blog/${id}`,
        method: "GET",
      }),
      providesTags: ["blog"],
    }),

    updateBlog: builder.mutation({
      query: ({ data, id }) => {
        // Check if data is FormData or regular object
        const isFormData = data instanceof FormData;

        return {
          url: `/blog/${id}`,
          method: "PATCH",
          headers: isFormData
            ? {
              // FormData will set its own Content-Type with boundary
              // Don't set Content-Type here for FormData
            }
            : {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
          body: isFormData ? data : JSON.stringify(data)
        };
      },
      invalidatesTags: ["blog"],
    }),

    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["blog"],
    }),
  }),
});

export const {
  useCreateBlogMutation,
  useGetAllBlogsQuery,
  useBlogLikeMutation,
  useGetSingleBlogQuery,
  useUpdateBlogMutation,
  useDeleteBlogMutation
} = blogApi;