import sequelizePkg from 'sequelize';

const { Op } = sequelizePkg;
/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Card Deck Stuff
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

// get a random index from an array given it's size
const getRandomIndex = function (size) {
  return Math.floor(Math.random() * size);
};

// cards is an array of card objects
const shuffleCards = function (cards) {
  let currentIndex = 0;

  // loop over the entire cards array
  while (currentIndex < cards.length) {
    // select a random position from the deck
    const randomIndex = getRandomIndex(cards.length);

    // get the current card in the loop
    const currentItem = cards[currentIndex];

    // get the random card
    const randomItem = cards[randomIndex];

    // swap the current card and the random card
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }

  // give back the shuffled deck
  return cards;
};

const makeDeck = function () {
  // create the empty deck at the beginning
  const deck = [];

  const suits = ['heart', 'diamond', 'club', 'spade'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    // make a variable of the current suit
    const currentSuit = suits[suitIndex];

    // loop to create all cards in this suit
    // rank 1-13
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;
      let assignedRank = rankCounter;
      // 1, 11, 12 ,13
      if (cardName === 1) {
        cardName = 'ace';
      } else if (cardName === 11) {
        cardName = 'jack';
      } else if (cardName === 12) {
        cardName = 'queen';
      } else if (cardName === 13) {
        cardName = 'king';
      }

      // Since Ace is the largest value card, we reassign Ace.rank to 14
      if (rankCounter === 1) {
        assignedRank = 14;
      }

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: assignedRank,
      };

      // add the card to the deck
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }

  return deck;
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Controller Stuff
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

