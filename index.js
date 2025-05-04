const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bookRoutes = require("./routes/bookRoutes");
const logger = require("./middleware/logger");
const { swaggerUi, swaggerDocs } = require("./swagger");

dotenv.config();
const app = express();

app.use(express.json());
app.use(logger);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/books", bookRoutes);
app.get("/", (req, res) => res.send("Library API"));

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});

module.exports = app;
