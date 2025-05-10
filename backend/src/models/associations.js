const setupAssociations = (models) => {
  const { User, CharityNeed, Contribution, Feedback, TransparencyReport, Evaluation, AdminLog } = models;

  // User relationships
  User.hasMany(CharityNeed, { foreignKey: 'created_by', as: 'charity_needs' });
  User.hasMany(Contribution, { foreignKey: 'user_id', as: 'contributions' });
  User.hasMany(Feedback, { foreignKey: 'user_id', as: 'feedbacks' });
  User.hasMany(Evaluation, { foreignKey: 'evaluator_id', as: 'evaluations' });
  User.hasMany(AdminLog, { foreignKey: 'admin_id', as: 'admin_logs' });

  // CharityNeed relationships
  CharityNeed.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  CharityNeed.hasMany(Contribution, { foreignKey: 'need_id', as: 'contributions' });
  CharityNeed.hasMany(Evaluation, { foreignKey: 'need_id', as: 'evaluations' });

  // Contribution relationships
  Contribution.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Contribution.belongsTo(CharityNeed, { foreignKey: 'need_id', as: 'need' });

  // Feedback relationships
  Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Evaluation relationships
  Evaluation.belongsTo(User, { foreignKey: 'evaluator_id', as: 'evaluator' });
  Evaluation.belongsTo(CharityNeed, { foreignKey: 'need_id', as: 'need' });

  // AdminLog relationships
  AdminLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

  // TransparencyReport relationships (nếu cần)
  // TransparencyReport không có trường tham chiếu, nên không cần mối quan hệ
};

module.exports = setupAssociations;