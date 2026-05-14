router.post(
  "/upload",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        price,
        image,
        description,
        category,
      } = req.body;

      const user = await User.findById(
        req.user.userId
      );

      if (!user || !user.isSeller) {
        return res.status(403).json({
          error: "Seller account required",
        });
           }

      const product = await Product.create({
        name,
        price,
        image,
        description,
        category,
        sellerId: user._id,
        sellerName: user.storeName,
      });

      res.status(201).json({
        message: "Product uploaded",
        product,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Server error",
      });
    }
  }
);