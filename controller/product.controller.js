const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Subcategory = require("../models/subcategory.model");
const Season = require("../models/season.model");
const { notifyAdmins } = require("../utils/notification");
const { uniqueProductSlug } = require("../utils/slug");

const validateRelations = async ({
  category,
  subcategory,
  season,
}) => {
  const [cat, sub, sea] = await Promise.all([
    Category.findOne({ _id: category, isDeleted: false, isActive: true }),
    Subcategory.findOne({ _id: subcategory, isDeleted: false, isActive: true }),
    Season.findOne({ _id: season, isDeleted: false, isActive: true }),
  ]);
  if (!cat){
     return "Category not found or inactive";
  }
  if (!sub){
     return "Subcategory not found or inactive";
  } 
  if (sub.category.toString() !== category.toString()){
    return "Subcategory does not belong to category";
  }
  if (!sea) {
    return "Season not found or inactive";}
 
  return null;
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      images,
      sku,
      category,
      subcategory,
      season,
      stock,
    } = req.body;
    if (!name || !description || !sku || !category || !subcategory || !season)
      return res
        .status(400)
        .json({ message: "Required product fields are missing" });
    if (price === undefined || price === null)
      return res.status(400).json({ message: "Price is required" });
    if (
      discountPrice !== undefined &&
      discountPrice !== null &&
      discountPrice > price
    )
      return res.status(400).json({ 
        message: "Discount price cannot be greater than price" });
    const exists = await Product.findOne({ sku });
    if (exists) return res.status(409).json({ message: "SKU already exists" });
    const relationError = await validateRelations({
      category,
      subcategory,
      season,
      stock,
    });
    if (relationError) return res.status(400).json({ message: relationError });
    const slug = await uniqueProductSlug(Product, name);
    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      images,
      sku,
      slug,
      category,
      subcategory,
      season,
      stock,
    });
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to create product", error: error.message });
  }
};
const getProducts = async (req, res) => {
  try {
    const filter = { isDeleted: false, isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.subcategory) filter.subcategory = req.query.subcategory;
    if (req.query.season) filter.season = req.query.season;
    if (req.query.inStock === "true") filter.stock = { $gt: 0 };
    if (req.query.search)
      filter.name = { $regex: req.query.search, $options: "i" };

    let sort = { createdAt: -1 };
    if (req.query.sort === "price_asc") sort = { price: 1 };
    if (req.query.sort === "price_desc") sort = { price: -1 };
    if (req.query.sort === "oldest") sort = { createdAt: 1 };

    let query = Product.find(filter)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("season", "name")
      .sort(sort);
    if (req.query.limit) query = query.limit(Number(req.query.limit));
    const products = await query;
    res.json({ products });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to get products", error: error.message });
  }
};
const getNewArrivals = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({ isDeleted: false, isActive: true })
      .populate("category", "name")
      .populate("subcategory", "name")
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Failed to get new arrivals", error: error.message });
  }
};
const getTopSellers = async (req, res) => {
  try {
    const Order = require("../models/order.model");
    const limit = Number(req.query.limit) || 8;
    const agg = await Order.aggregate([
      { $match: { orderStatus: { $nin: ["cancelled", "refunded"] } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", sold: { $sum: "$items.quantity" } } },
      { $sort: { sold: -1 } },
      { $limit: limit },
    ]);
    const ids = agg.map((a) => a._id);
    const products = await Product.find({
      _id: { $in: ids },
      isDeleted: false,
      isActive: true,
    })
      .populate("category", "name")
      .populate("subcategory", "name");
    const soldMap = Object.fromEntries(agg.map((a) => [a._id.toString(), a.sold]));
    const sorted = products
      .map((p) => ({ ...p.toObject(), sold: soldMap[p._id.toString()] || 0 }))
      .sort((a, b) => b.sold - a.sold);
    res.json({ products: sorted });
  } catch (error) {
    res.status(500).json({ message: "Failed to get top sellers", error: error.message });
  }
};
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isDeleted: false,
    })
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("season", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Failed to get product", error: error.message });
  }
};
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(
      req.query.includeDeleted === "true" ? {} : { isDeleted: false },
    )
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("season", "name")
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Failed to get products", error: error.message });
  }
};
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("season", "name")
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Failed to get product", error: error.message });
  }
};
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted)
      return res.status(404).json({ message: "Product not found" });
    const oldPrice = product.price;
    const fields = [
      "name",
      "description",
      "price",
      "discountPrice",
      "images",
      "sku",
      "category",
      "subcategory",
      "season",
      "stock",
    ];
    const nameChanged = req.body.name !== undefined && req.body.name !== product.name;
    fields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });
    if (nameChanged) {
      product.slug = await uniqueProductSlug(Product, product.name, product._id);
    }
    if (product.discountPrice !== null && product.discountPrice > product.price)
      return res.status(400).json({ message: "Discount price cannot be greater than price" });
    const relationError = await validateRelations({
      category: product.category,
      subcategory: product.subcategory,
      season: product.season,
    });
    if (relationError) return res.status(400).json({ message: relationError });
    await product.save();
    if (oldPrice !== product.price) {
      await notifyAdmins({
        type: "price_changed",
        title: "Product price changed",
        message: `The price of ${product.name} has changed`,
        relatedId: product._id,
      });
    }
    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted)
      return res.status(404).json({ message: "Product not found" });
    product.isDeleted = true;
    product.isActive = false;
    product.deletedAt = new Date();
    await product.save();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};
const restoreProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.isDeleted = false;
    product.isActive = true;
    product.deletedAt = null;
    await product.save();
    res.json({ message: "Product restored successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to restore product", error: error.message });   
}
}
const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.isActive = !product.isActive;
    await product.save();
    res.json({ message: "Product status updated successfully", product });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product status",
      error: error.message,
    });
  }
};
module.exports = {
  createProduct,
  getProducts,
  getAllProducts,
  getProduct,
  getProductBySlug,
  getNewArrivals,
  getTopSellers,
  updateProduct,
  deleteProduct,
  restoreProduct,
  toggleProductStatus,
};
