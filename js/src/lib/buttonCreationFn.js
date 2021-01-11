import axios from 'axios';

const createNewGameBtn = (gameButtonsDiv, createGame) => {
  const newGameBtn = document.createElement('button');
  newGameBtn.addEventListener('click', createGame);
  newGameBtn.innerText = 'Create New Game';
  newGameBtn.classList.add('btn');
  newGameBtn.classList.add('btn-light');
  newGameBtn.classList.add('new-game-btn');
  gameButtonsDiv.appendChild(newGameBtn);
};

// Create a play button to submit cards
const createPlayBtn = (playBtnContainer) => {
  const playBtn = document.createElement('button');
  playBtn.setAttribute('id', 'play-btn');
  playBtn.classList.add('btn');
  playBtn.classList.add('btn-light');
  playBtn.innerText = 'Play Selected Cards';
  playBtnContainer.append(playBtn);
  return playBtn;
};

const setGameStateToAbandoned = (gameId) => {
  console.log(`/games/${Number(gameId)}/abandoned`);
  axios.put(`/games/${Number(gameId)}/abandoned`)
    .then(() => {
      window.location = '/';
    })
    .catch((error) => { console.log(error); });
};

const displayExitGameBtn = (currGameId) => {
  console.log(currGameId, 'currGameId');
  // Render the cross button to exit the game at the top left
  const customNavBar = document.querySelector('#custom-nav-bar');
  const exitGameCrossBtn = document.querySelector('#exit-gameplay-btn');
  customNavBar.classList.remove('justify-content-end');
  customNavBar.classList.add('justify-content-between');
  exitGameCrossBtn.style.display = 'block';

  const confirmExitGameBtn = document.querySelector('.confirm-exit');
  confirmExitGameBtn.addEventListener('click', () => { setGameStateToAbandoned(currGameId); });
};

export { createNewGameBtn, createPlayBtn, displayExitGameBtn };
