const createNewGameBtn = (gameButtonsDiv, createGame) => {
  const newGameBtn = document.createElement('button');
  newGameBtn.addEventListener('click', createGame);
  newGameBtn.innerText = 'Create New Game';
  gameButtonsDiv.appendChild(newGameBtn);
};
export default createNewGameBtn;