export default function games(db) {
// **************** Helper Functions for routers ****************
// To get the discarded card pile as an object
  const getDiscardedPile = (currGame) => {
    const discardPileJSON = currGame.discardPile;
    const discardedPile = JSON.parse(discardPileJSON);
    return discardedPile;
  };

  // create a new game. Insert a new row in the DB.
  const create = async (req, res) => {
    // deal out a new shuffled deck for this game.
    const deck = shuffleCards(makeDeck());

    const newGame = {
      drawPile: {
        deck,
      },
    };
    try {
      // run the DB INSERT query
      const game = await db.Game.create(newGame);
      const newGameRound = {
        GameId: game.id,
        UserId: Number(req.cookies.loggedInUserId),
      };
      // set gamestate to 'waiting' for players
      game.gameState = 'waiting';
      await game.save();

      await db.GamesUser.create(newGameRound);

      const currentPlayer = await db.User.findByPk(req.loggedInUserId);
      console.log(currentPlayer, 'currentPlayer');

      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      res.send({
        id: game.id,
        currentPlayerName: currentPlayer.username,
        drawPile: game.drawPile,
        gameState: game.gameState,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  };

  // Officially begins the game and stops new players from enter
  // Deals 6 cards to each player
  const setGame = async (req, res) => {
    // get the game by the ID passed in the request
    try {
      const game = await db.Game.findByPk(req.params.id);

      // change game status to setGame;
      game.gameState = 'setGame';
      await game.save();

      // Get all the user ids
      const currUsersGameRoundArray = await db.GamesUser.findAll({
        where: {
          GameId: game.id,
        },
      });

      // Randomly assign playerNum to each UserId in the game
      // We store these values in an array first
      const randomPlayerNumArray = [];
      while (randomPlayerNumArray.length < currUsersGameRoundArray.length) {
        const generatedNum = Math.floor(Math.random() * currUsersGameRoundArray.length) + 1;
        let isGeneratedNumUnique = true;
        randomPlayerNumArray.forEach((randPlayerNum) => {
          if (randPlayerNum === generatedNum) {
            isGeneratedNumUnique = false;
          }
        });
        if (isGeneratedNumUnique) {
          randomPlayerNumArray.push(generatedNum);
        }
      }
      // Create a JSON that stores all the player sequences for the game
      const playerSequence = [];

      //
      randomPlayerNumArray.forEach(async (randNum, index) => {
        const playerTurn = index + 1;
        const playerTurnAndIdObject = {};
        playerTurnAndIdObject[playerTurn] = currUsersGameRoundArray[index].UserId;
        playerSequence.push(playerTurnAndIdObject);
        currUsersGameRoundArray[index].playerNum = randNum;
        await currUsersGameRoundArray[index].save();
      });

      // Update playerSequence
      (async () => {
        game.playerSequence = JSON.stringify(playerSequence);
        game.changed('playerSequence', true);
        await game.save();
      })();

      // Draw 3 face down cards into each of the player's faceDown col
      const playerFaceDownCards = [[], []];
      playerFaceDownCards.forEach(async (faceDownHand, index) => {
        for (let i = 0; i < 3; i += 1) {
          faceDownHand.push(game.drawPile.deck.pop());
        }
        currUsersGameRoundArray[index].faceDownCards = JSON.stringify(faceDownHand);
        currUsersGameRoundArray[index].changed('faceDownCards', true);

        currUsersGameRoundArray[index].drawPile = JSON.stringify(game.drawPile.deck);
        currUsersGameRoundArray[index].changed('drawPile', true);
        await currUsersGameRoundArray[index].save();
      });

      // Draw 6 cards into each of the player's currentHands
      const playerHands = [[], []];
      playerHands.forEach(async (hand, index) => {
        for (let i = 0; i < 6; i += 1) {
          hand.push(game.drawPile.deck.pop());
        }
        currUsersGameRoundArray[index].cardsInHand = JSON.stringify(hand);
        currUsersGameRoundArray[index].changed('cardsInHand', true);
        await currUsersGameRoundArray[index].save();
      });

      // Update the state of the drawPile after distributing the cards
      game.drawPile = JSON.stringify(game.drawPile.deck);
      game.changed('drawPile', true);
      await game.save();

      // Send the necessary AJAX response
      res.send({
        id: game.id,
        loggedInUserId: req.cookies.loggedInUserId,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // For either user to refresh the game... show the faceup cards (and the discard pile)
  const show = async (req, res) => {
    // First, check the state of the game...
    const currGame = await db.Game.findByPk(req.params.gameId);

    const currGameRoundDetails = await db.GamesUser.findAll({
      where: {
        GameId: req.params.gameId,
      },
    }, {
      attributes: ['faceUpCards'],
    });
    if (currGame.gameState === 'waiting') {
    // Retrieve usernames of each gameround entry
      const currGameUserGameRoundsPromises = currGameRoundDetails.map((gameRound) => gameRound.getUser());
      const currGameUserGameRoundResults = await Promise.all(currGameUserGameRoundsPromises);
      const currGameRoundUsernames = currGameUserGameRoundResults.map((result) => result.username);
      res.send({ currGameRoundDetails, currGameRoundUsernames, currGame });
    } else if (currGame.gameState === 'setGame') {
      res.redirect(`/games/${req.params.gameId}/players/${req.loggedInUserId}`);
    } else if (currGame.gameState === 'begin') {
      // Find player's userid where playerNum is 1...
      const currPlayer = await db.User.findOne({
        include: {
          model: db.GamesUser,
          where: {
            playerNum: 1,
            GameId: currGame.id,
          },
        },
      });

      // Add playerOne's Id into target table (Games)
      await currPlayer.addCurrentPlayerTurn(currGame);
      res.send({ currGameRoundDetails, currGame, currPlayer });
    }
  };

  // Index all on-going games
  const index = async (req, res) => {
    const { loggedInUserId } = req;
    if (req.middlewareLoggedIn === true) {
      const allOngoingGamesArray = await db.Game.findAll({
        where: {
          gameState: 'waiting',
        },
      });
      if (allOngoingGamesArray) {
        res.send({ allOngoingGamesArray, loggedInUserId });
        return;
      }
    }
    res.send('no ongoing games/must be loggedin');
  };

  const displayHand = async (req, res) => {
    const playerHand = await db.GamesUser.findOne({
      where: {
        GameId: req.params.gameId,
        UserId: req.params.playerId,
      },
    });
    const currGame = await playerHand.getGame();
    const currGameState = currGame.gameState;
    res.send({ playerHand, currGame, currGameState });
  };

  // Perform update on user's facedown/faceup/currentHand/
  const updateHand = async (req, res) => {
    const selectedCardsArray = req.body;
    const playerHand = await db.GamesUser.findOne({
      where: {
        GameId: req.params.gameId,
        UserId: req.params.playerId,
      },
    });

    // Update the player's cardsInHand
    const existingPlayerCardsInHand = JSON.parse(playerHand.cardsInHand);

    // For each of selectedCards, remove the same card in player's hand
    selectedCardsArray.forEach((selectedCard) => {
      // If the selected card is present inside the player's hand...
      const indexOfFaceUpCard = existingPlayerCardsInHand.findIndex((card) => JSON.stringify(card) === JSON.stringify(selectedCard));
      // We remove it
      if (indexOfFaceUpCard > -1) {
        existingPlayerCardsInHand.splice(indexOfFaceUpCard, 1);
        console.log(existingPlayerCardsInHand, 'spliced hand');
      }
    });
    playerHand.cardsInHand = JSON.stringify(existingPlayerCardsInHand);
    playerHand.changed('cardsInHand', true);
    await playerHand.save();

    // Update the player's faceUpCards
    playerHand.faceUpCards = JSON.stringify(selectedCardsArray);
    playerHand.changed('faceUpCards', true);
    await playerHand.save();

    // Perform check if all player's faceUpCards column have been completed
    const allPlayerHandsArray = await db.GamesUser.findAll({
      where: {
        GameId: req.params.gameId,
        faceUpCards: null,

      },
    });
    // If so change gameState to 'start'
    if (allPlayerHandsArray.length === 0) {
      const currGame = await playerHand.getGame();
      currGame.gameState = 'begin';
      await currGame.save();

      // Draw a random card from the drawPile
      const drawPile = JSON.parse(currGame.drawPile);

      // Push the top card from drawPile into the discardPile to set the game
      const discardPile = [];
      discardPile.push(drawPile.pop());

      currGame.discardPile = JSON.stringify(discardPile);
      currGame.changed('discardPile', true);

      currGame.drawPile = JSON.stringify(drawPile);
      currGame.changed('drawPile', true);

      await currGame.save();

      res.send({ setGame: 'completed', message: 'Set Game Completed' });
      return;
    }
    res.send({ setGame: 'in-process', message: 'Update operation complete' });
  };

  // Inserts a new entry into GamesUser table when a new user joins
  const join = async (req, res) => {
    // First, find if the user has joined this room before
    const currentPlayerEntry = await db.GamesUser.findOne({
      where: {
        GameId: req.params.gameId,
        UserId: req.params.playerId,
      },
    });

    // Retrieve the currentGame instance to be sent back to browser
    // cannot use associative method because upon the first joining, the non-creator
    // player has not been created yet

    const currentGame = await db.Game.findByPk(req.params.gameId);

    if (!currentPlayerEntry) {
    // If user has never joined the game before create a new entry for player
      await db.GamesUser.create(
        {
          GameId: req.params.gameId,
          UserId: req.params.playerId,
        },
      );
      res.send({ currentGame, message: 'new user has joined the game' });
      return;
    }
    res.send({ currentGame, message: 'user has joined the game before' });
  };

  const play = async (req, res) => {
    const currGame = await db.Game.findByPk(req.params.gameId);
    // This refers to the positions of the cards
    // that were selected for play, stored in an array

    const positionOfCardsPlayedArray = req.body;

    const currUserGameRound = await currGame.getGamesUsers({
      where: {
        UserId: req.params.playerId,
      },
    });

    // Get Discarded Pile
    let discardPile = getDiscardedPile(currGame);
    const topDiscardedCard = discardPile[discardPile.length - 1];

    // Get the Draw Pile
    const drawPile = JSON.parse(currGame.drawPile);

    // Get the cardsInHand
    let cardsInHand = JSON.parse(currUserGameRound[0].cardsInHand);

    // If move is illegal, retrieve all cards from discardPile into Hand
    if (positionOfCardsPlayedArray.length === 0) {
      cardsInHand = [...cardsInHand, ...discardPile];
      // empty discard pile and no need to draw new cards
      discardPile = null;
    }
    // Else if card(s) are submitted
    else {
      // Perform check to see if the move is legal
    // Test-1: First check how many cards are selected
      if (positionOfCardsPlayedArray.length > 1) {
      // Check if all the cards have the same rank
        let areCardsTheSame = true;

        // positionOfCardPlayed is zero indexed
        positionOfCardsPlayedArray.forEach((positionOfCardPlayed, indexOfCardPosition) => {
          // Check if current card(indexed) is the same as the previous selected card
          // in the position array
          // E.g index 1 and 2 of the cardInHand are selected, we compare
          // card at index 2 against card against index 1
          if (indexOfCardPosition + 1 <= positionOfCardsPlayedArray.length - 1) {
            console.log('card1', cardsInHand[positionOfCardsPlayedArray[indexOfCardPosition]]);
            console.log('card2', cardsInHand[positionOfCardsPlayedArray[indexOfCardPosition + 1]]);
            if ((cardsInHand[positionOfCardsPlayedArray[indexOfCardPosition]].rank)
              !== (cardsInHand[positionOfCardsPlayedArray[indexOfCardPosition + 1]].rank)
            ) {
              areCardsTheSame = false;
            }
          }
        });
        if (!areCardsTheSame) {
          console.log('cards are not the same');
          return;
        }
      }
      // Test-2: Check if (first) card is greater than that of discardPile's top card
      if (cardsInHand[positionOfCardsPlayedArray[0]].rank < topDiscardedCard.rank) {
        console.log('selected card(s) is not larger discarded card');
        return;
      }

      // If it passes test 1 and 2, means the selected cards can be pushed into the discardPile
      console.log(discardPile, 'oldvalue Of discard pile');
      positionOfCardsPlayedArray.forEach((position) => {
        discardPile.push(cardsInHand[position]);
      });

      console.log(discardPile, 'newValue of discardPile');
      console.log(cardsInHand, 'cardsInHand');
      console.log(positionOfCardsPlayedArray, 'position of cardsToBePlayed');
      // Remove the played cards from the hand
      positionOfCardsPlayedArray.forEach((positionOfCardPlayed) => {
        cardsInHand.splice(positionOfCardPlayed, 1);
      });

      // Draw cards until there are 3 cards in hand
      const numOfCardsInHand = cardsInHand.length;
      if (numOfCardsInHand < 3) {
        for (let i = 0; i < (3 - numOfCardsInHand); i += 1) {
          cardsInHand.push(drawPile.pop());
        }
      }
    }
    // Update the state in selectedGameRound and currGame card JSONs in DB
    currGame.discardPile = JSON.stringify(discardPile);
    currGame.changed('discardPile', true);
    // await currGame.save();

    currGame.drawPile = JSON.stringify(drawPile);
    currGame.changed('drawPile', true);
    await currGame.save();

    currUserGameRound[0].cardsInHand = JSON.stringify(cardsInHand);
    currUserGameRound[0].changed('cardsInHand', true);

    await currUserGameRound[0].save();

    // *********** Player Turn has Ended - Switch Player Turn ************//

    // Get Current Player ID
    const currPlayerId = currGame.CurrentPlayerId;

    // Get All player sequences
    const playerSequence = JSON.parse(currGame.playerSequence);

    // Get Current Turn Num
    const currPlayerNumArray = playerSequence.filter((record) => Object.values(record).includes(currPlayerId));

    // // Convert to number...
    const currPlayerNum = Number(Object.keys(currPlayerNumArray[0])[0]);

    // Get Next Turn Num
    let nextPlayerNum;
    let nextPlayerId;
    // if exceed num. of players means player 1 goes again
    if (currPlayerNum + 1 > playerSequence.length) {
      nextPlayerNum = '1';
      const nextPlayerIdObj = playerSequence.find((record) => record.hasOwnProperty(nextPlayerNum));
      const nextPlayerIdArray = Object.values(nextPlayerIdObj);
      nextPlayerId = nextPlayerIdArray[0];
    } else {
      nextPlayerNum = (currPlayerNum + 1).toString();
      const nextPlayerIdObj = playerSequence.find((record) => record.hasOwnProperty(nextPlayerNum));
      const nextPlayerIdArray = Object.values(nextPlayerIdObj);
      nextPlayerId = nextPlayerIdArray[0];
    }

    // Change Player Turn
    currGame.CurrentPlayerId = nextPlayerId;
    await currGame.save();

    // Get next player's username
    const currPlayer = db.User.findByPk(nextPlayerId);

    res.send({ currGame, currPlayer, message: 'update completed' });
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    create,
    index,
    show,
    setGame,
    displayHand,
    updateHand,
    join,
    play,
  };
}
