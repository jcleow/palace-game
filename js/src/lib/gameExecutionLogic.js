import axios from 'axios';
import { updateUsersJoinedDiv, updatePlayerActionDiv } from './updateHeaderDivFn.js';
import {
  renderFaceDownCards, renderFaceUpCards, renderMiscCards, renderOpponentHand,
} from './renderCards.js';
import { createPlayBtn } from './buttonCreation.js';
import getCardPicUrl from './getCardPicUrlFn.js';
// ************ Business Logic ***********//

/** Function that keeps track of all the selected cards in play
 * @param {Array} selectedCardsPositionArray
 * An array that the parent function holds to keep
 * track of the number of selected cards through their indices
 *
 * @param {DOMObject} cardImg
 *
 * @param {Object} card
 *
 * @param {Integer} limit
 * Max number of cards that is to be selected at
 * anyone time
 *
 */
const selectCardsToPlay = (selectedCardsPositionArray, selectedCardsArray, cardIndex,
  cardImg, card, topDiscardedCard) => {
  // Need to remove flashing red border if say a user decides to pick another higher value card
  // instead of the first higher value card previously chosen
  if (cardImg.classList.contains('invalid-selection')) {
    cardImg.classList.remove('invalid-selection');
  }
  // If selecting a previously unselected card...
  if (!cardImg.style.border) {
    // Check if current selected card has a higher or same rank as discardPileCard
    // Or whether the current selected card is wildCard 2 or 10
    if (!topDiscardedCard || card.rank >= topDiscardedCard.rank
       || card.rank === 2 || card.rank === 10) {
      cardImg.style.border = 'thick solid #0000FF';
      // Next, check if another card has already been selected...
      if (selectedCardsPositionArray.length > 0) {
        // Next check if this card selected has the same rank as the first
        // (otherwise all other) selected cards
        // If the 2 cards have the same rank means they are the same card...
        if (selectedCardsArray[0].rank === card.rank) {
          selectedCardsArray.push(card);
          selectedCardsPositionArray.push(cardIndex);
          // Otherwise this is an invalid selection
        } else {
          cardImg.style.border = '';
          cardImg.classList.add('invalid-selection');
        }
        // Else there is no cards currently selected and it is a valid selection
      } else {
        selectedCardsArray.push(card);
        selectedCardsPositionArray.push(cardIndex);
      }
      // If current card selected has a lower rank than discardPileCard
    } else {
      cardImg.classList.add('invalid-selection');
    }
  // Otherwise selecting a previously selected card
  } else {
    cardImg.style.border = '';
    // Remove selected card from its position
    selectedCardsArray.splice(selectedCardsArray.indexOf(card), 1);
    selectedCardsPositionArray.splice(selectedCardsPositionArray.indexOf(cardIndex), 1);
  }
  console.log(selectedCardsArray, 'selectedCards');
  console.log(selectedCardsPositionArray, 'selectedPositions');
  return selectedCardsPositionArray;
};

