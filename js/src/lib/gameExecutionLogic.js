import axios from 'axios';
import {
  updateGameRoomNumber,
  updateUsersJoinedDiv, updatePlayerActionDiv,
  updateGameOverDiv, updateSetGameInstructions,
  outputSetGameErrorMsgNotEnoughCards,
  outputSetGameErrorMsgTooManyCards,
  updateWaitingForPlayerMsg,
  loadSpinningAnimation,
  removeSpinningAnimation,
  outputSetUpGameText, removeSetUpGameMsg, outputGameAbandonedMsg,
} from './updateHeaderDivFn.js';
import {
  renderFaceDownCards, renderFaceUpCards, renderMiscCards, renderOpponentHand, renderCardsInHand,
} from './renderCardsFn.js';
import { createPlayBtn } from './buttonCreationFn.js';
import getCardPicUrl from './getCardPicUrlFn.js';
import refreshGamePlay from './refreshFn.js';
// ************ Business Logic ***********//

// Business logic that gets the existing state of the game from the table through AJAX
const refreshGameInfo = (clearIntervalRef) => {
  axios.get(`/games/${currentGame.id}`)
    .then((response) => {
      const { id: gameId, gameState: currGameState } = response.data.currGame;
      const { currGameRoundUsernames, currPlayer } = response.data;

      if (currGameState === 'waiting') {
        // update users who have joined the game
        updateGameRoomNumber(gameId);
        updateUsersJoinedDiv(currGameRoundUsernames);
      } else if (currGameState === 'setGame') {
        clearInterval(clearIntervalRef);
        updateSetGameInstructions();
        displaySetGameCardPicsAndBtn(response);
      } else if (currGameState === 'ongoing') {
        clearInterval(clearIntervalRef);
        removeSpinningAnimation();
        updateGameRoomNumber(gameId);
        // Update to see who is the current user(name) to play
        updatePlayerActionDiv(currPlayer);
        // Display all the cards on the table as well as cards in each player's hand
        displayTableTopAndBtns();
      } else if (currGameState === 'gameOver') {
        clearInterval(clearIntervalRef);
        // Display all the cards on the table as well as cards in each player's hand
        displayTableTopAndBtns();
        const { winner } = response.data;
        updateGameOverDiv(winner);
      } else if (currGameState === 'abandoned') {
        outputGameAbandonedMsg();
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

// Logic for displaying the entire table when game begins
const displayTableTopAndBtns = () => {
  const tableTop = document.querySelector('.table-top-display');
  tableTop.style.display = 'block';
  // get all the faceUpCards from database and create it here
  axios.get(`/games/${currentGame.id}`)
    .then((response) => {
      console.log(response.data, 'response-data');
      // Classify the response data round details into
      // either logged-in player array or opponent hand array
      // Type array as it might be easier to track more than 2 players for opponent hands
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
      const { cardsInHand: cardsInHandJSON, faceUpCards: faceUpCardsJSON, faceDownCards: faceDownCardsJSON } = loggedInPlayerHands[0];
      const drawPile = JSON.parse(drawPileJSON);
      const discardPile = JSON.parse(discardPileJSON);
      const cardsInHand = JSON.parse(cardsInHandJSON);
      const faceUpCards = JSON.parse(faceUpCardsJSON);
      const faceDownCards = JSON.parse(faceDownCardsJSON);

      // Get the most recently discarded card
      let topDiscardedCard;
      if (discardPile !== null) {
        topDiscardedCard = discardPile[discardPile.length - 1];
      }

      // Query for all the relevant card divs on the table top
      const {
        loggedInPlayerFaceUpDiv, opponentFaceUpDiv, privateHandDiv,
        opponentHandDiv, loggedInPlayerFaceDownDiv, opponentFaceDownDiv, centerMiscCardsDiv,
      } = getAllCardDivs();

      // Keep track of loggedInUser's selected cardsInHand to play
      const selectedCardsInHandArray = [];
      // Keep track of the position of loggedInUser's selected cardsInHand to play
      const selectedCardsInHandPositionArray = [];
      console.log(selectedCardsInHandPositionArray, 'cards in hand pos array');

      // Keep track of loggedInUser's selected FaceUpCards to play
      const selectedFaceUpCardsArray = [];
      // Keep track of the position of loggedInUser's selected FaceUpCards to play
      const selectedFaceUpCardsPositionArray = [];
      console.log(selectedFaceUpCardsPositionArray, 'face up cards pos array');

      // Keep track of loggedInUser's selected FaceDownCards to play
      const selectedFaceDownCardsArray = [];
      // Keep track of the position of loggedInUser's selected FaceDownCards to play
      const selectedFaceDownCardsPositionArray = [];
      console.log(selectedFaceDownCardsPositionArray, 'face down cards pos array');

      // Render opponent player's private hand
      renderOpponentHand(opponentHands, opponentHandDiv);

      // Render opponent player's face up cards
      renderFaceUpCards(opponentHands, opponentFaceUpDiv);

      // Render opponent's face down cards
      renderFaceDownCards(opponentHands, opponentFaceDownDiv);

      // Render logged-in player's face up cards
      renderFaceUpCards(loggedInPlayerHands, loggedInPlayerFaceUpDiv,
        selectedFaceUpCardsArray, selectedFaceUpCardsPositionArray,
        topDiscardedCard, drawPile);

      // Render logged-in player's face down cards
      renderFaceDownCards(loggedInPlayerHands, loggedInPlayerFaceDownDiv,
        selectedFaceDownCardsArray, selectedFaceDownCardsPositionArray,
        topDiscardedCard, drawPile);

      // Render logged-in player's private hand complete with client-side validation
      // of cards to play
      renderCardsInHand(loggedInPlayerHands, privateHandDiv,
        selectedCardsInHandArray, selectedCardsInHandPositionArray, topDiscardedCard);

      // Render draw pile and discard pile
      renderMiscCards(drawPile, discardPile, centerMiscCardsDiv);

      // Since user can choose to play either cardsInHand, faceUpCards, faceDownCards
      // we need to distinguish which cards to send to the server
      let selectedCardsPlayedPositionArray;
      let cardType;
      console.log(selectedCardsInHandPositionArray, 'selectedCardsInHandPosArray');
      console.log(selectedCardsInHandPositionArray.length, 'length');
      if (cardsInHand.length > 0) {
        selectedCardsPlayedPositionArray = selectedCardsInHandPositionArray;
        cardType = 'cardsInHand';
      } else if (faceUpCards.length > 0) {
        selectedCardsPlayedPositionArray = selectedFaceUpCardsPositionArray;
        cardType = 'faceUpCards';
      } else if (faceDownCards.length > 0) {
        selectedCardsPlayedPositionArray = selectedFaceDownCardsPositionArray;
        cardType = 'faceDownCards';
      } else {
        // This might be redundant as the game would have ended
        selectedCardsPlayedPositionArray = selectedCardsInHandPositionArray;
        cardType = 'cardsInHand';
      }

      if (currGame.CurrentPlayerId === loggedInUserId) {
        // removes the playbtn if already created
        const playBtnContainer = document.querySelector('.play-button-container');
        playBtnContainer.innerHTML = '';
        const playBtn = createPlayBtn(playBtnContainer);

        // If game over, we disable the playBtn
        if (currGame.gameState === 'gameOver') {
          playBtn.disabled = true;
          return;
        }

        playBtn.addEventListener('click', () => {
          console.log('clicked once');
          console.log(selectedCardsInHandPositionArray, 'selected position array');

          axios.put(`games/${currentGame.id}/players/${loggedInUserId}/play`,
            { selectedCardsPlayedPositionArray, cardType })
            .then((playCardsResponse) => {
              currentGame = playCardsResponse.data.currGame;
              refreshGameInfo();
              playBtn.disabled = true;
            })
            .catch((error) => { console.log(error); });
        });
        // Else it is not the loggedInUser's turn, disable the play button and refresh the game play
      } else {
        // As long as game is not over, continue to refresh
        if (currGame.gameState !== 'gameOver') {
          refreshGamePlay();
        }
        const playBtnContainer = document.querySelector('.play-button-container');
        let playBtn = document.querySelector('#play-btn');
        if (!playBtn) {
          playBtn = createPlayBtn(playBtnContainer);
        }
        playBtn.disabled = true;
      }
    });
};

// Logic for display all the 6 card pictures and relevant button for setting the faceup cards
const displaySetGameCardPicsAndBtn = (cardsInHandResponse) => {
  // Change header to reflect the game being setting up
  outputSetUpGameText();
  // First check if set-game-display has already been set up
  // Query for the relevant divs to hold the pics
  const cardPicContainer = document.querySelector('#card-pics-container');
  const faceDownBtnDiv = document.querySelector('#face-down-btn-div');
  // If set up already, refresh function shall not re-render/refresh
  if (cardPicContainer.innerHTML && faceDownBtnDiv.innerHTML) {
    return;
  }

  const cardsInHand = JSON.parse(cardsInHandResponse.data.playerHand.cardsInHand);
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
          cardPic.style.border = '5px solid #0000FF';
          selectedCardsArray.push(card);
        } else {
          cardPic.style.border = '';
          // Remove selected card from its position
          selectedCardsArray.splice(selectedCardsArray.indexOf(card), 1);
        }
      } else {
        // To output this message in a graphical form later
        outputSetGameErrorMsgTooManyCards();
      }
    });
    cardPicContainer.appendChild(cardPic);
  });

  const faceDownBtn = document.createElement('button');
  faceDownBtn.classList.add('btn');
  faceDownBtn.classList.add('btn-light');
  faceDownBtn.innerText = 'Place Selected Cards on Table';

  faceDownBtnDiv.appendChild(faceDownBtn);

  faceDownBtn.addEventListener('click', () => {
    console.log(selectedCardsArray, 'selectedCardsArray');
    if (selectedCardsArray.length < 3) {
      // Output error message
      outputSetGameErrorMsgNotEnoughCards();
      return;
    }

    // remove button and all the images
    cardPicContainer.innerHTML = '';
    faceDownBtnDiv.innerHTML = '';

    // Update output message to waiting for other player
    updateWaitingForPlayerMsg();

    // Load spinning animation
    loadSpinningAnimation();

    // resume refreshing gameplay
    refreshGamePlay();

    // Perform request to server to update faceDownCards
    axios.put(`/games/${currentGame.id}/players/${loggedInUserId}`, selectedCardsArray)
      .then((editResponse) => {
        // if all players have completed setting up their faceUpCards...
        if (editResponse.data.setGame === 'completed') {
          return axios.get(`/games/${currentGame.id}`);
        }
      })
      .then((currentGameResponse) => {
        if (currentGameResponse) {
          // Render the pictures on the table
          displayTableTopAndBtns();
          removeSetUpGameMsg();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

// Function that executes the setting up of game - allowing players to choose which cards to face up
const setGame = () => {
  axios.put(`/games/${currentGame.id}/setGame`)
    .then((response) => {
      currentGame = response.data;
      loggedInUserId = Number(response.data.loggedInUserId);

      // Update the game room number
      updateGameRoomNumber(currentGame.id);
      // remove start game button
      const startGameBtn = document.querySelector('#start-btn');
      const gameInterface = document.querySelector('#game-interface');
      gameInterface.removeChild(startGameBtn);

      // Display each loggedIn player's cards
      return axios.get(`/games/${currentGame.id}/players/${Number(loggedInUserId)}`);
    })
    .then((cardsInHandResponse) => {
      updateSetGameInstructions();
      displaySetGameCardPicsAndBtn(cardsInHandResponse);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

// ********Creation of UI Elements ********//

// Create a Start Button
const createStartBtn = () => {
  const startBtn = document.createElement('button');
  startBtn.innerText = 'Start';
  startBtn.setAttribute('id', 'start-btn');
  startBtn.classList.add('btn');
  startBtn.classList.add('btn-light');
  startBtn.classList.add('mr-2');
  startBtn.disabled = true;
  startBtn.addEventListener('click', setGame);
  return startBtn;
};

// Function that queries for all the relevant card divs on the table top
const getAllCardDivs = () => {
  const loggedInPlayerFaceUpDiv = document.querySelector('.logged-in-player-face-up-cards ');
  const opponentFaceUpDiv = document.querySelector('.opponent-face-up-cards');
  const privateHandDiv = document.querySelector('.logged-in-player-private-hand');
  const opponentHandDiv = document.querySelector('.opponent-private-hand');
  const loggedInPlayerFaceDownDiv = document.querySelector('.logged-in-player-face-down-cards');
  const opponentFaceDownDiv = document.querySelector('.opponent-face-down-cards');
  const centerMiscCardsDiv = document.querySelector('.center-misc-cards');
  return {
    loggedInPlayerFaceUpDiv, opponentFaceUpDiv, privateHandDiv, opponentHandDiv, loggedInPlayerFaceDownDiv, opponentFaceDownDiv, centerMiscCardsDiv,
  };
};

export {
  displaySetGameCardPicsAndBtn, displayTableTopAndBtns,
  setGame,
  refreshGameInfo, createStartBtn,
};
