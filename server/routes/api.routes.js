const usersRouter = require("../controller/user.controller");
const extractTable = require("../controller/extractTable.controller");
const bills = require("../controller/bill.controller");
const stocks = require("../controller/stocks.controller");
const express = require("express");

const router = express.Router();

router.use("/users", usersRouter);
router.use("/extractTable", extractTable);
router.use("/bills", bills);
router.use("/stocks", stocks);
module.exports = router;
