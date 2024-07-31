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
  percentage = 0
  position = 0
  minPrice = 0
  maxPrice = 0
  open = 0
  close = 0
  isLoser = false
  selectedDate = ""
  selectedId = ''
  isLoading = false
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
    this.percentage = data.percentage
    this.position = data.position
    this.minPrice = data.min
    this.maxPrice = data.max
    this.open = data.open
    this.close = data.close
    this.isLoser = list.urlFrom == "losers"
    this.selectedDate = date;
    this.selectedId = list._id
  }

  modalClose() {
    this.percentage = 0
    this.position = 0
    this.minPrice = 0
    this.maxPrice = 0
    this.open = 0
    this.close = 0
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
