const express = require("express");
const bills = require("../model/bills.model");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const docs = await bills.find();
    res.send(docs);
  } catch (error) {
    res.send(error);
  }
});
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const docs = await bills.create(data);
    res.send(docs);
  } catch (error) {
    res.send(error);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const docs = await bills.findByIdAndUpdate(id, data, { new: true });
    res.send(docs);
  } catch (error) {
    res.send(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const docs = await bills.findByIdAndDelete(id);
    res.send(docs);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
