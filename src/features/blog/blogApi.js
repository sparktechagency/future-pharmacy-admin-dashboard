import { baseApi } from "../../utils/apiBaseQuery";


export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBlog: builder.mutation({
      query: (data) => ({
        url: "/blog/create-blog",
        method: "POST",
        body: data
      }),
    }),


    getAllBlogs: builder.query({
      query: () => ({
        url: "/blog",
        method: "GET",
      }),
    }),


    blogLike: builder.mutation({
      query: (id) => ({
        url: `/blog/blog-likes/${id}`,
        method: "POST",
      }),
    }),


    getSingleBlog: builder.query({
      query: (id) => ({
        url: `/blog/${id}`,
        method: "GET",
      }),
    }),

    updateBlog: builder.mutation({
      query: ({ data, id }) => ({
        url: `/blog/${id}`,
        method: "PATCH",
        body: data
      }),
    }),


    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blog/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

// Export hooks
export const {
  useCreateBlogMutation,
  useGetAllBlogsQuery,
  useBlogLikeMutation,
  useGetSingleBlogQuery,
  useUpdateBlogMutation,
  useDeleteBlogMutation
} = blogApi;
