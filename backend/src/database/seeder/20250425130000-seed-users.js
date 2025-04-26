'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      {
        username: 'admin_user',
        password: '$2a$10$examplehashedpassword123', // Mật khẩu đã mã hóa bằng bcrypt
        role: 'admin',
      },
      {
        username: 'charity_org',
        password: '$2a$10$examplehashedpassword456',
        role: 'charity',
      },
      {
        username: 'donor_user',
        password: '$2a$10$examplehashedpassword789',
        role: 'user',
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};