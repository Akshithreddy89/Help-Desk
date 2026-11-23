import axiosInstance from '../../../utils/axios';

export interface CustomerProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
}

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface ChangePasswordPayload {
  old_password?: string;
  new_password?: string;
  confirm_password?: string;
}

/**
 * Service for Customer Profile API interactions.
 */
export const customerProfileService = {
  /**
   * Fetch authenticated customer's profile details.
   */
  async getProfile(): Promise<CustomerProfileData> {
    const response = await axiosInstance.get('/customer/profile');
    return response.data.data;
  },

  /**   * Update personal profile information.
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<any> {
    const response = await axiosInstance.put('/customer/profile', payload);
    return response.data;
  },

  /**
   * Change / set account password.
   */
  async changePassword(payload: ChangePasswordPayload): Promise<any> {
    const response = await axiosInstance.post('/customer/change-password', payload);
    return response.data;
  },
};
