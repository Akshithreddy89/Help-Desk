const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit, dataKey = 'data') => {
  const { count: totalItems, rows } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    [dataKey]: rows,
    totalPages,
    currentPage,
  };
};

module.exports = {
  getPagination,
  getPagingData,
};
