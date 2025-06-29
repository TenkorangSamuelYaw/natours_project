import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { login } from './login.js';
import { displayMap } from './mapBox.js';
import { initSignup } from './signup.js';

const mapElement = document.getElementById('map');
if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}

const formElement = document.querySelector('.form');
if (formElement) {
  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

initSignup(); // Sign up form functionality
