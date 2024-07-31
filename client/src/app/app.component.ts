import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableComponent } from "./table/table.component";
import { LoginComponent } from "./login/login.component";
import { localStorageService } from './service/local-storage.service';
import { ToastComponent } from "./toast/toast.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TableComponent, LoginComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'client';
  isLogin = false
  constructor(private ls: localStorageService) { }
  ngOnInit(): void {
    let user = this.ls.getUser()
    if (user) {
      this.isLogin = true
    }
    this.ls.isUserLoggedIn.subscribe((res) => {
      this.isLogin = true
    })
  }
}
