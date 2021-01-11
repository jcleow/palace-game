import axios from 'axios';

// createLoginForm function
const displayLoginForm = (loginContainer) => {
  const loginFormContainer = document.querySelector('#login-container');
  const loginBtn = document.querySelector('#login-btn');
  const registerBtn = document.querySelector('#register-btn');
  const usernameInput = document.querySelector('#username');
  const passwordInput = document.querySelector('#password');
  const userProfile = document.querySelector('.user-profile');
  userProfile.style.display = 'none';
  loginFormContainer.style.display = 'block';

  // Function that checks that the user is logged in
  // and replaces the login form with userid display and log out button
  const validateLogin = () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    axios.post('/user/login', { username, password })
      .then((response) => {
        loggedInUserId = response.data.loggedInUserId;
        if (response.data.authenticated === true) {
          userProfile.style.display = 'block';
          loginFormContainer.style.display = 'none';
          // Add the display of user id and a logout button
          createUserProfile(response);
        } else {
          const errorMessage = document.createElement('label');
          errorMessage.innerHTML = 'Your username and/or password is incorrect';
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const registerNewUser = () => {
    const data = {};
    data.username = usernameInput.value;
    data.password = passwordInput.value;
    axios.post('/user/new', data)
      .then((response) => {
        if (response.data.creationStatus === 'success') {
          validateLogin();
        } else if (response.data.creationStatus === 'existing username') {
          const validationErrorMsg = document.createElement('div');
          validationErrorMsg.innerHTML = 'Username already exists';
          loginContainer.appendChild(validationErrorMsg);
        }
      })
      .catch((error) => { console.log(error); });
  };

  loginBtn.addEventListener('click', validateLogin);
  registerBtn.addEventListener('click', registerNewUser);
};

const createUserProfile = (response) => {
  // Create the userId display and logout btn
  const userIdLabel = document.querySelector('#logged-in-display');
  userIdLabel.innerHTML = `Logged in as ${response.data.loggedInUsername}`;
  const logoutBtn = document.getElementById('logout-btn');
  const loginFormContainer = document.querySelector('#login-container');
  const userProfile = document.querySelector('.user-profile');

  // If the user chooses to log out...
  logoutBtn.addEventListener('click', () => {
    axios.put('/user/logout')
      .then(() => {
        // Re-display login form and turn off userprofile display
        userProfile.style.display = 'none';
        loginFormContainer.style.display = 'block';
      })
      .catch((error) => { console.log(error); });
  });
};

export { displayLoginForm, createUserProfile };
