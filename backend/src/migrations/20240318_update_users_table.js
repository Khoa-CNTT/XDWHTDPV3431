'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Drop foreign key constraints first
      await queryInterface.sequelize.query(`
        SET FOREIGN_KEY_CHECKS = 0;
      `);

      // Drop the old table
      await queryInterface.dropTable('users', {
        force: true,
        cascade: true
      });
      
      // Create new table
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        role: {
          type: Sequelize.ENUM('user', 'admin', 'charity'),
          defaultValue: 'user',
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      });

      // Re-enable foreign key checks
      await queryInterface.sequelize.query(`
        SET FOREIGN_KEY_CHECKS = 1;
      `);

      return Promise.resolve();
    } catch (error) {
      console.error('Migration Error:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Drop foreign key constraints first
      await queryInterface.sequelize.query(`
        SET FOREIGN_KEY_CHECKS = 0;
      `);

      // Drop the new table
      await queryInterface.dropTable('users', {
        force: true,
        cascade: true
      });
      
      // Create old table structure
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        role: {
          type: Sequelize.ENUM('user', 'admin', 'charity'),
          defaultValue: 'user',
        }
      });

      // Re-enable foreign key checks
      await queryInterface.sequelize.query(`
        SET FOREIGN_KEY_CHECKS = 1;
      `);

      return Promise.resolve();
    } catch (error) {
      console.error('Migration Error:', error);
      return Promise.reject(error);
    }
  }
}; 