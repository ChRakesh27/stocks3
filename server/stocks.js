const stocks = require("./model/stocks.model");
const axios = require("axios");

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
function getCurrentTime(now) {
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

async function Fetch_stocks() {
  try {
    const date = formatDate(new Date());
    let companies = await stocks
      .find({}, { symbol: true, "records.date": true })
      .sort({ company: 1 });

    let symbols = [];
    let countIndex = -1;
    let existDateComSymbol = [];
    for (let index in companies) {
      if (index % 40 == 0) {
        symbols.push([]);
        countIndex++;
      }
      let obj = companies[index].toObject();
      symbols[countIndex].push(obj.symbol);
      for (let item of obj.records) {
        if (item.date == date) {
          existDateComSymbol.push(obj.symbol);
          break;
        }
      }
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
          "records.$.price": value.ltp,
          "records.$.volume": value.volume,
          "records.$.tsInMillis": value.tsInMillis,
          "records.$.lowPriceRange": value.lowPriceRange,
          "records.$.highPriceRange": value.highPriceRange,
          "records.$.totalBuyQty": value.totalBuyQty,
          "records.$.totalSellQty": value.totalSellQty,
          "records.$.dayChange": value.dayChange,
          "records.$.percentage": value.dayChangePerc,
          "records.$.openInterest": value.openInterest,
          "records.$.lastTradeQty": value.lastTradeQty,
          "records.$.lastTradeTime": value.lastTradeTime,
          "records.$.prevOpenInterest": value.prevOpenInterest,
          "records.$.oiDayChange": value.oiDayChange,
          "records.$.oiDayChangePerc": value.oiDayChangePerc,
          "records.$.lowTradeRange": value.lowTradeRange,
          "records.$.highTradeRange": value.highTradeRange,
        },
      };
      const push = {
        $push: {
          records: {
            date: date,
            max: value.high,
            min: value.low,
            close: value.ltp,
            open: value.open,
            price: value.ltp,
            volume: value.volume,
            tsInMillis: value.tsInMillis,
            lowPriceRange: value.lowPriceRange,
            highPriceRange: value.highPriceRange,
            totalBuyQty: value.totalBuyQty,
            totalSellQty: value.totalSellQty,
            dayChange: value.dayChange,
            percentage: value.dayChangePerc,
            openInterest: value.openInterest,
            lastTradeQty: value.lastTradeQty,
            lastTradeTime: value.lastTradeTime,
            prevOpenInterest: value.prevOpenInterest,
            oiDayChange: value.oiDayChange,
            oiDayChangePerc: value.oiDayChangePerc,
            lowTradeRange: value.lowTradeRange,
            highTradeRange: value.highTradeRange,
          },
        },
      };

      if (existDateComSymbol.includes(key)) {
        const res = await stocks.updateMany(filter, update, { new: true });
        console.log("🚀 ~ update:", key, date);
      } else {
        const res = await stocks.updateMany({ symbol: key }, push, {
          new: true,
        });
        console.log("🚀 ~ pushed:", key, date);
      }
    }
  } catch (error) {
    console.log("🚀 ~ Fetch_stocks ~ error:", error);
  }
}

function runStocks() {
  const startTime = "09:15";
  const endTime = "15:30";
  setInterval(() => {
    const currentDate = new Date();
    const daysToSunday = 7 == currentDate.getDay();
    const daysToSaturday = 6 == currentDate.getDay();
    currentTime = getCurrentTime(currentDate);
    console.log("🚀 ~ setInterval ~ currentTime:", currentTime);
    if (
      currentTime > startTime &&
      currentTime < endTime &&
      !daysToSunday &&
      !daysToSaturday
    ) {
      console.log("fetching..");
      Fetch_stocks();
      console.log("done\n");
    } else {
      if (daysToSaturday) console.log("---Saturday---");
      else if (daysToSunday) console.log("---Sunday---");
      else console.log("TimeOut", currentTime);
    }
  }, 30000);
}

module.exports = runStocks;
