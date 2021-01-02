export default function gamesUserModel(sequelize, DataTypes) {
  return sequelize.define('GamesUser', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    GameId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Games',
        key: 'id',
      },
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    score: {
      type: DataTypes.INTEGER,
    },
    playerNum: {
      type: DataTypes.INTEGER,
    },
    faceUpCards: {
      type: DataTypes.JSON,
    },
    faceDownCards: {
      type: DataTypes.JSON,
    },
    cardsInHand: {
      type: DataTypes.JSON,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  });
}
