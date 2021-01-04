const loginContainer = document.querySelector('#loginContainer');
// Create all the elements inside loginContainer div for login form
axios.get('/user')
  .then((res) => {
    if (res.data.loggedInUserId) {
      createUserIdLabelAndLogOutBtnDisplay(loginContainer, res);
    } else {
      createLoginForm(loginContainer);
    }
  })

  .catch((error) => { console.log(error); });
