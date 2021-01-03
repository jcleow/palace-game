// get the gameInterface div
const gameInterface = document.querySelector('#game-interface');

// store all games relating to game retrieval/creation
const gameButtonsDiv = document.querySelector('.game-buttons');

// create game btn
const createGameBtn = document.createElement('button');

// // DOM manipulation function that displays the player's current hand.
// const runGame = function ({ cards, currRoundWinner }) {
//   // manipulate DOM
//   const dealList1 = document.querySelector('#deal-list-1');
//   const dealList2 = document.querySelector('#deal-list-2');
//   if ('playerHand' in cards) {
//     dealList1.innerText = `
//     Player 1 Hand:
//     ====
//     ${cards.playerHand[0].name}
//     of
//     ${cards.playerHand[0].suit}
//     `;
//     dealList2.innerText = `
//   Player 2 Hand
//     ====
//     ${cards.playerHand[1].name}
//     of
//     ${cards.playerHand[1].suit}
//   `;
//     // Display player container display
//     const playerDisplayContainer = document.querySelector('.playerDisplayContainer');
//     playerDisplayContainer.style.display = 'block';

//     // Display winner using server-side logic
//     const player1WinDiv = document.querySelector('#player1Win');
//     const player2WinDiv = document.querySelector('#player2Win');
//     if (currRoundWinner === 1) {
//       player1WinDiv.innerText = 'Winner';
//       player2WinDiv.innerText = '';
//     } else if (currRoundWinner === 2) {
//       player1WinDiv.innerText = '';
//       player2WinDiv.innerText = 'Winner';
//     } else {
//       player1WinDiv.innerText = 'Draw';
//       player2WinDiv.innerText = 'Draw';
//     }
//     outputCurrentGameScores(currentGame);
//   }
// };

const createGame = function () {
  gameInterface.removeChild(gameButtonsDiv);
  // Display Waiting for players
  const headerDiv = document.querySelector('.headerDiv');
  headerDiv.innerText = 'Waiting for players...';
  console.log(currentGame, 'currentGame');
  // Make a request to create a new game
  axios.post('/games')
    .then((response) => {
      // set the global value to the new game.
      console.log(response, 'response');
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

// First check if a game is already on-going(in case of multiplayer games)
axios.get('/games')
  .then((onGoingGameResponses) => {
    console.log(onGoingGameResponses, 'onGoingGameResponse');
    // set loggedInUserId obtained from server
    loggedInUserId = onGoingGameResponses.data.loggedInUserId;

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
              console.log(joinGameResponse, 'joinGameResponse');
              currentGame = joinGameResponse.data.currentGame;
              // Display Start & Refresh Buttons
              gameInterface.removeChild(gameButtonsDiv);
              gameInterface.appendChild(createStartBtn());
              gameInterface.appendChild(createRefreshBtn(currentGame));
              return axios.get(`/games/${ongoingGame.id}`);
            })
            .then((selectedGameResponse) => {
              console.log(selectedGameResponse, 'selectedGameResponse');
              const { currGameRoundDetails, currGameRoundUsernames } = selectedGameResponse.data;

              // Display deal & refresh buttons
              // Remove and reappend everytime a new game button is clicked
              // (to prevent disabled deal button specific to a game)
              const existingStartBtn = document.querySelector('#startBtn');
              const existingRefreshBtn = document.querySelector('#refreshBtn');

              if (existingStartBtn) {
                gameInterface.removeChild(existingStartBtn);
              }
              if (existingRefreshBtn) {
                gameInterface.removeChild(existingRefreshBtn);
              }
              gameInterface.appendChild(createStartBtn());
              gameInterface.appendChild(createRefreshBtn());
              const headerDiv = document.querySelector('.headerDiv');
              currGameRoundUsernames.forEach((username) => {
                headerDiv.innerText += `${username} has joined the game \n`;
              });
            })
            .catch((error) => { console.log(error); });
        });
      });
    }
  })
  .catch((error) => { console.log(error); });
