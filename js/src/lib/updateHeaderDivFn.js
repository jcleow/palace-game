// Update in header div which players have joined
const updateGameRoomNumber = (gameId) => {
  const headLineElement = document.querySelector('.header-text');
  headLineElement.innerText = `Game Room: ${gameId}`;
};

const updateUsersJoinedDiv = (currGameRoundUsernames) => {
  const headerDiv = document.querySelector('.header-div');
  headerDiv.innerHTML = '';
  currGameRoundUsernames.forEach((username) => {
    headerDiv.innerText += `${username} has joined the game \n`;
  });

  // Enable Start Game button when more than 1 user has joined
  const startGameBtn = document.querySelector('#start-btn');
  if (startGameBtn.disabled && currGameRoundUsernames.length > 1) {
    startGameBtn.disabled = false;
  }
};

const updateSetGameInstructions = () => {
  const headerDiv = document.querySelector('.header-div');
  headerDiv.innerText = 'Please choose 3 cards to face up on the table';
};

const outputSetGameErrorMsgNotEnoughCards = () => {
  const headerDiv = document.querySelector('.header-div');
  headerDiv.innerText = 'You did not choose 3 cards. Please try again';
};

const outputSetGameErrorMsgTooManyCards = () => {
  const headerDiv = document.querySelector('.header-div');
  headerDiv.innerText = 'You cannot choose more than 3 cards. Please try again';
};

const updateWaitingForPlayerMsg = () => {
  const headerDiv = document.querySelector('.header-div');
  headerDiv.innerText = 'You have selected your 3 face up cards. Waiting for other player(s)';
};

const loadSpinningAnimation = () => {
  const cardPicsContainer = document.querySelector('#card-pics-container');
  cardPicsContainer.innerHTML = '<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';
};

const removeSpinningAnimation = () => {
  const cardPicsContainer = document.querySelector('#card-pics-container');
  cardPicsContainer.innerHTML = '';
};
// Update in header which player's turn it is with player's username
const updatePlayerActionDiv = (currPlayer) => {
  const headLineElement = document.querySelector('.header-div');
  headLineElement.innerText = `It's ${currPlayer.username}'s turn`;
};

const updateGameOverDiv = (winner) => {
  const headerDiv = document.querySelector('.header-div');
  headerDiv.innerText = `${winner.username} is the winner!`;
};

const outputSetUpGameText = () => {
  const headLineElement = document.querySelector('.header-text');
  headLineElement.innerHTML = 'Setting Up the Game...';
};

const removeSetUpGameMsg = () => {
  const headLineElement = document.querySelector('.header-text');
  headLineElement.innerHTML = '';
};

export {
  updateGameRoomNumber,
  updateUsersJoinedDiv, updateSetGameInstructions,
  outputSetGameErrorMsgNotEnoughCards,
  outputSetGameErrorMsgTooManyCards,
  updateWaitingForPlayerMsg,
  updatePlayerActionDiv, updateGameOverDiv,
  loadSpinningAnimation, removeSpinningAnimation,
  outputSetUpGameText, removeSetUpGameMsg,
};
