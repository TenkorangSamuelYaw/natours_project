import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { login, logout } from './login.js';
import { displayMap } from './mapBox.js';
import { initSignup } from './signup.js';
import { updateSettings } from './updateSettings.js';

const mapElement = document.getElementById('map');
const formElement = document.querySelector('.form--login');
const logOutButton = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const loader = document.getElementById('loader');

if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}


if (formElement) {
  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (userDataForm) {
  // const saveBtn = userDataForm.querySelector('button[type="submit"]');
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loader.classList.remove('hidden'); // 🔁 Show loading
    // saveBtn.disabled = true;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    await updateSettings({name, email}, 'data');
    loader.classList.add('hidden'); // ✅ Hide loading
    // saveBtn.disabled = false;
  });
}

if (userPasswordForm) {
  // const saveBtn = userPasswordForm.querySelector('button[type="submit"]');
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loader.classList.remove('hidden'); // 🔁 Show loading
    // saveBtn.disabled = true;
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmNewPassword =
      document.getElementById('password-confirm').value;
    await updateSettings(
      { currentPassword, newPassword, confirmNewPassword },
      'password',
    );
    loader.classList.add('hidden'); // ✅ Hide loading
    // saveBtn.disabled = false;
    // Clear password fields after API finishes updating the password
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if(logOutButton) 
  logOutButton.addEventListener('click', logout);

initSignup(); // Sign up form functionality
