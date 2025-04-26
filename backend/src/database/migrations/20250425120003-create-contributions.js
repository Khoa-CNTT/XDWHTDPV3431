'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Drop table if exists
      await queryInterface.dropTable('contributions', { force: true });

      // Create table
      await queryInterface.createTable('contributions', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        need_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'charity_needs',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('pending', 'confirmed', 'rejected'),
          defaultValue: 'pending',
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

      // Add index for status
      await queryInterface.addIndex('contributions', ['status'], {
        name: 'idx_contributions_status',
        unique: false
      });

      // Add CHECK constraint for amount
      await queryInterface.sequelize.query(
        'ALTER TABLE contributions ADD CONSTRAINT check_amount_positive CHECK (amount > 0)'
      );

      return Promise.resolve();
    } catch (error) {
      console.error('Migration Error:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Drop table (this will also drop all associated indexes and constraints)
      await queryInterface.dropTable('contributions', { force: true });
      return Promise.resolve();
    } catch (error) {
      console.error('Migration Error:', error);
      return Promise.reject(error);
    }
  },
};