// Business logic that gets the existing state of the game from the table through AJAX
const refreshGameInfo = () => {
  console.log('gameIsRefreshed');
  axios.get(`/games/${currentGame.id}`)
    .then((response) => {
      const { gameState: currGameState } = response.data.currGame;
      const { currGameRoundUsernames, currPlayer } = response.data;
      if (currGameState === 'waiting') {
        // update users who have joined the game
        updateUsersJoinedDiv(currGameRoundUsernames);
      } else if (currGameState === 'setGame') {
        displaySetGameCardPicsAndBtn(response);
        console.log('gameIsRefreshed-setgame-state');
      } else if (currGameState === 'begin') {
        // Update to see who is the current user(name) to play
        updatePlayerActionDiv(currPlayer);
        // Display all the cards on the table as well as cards in each player's hand
        displayTableTopAndBtns();
        console.log('gameIsRefreshed-begin-state!!');
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
      // someFunction(response);
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
      // Get the most recently discarded card
      const discardPile = JSON.parse(discardPileJSON);
      let topDiscardedCard;
      if (discardPile !== null) {
        topDiscardedCard = discardPile.pop();
      }

      // Query for all the relevant card divs on the table top
      const {
        loggedInPlayerFaceUpDiv, opponentFaceUpDiv, privateHandDiv,
        opponentHandDiv, loggedInPlayerFaceDownDiv, opponentFaceDownDiv, centerMiscCardsDiv,
      } = getAllCardDivs();

      // Render opponent player's private hand
      renderOpponentHand(opponentHands, opponentHandDiv);
      // Render opponent player's face up cards
      renderFaceUpCards(opponentHands, opponentFaceUpDiv);
      // Render opponent's face down cards
      renderFaceDownCards(opponentHands, opponentFaceDownDiv);

      // Render logged-in player's face up cards
      renderFaceUpCards(loggedInPlayerHands, loggedInPlayerFaceUpDiv);

      // Render logged-in player's face down cards
      renderFaceDownCards(loggedInPlayerHands, loggedInPlayerFaceDownDiv);
      // Render draw pile and discard pile
      renderMiscCards(drawPileJSON, discardPileJSON, centerMiscCardsDiv);
      // If it is loggedInUser's turn surface the [Play] button

      // Keep track of selected cards for play
      const selectedCardsArray = [];
      // Keep track of the selected cards indices to play
      const selectedCardsPositionArray = [];

      // Render logged-in player's private hand complete with client-side validation
      // of cards to play
      renderCardsInHand(selectedCardsPositionArray, loggedInPlayerHands,
        privateHandDiv, selectedCardsArray, topDiscardedCard);
      console.log(selectedCardsPositionArray, 'selected positions array');

      if (currGame.CurrentPlayerId === loggedInUserId) {
        console.log('reached here');
        // removes the playbtn if already created
        const playBtnContainer = document.querySelector('.play-button-container');
        playBtnContainer.innerHTML = '';
        const playBtn = createPlayBtn(playBtnContainer);

        playBtn.addEventListener('click', () => {
          console.log('clicked once');
          axios.put(`games/${currentGame.id}/players/${loggedInUserId}/play`, selectedCardsPositionArray)
            .then((playCardsResponse) => {
              currentGame = playCardsResponse.data.currGame;
              refreshGameInfo();
              playBtn.disabled = true;
            })
            .catch((error) => { console.log(error); });
        });
        // Else it is not the loggedInUser's turn, disable the play button
      } else {
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
      // remove start game button
      const startGameBtn = document.querySelector('#start-btn');
      const gameInterface = document.querySelector('#game-interface');
      gameInterface.removeChild(startGameBtn);

      // Display each loggedIn player's cards
      return axios.get(`/games/${currentGame.id}/players/${Number(loggedInUserId)}`);
    })
    .then((cardsInHandResponse) => {
      displaySetGameCardPicsAndBtn(cardsInHandResponse);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

// ********Creation of UI Elements ********//
const renderCardsInHand = (selectedCardsPositionArray, selectedPlayerHandArray,
  selectedDivToAppendTo, selectedCardsArray, topDiscardedCard) => {
  // Clear everything in the existing div and re-add in new cards
  selectedDivToAppendTo.innerHTML = '';
  JSON.parse(selectedPlayerHandArray[0].cardsInHand).forEach((faceUpCard, index) => {
    const cardImg = document.createElement('img');
    cardImg.src = getCardPicUrl(faceUpCard);
    cardImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(cardImg);
    const cardIndex = index;
    cardImg.addEventListener('click', () => selectCardsToPlay(selectedCardsPositionArray, selectedCardsArray, cardIndex, cardImg, faceUpCard, topDiscardedCard));
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

// Create a refresh button
const createRefreshBtn = () => {
  const refreshBtn = document.createElement('button');
  refreshBtn.innerHTML = 'Refresh';
  refreshBtn.setAttribute('id', 'refresh-btn');
  refreshBtn.addEventListener('click', refreshGameInfo);
  return refreshBtn;
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
  renderCardsInHand,
  selectCardsToPlay,
  displaySetGameCardPicsAndBtn, displayTableTopAndBtns,
  setGame,
  refreshGameInfo, createStartBtn,
  createRefreshBtn,
};