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

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
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
  // render the main page
  const displayMainPage = (request, response) => {
    response.render('games/index');
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
      // set gamestate to start
      game.gameState = 'start';
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
  const start = async (req, res) => {
    // get the game by the ID passed in the request
    try {
      const game = await db.Game.findByPk(req.params.id);

      // change game status to ongoing;
      game.gameState = 'ongoing';
      await game.save();

      // Get all the user ids
      const playerUserIdArray = await db.GamesUser.findAll({
        where: {
          GameId: game.id,
        },
      });
      console.log(playerUserIdArray, 'playerUserIdArray');
      // Randomly assign playerNum to each UserId in the game
      const randomPlayerNumArray = [];
      while (randomPlayerNumArray.length < playerUserIdArray.length) {
        const generatedNum = Math.floor(Math.random() * playerUserIdArray.length) + 1;
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
      // Update each User's playerNum
      playerUserIdArray.forEach(async (playerUserId, index) => {
        await db.GamesUser.update(
          { playerNum: randomPlayerNumArray[index] },
          {
            where:
            {
              UserId: playerUserId.UserId,
              GameId: game.id,
            },
          },
        );
      });

      // Draw 3 face down cards into each of the player's faceDown col
      const playerFaceDownCards = [[], []];
      playerFaceDownCards.forEach(async (faceDownHand, index) => {
        for (let i = 0; i < 3; i += 1) {
          faceDownHand.push(game.drawPile.deck.pop());
        }
        playerUserIdArray[index].faceDownCards = JSON.stringify(faceDownHand);
        playerUserIdArray[index].changed('faceDownCards', true);
        await playerUserIdArray[index].save();
      });

      // Draw 6 cards into each of the player's currentHands
      const playerHands = [[], []];
      playerHands.forEach(async (hand, index) => {
        for (let i = 0; i < 6; i += 1) {
          hand.push(game.drawPile.deck.pop());
        }
        playerUserIdArray[index].cardsInHand = JSON.stringify(hand);
        playerUserIdArray[index].changed('cardsInHand', true);
        await playerUserIdArray[index].save();
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

  // deal two new cards from the deck.
  const deal = async (request, response) => {
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);
      // make changes to the object

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        gameStatus: game.status,
        playerHands,
      });
    } catch (error) {
      response.status(500).send(error);
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
    if (currGame.gameState === 'start') {
    // Retrieve usernames of each gameround entry
      const currGameUserGameRoundsPromises = currGameRoundDetails.map((gameRound) => gameRound.getUser());
      const currGameUserGameRoundResults = await Promise.all(currGameUserGameRoundsPromises);
      const currGameRoundUsernames = currGameUserGameRoundResults.map((result) => result.username);
      res.send({ currGameRoundDetails, currGameRoundUsernames });
    } else if (currGame.gameState === 'ongoing') {
      res.redirect(`/games/${req.params.gameId}/player/${req.loggedInUserId}`);
    }
  };

  // Index all on-going games
  const index = async (req, res) => {
    const { loggedInUserId } = req;
    if (req.middlewareLoggedIn === true) {
      const allOngoingGamesArray = await db.Game.findAll({
        where: {
          gameState: 'start',
        },
      });
      if (allOngoingGamesArray) {
        res.send({ allOngoingGamesArray, loggedInUserId });
        return;
      }
    }
    res.send('no ongoing games/must be loggedin');
  };

  // Get the existing score of P1 and P2
  const score = async (req, res) => {
    const player1Score = await db.GamesUser.findOne({
      where: {
        GameId: req.params.id,
        player_num: 1,
      },
    });

    const player2Score = await db.GamesUser.findOne({
      where: {
        GameId: req.params.id,
        player_num: 2,
      },
    });
    console.log(player2Score, 'player2Score');

    res.send({ player1Score, player2Score });
  };

  const displayHand = async (req, res) => {
    const playerHand = await db.GamesUser.findOne({
      where: {
        GameId: req.params.gameId,
        UserId: req.params.playerId,
      },
    });
    const currGame = await playerHand.get();

    res.send({ playerHand, currGame });
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
    playerHand.faceUpCards = JSON.stringify(selectedCardsArray);
    playerHand.changed('faceUpCards', true);
    await playerHand.save();
    res.send('Update operation complete');
  };

  // Update draw and discard pile
  const updatePile = () => {

  };

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
    console.log(currentGame, 'currentGame-23');

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

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    displayMainPage,
    deal,
    create,
    index,
    show,
    start,
    displayHand,
    updateHand,
    updatePile,
    score,
    join,
  };
}