require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const apiRoutes = require("./routes/api.routes");
require("./config/db");
require("./config/openai");
const runStocks = require("./stocks");

const app = express();

app.use(morgan("tiny"));
app.use(express.json({ limit: "1mb" }));
app.use(cors());

app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
runStocks();
