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

const displayExitGameBtn = () => {
  // Render the cross button to exit the game at the top left
  const customNavBar = document.querySelector('#custom-nav-bar');
  const exitGameBtn = document.querySelector('#exit-gameplay-btn');
  customNavBar.classList.remove('justify-content-end');
  customNavBar.classList.add('justify-content-between');
  exitGameBtn.style.display = 'block';
};

export { createNewGameBtn, createPlayBtn, displayExitGameBtn };
