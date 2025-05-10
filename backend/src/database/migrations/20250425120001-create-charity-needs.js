'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('charity_needs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      organization_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      target_group: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      items_needed: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      raised_amount: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      funding_goal: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
      },
      raised_percent: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      },
      blockchain_link: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      project_link: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      fund_avatar: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      is_interested: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Thêm các chỉ mục
    await queryInterface.addIndex('charity_needs', ['title'], { name: 'idx_charity_needs_title' });
    await queryInterface.addIndex('charity_needs', ['organization_name'], { name: 'idx_charity_needs_org' });
    await queryInterface.addIndex('charity_needs', ['created_by'], { name: 'idx_charity_needs_creator' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('charity_needs');
  },
};