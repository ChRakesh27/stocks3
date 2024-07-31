const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const stockSchema = new Schema(
  {
    _id: { type: mongoose.Types.ObjectId, auto: true },
    company: { type: String },
    remarks: { type: String },
    low: { type: Number },
    high: { type: Number },
    urlFrom: { type: String },
    records: { type: Array },
  },
  {
    versionKey: false,
  }
);
const stocks = mongoose.model("stocks", stockSchema);
module.exports = stocks;
