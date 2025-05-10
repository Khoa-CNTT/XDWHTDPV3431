const { CharityNeed } = require('../models');

const getAll = async ({ created_by, limit, offset }) => {
  const where = {};
  if (created_by) where.created_by = created_by;

  return await CharityNeed.findAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
};

const count = async (filters) => {
  return await CharityNeed.count({ where: filters });
};

const create = async ({ 
  title, 
  description,
  organization_name,
  location,
  target_group,
  items_needed,
  funding_goal,
  image,
  blockchain_link,
  project_link,
  fund_avatar,
  created_by 
}) => {
  return await CharityNeed.create({
    title,
    description,
    organization_name,
    location,
    target_group,
    items_needed,
    funding_goal,
    image,
    blockchain_link,
    project_link,
    fund_avatar,
    created_by,
  });
};

module.exports = { getAll, count, create };