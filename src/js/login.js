import axios from 'axios';
import { showAlert } from './alerts.js';
export const login = async (email, password) => {
    const baseUrl = process.env.PUBLIC_BASE_URL;
    
    try {
        const response = await axios.post(
          `${baseUrl}api/v1/users/login`,
          {
            email: email,
            password: password,
          },
          {
            withCredentials: true,
          },
        );
        if (response.data.status === 'success') {
          showAlert('success', 'Logged in successfully!');
          window.setTimeout(() => {
            location.assign('/');
          }, 1000);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
}
