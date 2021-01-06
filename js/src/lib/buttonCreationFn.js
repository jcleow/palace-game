const createNewGameBtn = (gameButtonsDiv, createGame) => {
  const newGameBtn = document.createElement('button');
  newGameBtn.addEventListener('click', createGame);
  newGameBtn.innerText = 'Create New Game';
  gameButtonsDiv.appendChild(newGameBtn);
};

// Create a play button to submit cards
const createPlayBtn = (playBtnContainer) => {
  const playBtn = document.createElement('button');
  playBtn.setAttribute('id', 'play-btn');
  playBtn.innerText = 'Play Selected Cards';
  playBtnContainer.append(playBtn);
  return playBtn;
};
export { createNewGameBtn, createPlayBtn };
