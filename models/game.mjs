export default function gameModel(sequelize, DataTypes) {
  return sequelize.define('Game', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    discardPile: {
      // allow us to keep non-relational data for the cards
      type: DataTypes.JSON,
    },
    drawPile: {
      type: DataTypes.JSON,
    },
    playerSequence: {
      type: DataTypes.JSON,
    },
    WinnerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    CurrentPlayerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    gameState: {
      type: DataTypes.ENUM('waiting', 'setGame', 'begin', 'ongoing', 'finished'),
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
