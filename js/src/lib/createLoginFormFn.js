import axios from 'axios';

// createLoginForm function
const createLoginForm = (loginContainer) => {
  const loginFormDiv = document.createElement('div');

  const usernameLabel = document.createElement('label');
  const usernameInput = document.createElement('input');
  usernameLabel.innerHTML = 'Username';
  usernameInput.placeholder = 'Enter your username';

  const breakLine1 = document.createElement('br');

  const passwordLabel = document.createElement('label');
  const passwordInput = document.createElement('input');
  passwordLabel.innerHTML = 'Password';
  passwordInput.placeholder = 'Enter your password';

  const breakLine2 = document.createElement('br');

  const loginBtn = document.createElement('button');
  loginBtn.innerHTML = 'Login';

  const registerBtn = document.createElement('button');
  registerBtn.innerHTML = 'Register';

  loginFormDiv.appendChild(usernameLabel);
  loginFormDiv.appendChild(usernameInput);

  loginFormDiv.appendChild(breakLine1);

  loginFormDiv.appendChild(passwordLabel);
  loginFormDiv.appendChild(passwordInput);

  loginFormDiv.appendChild(breakLine2);

  loginFormDiv.appendChild(loginBtn);
  loginFormDiv.appendChild(registerBtn);

  loginContainer.appendChild(loginFormDiv);

  // Function that checks that the user is logged in
  // and replaces the login form with userid display and log out button
  const validateLogin = () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    axios.post('/user/login', { username, password })
      .then((response) => {
        console.log(response, 'response');
        loggedInUserId = response.data.loggedInUserId;
        if (response.data.authenticated === true) {
          loginContainer.removeChild(loginFormDiv);

          // Add the display of user id and a logout button
          createUserIdLabelAndLogOutBtnDisplay(loginContainer, response);
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

const createUserIdLabelAndLogOutBtnDisplay = (parentNode, response) => {
  // Create the userId display and logout btn
  const userIdLabel = document.createElement('label');
  userIdLabel.innerHTML = `Logged On User Id is ${response.data.loggedInUserId}`;
  const logoutBtn = document.createElement('button');
  logoutBtn.innerHTML = 'logout';

  // If the user chooses to log out...
  logoutBtn.addEventListener('click', () => {
    axios.put('/user/logout')
      .then((logoutResponse) => {
        console.log(logoutResponse);
        // Query for the login container
        const loginContainer = document.querySelector('#login-container');

        // Remove userId-label and logout btn
        loginContainer.removeChild(userIdLabel);
        loginContainer.removeChild(logoutBtn);

        // Re-create login form
        createLoginForm(loginContainer);
      })
      .catch((error) => { console.log(error); });
  });
  parentNode.appendChild(userIdLabel);
  parentNode.appendChild(logoutBtn);
};

export { createLoginForm, createUserIdLabelAndLogOutBtnDisplay };
