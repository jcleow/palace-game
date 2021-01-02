import { resolve } from 'path';
import db from './models/index.mjs';
import convertUserIdToHash from './helper.mjs';
// import your controllers here
import users from './controllers/users.mjs';
import games from './controllers/games.mjs';

export default function routes(app) {
  app.use(async (req, res, next) => {
    req.middlewareLoggedIn = false;

    if (req.cookies.loggedInUserId) {
      const hash = convertUserIdToHash(req.cookies.loggedInUserId);

      if (req.cookies.loggedInHash === hash) {
        req.middlewareLoggedIn = true;
      }

      const { loggedInUserId } = req.cookies;
      // Find this user in the database
      const chosenUser = await db.User.findOne({
        where: {
          id: loggedInUserId,
        },
      });
      if (!chosenUser) {
        res.status(503).send('sorry an error has occurred');
      }
      req.middlewareLoggedIn = true;
      next();
      return;
    }
    next();
  });
  // special JS page. Include the webpack index.html file
  app.get('/', (request, response) => {
    response.sendFile(resolve('js/dist', 'index.html'));
  });

  const GamesController = games(db);
  // show if there are any existing games
  app.get('/games', GamesController.index);
  // get selected game
  app.get('/games/:id', GamesController.show);
  // get selected game score
  app.get('/games/:id/score', GamesController.score);

  // get selected player's first 6 cards
  app.get('/games/:gameId/:playerId', GamesController.displayHand);

  // create a new game
  app.post('/games', GamesController.create);
  // Starts the game by deciding a random player to begin first followed by dealing 6 cards
  app.put('/games/:id/start', GamesController.start);
  // update a game with new cards
  app.put('/games/:id/deal', GamesController.deal);
  // // refresh page to get current status of game
  // app.get('/currentGameStatus/:id', GamesController.show);

  const UsersController = users(db);
  app.get('/user', UsersController.show);
  app.post('/user/new', UsersController.create);
  app.post('/user/login', UsersController.login);
  app.put('/user/logout', UsersController.logout);
  app.get('/isUserAuthenticated', UsersController.checkIfUserAuthenticated);

  // get a random user and create a new entry in GamesUser table
  app.post('/user/random', UsersController.random);
}
