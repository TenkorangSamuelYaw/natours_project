import axios from 'axios';
// import { showAlert } from './alerts.js';
import { showAlert } from './alerts.js';
const baseUrl = process.env.PUBLIC_BASE_URL;

// Type is either password or data
export const updateSettings = async (data, type) => {
    try {
        const url =
          type === 'password'
            ? `${baseUrl}/api/v1/users/updateMyPassword`
            : `${baseUrl}/api/v1/users/updateMe`;
        const response = await axios.patch(`${url}`, data, {
            withCredentials: true
        });
        if (response.data.status === 'success') {
          showAlert('success', `${type.toUpperCase()} updated successfully!`);
        }
    } catch (error) {
        console.log(error.response.data.message);
        showAlert('error', error.response.data.message);
    }
};
