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
export { createNewGameBtn, createPlayBtn };
