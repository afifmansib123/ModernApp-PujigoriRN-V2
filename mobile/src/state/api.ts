import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';

interface User {
  _id: string;
  cognitoId: string;
  name: string;
  email: string;
  role: 'user' | 'creator' | 'admin';
}

type UserRole = 'user' | 'creator' | 'admin';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      try {
        // Try cached token first
        let token = await SecureStore.getItemAsync('authToken');

        // If no cached token, try to get from current session
        if (!token) {
          token = await authService.getCurrentSession();
        }

        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (error) {
        console.log('Error getting auth token:', error);
      }
      return headers;
    },
  }),
  reducerPath: 'api',
  tagTypes: ['User', 'Project', 'Upload', 'Payment', 'AdminStats', 'Donation', 'PaymentRequest'],
  endpoints: (build) => ({
    // AUTH ENDPOINTS

    getAuthUser: build.query<User, void>({
      queryFn: async () => {
        try {
          const token = await authService.getCurrentSession();

          if (!token) {
            return {
              error: {
                status: 400 as const,
                data: { message: 'No valid session found' },
              },
            };
          }

          const cognitoUser = authService.getCurrentUser();
          if (!cognitoUser) {
            return {
              error: {
                status: 400 as const,
                data: { message: 'No user found' },
              },
            };
          }

          // Decode JWT to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.sub;

          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/profile/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            if (response.status === 404) {
              return {
                error: {
                  status: 404 as const,
                  data: { message: 'User not in database' },
                },
              };
            }
            throw new Error('Failed to fetch user profile');
          }

          const userProfile = await response.json();

          return {
            data: userProfile.data,
          };
        } catch (error: any) {
          return {
            error: {
              status: 400 as const,
              data: { message: error.message },
            },
          };
        }
      },
      providesTags: ['User'],
    }),

    createUser: build.mutation<any, any>({
      query: (userData) => ({
        url: '/auth/create-user',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    getUserProfile: build.query<User, string>({
      query: (userId) => `/auth/profile/${userId}`,
      providesTags: ['User'],
    }),

    updateUserProfile: build.mutation<any, any>({
      query: ({ userId, data }) => ({
        url: `/auth/profile/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // PROJECT ENDPOINTS

    getProjects: build.query<any, any>({
      query: (params = {}) => ({
        url: '/projects',
        params,
      }),
      providesTags: ['Project'],
    }),

    getProject: build.query<any, string>({
      query: (slug) => `/projects/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Project', id: slug }],
    }),

    getTrendingProjects: build.query<any, any>({
      query: ({ limit = 6 } = {}) => ({
        url: '/projects/trending',
        params: { limit },
      }),
      providesTags: ['Project'],
    }),

    getProjectsByCategory: build.query<any, void>({
      query: () => '/projects/categories',
      providesTags: ['Project'],
    }),

    getProjectsByCreator: build.query<any, any>({
      query: ({ creatorId, ...params }) => ({
        url: `/projects/creator/${creatorId}`,
        params,
      }),
      providesTags: ['Project'],
    }),

    createProject: build.mutation<any, any>({
      query: (projectData) => ({
        url: '/projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Project'],
    }),

    updateProject: build.mutation<any, any>({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),

    deleteProject: build.mutation<any, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

    getProjectUpdates: build.query<any, string>({
      query: (id) => `/projects/${id}/updates`,
      providesTags: (result, error, id) => [{ type: 'Project', id: `${id}-updates` }],
    }),

    addProjectUpdate: build.mutation<any, any>({
      query: ({ id, data }) => ({
        url: `/projects/${id}/updates`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),

    getProjectStats: build.query<any, string>({
      query: (id) => `/projects/${id}/stats`,
      providesTags: (result, error, id) => [{ type: 'Project', id: `${id}-stats` }],
    }),

    // DONATION ENDPOINTS

    getDonations: build.query<any, any>({
      query: (filters = {}) => ({
        url: '/donations',
        params: filters,
      }),
      providesTags: ['Donation'],
    }),

    getDonation: build.query<any, string>({
      query: (id) => `/donations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Donation', id }],
    }),

    getProjectDonations: build.query<any, any>({
      query: ({ projectId, ...params }) => ({
        url: `/donations/project/${projectId}`,
        params,
      }),
      providesTags: ['Donation'],
    }),

    getUserDonations: build.query<any, any>({
      query: ({ userId, ...params }) => ({
        url: `/donations/user/${userId}`,
        params,
      }),
      providesTags: ['Donation'],
    }),

    getRecentDonations: build.query<any, any>({
      query: (params = {}) => ({
        url: '/donations/recent',
        params,
      }),
      providesTags: ['Donation'],
    }),

    getDonationQR: build.query<any, any>({
      query: ({ id, format = 'url' }) => ({
        url: `/donations/${id}/qr`,
        params: { format },
      }),
      providesTags: ['Donation'],
    }),

    redeemReward: build.mutation<any, any>({
      query: ({ id, ...data }) => ({
        url: `/donations/${id}/redeem`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Donation'],
    }),

    getPendingRewards: build.query<any, any>({
      query: (params = {}) => ({
        url: '/donations/rewards/pending',
        params,
      }),
      providesTags: ['Donation'],
    }),

    getDonationStatistics: build.query<any, any>({
      query: (params = {}) => ({
        url: '/donations/statistics',
        params,
      }),
      providesTags: ['AdminStats'],
    }),

    updateDonorMessage: build.mutation<any, any>({
      query: ({ id, message }) => ({
        url: `/donations/${id}/message`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: ['Donation'],
    }),

    // PAYMENT ENDPOINTS

    initiatePayment: build.mutation<any, any>({
      query: (paymentData) => ({
        url: '/payments/initiate',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payment'],
    }),

    getPaymentStatus: build.query<any, string>({
      query: (transactionId) => `/payments/${transactionId}/status`,
      providesTags: ['Payment'],
    }),

    getPaymentStatistics: build.query<any, any>({
      query: (params = {}) => ({
        url: '/payments/statistics',
        params,
      }),
      providesTags: ['AdminStats'],
    }),

    initiateRefund: build.mutation<any, any>({
      query: ({ transactionId, reason }) => ({
        url: `/payments/${transactionId}/refund`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Payment'],
    }),

    // PAYMENT REQUEST ENDPOINTS

    createPaymentRequest: build.mutation<any, any>({
      query: (data) => ({
        url: '/payment-requests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PaymentRequest'],
    }),

    getCreatorPaymentRequests: build.query<any, any>({
      query: (params = {}) => ({
        url: '/payment-requests/creator',
        params,
      }),
      providesTags: ['PaymentRequest'],
    }),

    getProjectPaymentRequests: build.query<any, string>({
      query: (projectId) => `/payment-requests/project/${projectId}`,
      providesTags: ['PaymentRequest'],
    }),

    getPaymentRequest: build.query<any, string>({
      query: (id) => `/payment-requests/${id}`,
      providesTags: ['PaymentRequest'],
    }),

    getCreatorBalances: build.query<any, void>({
      query: () => '/payment-requests/creator/balances',
      providesTags: ['PaymentRequest'],
    }),

    // ADMIN ENDPOINTS

    getDashboard: build.query<any, any>({
      query: ({ period = 30 } = {}) => ({
        url: '/admin/dashboard',
        params: { period },
      }),
      providesTags: ['AdminStats'],
    }),

    getPaymentRequests: build.query<any, any>({
      query: (params = {}) => ({
        url: '/admin/payment-requests',
        params,
      }),
      providesTags: ['PaymentRequest'],
    }),

    approvePaymentRequest: build.mutation<any, any>({
      query: ({ requestId, notes }) => ({
        url: `/admin/payment-requests/${requestId}/approve`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['PaymentRequest', 'AdminStats'],
    }),

    rejectPaymentRequest: build.mutation<any, any>({
      query: ({ requestId, reason }) => ({
        url: `/admin/payment-requests/${requestId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['PaymentRequest', 'AdminStats'],
    }),

    markPaymentAsPaid: build.mutation<any, any>({
      query: ({ requestId, notes, transactionReference }) => ({
        url: `/admin/payment-requests/${requestId}/mark-paid`,
        method: 'POST',
        body: { notes, transactionReference },
      }),
      invalidatesTags: ['PaymentRequest', 'AdminStats'],
    }),

    getAdminProjects: build.query<any, any>({
      query: (params = {}) => ({
        url: '/admin/projects',
        params,
      }),
      providesTags: ['Project'],
    }),

    updateProjectStatus: build.mutation<any, any>({
      query: ({ projectId, status, reason }) => ({
        url: `/admin/projects/${projectId}/status`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: ['Project', 'AdminStats'],
    }),

    getAdminDonations: build.query<any, any>({
      query: (params = {}) => ({
        url: '/admin/donations',
        params,
      }),
      providesTags: ['Donation'],
    }),

    getAdminAnalytics: build.query<any, any>({
      query: (params = {}) => ({
        url: '/admin/analytics',
        params,
      }),
      providesTags: ['AdminStats'],
    }),

    getFinancialReport: build.query<any, any>({
      query: (params) => ({
        url: '/admin/reports/financial',
        params,
      }),
      providesTags: ['AdminStats'],
    }),

    getProjectBalance: build.query<any, string>({
      query: (projectId) => `/payment-requests/project/${projectId}/balance`,
      providesTags: ['PaymentRequest'],
    }),

    deleteUser: build.mutation<any, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useGetUserProfileQuery,
  useCreateUserMutation,
  useUpdateUserProfileMutation,
  useGetProjectsQuery,
  useGetProjectQuery,
  useGetTrendingProjectsQuery,
  useGetProjectsByCategoryQuery,
  useGetProjectsByCreatorQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectUpdatesQuery,
  useAddProjectUpdateMutation,
  useGetProjectStatsQuery,
  useGetDonationsQuery,
  useGetDonationQuery,
  useGetProjectDonationsQuery,
  useGetUserDonationsQuery,
  useGetRecentDonationsQuery,
  useGetDonationQRQuery,
  useRedeemRewardMutation,
  useGetPendingRewardsQuery,
  useGetDonationStatisticsQuery,
  useUpdateDonorMessageMutation,
  useInitiatePaymentMutation,
  useGetPaymentStatusQuery,
  useGetPaymentStatisticsQuery,
  useInitiateRefundMutation,
  useCreatePaymentRequestMutation,
  useGetCreatorPaymentRequestsQuery,
  useGetProjectPaymentRequestsQuery,
  useGetPaymentRequestQuery,
  useGetCreatorBalancesQuery,
  useGetDashboardQuery,
  useGetPaymentRequestsQuery,
  useApprovePaymentRequestMutation,
  useRejectPaymentRequestMutation,
  useMarkPaymentAsPaidMutation,
  useGetAdminProjectsQuery,
  useUpdateProjectStatusMutation,
  useGetAdminDonationsQuery,
  useGetAdminAnalyticsQuery,
  useGetFinancialReportQuery,
  useGetProjectBalanceQuery,
  useDeleteUserMutation,
} = api;
