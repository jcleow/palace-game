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

// Update in header div which players have joined
const updateUsersJoinedDiv = (currGameRoundUsernames) => {
  const headerDiv = document.querySelector('.header-div');
  headerDiv.innerHTML = '';
  currGameRoundUsernames.forEach((username) => {
    headerDiv.innerText += `${username} has joined the game \n`;
  });
};
// Update in header which player's turn it is with player's username
const updatePlayerActionDiv = (currPlayer) => {
  const headerDiv = document.querySelector('.header-div');
  headerDiv.innerText = `It's ${currPlayer.username}'s turn`;
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
// Helper that renders face up cards
const renderFaceUpCards = (selectedPlayerHandArray, selectedDivToAppendTo) => {
  // Clear everything in the existing div and re-add in new cards
  selectedDivToAppendTo.innerHTML = '';
  JSON.parse(selectedPlayerHandArray[0].faceUpCards).forEach((faceUpCard) => {
    const cardImg = document.createElement('img');
    cardImg.src = getCardPicUrl(faceUpCard);
    cardImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(cardImg);
  });
};
const renderFaceDownCards = (selectedPlayerHandArray, selectedDivToAppendTo) => {
  // Clear everything in the existing div and re-add in new cards
  selectedDivToAppendTo.innerHTML = '';
  JSON.parse(selectedPlayerHandArray[0].faceDownCards).forEach((faceUpCard) => {
    const cardImg = document.createElement('img');
    cardImg.src = '/cardPictures/COVER-CARD.png';
    cardImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(cardImg);
  });
};

const renderCardsInHand = (selectedPlayerHandArray, selectedDivToAppendTo) => {
  // Clear everything in the existing div and re-add in new cards
  selectedDivToAppendTo.innerHTML = '';
  JSON.parse(selectedPlayerHandArray[0].cardsInHand).forEach((faceUpCard) => {
    const cardImg = document.createElement('img');
    cardImg.src = getCardPicUrl(faceUpCard);
    cardImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(cardImg);
  });
};

const renderOpponentHand = (selectedPlayerHandArray, selectedDivToAppendTo) => {
  // Clear everything in the existing div and re-add in new cards
  selectedDivToAppendTo.innerHTML = '';
  JSON.parse(selectedPlayerHandArray[0].cardsInHand).forEach((faceUpCard) => {
    const cardImg = document.createElement('img');
    cardImg.src = '/cardPictures/COVER-CARD.png';
    cardImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(cardImg);
  });
};

const renderMiscCards = (drawPileJSON, discardPileJSON, selectedDivToAppendTo) => {
  // Clear everything in the existing div and re-add in new cards
  selectedDivToAppendTo.innerHTML = '';
  // Rendering draw pile picture (if it still exists)
  const drawPileArray = JSON.parse(drawPileJSON);
  if (drawPileArray.length > 0) {
    const drawPileImg = document.createElement('img');
    drawPileImg.src = '/cardPictures/COVER-CARD.png';
    drawPileImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(drawPileImg);
  }

  // Rendering discard pile picture if it is more than 1
  const discardPile = JSON.parse(discardPileJSON);
  if (drawPileArray.length > 0) {
    const discardedCardImg = document.createElement('img');
    discardedCardImg.src = getCardPicUrl(discardPile[discardPile.length - 1]);
    discardedCardImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(discardedCardImg);
  }
};

// Displaying all the card pictures and relevant button for setting the faceup cards
const displaySetGameCardPicsAndBtn = (cardsInHandResponse) => {
  const cardsInHand = JSON.parse(cardsInHandResponse.data.playerHand.cardsInHand);

  // Create a container to hold the pics
  const cardPicContainer = document.createElement('div');
  const selectedCardsArray = [];

  // Display a picture for each of the cards
  cardsInHand.forEach((card) => {
    const cardPic = document.createElement('img');
    cardPic.src = getCardPicUrl(card);
    cardPic.setAttribute('class', 'card-pic');

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
        console.log(editResponse, 'editResponse');
        // if all players have completed setting up their faceUpCards...
        if (editResponse.data.setGame === 'completed') {
          return axios.get(`/games/${currentGame.id}`);
        }
      })
      .then((currentGameResponse) => {
        if (currentGameResponse) {
          console.log(currentGameResponse, 'currentGameDataResponse');
          // Render the pictures on the table
          displayTableTopAndBtns();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

const displayTableTopAndBtns = () => {
  const tableTop = document.querySelector('.table-top-display');
  tableTop.style.display = 'block';
  // get all the faceUpCards from database and create it here
  axios.get(`/games/${currentGame.id}`)
    .then((response) => {
      // Classify the response data round details into
      // either logged-in player array or opponent hand array
      const loggedInPlayerHands = [];
      const opponentHands = [];
      response.data.currGameRoundDetails.forEach((gameRound) => {
        if (gameRound.UserId === Number(loggedInUserId)) {
          loggedInPlayerHands.push(gameRound);
        } else {
          opponentHands.push(gameRound);
        }
      });
      // Obtain the currGame discard and draw pile data
      const { currGame } = response.data;
      const { drawPile: drawPileJSON, discardPile: discardPileJSON } = currGame;

      const loggedInPlayerFaceUpDiv = document.querySelector('.logged-in-player-face-up-cards ');
      const opponentFaceUpDiv = document.querySelector('.opponent-face-up-cards');
      const privateHandDiv = document.querySelector('.logged-in-player-private-hand');
      const opponentHandDiv = document.querySelector('.opponent-private-hand');
      const loggedInPlayerFaceDownDiv = document.querySelector('.logged-in-player-face-down-cards');
      const opponentFaceDownDiv = document.querySelector('.opponent-face-down-cards');
      const centerMiscCardsDiv = document.querySelector('.center-misc-cards');

      // Render opponent player's private hand
      renderOpponentHand(opponentHands, opponentHandDiv);
      // Render opponent player's face up cards
      renderFaceUpCards(opponentHands, opponentFaceUpDiv);
      // Render opponent's face down cards
      renderFaceDownCards(opponentHands, opponentFaceDownDiv);

      // Render logged-in player's face up cards
      renderFaceUpCards(loggedInPlayerHands, loggedInPlayerFaceUpDiv);
      // Render logged-in player's private hand
      renderCardsInHand(loggedInPlayerHands, privateHandDiv);
      // Render logged-in player's face down cards
      renderFaceDownCards(loggedInPlayerHands, loggedInPlayerFaceDownDiv);

      // Render draw pile and discard pile
      renderMiscCards(drawPileJSON, discardPileJSON, centerMiscCardsDiv);
    });
};

// Make a request to the server
// to change the deck. set 2 new cards into the player hand.
const dealCards = (currentGame) => {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;

      // If any of the current user wins in this round by having a score of 3...
      // then he is the winner
      if (currentGame.gameStatus === 'gameOver') {
        const dealBtn = document.querySelector('#deal-btn');
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

// Display all the card pictures for both players, drawPile, discardPile,table-top cards and hand

// Function that executes the setting up of game - allowing players to choose which cards to face up
const setGame = () => {
  axios.put(`/games/${currentGame.id}/setGame`)
    .then((response) => {
      currentGame = response.data;
      loggedInUserId = response.data.loggedInUserId;
      // remove start game button
      const startGameBtn = document.querySelector('#start-btn');
      const gameInterface = document.querySelector('#game-interface');
      gameInterface.removeChild(startGameBtn);

      // Display each loggedIn player's cards
      return axios.get(`/games/${currentGame.id}/player/${Number(loggedInUserId)}`);
    })
    .then((cardsInHandResponse) => {
      displaySetGameCardPicsAndBtn(cardsInHandResponse);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

// Function that gets the existing state of the game from the table through AJAX
const refreshGameInfo = () => {
  axios.get(`/games/${currentGame.id}`)
    .then((response) => {
      const { gameState: currGameState } = response.data.currGame;
      const { currGameRoundUsernames, currPlayer } = response.data;
      if (currGameState === 'waiting') {
        // update users who have joined the game
        updateUsersJoinedDiv(currGameRoundUsernames);
      } else if (currGameState === 'setGame') {
        displaySetGameCardPicsAndBtn(response);
      } else if (currGameState === 'begin') {
        // Update to see who is the current user(name) to play
        updatePlayerActionDiv(currPlayer);
        // Display all the cards on the table as well as cards in each player's hand
        displayTableTopAndBtns();
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

// Create a Start Button
const createStartBtn = () => {
  const startBtn = document.createElement('button');
  startBtn.innerText = 'Start';
  startBtn.setAttribute('id', 'start-btn');
  startBtn.addEventListener('click', setGame);
  return startBtn;
};

// Create a Start Button
const createDealBtn = () => {
  const dealBtn = document.createElement('button');
  dealBtn.innerText = 'Deal';
  dealBtn.setAttribute('id', 'deal-btn');
  dealBtn.addEventListener('click', dealCards);
  return dealBtn;
};

// Create a refresh button
const createRefreshBtn = () => {
  const refreshBtn = document.createElement('button');
  refreshBtn.innerHTML = 'Refresh';
  refreshBtn.setAttribute('id', 'refresh-btn');
  refreshBtn.addEventListener('click', refreshGameInfo);
  return refreshBtn;
};
