const { Category } = require('../models/Category');

exports.getCategories = async (req, res) => {
  const categoryList = await Category.find().sort('name');
  res.send(categoryList);
};

exports.getSingleCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category)
    return res
      .status(404)
      .send({ error: 'The category with the given id was not found' });

  res.send(category);
};

exports.createCategory = async (req, res) => {
  const category = new Category(req.body);
  await category.save();

  res.send(category);
};

exports.updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!category)
    return res
      .status(404)
      .send({ error: 'The category with the given id was not found' });

  res.send(category);
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndRemove(req.params.id);

  if (!category)
    return res
      .status(404)
      .send({ error: 'The category with the given id was not found' });

  res.send(category);
};
