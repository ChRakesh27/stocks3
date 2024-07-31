import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {
  dataSet = [];
  tempDate = []
  dateList = [];
  startDate = new Date('2024-07-24');
  endDate = new Date();
  sortOrder = 0;
  isLoser = false
  selectedDate = ""
  selectedId = ''
  isLoading = false
  RecordsFields = [
    { field: "percentage", value: 0 },
    { field: "max", value: 0 },
    { field: "min", value: 0 },
    { field: "close", value: 0 },
    { field: "open", value: 0 },
    { field: "price", value: 0 },
    { field: "volume", value: 0 },
    { field: "tsInMillis", value: 0 },
    { field: "lowPriceRange", value: 0 },
    { field: "highPriceRange", value: 0 },
    { field: "totalBuyQty", value: 0 },
    { field: "totalSellQty", value: 0 },
    { field: "dayChange", value: 0 },
    { field: "openInterest", value: 0 },
    { field: "lastTradeQty", value: 0 },
    { field: "lastTradeTime", value: 0 },
    { field: "prevOpenInterest", value: 0 },
    { field: "oiDayChange", value: 0 },
    { field: "oiDayChangePerc", value: 0 },
    { field: "lowTradeRange", value: 0 },
    { field: "highTradeRange", value: 0 },
  ]
  constructor(private service: AppService, private toast: ToastService) { }
  ngOnInit() {
    this.dateList = this.getDateRange(this.startDate, this.endDate);
    this.service.getData().subscribe((res) => {
      this.dataSet = res
      console.log("🚀 ~ TableComponent ~ this.service.getData ~ res:", res)
      this.tempDate.push(...res)
      this.toast.showSuccess("Successfully fetched Data")
    })
  }

  getDateRange(startDate, endDate) {
    if (startDate == "Invalid Date") {
      startDate = new Date('2024-07-23');
    }
    if (endDate == "Invalid Date") {
      endDate = new Date();
    }
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const daysToSunday = (7 - currentDate.getDay()) % 7;
      const daysToSaturday = (6 - currentDate.getDay() + 7) % 7;
      if (!daysToSunday || !daysToSaturday) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      dates.push(this.formatDate(new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);

    }
    return dates;
  }

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }


  setRemark(e, data, field) {
    let value = e.target.value
    if (field != "remarks") {
      value = +value
    }
    data[field] = value
    const payload = { [field]: value }
    this.service.updateRemark(data._id, payload).subscribe((res) => {
      this.toast.showSuccess(field + " field Updated Successful!")
    })
  }
  setStartDate(e) {
    this.startDate = new Date(e.target.value)
    this.dateList = this.getDateRange(this.startDate, this.endDate);
  }
  setEndDate(e) {
    this.endDate = new Date(e.target.value)
    this.dateList = this.getDateRange(this.startDate, this.endDate);
  }

  onChangeHandle(e, date, field) {
    const payload = { date: date, field: field, value: +e.target.value }
    this.service.updateData(this.selectedId, payload).subscribe((res) => {
      let record = this.dataSet.find(ele => ele._id == this.selectedId).records.find(ele => ele.date == date)
      record[field] = +e.target.value
      this.toast.showSuccess(field + " field Updated Successful!")
    })
  }
  onSortDate(date) {
    this.sortOrder++
    if (this.sortOrder == 3) {
      this.sortOrder = 0
      this.dataSet = []
      this.dataSet.push(...this.tempDate)
      return
    }
    this.dataSet.sort((a, b) => {
      const indexA = a.records.findIndex(x => x.date == date)
      const indexB = b.records.findIndex(x => x.date == date)
      const m = a.records[indexA]?.percentage ? a.records[indexA]?.percentage : 0
      const n = b.records[indexB]?.percentage ? b.records[indexB]?.percentage : 0
      return this.sortOrder == 1 ? m - n : n - m
    })

  }

  getBackgroundColor(list, date) {
    const obj = list.records.find(item => item.date == date);
    if (!obj) {
      return "#fff"
    }

    if (obj.percentage >= 6)
      return "green"
    if (obj.percentage >= 3)
      return "rgb(58, 240, 58)"
    if (obj.percentage >= 0)
      return "rgb(140, 233, 140)"

    if (obj.percentage <= -6)
      return "red"
    if (obj.percentage <= -3)
      return "rgb(255, 97, 97)"
    if (obj.percentage <= 0)
      return "rgb(252, 142, 142)"

    // if (obj.urlFrom == "losers") {
    //   if (obj.percentage >= 6)
    //     return "red"
    //   if (obj.percentage >= 3)
    //     return "rgb(255, 97, 97)"
    //   return "rgb(252, 142, 142)"
    // }
    // if (obj.urlFrom == "gainers") {
    //   if (obj.percentage >= 6)
    //     return "green"
    //   if (obj.percentage >= 3)
    //     return "rgb(58, 240, 58)"
    //   return "rgb(140, 233, 140)"
    // }

  }

  setUpdate(list, date) {
    const data = list.records.find(item => item.date == date)
    this.RecordsFields = [
      { field: "percentage", value: data.percentage },
      { field: "max", value: data.max },
      { field: "min", value: data.min },
      { field: "close", value: data.close },
      { field: "open", value: data.open },
      { field: "price", value: data.price },
      { field: "volume", value: data.volume },
      { field: "tsInMillis", value: data.tsInMillis },
      { field: "lowPriceRange", value: data.lowPriceRange },
      { field: "highPriceRange", value: data.highPriceRange },
      { field: "totalBuyQty", value: data.totalBuyQty },
      { field: "totalSellQty", value: data.totalSellQty },
      { field: "dayChange", value: data.dayChange },
      { field: "openInterest", value: data.openInterest },
      { field: "lastTradeQty", value: data.lastTradeQty },
      { field: "lastTradeTime", value: data.lastTradeTime },
      { field: "prevOpenInterest", value: data.prevOpenInterest },
      { field: "oiDayChange", value: data.oiDayChange },
      { field: "oiDayChangePerc", value: data.oiDayChangePerc },
      { field: "lowTradeRange", value: data.lowTradeRange },
      { field: "highTradeRange", value: data.highTradeRange },
    ]
    this.isLoser = list.urlFrom == "losers"
    this.selectedDate = date;
    this.selectedId = list._id
  }

  modalClose() {
    this.RecordsFields = [
      { field: "percentage", value: 0 },
      { field: "max", value: 0 },
      { field: "min", value: 0 },
      { field: "close", value: 0 },
      { field: "open", value: 0 },
      { field: "price", value: 0 },
      { field: "volume", value: 0 },
      { field: "tsInMillis", value: 0 },
      { field: "lowPriceRange", value: 0 },
      { field: "highPriceRange", value: 0 },
      { field: "totalBuyQty", value: 0 },
      { field: "totalSellQty", value: 0 },
      { field: "dayChange", value: 0 },
      { field: "openInterest", value: 0 },
      { field: "lastTradeQty", value: 0 },
      { field: "lastTradeTime", value: 0 },
      { field: "prevOpenInterest", value: 0 },
      { field: "oiDayChange", value: 0 },
      { field: "oiDayChangePerc", value: 0 },
      { field: "lowTradeRange", value: 0 },
      { field: "highTradeRange", value: 0 },
    ]
    this.isLoser = false
    this.selectedDate = ""
    this.selectedId = ""
  }


  // fetchData() {
  //   this.isLoading = true
  //   const date = this.formatDate(new Date())
  //   this.service.fetchDataApi(date).subscribe((res) => {
  //     console.log("🚀 ~  response:", res);
  //     this.dataSet = res
  //     this.tempDate.push(...res)
  //     this.isLoading = false
  //     this.toast.showSuccess("Successfully fetched!")
  //   })
  // }
}
