const express = require("express");
const stocks = require("../model/stocks.model");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const docs = await stocks.find().sort({ company: 1 });
    res.send(docs);
  } catch (error) {
    res.send(error);
  }
});

router.get("/:date", async (req, res) => {
  try {
    const date = req.params.date;
    let companies = await stocks.find({ symbol: true }).sort({ company: 1 });

    let symbols = [];
    let countIndex = -1;

    for (let index in companies) {
      if (index % 40 == 0) {
        symbols.push([]);
        countIndex++;
      }
      let obj = companies[index].toObject();
      symbols[countIndex].push(obj.symbol);
    }

    const url =
      "https://groww.in/v1/api/stocks_data/v1/tr_live_delayed/segment/CASH/latest_aggregated";
    result = {};
    for (let ele of symbols) {
      const body = {
        exchangeAggReqMap: {
          NSE: {
            priceSymbolList: ele,
          },
        },
      };
      const doc = await axios.post(url, body);
      result = {
        ...result,
        ...doc.data.exchangeAggRespMap.NSE.priceLivePointsMap,
      };
    }

    for (let [key, value] of Object.entries(result)) {
      const filter = { symbol: key, "records.date": date };
      const update = {
        $set: {
          "records.$.max": value.high,
          "records.$.min": value.low,
          "records.$.close": value.ltp,
          "records.$.open": value.open,
        },
      };
      console.log("🚀 ~ router.post ~ payload:", filter, update);
      await stocks.updateMany(filter, update, { new: true });
    }
    const docs = await stocks.find().sort({ company: 1 });
    res.send(docs);
  } catch (error) {
    res.send(error);
  }
});

router.patch("/updateRemark/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    console.log("🚀 ~ router.patch ~ data:", data, id);
    const docs = await stocks.findByIdAndUpdate(id, data, { new: true });
    res.send(docs);
  } catch (error) {
    res.send(error);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { date, field, value } = req.body;
    const filter = { _id: id, "records.date": date };
    const ukey = "records.$." + field;
    const data = { $set: { [ukey]: value } };
    const docs = await stocks.updateOne(filter, data, { new: true });
    res.send({ msg: "Successfully Updated" });
  } catch (error) {
    res.send(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const docs = await stocks.findByIdAndDelete(id);
    res.send(docs);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
