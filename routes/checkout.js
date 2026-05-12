import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/api/checkout", async (req, res) => {
  try {
    const { product } = req.body;

    if (!product) {
      return res.status(400).json({ error: "Product missing" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.category,
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: 1,
        },
      ],

      success_url:
        "https://shoplink-frontend-snowy.vercel.app/success",

      cancel_url:
        "https://shoplink-frontend-snowy.vercel.app/product/" +
        product._id,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).json({ error: "Checkout failed" });
  }
});