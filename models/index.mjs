import { Sequelize } from 'sequelize';
import url from 'url';
import allConfig from '../config/config.js';

import gameModel from './game.mjs';
import userModel from './user.mjs';
import gamesUserModel from './gamesUser.mjs';

const env = process.env.NODE_ENV || 'development';

const config = allConfig[env];

const db = {};

let sequelize;

if (env === 'production') {
  // break apart the Heroku database url and rebuild the configs we need

  const { DATABASE_URL } = process.env;
  const dbUrl = url.parse(DATABASE_URL);
  const username = dbUrl.auth.substr(0, dbUrl.auth.indexOf(':'));
  const password = dbUrl.auth.substr(dbUrl.auth.indexOf(':') + 1, dbUrl.auth.length);
  const dbName = dbUrl.path.slice(1);

  const host = dbUrl.hostname;
  const { port } = dbUrl;

  config.host = host;
  config.port = port;

  sequelize = new Sequelize(dbName, username, password, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
// add your model definitions to db here
db.Game = gameModel(sequelize, Sequelize.DataTypes);
db.User = userModel(sequelize, Sequelize.DataTypes);
db.GamesUser = gamesUserModel(sequelize, Sequelize.DataTypes);

// M:N association between User table and Game table
db.Game.belongsToMany(db.User, { through: db.GamesUser });
db.User.belongsToMany(db.Game, { through: db.GamesUser });

// 1-M association between CartsItem table and associated tables
// to access GamesUser table from Game and User instances
db.Game.hasMany(db.GamesUser);
db.GamesUser.belongsTo(db.Game);
db.User.hasMany(db.GamesUser);
db.GamesUser.belongsTo(db.User);

// Creating another association between User and Game through alias of 'Wins'
db.User.hasMany(db.Game, { as: 'Wins', foreignKey: 'WinnerId' });
db.Game.belongsTo(db.User, { as: 'Winner', foreignKey: 'WinnerId' });
// Creating another association between User and Game through alias of 'CurrentPlayerTurn'
db.User.hasMany(db.Game, { as: 'CurrentPlayerTurns', foreignKey: 'CurrentPlayerId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
