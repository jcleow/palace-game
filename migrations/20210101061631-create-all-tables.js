module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      sessionLoggedIn: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.createTable('Games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      discardPile: {
        // allow us to keep non-relational data for the cards
        type: Sequelize.JSON,
      },
      drawPile: {
        type: Sequelize.JSON,
      },
      playerSequence: {
        type: Sequelize.JSON,
      },
      WinnerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      CurrentPlayerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      gameState: {
        type: Sequelize.ENUM('waiting', 'setGame', 'ongoing', 'gameOver', 'abandoned'),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.createTable('GamesUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      GameId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Games',
          key: 'id',
        },
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      score: {
        type: Sequelize.INTEGER,
      },
      playerNum: {
        type: Sequelize.INTEGER,
      },
      faceUpCards: {
        type: Sequelize.JSON,
      },
      faceDownCards: {
        type: Sequelize.JSON,
      },
      cardsInHand: {
        type: Sequelize.JSON,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GamesUsers');
    await queryInterface.dropTable('Games');
    await queryInterface.dropTable('Users');
  },
};
