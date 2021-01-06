import axios from 'axios';
import './styles.scss';

// Import Helper Functions
import {
  createStartBtn, createRefreshBtn,
} from './lib/helperFn.js';
import { createLoginForm, createUserIdLabelAndLogOutBtnDisplay } from './lib/createLoginFormFn.js';
import { updateUsersJoinedDiv } from './lib/updateHeaderDivFn.js';

// get the gameInterface div
const gameInterface = document.querySelector('#game-interface');

// store all games relating to game retrieval/creation
const gameButtonsDiv = document.querySelector('.game-buttons');

// create game btn
const createGameBtn = document.createElement('button');

const createGame = function () {
  gameInterface.removeChild(gameButtonsDiv);
  // Display Waiting for players
  const headerDiv = document.querySelector('.header-div');
  headerDiv.innerText = 'Waiting for players...';

  // Make a request to create a new game
  axios.post('/games')
    .then((response) => {
      // set the global value to the new game.
      currentGame = response.data;
      headerDiv.innerText = `${response.data.currentPlayerName} has joined the game`;
      gameInterface.appendChild(createStartBtn());
      gameInterface.appendChild(createRefreshBtn());
      return Promise.resolve(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

createGameBtn.addEventListener('click', createGame);
createGameBtn.innerText = 'Create New Game';
gameButtonsDiv.appendChild(createGameBtn);

const loginContainer = document.querySelector('#login-container');
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

// First check if a game is already on-going(in case of multiplayer games)
axios.get('/games')
  .then((onGoingGameResponses) => {
    // set loggedInUserId obtained from server

    loggedInUserId = Number(onGoingGameResponses.data.loggedInUserId);

    // If there are more than 1 ongoing games, display these games
    if (onGoingGameResponses.data.allOngoingGamesArray) {
      onGoingGameResponses.data.allOngoingGamesArray.forEach((ongoingGame) => {
        // create a button that retrieves each of the ongoing games
        const gameButton = document.createElement('button');
        gameButton.innerText = `Game: ${ongoingGame.id}`;
        gameButtonsDiv.appendChild(gameButton);

        // add event listener to get/enter that particular game
        gameButton.addEventListener('click', () => {
          axios.post(`/games/${ongoingGame.id}/join/${loggedInUserId}`)
            .then((joinGameResponse) => {
              currentGame = joinGameResponse.data.currentGame;
              // Display Start & Refresh Buttons
              gameInterface.removeChild(gameButtonsDiv);
              gameInterface.appendChild(createStartBtn());
              gameInterface.appendChild(createRefreshBtn());
              return axios.get(`/games/${ongoingGame.id}`);
            })
            .then((selectedGameResponse) => {
              const { currGameRoundDetails, currGameRoundUsernames } = selectedGameResponse.data;

              // Display deal & refresh buttons
              // Remove and reappend everytime a new game button is clicked
              // (to prevent disabled deal button specific to a game)
              const existingStartBtn = document.querySelector('#start-btn');
              const existingRefreshBtn = document.querySelector('#refresh-btn');

              if (existingStartBtn) {
                gameInterface.removeChild(existingStartBtn);
              }
              if (existingRefreshBtn) {
                gameInterface.removeChild(existingRefreshBtn);
              }
              gameInterface.appendChild(createRefreshBtn());
              updateUsersJoinedDiv(currGameRoundUsernames);
            })
            .catch((error) => { console.log(error); });
        });
      });
    }
  })
  .catch((error) => { console.log(error); });
