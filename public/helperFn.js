// global value that holds info about the current hand.
let currentGame = null;
// global value for current loggedInUserId
let loggedInUserId;

// Function that generates the path to each individual card
const getCardPicUrl = (card) => {
  let imgSrc = '';
  // get directory for each of the cards
  imgSrc = `/cardPictures/${card.suit.toUpperCase()}-${card.rank}`;
  if (card.rank >= 11 && card.rank <= 13) {
    imgSrc += `-${card.name.toUpperCase()}`;
  }
  imgSrc += '.png';
  // Returns the link to the image
  return imgSrc;
};

const createUserIdAndLogOutBtnDisplay = (parentNode, response) => {
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
        const loginContainer = document.querySelector('#loginContainer');

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

// make a request to the server
// to change the deck. set 2 new cards into the player hand.
const dealCards = function (currentGame) {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;

      // If any of the current user wins in this round by having a score of 3...
      // then he is the winner
      if (currentGame.gameStatus === 'gameOver') {
        const dealBtn = document.querySelector('#dealBtn');
        dealBtn.disabled = true;
        const displayGameOverMsg = document.querySelector('#game-over');
        displayGameOverMsg.innerText = `Game Over. Winner is P${currentGame.currRoundWinner}`;
      }
    })
    .then(() => {
      // Update the display of the running score for both players

    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const outputCardPicsAndBtn = (cardsInHandResponse) => {
  const cardsInHand = JSON.parse(cardsInHandResponse.data.playerHand.cardsInHand);

  // Create a container to hold the pics
  const cardPicContainer = document.createElement('div');
  const selectedCardsArray = [];

  // Display a picture for each of the cards
  cardsInHand.forEach((card) => {
    const cardPic = document.createElement('img');
    cardPic.src = getCardPicUrl(card);
    cardPic.setAttribute('class', 'cardPic');

    // Select & deselecting each card for the face up or down feature
    cardPic.addEventListener('click', () => {
      if (selectedCardsArray.length < 3 || cardPic.style.border) {
        if (!cardPic.style.border) {
          cardPic.style.border = 'thick solid #0000FF';
          selectedCardsArray.push(card);
        } else {
          cardPic.style.border = '';
          // Remove selected card from its position
          selectedCardsArray.splice(selectedCardsArray.indexOf(card), 1);
        }
      } else {
        // To output this message in a graphical form later
        console.log('You cannot choose more than 3 cards to faceup');
      }
    });
    cardPicContainer.appendChild(cardPic);
  });

  const faceDownBtn = document.createElement('button');
  faceDownBtn.innerText = 'Place Selected Cards on Table';

  document.body.appendChild(cardPicContainer);
  document.body.appendChild(faceDownBtn);

  faceDownBtn.addEventListener('click', () => {
    // remove button and all the images
    document.body.removeChild(cardPicContainer);
    document.body.removeChild(faceDownBtn);

    // Perform request to server to update faceDownCards
    axios.put(`/games/${currentGame.id}/player/${loggedInUserId}`, selectedCardsArray)
      .then((editResponse) => {
        console.log(editResponse);
        // if all players have completed setting up their faceUpCards...
        if (editResponse.data.setGame === 'completed') {
          return axios.get(`/games/${currentGame.id}`);
        }
      })
      .then((currentGameResponse) => {
        console.log(currentGameResponse, 'currentGameDataResponse');
        // Render the pictures on the table
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

const setGame = function () {
  axios.put(`/games/${currentGame.id}/setGame`)
    .then((response) => {
      currentGame = response.data;
      loggedInUserId = response.data.loggedInUserId;
      // remove start game button
      const startGameBtn = document.querySelector('#startBtn');
      const gameInterface = document.querySelector('#game-interface');
      gameInterface.removeChild(startGameBtn);

      // Display each loggedIn player's cards
      return axios.get(`/games/${currentGame.id}/player/${Number(loggedInUserId)}`);
    })
    .then((cardsInHandResponse) => {
      outputCardPicsAndBtn(cardsInHandResponse);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

// Function that gets the existing state of the game from the table through AJAX
const refreshGameInfo = () => {
  axios.get(`/games/${currentGame.id}`)
    .then((playerHandResponse) => {
      outputCardPicsAndBtn(playerHandResponse);
    })
    .catch((error) => {
      console.log(error);
    });
};

// Create a Start Button
const createStartBtn = () => {
  const startBtn = document.createElement('button');
  startBtn.innerText = 'Start';
  startBtn.setAttribute('id', 'startBtn');
  startBtn.addEventListener('click', setGame);
  return startBtn;
};

// Create a Start Button
const createDealBtn = () => {
  const dealBtn = document.createElement('button');
  dealBtn.innerText = 'Deal';
  dealBtn.setAttribute('id', 'dealBtn');
  dealBtn.addEventListener('click', dealCards);
  return dealBtn;
};

// Create a refresh button
const createRefreshBtn = () => {
  const refreshBtn = document.createElement('button');
  refreshBtn.innerHTML = 'Refresh';
  refreshBtn.setAttribute('id', 'refreshBtn');
  refreshBtn.addEventListener('click', refreshGameInfo);
  return refreshBtn;
};
