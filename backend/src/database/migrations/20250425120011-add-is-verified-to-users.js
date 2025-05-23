'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'verification_token', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'is_verified'
    });

    await queryInterface.addColumn('users', 'verification_token_expires', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'verification_token'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'verification_token');
    await queryInterface.removeColumn('users', 'verification_token_expires');
  }
}; 