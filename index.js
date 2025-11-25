const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const cors = require("cors");

const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());

app.use(express.json());

// Routes
app.use("/events", require("./routes/Events"));
app.use("/users", require("./routes/Users"));
app.use("/categories", require("./routes/Cats"));
app.use("/bookings", require("./routes/Bookings"));

// Default port or custom port
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
