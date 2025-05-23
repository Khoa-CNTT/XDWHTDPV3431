const { CharityNeed } = require('../models');

const getAll = async ({ created_by, limit, offset }) => {
  try {
    const where = {};
    if (created_by) where.created_by = created_by;

    const options = {
      where,
      order: [['created_at', 'DESC']]
    };

    if (limit && !isNaN(parseInt(limit))) {
      options.limit = parseInt(limit);
    }
    if (offset && !isNaN(parseInt(offset))) {
      options.offset = parseInt(offset);
    }

    return await CharityNeed.findAll(options);
  } catch (error) {
    console.error('Error in charityNeedRepository.getAll:', error);
    throw error;
  }
};

const count = async (filters) => {
  return await CharityNeed.count({ where: filters });
};

const create = async ({ 
  title, 
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

const findById = async (id) => {
  return await CharityNeed.findByPk(id);
};

module.exports = { getAll, count, create, findById };