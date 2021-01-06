// Function that generates the path to each individual card
const getCardPicUrl = (card) => {
  let imgSrc = '';

  // get directory for each of the cards
  imgSrc = `/cardPictures/${card.suit.toUpperCase()}-${card.rank}`;

  // If Ace is drawn, reassign Ace's rank to 1 for rendering picture purposes
  if (card.rank === 14) {
    imgSrc = `/cardPictures/${card.suit.toUpperCase()}-${1}`;
  }
  if (card.rank >= 11 && card.rank <= 13) {
    imgSrc += `-${card.name.toUpperCase()}`;
  }
  imgSrc += '.png';
  // Returns the link to the image
  return imgSrc;
};

// Helper that renders face up cards
const renderFaceUpCards = (selectedPlayerHandArray, selectedDivToAppendTo) => {
  // Clear everything in the existing div and re-add in new cards
  selectedDivToAppendTo.innerHTML = '';
  JSON.parse(selectedPlayerHandArray[0].faceUpCards).forEach((faceUpCard) => {
    const cardImg = document.createElement('img');
    cardImg.src = getCardPicUrl(faceUpCard);
    cardImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(cardImg);
  });
};
const renderFaceDownCards = (selectedPlayerHandArray, selectedDivToAppendTo) => {
  // Clear everything in the existing div and re-add in new cards
  selectedDivToAppendTo.innerHTML = '';
  JSON.parse(selectedPlayerHandArray[0].faceDownCards).forEach((faceUpCard) => {
    const cardImg = document.createElement('img');
    cardImg.src = '/cardPictures/COVER-CARD.png';
    cardImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(cardImg);
  });
};

const renderMiscCards = (drawPileJSON, discardPileJSON, selectedDivToAppendTo) => {
  // Clear everything in the existing div and re-add in new cards
  selectedDivToAppendTo.innerHTML = '';
  // Rendering draw pile picture (if it still exists)
  const drawPileArray = JSON.parse(drawPileJSON);
  if (drawPileArray[0] !== null) {
    const drawPileImg = document.createElement('img');
    drawPileImg.src = '/cardPictures/COVER-CARD.png';
    drawPileImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(drawPileImg);
  }

  // Rendering discard pile picture if it is more than 1
  const discardPileArray = JSON.parse(discardPileJSON);
  console.log(discardPileArray, 'discardPileArray');
  if (discardPileArray.length > 0) {
    const discardedCardImg = document.createElement('img');
    discardedCardImg.src = getCardPicUrl(discardPileArray[discardPileArray.length - 1]);
    discardedCardImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(discardedCardImg);
  }
};

const renderOpponentHand = (selectedPlayerHandArray, selectedDivToAppendTo) => {
  // Clear everything in the existing div and re-add in new cards
  selectedDivToAppendTo.innerHTML = '';
  JSON.parse(selectedPlayerHandArray[0].cardsInHand).forEach((faceUpCard) => {
    const cardImg = document.createElement('img');
    cardImg.src = '/cardPictures/COVER-CARD.png';
    cardImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(cardImg);
  });
};

export {
  renderFaceDownCards, renderFaceUpCards, renderMiscCards, renderOpponentHand,
};
