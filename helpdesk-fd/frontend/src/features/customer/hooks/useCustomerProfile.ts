import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../constants/queryKeys';
import {
  customerProfileService,
  type UpdateProfilePayload,
  type ChangePasswordPayload,
} from '../services/customerProfile.service';

/**
 * Hook to fetch authenticated customer profile.
 * Cached for 5 minutes as profile info changes infrequently.
 */
export function useCustomerProfile() {
  return useQuery({
    queryKey: queryKeys.customer.profile(),
    queryFn: () => customerProfileService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Mutation hook to update customer profile info.
 * On success, automatically invalidates the profile cache and keeps localStorage in sync.
 */
export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => customerProfileService.updateProfile(payload),
    onSuccess: (_data, variables) => {
      // Invalidate profile query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.profile() });

      // Synchronize localStorage user object so Navbar / Header reflects new name immediately
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const updated = {
            ...parsed,
            first_name: variables.first_name,
            last_name: variables.last_name,
            email: variables.email,
            phone_number: variables.phone_number,
          };
          localStorage.setItem('user', JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Failed to update user in localStorage', e);
      }
    },
  });
}

/**
 * Mutation hook to change customer password.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => customerProfileService.changePassword(payload),
  });
}
