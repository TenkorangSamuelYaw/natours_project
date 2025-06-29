import axios from 'axios';
import { showAlert } from './alerts.js';
const baseUrl = process.env.PUBLIC_BASE_URL;
export const login = async (email, password) => {
    try {
        const response = await axios.post(
          `${baseUrl}/api/v1/users/login`,
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

export const logout = async () => {
  try {
    const response = await axios.get(`${baseUrl}/api/v1/users/logout`);
    if (response.data.status === 'success') location.reload(true);
  } catch (error) {
    showAlert("error", 'Error logging out! Try again.'); // Maybe internet issues
  }
  
}
