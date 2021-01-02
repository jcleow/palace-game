import { response } from 'express';
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
      if (cardName == 1) {
        cardName = 'ace';
      } else if (cardName == 11) {
        cardName = 'jack';
      } else if (cardName == 12) {
        cardName = 'queen';
      } else if (cardName == 13) {
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
  const create = async (request, response) => {
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
        UserId: Number(request.cookies.loggedInUserId),
      };
      // set gamestate to start
      game.gameState = 'start';
      await game.save();

      await db.GamesUser.create(newGameRound);

      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        drawPile: game.drawPile,
        gameState: game.gameState,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // Officially begins the game and stops new players from enter
  // Deals 6 cards to each player
  const start = async (request, response) => {
    // get the game by the ID passed in the request
    try {
      const game = await db.Game.findByPk(request.params.id);
      console.log(game, 'game');

      // change game status to ongoing;
      game.gameState = 'ongoing';
      await game.save();

      // Get all the user ids
      const playerUserIdArray = await db.GamesUser.findAll({
        where: {
          GameId: game.id,
        },
        attributes: ['id', 'UserId', 'cardsInHand'],
      });
      console.log(playerUserIdArray, 'playerUserId');
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
      console.log(randomPlayerNumArray, 'randomPlayerNumArray');
      // Update each User's playerNum
      playerUserIdArray.forEach(async (playerUserId, index) => {
        const rows = await db.GamesUser.update(
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

      // Draw 6 cards into each of the player's pile
      const playerHands = [[], []];
      playerHands.forEach(async (hand, index) => {
        for (let i = 0; i < 6; i += 1) {
          hand.push(game.drawPile.deck.pop());
        }
        playerUserIdArray[index].cardsInHand = JSON.stringify(hand);
        playerUserIdArray[index].changed('cardsInHand', true);
        playerUserIdArray[index].save();
      });
      response.send({
        id: game.id,
        loggedInUserId: request.cookies.loggedInUserId,
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

  // For either user to refresh the game
  const show = async (request, response) => {
    const currentGame = await db.Game.findByPk(request.params.id);
    if (currentGame.cards.playerHand) {
      const P1Card = currentGame.cards.playerHand[0];
      const P2Card = currentGame.cards.playerHand[1];
      let currRoundWinner;
      if (P1Card.rank > P2Card.rank) {
        currRoundWinner = 1;
      } else if (P2Card.rank > P1Card.rank) {
        currRoundWinner = 2;
      } else {
        currRoundWinner = 'none';
      }
      currentGame.setDataValue('currRoundWinner', currRoundWinner);
    }
    response.send(currentGame);
  };

  // Index all on-going games
  const index = async (req, res) => {
    if (req.middlewareLoggedIn === true) {
      const allOngoingGamesArray = await db.Game.findAll({
        where: {
          WinnerId: null,
        },
        include: {
          model: db.GamesUser,
          where: {
            UserId: req.cookies.loggedInUserId,
          },
        },
      });
      if (allOngoingGamesArray) {
        res.send(allOngoingGamesArray);
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
    console.log(playerHand.cardsInHand, 'playerHand');
    res.send(playerHand);
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
    score,
  };
}
