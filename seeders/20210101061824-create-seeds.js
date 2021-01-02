const jsSHA = require('jssha');

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj.update('password');
    const hashedPassword = shaObj.getHash('HEX');
    const usersList = [
      {
        username: 'user1',
        password: hashedPassword,
        sessionLoggedIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        username: 'user2',
        password: hashedPassword,
        sessionLoggedIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await queryInterface.bulkInsert('Users', usersList);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
