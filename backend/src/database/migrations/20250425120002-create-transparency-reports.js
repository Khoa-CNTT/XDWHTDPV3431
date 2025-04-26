'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Drop table if exists
      await queryInterface.dropTable('transparency_reports', { force: true });

      // Create table
      await queryInterface.createTable('transparency_reports', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        }
      });

      // Add index
      await queryInterface.addIndex('transparency_reports', ['title'], {
        name: 'idx_transparency_reports_title',
        unique: false
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Migration Error:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Drop table (this will also drop all associated indexes)
      await queryInterface.dropTable('transparency_reports', { force: true });
      return Promise.resolve();
    } catch (error) {
      console.error('Migration Error:', error);
      return Promise.reject(error);
    }
  },
};