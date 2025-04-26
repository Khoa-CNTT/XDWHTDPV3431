'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('evaluations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      need_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'charity_needs',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      evaluator_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      comment: {
        type: Sequelize.TEXT,
      },
      score: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Thêm ràng buộc CHECK cho score
    await queryInterface.sequelize.query('ALTER TABLE evaluations ADD CONSTRAINT check_score_range CHECK (score BETWEEN 1 AND 10)');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('evaluations');
  },
};