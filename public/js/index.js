import '@babel/polyfill';
import { displayMap } from './mapBox';
import { login, logout } from './login';
import { UpdateSettings } from './UpdateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';

// DOM Elements
const mapbox = document.getElementById('map');
const loginform = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');
//Delegation
if (mapbox) {
  const locate = JSON.parse(mapbox.dataset.locations);
  displayMap(locate);
}
if (loginform) {
  loginform.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('email', document.getElementById('email').value);
    form.append('name', document.getElementById('name').value);
    form.append('photo', document.getElementById('photo').files[0]);
    //console.log(form);
    UpdateSettings(form, 'data');
  });
}
if (passwordForm) {
  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    UpdateSettings({ passwordCurrent, password, passwordConfirm }, 'password');

    document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    //Whenever there is - it will automatically convert to camelcase
    const { tourId } = e.target.dataset;
    //console.log(tourId);
    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alertMessage;
if (alertMessage) showAlert('success', alertMessage,20);
