const setupAssociations = (models) => {
  const { User, CharityNeed, Contribution, Feedback, TransparencyReport, Evaluation } = models;

  // User relationships
  User.hasMany(CharityNeed, { foreignKey: 'created_by', as: 'created_by_user' });
  User.hasMany(Contribution, { foreignKey: 'user_id', as: 'contributions' });
  User.hasMany(Feedback, { foreignKey: 'user_id', as: 'feedbacks' });
  User.hasMany(Evaluation, { foreignKey: 'evaluator_id', as: 'evaluations' });

  // CharityNeed relationships
  CharityNeed.belongsTo(User, { foreignKey: 'created_by', as: 'charity' });
  CharityNeed.hasMany(Evaluation, { foreignKey: 'need_id', as: 'evaluations' });

  // Contribution relationships
  Contribution.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Contribution.belongsTo(CharityNeed, { foreignKey: 'charity_need_id', as: 'charity_need' });

  // Feedback relationships
  Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Feedback.belongsTo(CharityNeed, { foreignKey: 'charity_need_id', as: 'charity_need' });

  // Evaluation relationships
  Evaluation.belongsTo(User, { foreignKey: 'evaluator_id', as: 'evaluator' });
  Evaluation.belongsTo(CharityNeed, { foreignKey: 'need_id', as: 'charity_need' });

  // TransparencyReport relationships (nếu cần)
  // TransparencyReport không có trường tham chiếu, nên không cần mối quan hệ
};

module.exports = setupAssociations;