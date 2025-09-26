const express = require("express");
const { userAuth } = require("../middleware/user.js");
const Cart = require("../models/cartSchema.js");
const Product = require("../models/productSchema.js");
const cartRouter = express.Router();

cartRouter.post("/addtocart/:id", userAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product available quantity:", product.quantity);

    if (quantity <= product.quantity) {
      const cartItem = new Cart({
        productId,
        userId: req.userId,
        quantity,
      });
      await cartItem.save();

      return res
        .status(201)
        .json({ message: "Added to cart successfully", cartItem });
    } else {
      return res
        .status(400)
        .json({ message: "Requested quantity exceeds available stock" });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

cartRouter.post("/clearCart/:productId", userAuth, async (req, res) => {
  const { operation } = req.body;
  const productId = req.params;

  if (operation === "delete") {
    const deletedItem = await Cart.findOneAndUpdate(
      { productId: productId },
      { $inc: { quantity: -1 } }
    );

    await Product.findOneAndUpdate(
      { _id: productId },
      { $inc: { quantity: 1 } }
    );

    res.status(200).json({
      message: "product deleted successfully",
    });
  }
  if (operation === "add") {
    const deletedItem = await Cart.findOneAndUpdate(
      { productId: productId },
      { $inc: { quantity: 1 } }
    );

    await Product.findOneAndUpdate(
      { _id: productId },
      { $inc: { quantity: -1 } }
    );
  }

  res.status(200).json({
    message: "product added successfully",
  });
});

// cartRouter.post("/clearCart/:productId", userAuth, async (req, res) => {
//   try {
//     const { productId } = req.params;

//     const deletedItem = await Cart.findOneAndUpdate(
//   { productId: productId },
//   { $inc: { quantity: -1 } }
// );

//     console.log(deletedItem)

//     if (!deletedItem) {
//       return res.status(404).json({ message: "Product not found in cart" });
//     }

//   await Product.findOneAndUpdate(
//   { _id: productId },
//   { $inc: { quantity: 1 } }
// );

//     res
//       .status(200)
//       .json({
//         message: "Product removed from cart and quantity updated successfully",
//       });
//   } catch (error) {
//     console.error(
//       "Error removing product from cart or updating quantity:",
//       error
//     );
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

module.exports = cartRouter;
