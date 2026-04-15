const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products." });
  }
};

const updateProductStock = async (req, res) => {
  try {
    const { quantityDeducted } = req.body;

    // Find product by custom productId (e.g., 'P001')
    const product = await Product.findOne({ productId: req.params.productId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.stockAvailable -= quantityDeducted;
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to update stock." });
  }
};

module.exports = {
  getProducts,
  updateProductStock,
};
