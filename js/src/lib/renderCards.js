import getCardPicUrl from './getCardPicUrlFn.js';

/** Function that keeps track of all the selected cards in play
 * @param {Array} selectedCardsPositionArray
 * An array that the parent function holds to keep
 * track of the number of selected cards through their indices
 *
 * @param {DOMObject} cardImg
 *
 * @param {Object} card
 *
 * @param {Integer} limit
 * Max number of cards that is to be selected at
 * anyone time
 *
 */
const selectCardsToPlay = (selectedCardsPositionArray, selectedCardsArray, cardIndex,
  cardImg, card, topDiscardedCard) => {
  // Need to remove flashing red border if say a user decides to pick another higher value card
  // instead of the first higher value card previously chosen
  if (cardImg.classList.contains('invalid-selection')) {
    cardImg.classList.remove('invalid-selection');
  }
  // If selecting a previously unselected card...
  if (!cardImg.style.border) {
    // Check if current selected card has a higher or same rank as discardPileCard
    // Or whether the current selected card is wildCard 2 or 10
    if (!topDiscardedCard || card.rank >= topDiscardedCard.rank
       || card.rank === 2 || card.rank === 10) {
      cardImg.style.border = 'thick solid #0000FF';
      // Next, check if another card has already been selected...
      if (selectedCardsPositionArray.length > 0) {
        // Next check if this card selected has the same rank as the first
        // (otherwise all other) selected cards
        // If the 2 cards have the same rank means they are the same card...
        if (selectedCardsArray[0].rank === card.rank) {
          selectedCardsArray.push(card);
          selectedCardsPositionArray.push(cardIndex);
          // Otherwise this is an invalid selection
        } else {
          cardImg.style.border = '';
          cardImg.classList.add('invalid-selection');
        }
        // Else there is no cards currently selected and it is a valid selection
      } else {
        selectedCardsArray.push(card);
        selectedCardsPositionArray.push(cardIndex);
      }
      // If current card selected has a lower rank than discardPileCard
    } else {
      cardImg.classList.add('invalid-selection');
    }
  // Otherwise selecting a previously selected card
  } else {
    cardImg.style.border = '';
    // Remove selected card from its position
    selectedCardsArray.splice(selectedCardsArray.indexOf(card), 1);
    selectedCardsPositionArray.splice(selectedCardsPositionArray.indexOf(cardIndex), 1);
  }
  console.log(selectedCardsArray, 'selectedCards');
  console.log(selectedCardsPositionArray, 'selectedPositions');
  return selectedCardsPositionArray;
};

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

const renderCardsInHand = (selectedCardsPositionArray, selectedPlayerHandArray,
  selectedDivToAppendTo, selectedCardsArray, topDiscardedCard) => {
  // Clear everything in the existing div and re-add in new cards
  selectedDivToAppendTo.innerHTML = '';
  JSON.parse(selectedPlayerHandArray[0].cardsInHand).forEach((faceUpCard, index) => {
    const cardImg = document.createElement('img');
    cardImg.src = getCardPicUrl(faceUpCard);
    cardImg.classList.add('card-pic');
    selectedDivToAppendTo.appendChild(cardImg);
    const cardIndex = index;
    cardImg.addEventListener('click', () => selectCardsToPlay(selectedCardsPositionArray, selectedCardsArray, cardIndex, cardImg, faceUpCard, topDiscardedCard));
  });
};

export {
  renderFaceDownCards, renderFaceUpCards, renderMiscCards, renderOpponentHand, renderCardsInHand,
};
