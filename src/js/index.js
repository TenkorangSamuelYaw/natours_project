import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { login, logout } from './login.js';
import { displayMap } from './mapBox.js';
import { initSignup } from './signup.js';

const mapElement = document.getElementById('map');
const formElement = document.querySelector('.form');
const logOutButton = document.querySelector('.nav__el--logout');
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

if(logOutButton) 
  logOutButton.addEventListener('click', logout);

initSignup(); // Sign up form functionality
