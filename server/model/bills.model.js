const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const billSchema = new Schema(
  {
    _id: { type: mongoose.Types.ObjectId, auto: true },
    image: { type: String },
    data: { type: Object },
  },
  {
    versionKey: false,
  }
);
const bills = mongoose.model("bills", billSchema);
module.exports = bills;
