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

const updateGameOverDiv = (winner) => {
  const headerDiv = document.querySelector('.header-div');
  headerDiv.innerText = `${winner.username} is the winner!`;
};

export { updateUsersJoinedDiv, updatePlayerActionDiv, updateGameOverDiv };
