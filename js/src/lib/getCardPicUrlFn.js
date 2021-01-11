// Function that generates the path to each individual card
const getCardPicUrl = (card) => {
  if (card === null) {
    return;
  }

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
export default getCardPicUrl;
